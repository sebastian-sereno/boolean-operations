import { describe, expect, it } from 'vitest';
import { excludedMiddle, nonContradiction } from '../../src/rules';
import { and, c, not, or, v } from '../helpers';

describe('excludedMiddle', () => {
  it('reduces A OR NOT A to TRUE', () => {
    expect(excludedMiddle.apply(or(v('A'), not(v('A'))))).toEqual(c(true));
  });

  it('handles reversed complements', () => {
    expect(excludedMiddle.apply(or(not(v('A')), v('A')))).toEqual(c(true));
  });

  it('does not match unrelated operands', () => {
    expect(excludedMiddle.apply(or(v('A'), not(v('B'))))).toBeNull();
  });
});

describe('nonContradiction', () => {
  it('reduces A AND NOT A to FALSE', () => {
    expect(nonContradiction.apply(and(v('A'), not(v('A'))))).toEqual(c(false));
  });

  it('handles reversed complements', () => {
    expect(nonContradiction.apply(and(not(v('A')), v('A')))).toEqual(c(false));
  });

  it('finds complements in nested AND expressions', () => {
    const expr = and(and(v('A'), v('B')), not(v('A')));

    expect(nonContradiction.apply(expr)).toEqual(c(false));
  });

  it('does not match unrelated operands', () => {
    expect(nonContradiction.apply(and(v('A'), not(v('B'))))).toBeNull();
  });
});
