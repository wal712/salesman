// "Board" parameters

let size;
let numNodes;
let nodes = []
let indexes = []

// Lexocographic order variables
let bestLexOrder;
let bestLexScore;
let currLexScore;
let currLexOrder;

// Genetic algorithm variables
let generation;
let genSize;
let genFitness;
let bestGen;
let bestGenScore;

// Button variables
let sizeSlider;
let sizeLabel;

function setup() {
  createCanvas(800, 800);

  // Initializing buttons
  sizeSlider = createSlider(0, 100, 40, 1);
  sizeSlider.position(10, 70);
  textAlign(CENTER);
  textSize(20);
  sizeLabel = createElement('h2', 'Size of locations:');
  sizeLabel.position(10, 20);
  


  size = sizeSlider.value();
  numNodes = 9;

  // Makes numNodes random vectors and pushes to nodes list
  // Also creates list of indexes in nodes list
  for (let i = 0; i < numNodes; i++) {
    let newvec = createVector(getRandomInt(size, width - size), getRandomInt(size, height - size));
    // Checks for overlapping nodes
    for (const node of nodes) {
      while (Math.abs(newvec.x - node.x) < size || Math.abs(newvec.y - node.y) < size) {
        newvec = createVector(getRandomInt(size, width - size), getRandomInt(size, height - size))
      }
    }
    nodes.push(newvec)
    indexes.push(i);
  }

  // Genetic algorithm genepool initialization
  genSize = 10; // TODO: Add slider for controlling value
  generation = [];
  // Starts with genSize shuffled index orders
  for (let i = 0; i < genSize; i++) {
    generation.push(shuffle(indexes));
  }
  genFitness = getFitness(generation);
  bestGenScore = Infinity;
  getBestGenScore();
  console.log(generation);
  console.log(genFitness);
  console.log(bestGenScore);
  console.log(bestGen);


  // Lex order starting point
  currLexOrder = indexes.slice();
  bestLexOrder = indexes.slice();
  bestLexScore = pLength(nodes, bestLexOrder);
  currLexScore = pLength(nodes, bestLexOrder);
  // frameRate(5);
}

function draw() {
  // Gets size of nodes from slider
  size = sizeSlider.value();

  background(20);

  // Draws nodes
  fill(255);
  stroke(255);
  for (const vec of nodes){
    ellipse(vec.x, vec.y, size, size);
  }

  // Draws Lex path
  stroke(255, 0, 0);
  for (let i = 0; i < bestLexOrder.length - 1; i++) {
    vec1 = nodes[bestLexOrder[i]];
    vec2 = nodes[bestLexOrder[i + 1]];
    line(vec1.x, vec1.y, vec2.x, vec2.y);
  }

  // Draws Gen path
  stroke(0, 255, 0);
  for (let i = 0; i < bestGen.length - 1; i++) {
    vec1 = nodes[bestGen[i]];
    vec2 = nodes[bestGen[i + 1]];
    line(vec1.x, vec1.y, vec2.x, vec2.y);
  }

  // Print Lex scores
  stroke(255, 0, 0);
  fill(255, 0, 0, 0.6);
  textSize(20);
  text(`Brute Force Score: ${Math.round(bestLexScore, 2)}`, width - 250, 30);

  // Print Gen scores
  stroke(0, 255, 0);
  fill(0, 255, 0, 0.6);
  textSize(20);
  text(`Best Gen Score: ${Math.round(bestGenScore, 2)}`, width - 250, 60);

  crossOver();

  currLexOrder = nextPerm(currLexOrder);
  currLexScore = pLength(nodes, currLexOrder);
  if (currLexScore < bestLexScore) {
    bestLexScore = currLexScore;
    bestLexOrder = currLexOrder.slice();
  }

  if (arraysEqual(indexes, currLexOrder) === true) {
    console.log("stopped")
    noLoop();
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function nextPerm(nums) {
  let x = -1;

  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] < nums[i + 1]) {
      x = i;
    }
  }

  if (x === -1) {
    console.log("lex order done");
    return nums.sort();
  }
  
  let y = x + 1;
  for (let i = y; i < nums.length; i++) {
    if (nums[i] > nums[x]) {
      y = i
    }
  }
  newNums = nums.slice();
  newNums = swap(newNums, x, y);
  temp = newNums.slice(x + 1);
  temp = temp.reverse();
  newNums = newNums.slice(0, x+1);
  return newNums.concat(temp);
}

function swap(nums, x, y) {
  const temp = nums[y];
  nums[y] = nums[x];
  nums[x] = temp;
  return nums;
}

// Taken from: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// Returns sum of distances from the given order of the nodes
function pLength(nodes, order) {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    v1 = nodes[order[i]];
    v2 = nodes[order[i+1]];
    total += dist(v1.x, v1.y, v2.x, v2.y);
  }
  return total;
}

function getFitness(a) {
  let scores = [];
  for (const gen of a) {
    scores.push(Math.round(pLength(nodes, gen)));
  }
  return scores;
}

function getBestGenScore() {
  for (let i = 0; i < genFitness.length; i++) {
    if (genFitness[i] < bestGenScore) {
      bestGenScore = genFitness[i];
      bestGen = generation[i].slice();
    }
  }
}

const arrSum = arr => arr.reduce((a,b) => a + b, 0);

function crossOver() {
  const total = arrSum(genFitness);
  let pool = [];
  for (const currfit of genFitness) {
    pool.push(arrSum(pool) + currfit/total);
  }
  // console.log(pool);
  console.log(arrSum(pool));
}