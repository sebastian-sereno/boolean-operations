import type { RewriteRule } from '@/rules/types.js';

export const distributive: RewriteRule = {
  apply(expr) {
    // A AND (B OR C) -> (A AND B) OR (A AND C)
    if (expr.type === 'and') {
      if (expr.right.type === 'or') {
        return {
          left: {
            left: expr.left,
            right: expr.right.left,
            type: 'and',
          },
          right: {
            left: expr.left,
            right: expr.right.right,
            type: 'and',
          },
          type: 'or',
        };
      }

      // (A OR B) AND C -> (A AND C) OR (B AND C)
      if (expr.left.type === 'or') {
        return {
          left: {
            left: expr.left.left,
            right: expr.right,
            type: 'and',
          },
          right: {
            left: expr.left.right,
            right: expr.right,
            type: 'and',
          },
          type: 'or',
        };
      }
    }

    // A OR (B AND C) -> (A OR B) AND (A OR C)
    if (expr.type === 'or') {
      if (expr.right.type === 'and') {
        return {
          left: {
            left: expr.left,
            right: expr.right.left,
            type: 'or',
          },
          right: {
            left: expr.left,
            right: expr.right.right,
            type: 'or',
          },
          type: 'and',
        };
      }

      // (A AND B) OR C -> (A OR C) AND (B OR C)
      if (expr.left.type === 'and') {
        return {
          left: {
            left: expr.left.left,
            right: expr.right,
            type: 'or',
          },
          right: {
            left: expr.left.right,
            right: expr.right,
            type: 'or',
          },
          type: 'and',
        };
      }
    }

    return null;
  },
  cost: 32,
  description:
    'A AND (B OR C) = (A AND B) OR (A AND C); ' + 'A OR (B AND C) = (A OR B) AND (A OR C)',
  id: 'distributive',
  name: 'Distributive Laws',
};

export const xor_distributive: RewriteRule = {
  apply(expr) {
    // A XOR B -> (A OR B) AND NOT (A AND B)
    if (expr.type === 'xor') {
      return {
        left: {
          left: expr.left,
          right: expr.right,
          type: 'or',
        },
        right: {
          operand: {
            left: expr.left,
            right: expr.right,
            type: 'and',
          },
          type: 'not',
        },
        type: 'and',
      };
    }
    return null;
  },
  cost: 16,
  description: 'A XOR B = (A OR B) AND NOT (A AND B)',
  id: 'xor-distributive',
  name: 'XOR Distributive Laws',
};
