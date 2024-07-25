let particles = [], sticks = [], gravityX = 0, gravityY = 0.25;
const radius = 15, rebound = 0.99, friction = 0.99;

let start = false;
let startX, startY;

function distance(p0, p1){
  let dx = p1.x - p0.x,
      dy = p1.y - p0.y;

  return Math.sqrt(dx**2 + dy**2);
}

function update(){
  for(const particle of particles){
    if(!particle.fixed){
      let tempX = particle.x, tempY = particle.y;
      let velX = (particle.x - particle.oldx) * friction; // Apply friction
      let velY = (particle.y - particle.oldy) * friction; // Apply friction
      particle.x = particle.x + velX + gravityX;
      particle.oldx = tempX;
      particle.y = particle.y + velY + gravityY;
      particle.oldy = tempY;
    }
  }
}

function updateSticks() {
  for (const stick of sticks) {
    let currentDistance = distance(stick.p0, stick.p1);
    let difference = stick.length - currentDistance;
    let percent = difference / currentDistance / 2;
    let offsetX = (stick.p1.x - stick.p0.x) * percent;
    let offsetY = (stick.p1.y - stick.p0.y) * percent;
    
    if (!stick.p0.fixed) {
      stick.p0.x -= offsetX;
      stick.p0.y -= offsetY;
    }
    if (!stick.p1.fixed) {
      stick.p1.x += offsetX;
      stick.p1.y += offsetY;
    }
  }
}

function collisions(){
  for(const particle of particles){
    if(particle.x - radius < 0){
      particle.x = radius;
      particle.oldx = particle.x + (particle.x - particle.oldx) * rebound;
    } 
    if(particle.x + radius > width) {
      particle.x = width - radius;
      particle.oldx = particle.x + (particle.x - particle.oldx) * rebound;
    }
    if(particle.y + radius > height) {
      particle.y = height - radius;
      particle.oldy = particle.y + (particle.y - particle.oldy) * rebound;
    }
    if(particle.y - radius < 0) {
      particle.y = radius;
      particle.oldy = particle.y + (particle.y - particle.oldy) * rebound;
    }
  }
}

function display(){
  stroke(255);
  for (const stick of sticks) {
    line(stick.p0.x, stick.p0.y, stick.p1.x, stick.p1.y);
  }
  noStroke();
  for(const particle of particles){
    if(particle.fixed) fill(255,0,0);
    else fill(255);
    ellipse(particle.x, particle.y, radius * 2, radius * 2);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  particles.push({
    oldx: width / 2,
    oldy: 0,
    x: width / 2,
    y: 0,
    fixed: false
  },
  {
    oldx: width / 2 - 100,
    oldy: -10,
    x: width / 2 - 100,
    y: 10,
    fixed: false
  },
  {
    oldx: width / 2 + 100,
    oldy: 200,
    x: width / 2 + 100,
    y: 200 + 10,
    fixed: false
  },
  {
    oldx: width / 2,
    oldy: height / 2,
    x: width / 2,
    y: height / 2,
    fixed: true
  });

  sticks.push({
    p0: particles[0],
    p1: particles[1],
    length: distance(particles[0], particles[1])
  },
  {
    p0: particles[0],
    p1: particles[2],
    length: distance(particles[0], particles[2])
  },
  {
    p0: particles[2],
    p1: particles[3],
    length: distance(particles[2], particles[3])
  },
  {
    p0: particles[1],
    p1: particles[3],
    length: distance(particles[1], particles[3])
  });
}

function draw() {
  background(45, 45, 45);
  if (keyIsDown(83)) start = !start;  // 83 is the ASCII code for 'S'
  if (start) {
    update();
    updateSticks();
  }
  collisions();
  display();
}

function mousePressed(){
  let value = (mouseButton === "left") ? false:true
  particles.push({
    oldx: mouseX,
    oldy: mouseY,
    x: mouseX,
    y: mouseY,
    fixed: false
  })
}