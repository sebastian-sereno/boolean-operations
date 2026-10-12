import { describe, expect, it } from 'vitest';
import { defaultRules } from '../src/rules/index.js';
import type { RewriteRule } from '../src/rules/types.js';
import { searchSimplify } from '../src/search.js';
import { expressionWeight } from '../src/weight.js';
import { and, c, not, or, v } from './helpers.js';

describe('searchSimplify', () => {
  it('finds a simpler double-negation expression', () => {
    const input = not(not(v('A')));

    const result = searchSimplify(input, defaultRules);

    expect(result.expression).toEqual(v('A'));
    expect(result.weight).toBeLessThan(expressionWeight(input));
  });

  it('finds a constant solution', () => {
    const input = or(v('A'), not(v('A')));

    const result = searchSimplify(input, defaultRules);

    expect(result.expression).toEqual(c(true));
  });

  it('returns the input when no rules apply', () => {
    const input = v('A');

    const result = searchSimplify(input, []);

    expect(result.expression).toEqual(input);
    expect(result.steps).toHaveLength(0);
  });

  it('respects the search-state budget', () => {
    const result = searchSimplify(and(v('A'), v('B')), defaultRules, { maxStates: 1 });

    expect(result.explored).toBeLessThanOrEqual(1);
  });

  it('respects the depth limit', () => {
    const input = not(not(v('A')));

    const result = searchSimplify(input, defaultRules, { maxDepth: 0 });

    expect(result.expression).toEqual(input);
    expect(result.steps).toHaveLength(0);
  });

  it('does not accept a no-op rewrite', () => {
    const noOp: RewriteRule = {
      apply: (expr) => expr,
      cost: 8,
      description: 'Returns the input unchanged',
      id: 'no-op',
      name: 'No operation',
    };

    const result = searchSimplify(v('A'), [noOp]);

    expect(result.expression).toEqual(v('A'));
    expect(result.steps).toHaveLength(0);
  });

  it('finds the lower-weight result among alternatives', () => {
    const alternative: RewriteRule = {
      apply(expr) {
        if (expr.type === 'and') return expr.left;
        return null;
      },
      cost: 10,
      description: 'Rewrites A AND B to A',
      id: 'alternative',
      name: 'Alternative',
    };

    const input = and(v('A'), v('B'));

    const result = searchSimplify(input, [alternative]);

    expect(result.expression).toEqual(v('A'));
    expect(result.weight).toBeLessThan(expressionWeight(input));
  });
});
