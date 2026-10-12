import type { Expr } from '@/ast.js';

export interface RewriteRule {
  id: string;
  name: string;
  description: string;
  cost: number;

  apply(expr: Expr): Expr | null;
}

export interface RewriteStep {
  ruleId: string;
  ruleName: string;
  before: Expr;
  after: Expr;
}

export interface SimplifyOptions {
  maxStates?: number;
  maxDepth?: number;
}

export const isConst = (expr: Expr, value: boolean): boolean =>
  expr.type === 'const' && expr.value === value;
