import type { Expr } from '../ast.js';
import { sameExpr as same } from '../equality.js';
import type { RewriteRule } from './types.js';

export const conditionalAbsorption: RewriteRule = {
  apply(expr: Expr): Expr | null {
    if (expr.type !== 'or') return null;

    const matches = (andExpr: Expr, other: Expr): Expr | null => {
      if (andExpr.type !== 'and') return null;

      if (andExpr.left.type === 'not' && same(andExpr.left.operand, other)) {
        return andExpr.right;
      }

      if (andExpr.right.type === 'not' && same(andExpr.right.operand, other)) {
        return andExpr.left;
      }

      return null;
    };

    const leftResult = matches(expr.left, expr.right);
    if (leftResult) {
      return {
        left: leftResult,
        right: expr.right,
        type: 'or',
      };
    }

    const rightResult = matches(expr.right, expr.left);
    if (rightResult) {
      return {
        left: expr.left,
        right: rightResult,
        type: 'or',
      };
    }

    return null;
  },
  cost: 1,
  description: '(A AND NOT B) OR B = A OR B',
  id: 'conditional-absorption',
  name: 'Conditional Absorption',
};

export const absorption: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'and' && expr.type !== 'or') {
      return null;
    }

    const outerType = expr.type;
    const innerType = outerType === 'and' ? 'or' : 'and';

    // A op (A innerOp B) = A
    const matches = (outer: Expr, inner: Expr): boolean =>
      inner.type === innerType && (same(outer, inner.left) || same(outer, inner.right));

    if (matches(expr.left, expr.right)) return expr.left;
    if (matches(expr.right, expr.left)) return expr.right;

    return null;
  },
  cost: 2,
  description: 'A OR (A AND B) = A; A AND (A OR B) = A',
  id: 'absorption',
  name: 'Absorption Laws',
};

export const negatedAndOrAbsorption: RewriteRule = {
  apply(expr: Expr): Expr | null {
    if (expr.type !== 'or') return null;

    const matches = (negated: Expr, other: Expr): boolean =>
      negated.type === 'not' &&
      negated.operand.type === 'and' &&
      (same(negated.operand.left, other) || same(negated.operand.right, other));

    if (matches(expr.left, expr.right) || matches(expr.right, expr.left)) {
      return { type: 'const', value: true };
    }

    return null;
  },
  cost: 1,
  description: 'NOT (A AND B) OR B = TRUE',
  id: 'negated-and-or-absorption',
  name: 'Negated AND/OR Absorption',
};
