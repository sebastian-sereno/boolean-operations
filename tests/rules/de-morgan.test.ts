import { describe, expect, it } from 'vitest';
import { deMorganCompress, deMorganExpand } from '../../src/rules';
import { and, not, or, v } from '../helpers';

describe('De Morgan expansion', () => {
  it('expands NOT (A AND B)', () => {
    expect(deMorganExpand.apply(not(and(v('A'), v('B'))))).toEqual(or(not(v('A')), not(v('B'))));
  });

  it('expands NOT (A OR B)', () => {
    expect(deMorganExpand.apply(not(or(v('A'), v('B'))))).toEqual(and(not(v('A')), not(v('B'))));
  });

  it('does not expand a negated variable', () => {
    expect(deMorganExpand.apply(not(v('A')))).toBeNull();
  });
});

describe('De Morgan compression', () => {
  it('compresses NOT A AND NOT B', () => {
    expect(deMorganCompress.apply(and(not(v('A')), not(v('B'))))).toEqual(not(or(v('A'), v('B'))));
  });

  it('compresses NOT A OR NOT B', () => {
    expect(deMorganCompress.apply(or(not(v('A')), not(v('B'))))).toEqual(not(and(v('A'), v('B'))));
  });

  it('does not compress non-negated operands', () => {
    expect(deMorganCompress.apply(and(v('A'), not(v('B'))))).toBeNull();
  });
});
