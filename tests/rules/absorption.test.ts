import { describe, expect, it } from 'vitest';
import { absorption } from '../../src/rules';
import { and, or, v } from '../helpers';

describe('absorption', () => {
  it('reduces A OR (A AND B) to A', () => {
    expect(absorption.apply(or(v('A'), and(v('A'), v('B'))))).toEqual(v('A'));
  });

  it('handles reversed OR operands', () => {
    expect(absorption.apply(or(and(v('A'), v('B')), v('A')))).toEqual(v('A'));
  });

  it('reduces A AND (A OR B) to A', () => {
    expect(absorption.apply(and(v('A'), or(v('A'), v('B'))))).toEqual(v('A'));
  });

  it('handles reversed AND operands', () => {
    expect(absorption.apply(and(or(v('A'), v('B')), v('A')))).toEqual(v('A'));
  });

  it('does not absorb unrelated expressions', () => {
    expect(absorption.apply(or(v('A'), and(v('B'), v('C'))))).toBeNull();
  });
});
