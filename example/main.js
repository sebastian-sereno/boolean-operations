import { parse } from '../dist/logic/parser.js';
import { printExpr } from '../dist/logic/printer.js';
import { simplify } from '../dist/simplify.js';

// import type { Expr } from "./logic/ast.js";

/** @typedef {import('../dist/ast.js').Expr} Expr */

/** @type { HTMLTextAreaElement } */
const input = document.querySelector('#expression');

/** @type { HTMLElement } */
const result = document.querySelector('#result');
/** @type { HTMLOListElement } */
const history = document.querySelector('#history');
/** @type { HTMLElement } */
const tree = document.querySelector('#expression-tree');
/** @type { HTMLElement } */
const error = document.querySelector('#error');

/** @type { HTMLButtonElement } */
const simplifyButton = document.querySelector('#simplify-button');
/** @type { HTMLButtonElement } */
const resetButton = document.querySelector('#reset-button');

const startTree = document.querySelector('#start-tree');
const endTree = document.querySelector('#end-tree');
const playButton = document.querySelector('#play-button');
const previousButton = document.querySelector('#previous-step');
const nextButton = document.querySelector('#next-step');
const speedSelect = document.querySelector('#animation-speed');
const currentRule = document.querySelector('#current-rule');
const currentDescription = document.querySelector('#current-description');
const stepCounter = document.querySelector('#step-counter');
const progressTrack = document.querySelector('#progress-track');
const progressFill = document.querySelector('#progress-fill');
const playbackStatus = document.querySelector('#playback-status');

let originalExpression = null;
let finalExpression = null;
let steps = [];
let stepIndex = 0;
let playbackTimer = null;
let isPlaying = false;
let runId = 0;

/**
 * @param {Expr} expr
 * @param {HTMLElement} container
 */
function renderTree(expr, container) {
  container.replaceChildren();

  /**
   * @param {Expr} node
   * @returns {HTMLElement}
   */
  function buildNode(node) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tree-branch';

    const label = document.createElement('div');
    label.className = 'tree-node';

    switch (node.type) {
      case 'variable':
        label.textContent = node.name;
        break;

      case 'const':
        label.textContent = node.value ? 'TRUE' : 'FALSE';
        break;

      case 'not':
        label.textContent = 'NOT';
        label.classList.add('operator');
        break;

      case 'and':
      case 'or':
      case 'xor':
        label.textContent = node.type.toUpperCase();
        label.classList.add('operator');
        break;
    }

    wrapper.appendChild(label);

    if (node.type === 'not') {
      const children = document.createElement('div');
      children.className = 'tree-children';
      children.appendChild(buildNode(node.operand));
      wrapper.appendChild(children);
    }

    if (node.type === 'and' || node.type === 'or' || node.type === 'xor') {
      const children = document.createElement('div');
      children.className = 'tree-children';

      children.appendChild(buildNode(node.left));
      children.appendChild(buildNode(node.right));

      wrapper.appendChild(children);
    }

    return wrapper;
  }

  container.appendChild(buildNode(expr));
}

// Stop any scheduled playback.
function stopPlayback() {
  isPlaying = false;

  if (playbackTimer !== null) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  playButton.textContent = '▶ Play';
}

// Render a complete expression at a particular playback position.
// stepIndex is the number of transformations already applied.
function renderPlayback() {
  if (!originalExpression || !finalExpression) return;

  const total = steps.length;

  const displayedExpression = stepIndex === 0 ? originalExpression : steps[stepIndex - 1].after;

  renderTree(displayedExpression, startTree);

  // The final expression never changes during playback.
  renderTree(finalExpression, endTree);

  stepCounter.textContent = `Step ${stepIndex} of ${total}`;

  progressTrack.setAttribute('aria-valuemax', String(total));
  progressTrack.setAttribute('aria-valuenow', String(stepIndex));

  progressFill.style.width = `${total === 0 ? 100 : (stepIndex / total) * 100}%`;

  previousButton.disabled = isPlaying || stepIndex === 0;
  nextButton.disabled = isPlaying || stepIndex >= total;

  if (total === 0) {
    currentRule.textContent = 'Already simplified';
    currentDescription.textContent = 'No transformation rules were needed.';
    playbackStatus.textContent = 'Complete';
  } else if (stepIndex === 0) {
    currentRule.textContent = 'Ready to play';
    currentDescription.textContent = `The original expression is ${printExpr(originalExpression)}.`;
    playbackStatus.textContent = 'Ready';
  } else {
    const step = steps[stepIndex - 1];

    currentRule.textContent = step.ruleName;
    currentDescription.textContent = `${printExpr(step.before)} → ${printExpr(step.after)}`;

    playbackStatus.textContent = stepIndex === total ? 'Complete' : 'Step ' + stepIndex;
  }
}

