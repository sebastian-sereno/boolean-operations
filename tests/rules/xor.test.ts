import { describe, expect, it } from 'vitest';
import { xorComplement, xorIdempotence, xorIdentity, xorNegation } from '../../src/rules';
import { and, c, not, or, v, xor } from '../helpers';

describe('xorIdentity', () => {
  it('simplifies A XOR FALSE', () => {
    expect(xorIdentity.apply(xor(v('A'), c(false)))).toEqual(v('A'));
  });

  it('simplifies FALSE XOR A', () => {
    expect(xorIdentity.apply(xor(c(false), v('A')))).toEqual(v('A'));
  });

  it('does not rewrite XOR with TRUE', () => {
    expect(xorIdentity.apply(xor(v('A'), c(true)))).toBeNull();
  });
});

describe('xorNegation', () => {
  it('simplifies A XOR TRUE', () => {
    expect(xorNegation.apply(xor(v('A'), c(true)))).toEqual(not(v('A')));
  });

  it('simplifies TRUE XOR A', () => {
    expect(xorNegation.apply(xor(c(true), v('A')))).toEqual(not(v('A')));
  });

  it('does not rewrite XOR with FALSE', () => {
    expect(xorNegation.apply(xor(v('A'), c(false)))).toBeNull();
  });
});

describe('xorIdempotence', () => {
  it('simplifies A XOR A to FALSE', () => {
    expect(xorIdempotence.apply(xor(v('A'), v('A')))).toEqual(c(false));
  });

  it('handles structurally identical nested expressions', () => {
    const expr = and(v('A'), v('B'));

    expect(xorIdempotence.apply(xor(expr, expr))).toEqual(c(false));
  });

  it('does not rewrite different operands', () => {
    expect(xorIdempotence.apply(xor(v('A'), v('B')))).toBeNull();
  });
});

describe('xorComplement', () => {
  it('simplifies A XOR NOT A to TRUE', () => {
    expect(xorComplement.apply(xor(v('A'), not(v('A'))))).toEqual(c(true));
  });

  it('simplifies NOT A XOR A to TRUE', () => {
    expect(xorComplement.apply(xor(not(v('A')), v('A')))).toEqual(c(true));
  });

  it('detects complements of compound expressions', () => {
    const expr = and(v('A'), v('B'));

    expect(xorComplement.apply(xor(expr, not(expr)))).toEqual(c(true));
  });

  it('does not rewrite unrelated operands', () => {
    expect(xorComplement.apply(xor(v('A'), not(v('B'))))).toBeNull();
  });
});

describe('XOR rules do not match unrelated operators', () => {
  it('does not apply XOR identity to AND or OR', () => {
    expect(xorIdentity.apply(and(v('A'), c(false)))).toBeNull();

    expect(xorIdentity.apply(or(v('A'), c(false)))).toBeNull();
  });
});
