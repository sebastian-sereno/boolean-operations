import type { Expr } from '@/ast.js';
import { sameExpr } from '@/equality.js';
import type { RewriteRule, RewriteStep } from '@/rules/types.js';
import { defaultCost, type ExpressionCost, expressionWeight } from '@/weight.js';

interface Candidate {
  expression: Expr;
  rule: RewriteRule;
}

interface SearchState {
  expression: Expr;
  steps: RewriteStep[];
  ruleCost: number;
}

export interface SearchOptions {
  maxStates?: number;
  maxDepth?: number;
  cost?: ExpressionCost;
}

export interface SearchResult {
  expression: Expr;
  steps: RewriteStep[];
  weight: number;
  explored: number;
}

/**
 * Generate every expression reachable by applying one rule
 * to any node in the current expression.
 */
function generateCandidates(expr: Expr, rules: RewriteRule[]): Candidate[] {
  const results: Candidate[] = [];

  function visit(node: Expr, rebuild: (replacement: Expr) => Expr): void {
    for (const rule of rules) {
      const replacement = rule.apply(node);

      if (replacement === null) continue;
      if (sameExpr(replacement, node)) continue;

      results.push({
        expression: rebuild(replacement),
        rule,
      });
    }

    if (node.type === 'not') {
      visit(node.operand, (replacement) => rebuild({ ...node, operand: replacement }));
    } else if (node.type === 'and' || node.type === 'or' || node.type === 'xor') {
      visit(node.left, (replacement) => rebuild({ ...node, left: replacement }));

      visit(node.right, (replacement) => rebuild({ ...node, right: replacement }));
    }
  }

  visit(expr, (replacement) => replacement);

  return results;
}

/**
 * Search for a low-weight expression.
 *
 * This returns the best expression found within the search
 * budget, not necessarily the globally optimal expression.
 */
export function searchSimplify(
  input: Expr,
  rules: RewriteRule[],
  options: SearchOptions = {},
): SearchResult {
  const maxStates = options.maxStates ?? 10_000;
  const maxDepth = options.maxDepth ?? 30;
  const cost = options.cost ?? defaultCost;

  const initial: SearchState = {
    expression: input,
    ruleCost: 0,
    steps: [],
  };

  const queue: SearchState[] = [initial];
  const visited = new Set<string>([JSON.stringify(input)]);

  let best = initial;
  let explored = 0;

  const weight = (expr: Expr) => expressionWeight(expr, cost);

  while (queue.length > 0 && explored < maxStates) {
    // Lowest expression weight first.
    // Rule cost breaks ties; insertion order breaks remaining ties.
    queue.sort((a, b) => weight(a.expression) - weight(b.expression) || a.ruleCost - b.ruleCost);

    const current = queue.shift()!;
    explored++;

    if (weight(current.expression) < weight(best.expression)) {
      best = current;
    }

    if (current.steps.length >= maxDepth) continue;

    const candidates = generateCandidates(current.expression, rules);

    for (const candidate of candidates) {
      // Deduplicate structurally identical expressions.
      const candidateKey = JSON.stringify(candidate.expression);
      if (visited.has(candidateKey)) continue;
      visited.add(candidateKey);

      const step: RewriteStep = {
        after: candidate.expression,
        before: current.expression,
        ruleId: candidate.rule.id,
        ruleName: candidate.rule.name,
      };

      queue.push({
        expression: candidate.expression,
        ruleCost: current.ruleCost + (candidate.rule.cost ?? 1),
        steps: [...current.steps, step],
      });
    }
  }

  return {
    explored,
    expression: best.expression,
    steps: best.steps,
    weight: weight(best.expression),
  };
}
