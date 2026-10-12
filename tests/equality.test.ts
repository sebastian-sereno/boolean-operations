import { describe, expect, it } from 'vitest';
import { sameExpr } from '../src/equality';
import { and, c, not, or, v, xor } from './helpers';

describe('sameExpr', () => {
  it('recognizes identical variables', () => {
    expect(sameExpr(v('A'), v('A'))).toBe(true);
  });

  it('distinguishes different variables', () => {
    expect(sameExpr(v('A'), v('B'))).toBe(false);
  });

  it('compares constants by value', () => {
    expect(sameExpr(c(true), c(true))).toBe(true);
    expect(sameExpr(c(true), c(false))).toBe(false);
  });

  it('compares nested negations', () => {
    expect(sameExpr(not(not(v('A'))), not(not(v('A'))))).toBe(true);

    expect(sameExpr(not(v('A')), not(v('B')))).toBe(false);
  });

  it('compares binary operators recursively', () => {
    expect(sameExpr(and(v('A'), v('B')), and(v('A'), v('B')))).toBe(true);

    expect(sameExpr(and(v('A'), v('B')), and(v('A'), v('C')))).toBe(false);
  });

  it('distinguishes different operators', () => {
    expect(sameExpr(and(v('A'), v('B')), or(v('A'), v('B')))).toBe(false);

    expect(sameExpr(or(v('A'), v('B')), xor(v('A'), v('B')))).toBe(false);
  });

  it('preserves operand order for structural equality', () => {
    expect(sameExpr(and(v('A'), v('B')), and(v('B'), v('A')))).toBe(false);
  });

  it('distinguishes different tree shapes', () => {
    expect(sameExpr(and(and(v('A'), v('B')), v('C')), and(v('A'), and(v('B'), v('C'))))).toBe(
      false,
    );
  });

  it('distinguishes constants from variables', () => {
    expect(sameExpr(c(true), v('A'))).toBe(false);
  });
});
