import { absorption } from './absorption.js';
import { excludedMiddle, nonContradiction } from './complements.js';
import { constantNegation, domination } from './constants.js';
import { deMorganCompress, deMorganExpand } from './de-morgan.js';
import { distributive } from './distributive.js';
import { idempotence, identity } from './identity.js';
import { doubleNegation } from './negation.js';
import { xorComplement, xorIdempotence, xorIdentity, xorNegation, xorRules } from './xor.js';

export {
  absorption,
  constantNegation,
  deMorganCompress,
  deMorganExpand,
  distributive,
  domination,
  doubleNegation,
  excludedMiddle,
  idempotence,
  identity,
  nonContradiction,
  xorComplement,
  xorIdempotence,
  xorIdentity,
  xorNegation,
};

export const simplificationRules = [
  identity,
  domination,
  constantNegation,
  doubleNegation,
  idempotence,
  absorption,
  excludedMiddle,
  nonContradiction,
  deMorganCompress,
  ...xorRules,
];

export const transformationRules = [deMorganExpand, distributive];

export const defaultRules = simplificationRules;
