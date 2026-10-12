import type { Expr } from '../ast.js';
import type { RewriteRule } from './types.js';

export type DeMorganDirection = 'expand' | 'compress';

export function createDeMorganRule(direction: DeMorganDirection): RewriteRule {
  return {
    apply(expr: Expr): Expr | null {
      // Expand:
      // NOT (A AND B) -> NOT A OR NOT B
      // NOT (A OR B) -> NOT A AND NOT B
      if (direction === 'expand' && expr.type === 'not') {
        const inner = expr.operand;

        if (inner.type === 'and' || inner.type === 'or') {
          const operator = inner.type === 'and' ? 'or' : 'and';

          return {
            left: { operand: inner.left, type: 'not' },
            right: { operand: inner.right, type: 'not' },
            type: operator,
          };
        }
      }

      // Compress:
      // NOT A AND NOT B -> NOT (A OR B)
      // NOT A OR NOT B -> NOT (A AND B)
      if (
        direction === 'compress' &&
        (expr.type === 'and' || expr.type === 'or') &&
        expr.left.type === 'not' &&
        expr.right.type === 'not'
      ) {
        const operator = expr.type === 'and' ? 'or' : 'and';

        return {
          operand: {
            left: expr.left.operand,
            right: expr.right.operand,
            type: operator,
          },
          type: 'not',
        };
      }

      return null;
    },
    cost: 4,
    description: `De Morgan transformation (${direction})`,
    id: `de-morgan-${direction}`,
    name: "De Morgan's Laws",
  };
}

export const deMorganExpand = createDeMorganRule('expand');
export const deMorganCompress = createDeMorganRule('compress');
