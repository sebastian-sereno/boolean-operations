import { isConst, type RewriteRule } from '@/rules/types.js';

export const domination: RewriteRule = {
  apply(expr) {
    if (expr.type === 'and') {
      if (isConst(expr.left, false) || isConst(expr.right, false)) {
        return { type: 'const', value: false };
      }
    }

    if (expr.type === 'or') {
      if (isConst(expr.left, true) || isConst(expr.right, true)) {
        return { type: 'const', value: true };
      }
    }

    return null;
  },
  cost: 1,
  description: 'A AND FALSE = FALSE; A OR TRUE = TRUE',
  id: 'domination',
  name: 'Domination Laws',
};

export const constantNegation: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'not' || expr.operand.type !== 'const') {
      return null;
    }

    return {
      type: 'const',
      value: !expr.operand.value,
    };
  },
  cost: 1,
  description: 'NOT FALSE = TRUE; NOT TRUE = FALSE',
  id: 'constant-negation',
  name: 'Negation of Constants',
};
