import type { Expr } from './ast.js';

export interface ExpressionCost {
  literalWeight: number;
  operatorWeight: number;
  constantWeight: number;
  xorWeight: number;
}

export const defaultCost: ExpressionCost = {
  constantWeight: 0,
  literalWeight: 1,
  operatorWeight: 1,
  xorWeight: 2,
};

export function expressionWeight(expr: Expr, cost: ExpressionCost = defaultCost): number {
  switch (expr.type) {
    case 'const':
      return cost.constantWeight;

    case 'variable':
      return cost.literalWeight;

    case 'not':
      return cost.operatorWeight + expressionWeight(expr.operand, cost);

    case 'and':
    case 'or':
      return (
        cost.operatorWeight + expressionWeight(expr.left, cost) + expressionWeight(expr.right, cost)
      );

    case 'xor':
      return (
        cost.xorWeight + expressionWeight(expr.left, cost) + expressionWeight(expr.right, cost)
      );
  }
}
