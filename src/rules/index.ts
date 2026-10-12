import { absorption, conditionalAbsorption, negatedAndOrAbsorption } from '@/rules/absorption.js';
import { excludedMiddle, nonContradiction } from '@/rules/complements.js';
import { constantNegation, domination } from '@/rules/constants.js';
import { deMorganCompress, deMorganExpand } from '@/rules/de-morgan.js';
import { distributive, xor_distributive } from '@/rules/distributive.js';
import { idempotence, identity } from '@/rules/identity.js';
import { doubleNegation } from '@/rules/negation.js';
import { xorComplement, xorIdempotence, xorIdentity, xorNegation, xorRules } from '@/rules/xor.js';

export {
  absorption,
  conditionalAbsorption,
  constantNegation,
  deMorganCompress,
  deMorganExpand,
  distributive,
  domination,
  doubleNegation,
  excludedMiddle,
  idempotence,
  identity,
  negatedAndOrAbsorption,
  nonContradiction,
  xor_distributive,
  xorComplement,
  xorIdempotence,
  xorIdentity,
  xorNegation,
};

export const simplificationRules = [
  identity,
  distributive,
  domination,
  constantNegation,
  doubleNegation,
  idempotence,
  absorption,
  conditionalAbsorption,
  negatedAndOrAbsorption,
  excludedMiddle,
  nonContradiction,
  deMorganCompress,
  xor_distributive,
  ...xorRules,
];

export const transformationRules = [deMorganExpand, distributive];

export const defaultRules = simplificationRules;
