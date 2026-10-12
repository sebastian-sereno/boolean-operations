import { absorption, conditionalAbsorption, negatedAndOrAbsorption } from './absorption.js';
import { excludedMiddle, nonContradiction } from './complements.js';
import { constantNegation, domination } from './constants.js';
import { deMorganCompress, deMorganExpand } from './de-morgan.js';
import { distributive, xor_distributive } from './distributive.js';
import { idempotence, identity } from './identity.js';
import { doubleNegation } from './negation.js';
import { xorComplement, xorIdempotence, xorIdentity, xorNegation, xorRules } from './xor.js';

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
