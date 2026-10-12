import type { Expr } from '../ast.js';
import { sameExpr } from '../equality.js';
import type { RewriteRule } from '../rules/types.js';
import { expressionWeight } from '../weight.js';

interface Candidate {
  expression: Expr;
  rule: RewriteRule;
  weight: number;
}

/**
 * Finds the best strictly weight-reducing rewrite
 * anywhere in the expression tree.
 */
export function rewriteOnce(
  expr: Expr,
  rules: RewriteRule[],
): { expression: Expr; rule: RewriteRule } | null {
  const candidates: Candidate[] = [];
  const originalWeight = expressionWeight(expr);

  function visit(node: Expr, rebuild: (next: Expr) => Expr): void {
    // Try rewriting this node.
    for (const rule of rules) {
      const replacement = rule.apply(node);

      if (replacement === null) continue;
      if (sameExpr(replacement, node)) continue;

      const result = rebuild(replacement);
      const weight = expressionWeight(result);

      // Only accept strict improvements.
      if (weight < originalWeight) {
        candidates.push({ expression: result, rule, weight });
      }
    }

    // Try rewriting descendants.
    if (node.type === 'not') {
      visit(node.operand, (next) =>
        rebuild({
          ...node,
          operand: next,
        }),
      );
    } else if (node.type === 'and' || node.type === 'or' || node.type === 'xor') {
      visit(node.left, (next) =>
        rebuild({
          ...node,
          left: next,
        }),
      );

      visit(node.right, (next) =>
        rebuild({
          ...node,
          right: next,
        }),
      );
    }
  }

  visit(expr, (next) => next);

  if (candidates.length === 0) return null;

  // Stable tie-break: retain rule ordering when weights are equal.
  candidates.sort((a, b) => a.weight - b.weight);

  const best = candidates[0]!;

  return {
    expression: best.expression,
    rule: best.rule,
  };
}
