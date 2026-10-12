import type { Expr } from '../ast.js';

type Token = string;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const pattern =
    /\s*(\(|\)|&&|\|\||!|&|\||\bAND\b|\bOR\b|\bXOR\b|\bNOT\b|\bTRUE\b|\bFALSE\b|[A-Za-z_]\w*)/iy;

  let position = 0;

  while (position < input.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(input);

    if (!match || match[0].length === 0) {
      throw new Error(`Unexpected character at position ${position + 1}`);
    }

    tokens.push(match[1]!);
    position = pattern.lastIndex;
  }

  return tokens;
}

export function parse(input: string): Expr {
  const tokens = tokenize(input);
  let position = 0;

  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  function parsePrimary(): Expr {
    const token = consume();

    if (token === undefined) {
      throw new Error('Unexpected end of expression');
    }

    if (token === '(') {
      const expr = parseOr();

      if (consume() !== ')') {
        throw new Error('Expected closing parenthesis');
      }

      return expr;
    }

    if (/^(NOT|!)$/i.test(token)) {
      return { operand: parsePrimary(), type: 'not' };
    }

    if (/^(TRUE)$/i.test(token)) {
      return { type: 'const', value: true };
    }

    if (/^(FALSE)$/i.test(token)) {
      return { type: 'const', value: false };
    }

    if (/^[A-Za-z_]\w*$/.test(token)) {
      return { name: token, type: 'variable' };
    }

    throw new Error(`Unexpected token: ${token}`);
  }

  function parseAnd(): Expr {
    let left = parsePrimary();

    while (/^(AND|&&|&)$/i.test(peek() ?? '')) {
      consume();
      left = {
        left,
        right: parsePrimary(),
        type: 'and',
      };
    }

    return left;
  }

  function parseXor(): Expr {
    let left = parseAnd();

    while (/^XOR$/i.test(peek() ?? '')) {
      consume();
      left = {
        left,
        right: parseAnd(),
        type: 'xor',
      };
    }

    return left;
  }

  function parseOr(): Expr {
    let left = parseXor();

    while (/^(OR|\|\|? )$/i.test(peek() ?? '')) {
      consume();
      left = {
        left,
        right: parseXor(),
        type: 'or',
      };
    }

    // Handle OR and || without requiring whitespace.
    while (peek() === 'OR' || peek() === '||' || peek() === '|') {
      consume();
      left = {
        left,
        right: parseXor(),
        type: 'or',
      };
    }

    return left;
  }

  if (tokens.length === 0) {
    throw new Error('Enter an expression');
  }

  const expression = parseOr();

  if (position !== tokens.length) {
    throw new Error(`Unexpected token: ${peek()}`);
  }

  return expression;
}
