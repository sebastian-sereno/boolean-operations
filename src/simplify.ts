import type { Expr } from './ast.js';
import { defaultRules } from './rules/index.js';
import type { RewriteRule, RewriteStep } from './rules/types.js';
import { searchSimplify } from './search.js';
import type { ExpressionCost } from './weight.js';

export interface SimplifyResult {
  expression: Expr;
  steps: RewriteStep[];
  weight: number;
  explored: number;
}

export interface SimplifyOptions {
  maxStates?: number;
  maxDepth?: number;
  cost?: ExpressionCost;
}

export function simplify(
  expr: Expr,
  rules: RewriteRule[] = defaultRules,
  options: SimplifyOptions = {},
): SimplifyResult {
  return searchSimplify(expr, rules, options);
}
