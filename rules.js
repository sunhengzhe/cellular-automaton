const RULES = '00000101000001100001010110000111000001110000010000010101010101110110010001110111000001010000000101111101111111111011011101111111';

const getNeighbors = (i, radius, cells) => {
  let rightAndMiddle = cells.slice(i, i + radius + 1);
  if (rightAndMiddle.length < radius + 1) {
    rightAndMiddle += cells.slice(0, radius + 1 - rightAndMiddle.length);
  }

  let left = '';
  if (i < radius) {
    left = cells.slice(i - radius) + cells.slice(0, i);
  } else {
    left = cells.slice(i - radius, i);
  }

  return left + rightAndMiddle;
};

function iteration(cells, rules) {
  const radius = (Math.log2(rules.length) - 1) / 2;

  const newCells = [];
  for (let i = 0; i < cells.length; i++) {
    const neighbors = getNeighbors(i, radius, cells);
    const rulesIndex = parseInt(neighbors, 2);
    const newState = rules[rulesIndex];
    newCells[i] = newState;
  }

  return newCells.join('');
}

module.exports = {
  getNeighbors,
  iteration,
};
