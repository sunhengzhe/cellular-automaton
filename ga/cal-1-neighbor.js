/**
 * 每个个体为形如 01110101 长度为 8 的字符串
 * 每位取值 0 1，代表在该情况下的动作
 * 000
 * 001
 * 010
 * 011
 * 100
 * 101
 * 110
 * 111
 */
const { iteration } = require('../rules');

const GENE_LENGTH = 32;
const GENE_TYPE_COUNT = 2;
const POPULATION_SIZE = 500;
const TRY_TURNS = 100;
const TRY_TIMES_IN_ONE_TURN = 1000;
const CELL_LENGTH = 111;
const EVAL_TIMES = 2000;
const VARIATION_PROBABILITY = 0.08;
const CROSS_PROBABILITY = 0.82;
const MAX_VARI_COUNT = 3;

/**
 * 生成初始种群，每个种群含 POPULATION_SIZE 个随机个体
 */
const getInitPopulation = () => {
  const population = [];
  // 生成种群
  for (let i = 0; i < POPULATION_SIZE; i++) {
    // 随机生成一个个体
    let strategy = '';
    for (let j = 0; j < GENE_LENGTH; j++) {
      strategy += Math.floor(Math.random() * GENE_TYPE_COUNT);
    }
    // 将个体添加进种群
    population.push(strategy);
  }
  return population;
};

const getTheMostState = (cells) => {
  let closeStateCount = 0;

  for (const state of cells) {
    if (state === '1') {
      closeStateCount += 1;
    }
  }

  return closeStateCount > cells.length / 2 ? '1' : '0';
};

const getIndividualFitness = (strategy) => {
  let correctCount = 0;

  for (let tryCount = 0; tryCount < TRY_TURNS; tryCount++) {
    let cells = ([...new Array(CELL_LENGTH)]).map(() => Math.floor(Math.random() * 2)).join('');
    const expectState = getTheMostState(cells);

    for (let i = 0; i < TRY_TIMES_IN_ONE_TURN; i++) {
      cells = iteration(cells, strategy);
    }

    if (cells === expectState.repeat(CELL_LENGTH)) {
      correctCount += 1;
    }
  }

  return correctCount / TRY_TURNS;
};

/**
 * 计算种群适应度
 */
const getPopulationFitness = (population) => {
  const scoreList = [];

  for (const item of population) {
    // 对每个个体计算适应度
    const score = getIndividualFitness(item);
    scoreList.push({
      strategy: item,
      score,
    });
  }

  return scoreList;
};

/**
 * 获取种群平均适应度
 */
const getAverageFitness = (scoreList) => {
  const average = scoreList.reduce((cur, prev) => ({
    score: cur.score + prev.score,
  })).score / scoreList.length;
  return average;
};

/**
 * 进化
 */
const evolve = (scoreList) => {
  // 从小到大排列
  scoreList.sort((a, b) => a.score - b.score);

  console.log('平均适应度', getAverageFitness(scoreList));
  console.log('最高分', scoreList[scoreList.length - 1].strategy, scoreList[scoreList.length - 1].score);

  // 调整分数，保证所有分数都是正数以计算概率
  // 绝对值 + 1
  const adjust = Math.abs(scoreList[0].score) + 1;
  scoreList.forEach((item, index, arr) => {
    // 次方 4: 300
    // 次方 2: 400
    arr[index].score = Math.pow(arr[index].score + adjust, 2);
  });
  // 总分数
  const total = scoreList.reduce((cur, prev) => ({
    score: cur.score + prev.score,
  })).score;
  // 生成轮盘
  const weigthArr = [];
  let prevWeight = 0;
  for (let i = 0; i < scoreList.length; i++) {
    const weight = scoreList[i].score / total + prevWeight;
    weigthArr.push(weight);
    prevWeight = weight;
  }

  // 交叉点
  let rPos = Math.floor(Math.random() * GENE_LENGTH);
  while (rPos === 0) {
    // 交叉点不能等于 0
    rPos = Math.floor(Math.random() * GENE_LENGTH);
  }

  // 下一代总群
  const newPopulation = [];
  while (newPopulation.length < POPULATION_SIZE) {
    let father; let
      mother;
    // 生成父亲
    const r1 = Math.random();
    for (let i = 0; i < weigthArr.length; i++) {
      if (r1 <= weigthArr[i]) {
        father = scoreList[i].strategy;
        break;
      }
    }
    // 生成母亲
    const r2 = Math.random();
    for (let i = 0; i < weigthArr.length; i++) {
      if (r2 <= weigthArr[i]) {
        mother = scoreList[i].strategy;
        break;
      }
    }
    // 生成后代
    let child1; let
      child2;
    // 交叉概率
    const crossRate = Math.random();

    if (crossRate < CROSS_PROBABILITY) {
      child1 = father.slice(0, rPos) + mother.slice(rPos);
      child2 = mother.slice(0, rPos) + father.slice(rPos);
    } else {
      child1 = father;
      child2 = mother;
    }

    // 变异
    let r = Math.random();
    if (r < VARIATION_PROBABILITY) {
      const rCount = Math.floor(Math.random() * (MAX_VARI_COUNT - 1)) + 1;
      for (let i = 0; i < rCount; i++) {
        // 该处基因变异
        const rIndex = Math.floor(Math.random() * GENE_LENGTH);
        let newGen = Math.floor(Math.random() * GENE_TYPE_COUNT);
        while (newGen == child1[rIndex]) { // 数字和字符串的比较
          // 变异基因和原先不一样
          newGen = Math.floor(Math.random() * GENE_TYPE_COUNT);
        }

        child1 = child1.slice(0, rIndex) + newGen + child1.slice(rIndex + 1);
      }
    }
    r = Math.random();
    if (r < VARIATION_PROBABILITY) {
      const rCount = Math.floor(Math.random() * (MAX_VARI_COUNT - 1)) + 1;
      for (let i = 0; i < rCount; i++) {
        // 该处基因变异
        const rIndex = Math.floor(Math.random() * GENE_LENGTH);
        let newGen = Math.floor(Math.random() * GENE_TYPE_COUNT);
        while (newGen == child2[rIndex]) { // 数字和字符串的比较
          newGen = Math.floor(Math.random() * GENE_TYPE_COUNT);
        }

        child2 = child2.slice(0, rIndex) + newGen + child2.slice(rIndex + 1);
      }
    }

    newPopulation.push(child1, child2);
  }

  return newPopulation;
};

const start = () => {
  // 初始化种群
  let population = getInitPopulation();
  let scoreList;

  for (let i = 0; i < EVAL_TIMES; i++) {
    // 计算种群的适应度
    scoreList = getPopulationFitness(population);
    // 进化产生新种群
    population = evolve(scoreList);
  }
};

start();
