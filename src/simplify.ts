import type { Expr } from './ast.js';
import { sameExpr } from './equality.js';
import { defaultRules } from './rules/index.js';
import type { RewriteRule, RewriteStep } from './rules/types.js';
import { searchSimplify } from './search.js';
import { type ExpressionCost, expressionWeight } from './weight.js';

interface SingleRewrite {
  expression: Expr;
  rule: RewriteRule;
  before: Expr;
}

export interface SimplifyResult {
  expression: Expr;
  steps: RewriteStep[];
  weight: number;
  explored: number;
}

export type SimplifyStrategy = 'fast' | 'step-by-step' | 'lookahead';

export interface SimplifyOptions {
  maxStates?: number;
  maxDepth?: number;
  rules?: RewriteRule[];
  strategy?: SimplifyStrategy;
  cost?: ExpressionCost;
  beamWidth?: number;
}

export function simplify(expr: Expr, options: SimplifyOptions = {}): SimplifyResult {
  const { rules = defaultRules } = options;

  if (options.strategy === 'step-by-step') {
    const result = simplifyStepByStep(expr, rules, options.maxStates ?? 100);

    return {
      ...result,
      explored: result.steps.length,
      weight: expressionWeight(result.expression, options.cost),
    };
  }

  if (options.strategy === 'lookahead') {
    return simplifyLookahead(expr, rules, options);
  }

  return searchSimplify(expr, rules, options);
}

function rewriteOne(expr: Expr, rules: RewriteRule[]): SingleRewrite | null {
  // Search the leftmost child first.
  if (expr.type === 'not') {
    const child = rewriteOne(expr.operand, rules);

    if (child) {
      return {
        ...child,
        before: expr,
        expression: {
          ...expr,
          operand: child.expression,
        },
      };
    }
  }

  if (expr.type === 'and' || expr.type === 'or' || expr.type === 'xor') {
    const left = rewriteOne(expr.left, rules);

    if (left) {
      return {
        ...left,
        before: expr,
        expression: {
          ...expr,
          left: left.expression,
        },
      };
    }

    const right = rewriteOne(expr.right, rules);

    if (right) {
      return {
        ...right,
        before: expr,
        expression: {
          ...expr,
          right: right.expression,
        },
      };
    }
  }

  // Apply the first matching rule to this node.
  for (const rule of rules) {
    const replacement = rule.apply(expr);

    if (replacement !== null && !sameExpr(replacement, expr)) {
      return {
        before: expr,
        expression: replacement,
        rule,
      };
    }
  }

  return null;
}

export function simplifyStepByStep(
  input: Expr,
  rules: RewriteRule[],
  maxSteps = 100,
): {
  expression: Expr;
  steps: RewriteStep[];
} {
  let current = input;
  const steps: RewriteStep[] = [];
  const visited = new Set<string>([JSON.stringify(input)]);

  for (let i = 0; i < maxSteps; i++) {
    const rewrite = rewriteOne(current, rules);

    if (!rewrite) break;

    const next = rewrite.expression;
    const key = JSON.stringify(next);

    if (visited.has(key)) break;

    steps.push({
      after: next,
      before: current,
      ruleId: rewrite.rule.id,
      ruleName: rewrite.rule.name,
    });

    current = next;
    visited.add(key);
  }

  return { expression: current, steps };
}

interface RewriteCandidate {
  expression: Expr;
  rule: RewriteRule;
}

/** Generate every one-rule rewrite available in the tree. */
function generateRewrites(expr: Expr, rules: RewriteRule[]): RewriteCandidate[] {
  const candidates: RewriteCandidate[] = [];

  // Rules applied at the current node.
  for (const rule of rules) {
    const replacement = rule.apply(expr);

    if (replacement && !sameExpr(replacement, expr)) {
      candidates.push({
        expression: replacement,
        rule,
      });
    }
  }

  // Rules applied inside NOT.
  if (expr.type === 'not') {
    for (const child of generateRewrites(expr.operand, rules)) {
      candidates.push({
        expression: {
          ...expr,
          operand: child.expression,
        },
        rule: child.rule,
      });
    }
  }

  // Rules applied inside binary operators.
  if (expr.type === 'and' || expr.type === 'or' || expr.type === 'xor') {
    for (const child of generateRewrites(expr.left, rules)) {
      candidates.push({
        expression: {
          ...expr,
          left: child.expression,
        },
        rule: child.rule,
      });
    }

    for (const child of generateRewrites(expr.right, rules)) {
      candidates.push({
        expression: {
          ...expr,
          right: child.expression,
        },
        rule: child.rule,
      });
    }
  }

  // Deduplicate equivalent ASTs.
  return candidates.filter(
    (candidate, index, all) =>
      all.findIndex((other) => sameExpr(other.expression, candidate.expression)) === index,
  );
}

interface BeamState {
  expression: Expr;
  steps: RewriteStep[];
  ruleWeight: number;
}

export function simplifyLookahead(
  input: Expr,
  rules: RewriteRule[],
  options: SimplifyOptions = {},
): SimplifyResult {
  const beamWidth = Math.max(1, options.beamWidth ?? 5);
  const maxDepth = Math.max(0, options.maxDepth ?? 30);
  const maxStates = Math.max(1, options.maxStates ?? 10_000);
  const cost = options.cost;

  const weight = (expr: Expr) => expressionWeight(expr, cost);

  const initial: BeamState = {
    expression: input,
    ruleWeight: 0,
    steps: [],
  };

  let beam: BeamState[] = [initial];
  let best = initial;
  let explored = 0;

  // Store expressions rather than JSON strings so equality
  // uses your existing structural comparison.
  const visited: Expr[] = [input];

  const compare = (a: BeamState, b: BeamState) =>
    weight(a.expression) - weight(b.expression) || a.ruleWeight - b.ruleWeight;

  while (beam.length > 0 && explored < maxStates) {
    const nextBeam: BeamState[] = [];

    for (const state of beam) {
      if (explored >= maxStates) break;
      explored++;

      if (compare(state, best) < 0) {
        best = state;
      }

      if (state.steps.length >= maxDepth) continue;

      const rewrites = generateRewrites(state.expression, rules);

      for (const rewrite of rewrites) {
        if (visited.some((expr) => sameExpr(expr, rewrite.expression))) {
          continue;
        }

        visited.push(rewrite.expression);

        const step: RewriteStep = {
          after: rewrite.expression,
          before: state.expression,
          ruleId: rewrite.rule.id,
          ruleName: rewrite.rule.name,
        };

        const candidate: BeamState = {
          expression: rewrite.expression,
          ruleWeight: state.ruleWeight + rewrite.rule.cost,
          steps: [...state.steps, step],
        };

        if (compare(candidate, best) < 0) {
          best = candidate;
        }

        nextBeam.push(candidate);
      }
    }

    nextBeam.sort(compare);
    beam = nextBeam.slice(0, beamWidth);
  }

  return {
    explored,
    expression: best.expression,
    steps: best.steps,
    weight: weight(best.expression),
  };
}
