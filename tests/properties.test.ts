import { describe, expect, it } from 'vitest';
import type { Expr } from '../src/ast';
import { simplify } from '../src/simplify';
import { and, c, not, or, v, xor } from './helpers';

function evaluate(expr: Expr, env: Record<string, boolean>): boolean {
  switch (expr.type) {
    case 'const':
      return expr.value;

    case 'variable':
      return env[expr.name] ?? false;

    case 'not':
      return !evaluate(expr.operand, env);

    case 'and':
      return evaluate(expr.left, env) && evaluate(expr.right, env);

    case 'or':
      return evaluate(expr.left, env) || evaluate(expr.right, env);

    case 'xor':
      return evaluate(expr.left, env) !== evaluate(expr.right, env);

    default:
      throw new Error(`Unsupported AST node: ${JSON.stringify(expr)}`);
  }
}

function assignments(names: string[]) {
  const total = 2 ** names.length;

  return Array.from(
    { length: total },
    (_, mask) =>
      Object.fromEntries(names.map((name, i) => [name, Boolean(mask & (1 << i))])) as Record<
        string,
        boolean
      >,
  );
}

function assertEquivalent(a: Expr, b: Expr) {
  const names = ['A', 'B', 'C'];

  for (const env of assignments(names)) {
    expect(evaluate(a, env)).toBe(evaluate(b, env));
  }
}

describe('Boolean equivalence', () => {
  it('preserves semantics after simplification', () => {
    const expr = and(not(not(v('A'))), or(v('B'), c(false)));
    const result = simplify(expr);
    assertEquivalent(expr, result.expression);
  }, 2_000);

  it('preserves double-negation semantics', () => {
    assertEquivalent(not(not(v('A'))), v('A'));
  });

  it('preserves identity semantics', () => {
    assertEquivalent(and(v('A'), c(true)), v('A'));
    assertEquivalent(or(v('A'), c(false)), v('A'));
  });

  it('preserves domination semantics', () => {
    assertEquivalent(and(v('A'), c(false)), c(false));
    assertEquivalent(or(v('A'), c(true)), c(true));
  });

  it('preserves absorption semantics', () => {
    assertEquivalent(or(v('A'), and(v('A'), v('B'))), v('A'));

    assertEquivalent(and(v('A'), or(v('A'), v('B'))), v('A'));
  });

  it('preserves excluded-middle semantics', () => {
    assertEquivalent(or(v('A'), not(v('A'))), c(true));
  });

  it('preserves non-contradiction semantics', () => {
    assertEquivalent(and(v('A'), not(v('A'))), c(false));
  });

  it('preserves De Morgan expansion semantics', () => {
    assertEquivalent(not(and(v('A'), v('B'))), or(not(v('A')), not(v('B'))));

    assertEquivalent(not(or(v('A'), v('B'))), and(not(v('A')), not(v('B'))));
  });

  it('preserves distributive semantics', () => {
    assertEquivalent(and(v('A'), or(v('B'), v('C'))), or(and(v('A'), v('B')), and(v('A'), v('C'))));

    assertEquivalent(or(v('A'), and(v('B'), v('C'))), and(or(v('A'), v('B')), or(v('A'), v('C'))));
  });

  it('preserves XOR semantics', () => {
    assertEquivalent(xor(v('A'), c(false)), v('A'));
    assertEquivalent(xor(v('A'), c(true)), not(v('A')));
    assertEquivalent(xor(v('A'), v('A')), c(false));
  });

  it('preserves semantics after simplification', () => {
    const expr = and(not(not(v('A'))), or(v('B'), c(false)));

    assertEquivalent(expr, simplify(expr).expression);
  });
});
