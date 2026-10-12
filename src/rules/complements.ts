import type { Expr } from '../ast.js';
import { sameExpr as same } from '../equality.js';
import type { RewriteRule } from './types.js';

export const excludedMiddle: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'or') return null;

    // Flatten nested OR expressions into a single list.
    const flattenOr = (node: Expr): Expr[] => {
      if (node.type === 'or') {
        return [...flattenOr(node.left), ...flattenOr(node.right)];
      }

      return [node];
    };

    // Rebuild an OR expression from a list of terms.
    const buildOr = (terms: Expr[]): Expr => {
      if (terms.length === 1) return terms[0]!;

      return {
        left: terms[0]!,
        right: buildOr(terms.slice(1)),
        type: 'or',
      };
    };

    const isComplement = (a: Expr, b: Expr): boolean =>
      (a.type === 'not' && same(a.operand, b)) || (b.type === 'not' && same(b.operand, a));

    const terms = flattenOr(expr);

    // Search every pair, regardless of tree position.
    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        if (isComplement(terms[i]!, terms[j]!)) {
          // const remaining = terms.filter((_, index) => index !== i && index !== j);

          // // A OR NOT A = TRUE.
          // // Preserve any unrelated terms.
          // remaining.push({ type: 'const', value: true });

          // return buildOr(remaining);
          return { type: 'const', value: true };
        }
      }
    }

    return null;
  },
  cost: 1,
  description: 'A OR NOT A = TRUE',
  id: 'excluded-middle',
  name: 'Law of Excluded Middle',
};

export const nonContradiction: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'and') return null;

    const flattenAnd = (node: Expr): Expr[] => {
      if (node.type === 'and') {
        return [...flattenAnd(node.left), ...flattenAnd(node.right)];
      }

      return [node];
    };

    const isComplement = (a: Expr, b: Expr): boolean =>
      (a.type === 'not' && same(a.operand, b)) || (b.type === 'not' && same(b.operand, a));

    const terms = flattenAnd(expr);

    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        if (isComplement(terms[i]!, terms[j]!)) {
          return { type: 'const', value: false };
        }
      }
    }

    return null;
  },
  cost: 1,
  description: 'A AND NOT A = FALSE',
  id: 'non-contradiction',
  name: 'Law of Non-Contradiction',
};