function showStep(index) {
  stopPlayback();

  stepIndex = Math.max(0, Math.min(index, steps.length));
  renderPlayback();
}

function playNext() {
  if (!isPlaying) return;

  if (stepIndex >= steps.length) {
    stopPlayback();
    playbackStatus.textContent = 'Complete';
    renderPlayback();
    return;
  }

  stepIndex++;
  renderPlayback();

  // Keep the Play button in its pause state while running.
  playButton.textContent = 'Ⅱ Pause';
  previousButton.disabled = true;
  nextButton.disabled = true;

  playbackTimer = setTimeout(playNext, Number(speedSelect.value));
}

function togglePlayback() {
  if (!originalExpression || !finalExpression) return;

  if (isPlaying) {
    stopPlayback();
    playbackStatus.textContent = 'Paused';
    renderPlayback();
    return;
  }

  if (steps.length === 0) {
    renderPlayback();
    return;
  }

  // Replay from the beginning when already at the end.
  if (stepIndex >= steps.length) {
    stepIndex = 0;
    renderPlayback();
  }

  isPlaying = true;
  playbackStatus.textContent = 'Playing';
  playButton.textContent = 'Ⅱ Pause';

  playNext();
}

function renderHistory() {
  history.replaceChildren();

  if (steps.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'No transformations were needed.';
    history.appendChild(item);
    return;
  }

  steps.forEach((step, index) => {
    const item = document.createElement('li');

    const rule = document.createElement('span');
    rule.className = 'step-rule';
    rule.textContent = `${index + 1}. ${step.ruleName}`;

    const transformation = document.createElement('code');
    transformation.textContent = `${printExpr(step.before)} → ${printExpr(step.after)}`;

    const inspect = document.createElement('button');
    inspect.type = 'button';
    inspect.className = 'secondary';
    inspect.textContent = 'View step';
    inspect.addEventListener('click', () => {
      showStep(index + 1);
    });

    item.append(rule, transformation, inspect);
    history.appendChild(item);
  });
}

function runSimplifier() {
  stopPlayback();
  runId++;

  error.hidden = true;
  error.textContent = '';

  try {
    originalExpression = parse(input.value);

    const output = simplify(originalExpression);

    finalExpression = output.expression;
    steps = output.steps;
    stepIndex = 0;

    result.textContent = printExpr(finalExpression);

    // Preserve your existing single-tree panel if present.
    if (tree) {
      renderTree(finalExpression, tree);
    }

    renderHistory();
    renderPlayback();
  } catch (cause) {
    originalExpression = null;
    finalExpression = null;
    steps = [];
    stepIndex = 0;

    error.textContent = cause instanceof Error ? cause.message : 'Invalid expression';

    error.hidden = false;
    result.textContent = 'Unable to simplify expression.';

    history.replaceChildren();
    startTree.replaceChildren();
    endTree.replaceChildren();

    progressFill.style.width = '0%';
    currentRule.textContent = 'Unable to play';
    currentDescription.textContent = 'Fix the expression and try again.';
    playbackStatus.textContent = 'Error';
  }
}

playButton.addEventListener('click', togglePlayback);

previousButton.addEventListener('click', () => {
  showStep(stepIndex - 1);
});

nextButton.addEventListener('click', () => {
  showStep(stepIndex + 1);
});

speedSelect.addEventListener('change', () => {
  if (isPlaying) {
    stopPlayback();
    isPlaying = true;
    playbackStatus.textContent = 'Playing';
    playButton.textContent = 'Ⅱ Pause';
    playNext();
  }
});

simplifyButton.addEventListener('click', runSimplifier);

resetButton.addEventListener('click', () => {
  stopPlayback();
  runId++;

  input.value = '';
  originalExpression = null;
  finalExpression = null;
  steps = [];
  stepIndex = 0;

  result.textContent = 'Your result will appear here.';
  history.replaceChildren();
  tree.replaceChildren();
  startTree.replaceChildren();
  endTree.replaceChildren();

  error.hidden = true;
  progressFill.style.width = '0%';
  stepCounter.textContent = 'Step 0 of 0';
  currentRule.textContent = 'Ready to play';
  currentDescription.textContent = 'Enter an expression and select Simplify.';
  playbackStatus.textContent = 'Ready';

  previousButton.disabled = true;
  nextButton.disabled = true;
  playButton.textContent = '▶ Play';

  input.focus();
});

input.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    runSimplifier();
  }
});

runSimplifier();
