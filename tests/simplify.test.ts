import { describe, expect, it } from 'vitest';
import { simplify } from '../src/simplify';
import { expressionWeight } from '../src/weight';
import { and, c, not, or, v } from './helpers';

describe('simplify', () => {
  it('simplifies double negation', () => {
    const result = simplify(not(not(v('A'))));

    expect(result.expression).toEqual(v('A'));
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('simplifies NOT (A AND B) OR B to TRUE', () => {
    const expr = or(not(and(v('A'), v('B'))), v('B'));
    const result = simplify(expr);

    expect(result.expression).toEqual(c(true));
  });

  it('simplifies identity expressions', () => {
    const result = simplify(and(v('A'), c(true)));

    expect(result.expression).toEqual(v('A'));
  });

  it('simplifies domination expressions', () => {
    const result = simplify(or(v('A'), c(true)));

    expect(result.expression).toEqual(c(true));
  });

  it('simplifies duplicate operands', () => {
    const result = simplify(and(v('A'), v('A')));

    expect(result.expression).toEqual(v('A'));
  });

  it('simplifies nested constant expressions', () => {
    const expr = and(and(v('A'), c(true)), c(true));

    const result = simplify(expr);

    expect(result.expression).toEqual(v('A'));
  });

  it('simplifies constant negation', () => {
    const result = simplify(not(c(false)));

    expect(result.expression).toEqual(c(true));
  });

  it('records rewrite steps', () => {
    const result = simplify(not(not(v('A'))));

    expect(result.steps.length).toBeGreaterThan(0);

    for (const step of result.steps) {
      expect(step.ruleId).toBeTruthy();
      expect(step.ruleName).toBeTruthy();
      expect(step.before).toBeDefined();
      expect(step.after).toBeDefined();
    }
  });

  it('never returns a heavier expression for a weight-reducing run', () => {
    const expr = and(not(not(v('A'))), c(true));

    const result = simplify(expr);

    expect(expressionWeight(result.expression)).toBeLessThanOrEqual(expressionWeight(expr));
  });

  it('handles an already simplified expression', () => {
    const expr = v('A');
    const result = simplify(expr);

    expect(result.expression).toEqual(expr);
    expect(result.steps).toHaveLength(0);
  });

  it('handles constant-only expressions', () => {
    const result = simplify(and(c(true), c(false)));

    expect(result.expression).toEqual(c(false));
  });
});
