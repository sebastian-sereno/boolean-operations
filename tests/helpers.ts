import { expect } from 'vitest';
import type { Expr } from '../src/ast.js';

export const v = (name: string): Expr => ({ name, type: 'variable' });

export const c = (value: boolean): Expr => ({
  type: 'const',
  value,
});

export const not = (operand: Expr): Expr => ({
  operand,
  type: 'not',
});

export const and = (left: Expr, right: Expr): Expr => ({
  left,
  right,
  type: 'and',
});

export const or = (left: Expr, right: Expr): Expr => ({
  left,
  right,
  type: 'or',
});

export const xor = (left: Expr, right: Expr): Expr => ({
  left,
  right,
  type: 'xor',
});

export function expectExpr(actual: Expr, expected: Expr) {
  expect(actual).toEqual(expected);
}
