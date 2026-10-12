export type Expr =
  | { type: 'variable'; name: string }
  | { type: 'const'; value: boolean }
  | { type: 'not'; operand: Expr }
  | { type: 'and'; left: Expr; right: Expr }
  | { type: 'or'; left: Expr; right: Expr }
  | { type: 'xor'; left: Expr; right: Expr };

export const variable = (name: string): Expr => ({
  name,
  type: 'variable',
});

export const constant = (value: boolean): Expr => ({
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
