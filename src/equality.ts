import type { Expr } from '@/ast.js';

/**
 * Compares two expressions by their AST structure.
 * Does not treat commutative expressions as equal when
 * their children appear in a different order.
 */
export function sameExpr(a: Expr, b: Expr): boolean {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case 'const':
      return b.type === 'const' && a.value === b.value;
    case 'variable':
      return b.type === 'variable' && a.name === b.name;

    case 'not':
      return b.type === 'not' && sameExpr(a.operand, b.operand);

    case 'and':
    case 'or':
    case 'xor':
      return b.type === a.type && sameExpr(a.left, b.left) && sameExpr(a.right, b.right);

    default:
      // Handles any additional AST node types.
      // Extend this switch when adding new expression types.
      return false;
  }
}
