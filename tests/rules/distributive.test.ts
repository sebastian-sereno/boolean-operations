import { describe, expect, it } from 'vitest';
import { distributive } from '../../src/rules';
import { and, or, v } from '../helpers';

describe('distributive', () => {
  it('expands A AND (B OR C)', () => {
    expect(distributive.apply(and(v('A'), or(v('B'), v('C'))))).toEqual(
      or(and(v('A'), v('B')), and(v('A'), v('C'))),
    );
  });

  it('expands (A OR B) AND C', () => {
    expect(distributive.apply(and(or(v('A'), v('B')), v('C')))).toEqual(
      or(and(v('A'), v('C')), and(v('B'), v('C'))),
    );
  });

  it('expands A OR (B AND C)', () => {
    expect(distributive.apply(or(v('A'), and(v('B'), v('C'))))).toEqual(
      and(or(v('A'), v('B')), or(v('A'), v('C'))),
    );
  });

  it('expands (A AND B) OR C', () => {
    expect(distributive.apply(or(and(v('A'), v('B')), v('C')))).toEqual(
      and(or(v('A'), v('C')), or(v('B'), v('C'))),
    );
  });

  it('does not rewrite expressions without a distributive pattern', () => {
    expect(distributive.apply(and(v('A'), v('B')))).toBeNull();
    expect(distributive.apply(or(v('A'), v('B')))).toBeNull();
  });
});
