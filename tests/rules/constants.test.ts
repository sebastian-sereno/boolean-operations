import { describe, expect, it } from 'vitest';
import { constantNegation, domination, identity } from '../../src/rules';
import { and, c, not, or, v } from '../helpers';

describe('identity', () => {
  it.each([
    [and(v('A'), c(true)), v('A')],
    [and(c(true), v('A')), v('A')],
    [or(v('A'), c(false)), v('A')],
    [or(c(false), v('A')), v('A')],
  ])('simplifies identity expressions', (input, expected) => {
    expect(identity.apply(input)).toEqual(expected);
  });

  it('does not rewrite unrelated expressions', () => {
    expect(identity.apply(and(v('A'), v('B')))).toBeNull();
    expect(identity.apply(or(v('A'), v('B')))).toBeNull();
  });
});

describe('domination', () => {
  it.each([
    [and(v('A'), c(false)), c(false)],
    [and(c(false), v('A')), c(false)],
    [or(v('A'), c(true)), c(true)],
    [or(c(true), v('A')), c(true)],
  ])('simplifies domination expressions', (input, expected) => {
    expect(domination.apply(input)).toEqual(expected);
  });
});

describe('constantNegation', () => {
  it('simplifies NOT TRUE', () => {
    expect(constantNegation.apply(not(c(true)))).toEqual(c(false));
  });

  it('simplifies NOT FALSE', () => {
    expect(constantNegation.apply(not(c(false)))).toEqual(c(true));
  });

  it('does not rewrite negated variables', () => {
    expect(constantNegation.apply(not(v('A')))).toBeNull();
  });
});
