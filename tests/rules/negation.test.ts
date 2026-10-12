import { describe, expect, it } from 'vitest';
import { doubleNegation, idempotence } from '../../src/rules';
import { and, not, or, v } from '../helpers';

describe('doubleNegation', () => {
  it('reduces NOT NOT A to A', () => {
    expect(doubleNegation.apply(not(not(v('A'))))).toEqual(v('A'));
  });

  it('reduces nested double negation', () => {
    expect(doubleNegation.apply(not(not(not(not(v('A'))))))).toEqual(not(not(v('A'))));
  });

  it('does not rewrite a single negation', () => {
    expect(doubleNegation.apply(not(v('A')))).toBeNull();
  });
});

describe('idempotence', () => {
  it('reduces A AND A to A', () => {
    expect(idempotence.apply(and(v('A'), v('A')))).toEqual(v('A'));
  });

  it('reduces A OR A to A', () => {
    expect(idempotence.apply(or(v('A'), v('A')))).toEqual(v('A'));
  });

  it('does not simplify different operands', () => {
    expect(idempotence.apply(and(v('A'), v('B')))).toBeNull();
    expect(idempotence.apply(or(v('A'), v('B')))).toBeNull();
  });
});
