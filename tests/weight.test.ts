import { describe, expect, it } from 'vitest';
import { expressionWeight } from '../src/weight';
import { and, c, not, or, v, xor } from './helpers';

describe('expressionWeight', () => {
  it('assigns zero weight to constants', () => {
    expect(expressionWeight(c(true))).toBe(0);
    expect(expressionWeight(c(false))).toBe(0);
  });

  it('assigns unit weight to variables', () => {
    expect(expressionWeight(v('A'))).toBe(1);
  });

  it('counts negation operators', () => {
    expect(expressionWeight(not(v('A')))).toBe(2);
    expect(expressionWeight(not(not(v('A'))))).toBe(3);
  });

  it('counts AND and OR operators', () => {
    expect(expressionWeight(and(v('A'), v('B')))).toBe(3);
    expect(expressionWeight(or(v('A'), v('B')))).toBe(3);
  });

  it('applies the configured XOR cost', () => {
    expect(expressionWeight(xor(v('A'), v('B')))).toBe(4);
  });

  it('counts nested expressions recursively', () => {
    expect(expressionWeight(and(v('A'), or(v('B'), v('C'))))).toBe(5);
  });

  it('rewards double-negation elimination', () => {
    expect(expressionWeight(v('A'))).toBeLessThan(expressionWeight(not(not(v('A')))));
  });

  it('rewards identity simplification', () => {
    expect(expressionWeight(v('A'))).toBeLessThan(expressionWeight(and(v('A'), c(true))));
  });
});
