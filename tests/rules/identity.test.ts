import { describe, expect, it } from 'vitest';
import { identity } from '../../src/rules';
import { and, c, not, or, v, xor } from '../helpers';

describe('identity', () => {
  describe('AND identity: A AND TRUE = A', () => {
    it('simplifies TRUE on the right', () => {
      expect(identity.apply(and(v('A'), c(true)))).toEqual(v('A'));
    });

    it('simplifies TRUE on the left', () => {
      expect(identity.apply(and(c(true), v('A')))).toEqual(v('A'));
    });

    it('preserves nested expressions', () => {
      const expr = and(and(v('A'), v('B')), c(true));

      expect(identity.apply(expr)).toEqual(and(v('A'), v('B')));
    });
  });

  describe('OR identity: A OR FALSE = A', () => {
    it('simplifies FALSE on the right', () => {
      expect(identity.apply(or(v('A'), c(false)))).toEqual(v('A'));
    });

    it('simplifies FALSE on the left', () => {
      expect(identity.apply(or(c(false), v('A')))).toEqual(v('A'));
    });

    it('preserves nested expressions', () => {
      const expr = or(or(v('A'), v('B')), c(false));

      expect(identity.apply(expr)).toEqual(or(v('A'), v('B')));
    });
  });

  describe('non-matching expressions', () => {
    it('does not rewrite AND with FALSE', () => {
      expect(identity.apply(and(v('A'), c(false)))).toBeNull();
    });

    it('does not rewrite OR with TRUE', () => {
      expect(identity.apply(or(v('A'), c(true)))).toBeNull();
    });

    it('does not rewrite unrelated binary expressions', () => {
      expect(identity.apply(and(v('A'), v('B')))).toBeNull();

      expect(identity.apply(or(v('A'), v('B')))).toBeNull();
    });

    it('does not rewrite NOT expressions', () => {
      expect(identity.apply(not(v('A')))).toBeNull();
    });

    it('does not rewrite XOR expressions', () => {
      expect(identity.apply(xor(v('A'), c(false)))).toBeNull();
    });

    it('does not rewrite constants by themselves', () => {
      expect(identity.apply(c(true))).toBeNull();
      expect(identity.apply(c(false))).toBeNull();
    });
  });
});
