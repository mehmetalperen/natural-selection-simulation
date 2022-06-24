var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 50;
var context = canvas.getContext("2d");

const population = 200;
const geneLength = 300;
const organismSize = 5;
const goalSize = 50;
const mutationRate = 0.4;

const xBorders = canvas.width;
const yBorders = canvas.height;

const xStart = canvas.width / 2;
const yStart = canvas.height - goalSize;

const xGoal = canvas.width / 2 + goalSize;
const yGoal = goalSize;

var currentGene = 0;
var organismArray = [];
var bestFits = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
var countGen = 1;

class Organism {
  constructor(
    xPos,
    yPos,
    context,
    id, //might be unneccesarry
    size,
    xBorders,
    yBorders,
    xGoal,
    yGoal,
    geneLength,
    isDeath,
    mutationRate,
    isDone
  ) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.context = context;
    this.id = id;
    this.size = size;
    this.xBorders = xBorders;
    this.yBorders = yBorders;
    this.xGoal = xGoal;
    this.yGoal = yGoal;
    this.currentXpos = this.xPos;
    this.currentYpos = this.yPos;
    this.geneLength = geneLength;
    this.fitness = 0;
    this.isDeath = isDeath;
    this.mutationRate = mutationRate;
    this.isDone = isDone;
  }

  createDNA() {
    this.dna = [];

    for (let i = 0; i <= this.geneLength; i++) {
      var directionX = Math.random() < 0.5 ? -1 : 1;
      var directionY = Math.random() < 0.5 ? -1 : 1;

      this.dna.push([
        directionX * Math.round(Math.random() * 10),
        directionY * Math.round(Math.random() * 10),
      ]);
    }
  }

  modifyDNA(geneDad, geneMom) {
    this.dna.length = 0;

    for (let i = 0; i <= this.geneLength; i++) {
      if (this.mutationRate > Math.random()) {
        var directionX = Math.random() < 0.5 ? -1 : 1;
        var directionY = Math.random() < 0.5 ? -1 : 1;

        this.dna.push([
          directionX * Math.round(Math.random() * 10),
          directionY * Math.round(Math.random() * 10),
        ]);
      } else {
        this.dna.push([geneDad[i], geneMom[i]]);
      }
    }
    this.isDeath = false;
    this.currentXpos = this.xPos;
    this.currentYpos = this.yPos;
  }

  drawOrganisms() {
    this.context.beginPath();
    this.context.arc(
      this.currentXpos,
      this.currentYpos,
      this.size,
      0,
      Math.PI * 2,
      true
    );
    this.context.fill();
  }

  updateMovement(currentGene) {
    if (this.currentXpos === this.xGoal && this.currentYpos === this.yGoal) {
      this.isDone = true;
    } else if (
      this.xBorders > this.currentXpos + this.size &&
      this.currentXpos - this.size > 0 &&
      this.yBorders > this.currentYpos + this.size &&
      this.currentYpos - this.size > 0 &&
      currentGene < this.geneLength
    ) {
      this.currentXpos += this.dna[currentGene][0];
      this.currentYpos += this.dna[currentGene][1];
    } else {
      this.isDeath = true;
    }
  }

  calculateFitness() {
    //distance to the goal
    this.fitness = Math.round(
      Math.sqrt(
        Math.pow(this.xGoal - this.currentXpos, 2) +
          Math.pow(this.currentYpos - this.yGoal, 2)
      )
    );
  }

  getFitness() {
    return this.fitness;
  }

  getIsDead() {
    return this.isDeath;
  }

  getDNA() {
    return this.dna;
  }
} //Organism class

function createOrganism(totOrganism) {
  console.log("similution start");
  for (let i = 0; i < totOrganism; i++) {
    var organism = new Organism(
      xStart,
      yStart,
      context,
      i,
      organismSize,
      xBorders,
      yBorders,
      xGoal,
      yGoal,
      geneLength,
      false,
      mutationRate,
      false
    );
    organism.createDNA();
    organismArray.push(organism);
  }

  animationLoop();
}

function setGoal() {
  context.beginPath();
  context.rect(canvas.width / 2 - goalSize, 0, goalSize, goalSize);
  context.fill();
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < population; i++) {
    if (!organismArray[i].getIsDead()) {
      organismArray[i].updateMovement(currentGene);
      organismArray[i].drawOrganisms();
      organismArray[i].calculateFitness();
    } else {
      organismArray[i].calculateFitness();
    }
  }

  currentGene++;

  if (currentGene > geneLength) {
    selectBestFits();

    currentGene = 0;
  }

  setGoal();
}

createOrganism(population);

function selectBestFits() {
  let bestFitMale;
  let bestFitFemale;
  let maleFitness = Number.MAX_SAFE_INTEGER;
  let femaleFitness = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < organismArray.length; i++) {
    if (organismArray[i].getFitness() < maleFitness) {
      bestFitMale = organismArray[i];
      maleFitness = bestFitMale.getFitness();
    }
  }
  for (let i = 0; i < organismArray.length; i++) {
    if (
      organismArray[i].getFitness() < femaleFitness &&
      organismArray[i].getFitness() !== maleFitness
    ) {
      bestFitFemale = organismArray[i];
      femaleFitness = bestFitFemale.getFitness();
    }
  }

  createNextGen(bestFitMale, bestFitFemale);
}

function createNextGen(bestFitMale, bestFitFemale) {
  let geneDad = [];
  let geneMom = [];

  let dadDNA = bestFitMale.getDNA();
  let momDNA = bestFitFemale.getDNA();

  for (let i = 0; i < dadDNA.length; i++) {
    geneDad.push(dadDNA[i][0]);
    geneMom.push(momDNA[i][1]);
  }

  for (let i = 0; i < organismArray.length; i++) {
    organismArray[i].modifyDNA(geneDad, geneMom);
  }

  countGen++;
  console.log(`Generation: ${countGen}`);
}
