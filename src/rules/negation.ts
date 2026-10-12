import type { RewriteRule } from './types.js';

export const doubleNegation: RewriteRule = {
  apply(expr) {
    if (expr.type === 'not' && expr.operand.type === 'not') {
      return expr.operand.operand;
    }

    return null;
  },
  cost: 1,
  description: 'NOT (NOT A) = A',
  id: 'double-negation',
  name: 'Double Negation',
};
