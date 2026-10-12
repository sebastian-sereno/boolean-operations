import type { Expr } from '@/ast.js';

const precedence = {
  and: 3,
  atom: 5,
  not: 4,
  or: 1,
  xor: 2,
} as const;

export function printExpr(expr: Expr, parent = 0): string {
  let result: string;
  let level: number;

  switch (expr.type) {
    case 'variable':
      result = expr.name;
      level = precedence.atom;
      break;

    case 'const':
      result = expr.value ? 'TRUE' : 'FALSE';
      level = precedence.atom;
      break;

    case 'not':
      result = `NOT ${printExpr(expr.operand, precedence.not)}`;
      level = precedence.not;
      break;

    case 'and':
    case 'or':
    case 'xor': {
      const symbols = {
        and: 'AND',
        or: 'OR',
        xor: 'XOR',
      };

      level = precedence[expr.type];
      result =
        `${printExpr(expr.left, level)} ` +
        `${symbols[expr.type]} ` +
        `${printExpr(expr.right, level + 1)}`;
      break;
    }
  }

  return level < parent ? `(${result})` : result;
}
