import { sameExpr as same } from '@/equality.js';
import { isConst, type RewriteRule } from '@/rules/types.js';

export const idempotence: RewriteRule = {
  apply(expr) {
    if ((expr.type === 'and' || expr.type === 'or') && same(expr.left, expr.right)) {
      return expr.left;
    }

    return null;
  },
  cost: 1,
  description: 'A AND A = A; A OR A = A',
  id: 'idempotence',
  name: 'Idempotent Laws',
};

export const identity: RewriteRule = {
  apply(expr) {
    if (expr.type === 'and') {
      if (isConst(expr.left, true)) return expr.right;
      if (isConst(expr.right, true)) return expr.left;
    }

    if (expr.type === 'or') {
      if (isConst(expr.left, false)) return expr.right;
      if (isConst(expr.right, false)) return expr.left;
    }

    return null;
  },
  cost: 1,
  description: 'A AND TRUE = A; A OR FALSE = A',
  id: 'identity',
  name: 'Identity Laws',
};
