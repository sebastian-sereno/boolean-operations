import type { Expr } from '../ast.js';
import { sameExpr } from '../equality.js';
import type { RewriteRule } from './types.js';

const isConst = (expr: Expr, value: boolean): boolean =>
  expr.type === 'const' && expr.value === value;

export const xorIdentity: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'xor') return null;

    if (isConst(expr.left, false)) return expr.right;
    if (isConst(expr.right, false)) return expr.left;

    return null;
  },
  cost: 1,
  description: 'A XOR FALSE = A',
  id: 'xor-identity',
  name: 'XOR Identity',
};

export const xorNegation: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'xor') return null;

    if (isConst(expr.left, true)) {
      return { operand: expr.right, type: 'not' };
    }

    if (isConst(expr.right, true)) {
      return { operand: expr.left, type: 'not' };
    }

    return null;
  },
  cost: 1,
  description: 'A XOR TRUE = NOT A',
  id: 'xor-negation',
  name: 'XOR Negation',
};

export const xorIdempotence: RewriteRule = {
  apply(expr) {
    if (expr.type === 'xor' && sameExpr(expr.left, expr.right)) {
      return { type: 'const', value: false };
    }

    return null;
  },
  cost: 1,
  description: 'A XOR A = FALSE',
  id: 'xor-idempotence',
  name: 'XOR Self-Cancellation',
};

export const xorComplement: RewriteRule = {
  apply(expr) {
    if (expr.type !== 'xor') return null;

    const isComplement = (a: Expr, b: Expr): boolean =>
      (a.type === 'not' && sameExpr(a.operand, b)) || (b.type === 'not' && sameExpr(b.operand, a));

    if (isComplement(expr.left, expr.right)) {
      return { type: 'const', value: true };
    }

    return null;
  },
  cost: 1,
  description: 'A XOR NOT A = TRUE',
  id: 'xor-complement',
  name: 'XOR Complement',
};

export const xorRules: RewriteRule[] = [xorIdentity, xorNegation, xorIdempotence, xorComplement];
