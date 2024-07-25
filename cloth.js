let particles = [], sticks = [], gravityX = 0., gravityY = 0.9, selectedParticle = null;
const radius = 1, rebound = 0.99, friction = 0.99;
const cols = 60, rows = 15, spacing = 14;

function distance(p0, p1) {
  let dx = p1.x - p0.x,
      dy = p1.y - p0.y;

  return Math.sqrt(dx**2 + dy**2);
}

function createCloth() {
  // Create particles in a grid
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      //create fixed points for the cloth to "hang"
      let fixed = (y == 0 && x % 10 == 0) || 
            (y == rows && x % 10 == 0) || 
            (x == 0 && y % 10 == 0) || 
            (x == cols && y % 10 == 0);

      particles.push({
        oldx: x * spacing + width / 2 - cols * spacing / 2,
        oldy: y * spacing + 50,
        x: x * spacing + width / 2 - cols * spacing / 2,
        y: y * spacing + 50,
        fixed: fixed
      });
    }
  }

  // Create horizontal sticks
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x < cols; x++) {
      let p0 = particles[y * (cols + 1) + x];
      let p1 = particles[y * (cols + 1) + x + 1];
      sticks.push({ p0: p0, p1: p1, length: distance(p0, p1) });
    }
  }

  // Create vertical sticks
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x <= cols; x++) {
      let p0 = particles[y * (cols + 1) + x];
      let p1 = particles[(y + 1) * (cols + 1) + x];
      sticks.push({ p0: p0, p1: p1, length: distance(p0, p1) });
    }
  }
}

function update() {
  for (const particle of particles) {
    if (!particle.fixed) {
      let tempX = particle.x, tempY = particle.y;
      let velX = (particle.x - particle.oldx) * friction;
      let velY = (particle.y - particle.oldy) * friction;
      particle.x += velX + gravityX;
      particle.oldx = tempX;
      particle.y += velY + gravityY;
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

function collisions() {
  // Particle-boundary collisions
  for (const particle of particles) {
    if (particle.x - radius < 0) {
      particle.x = radius;
      particle.oldx = particle.x + (particle.x - particle.oldx) * rebound;
    }
    if (particle.x + radius > width) {
      particle.x = width - radius;
      particle.oldx = particle.x + (particle.x - particle.oldx) * rebound;
    }
    if (particle.y + radius > height) {
      particle.y = height - radius;
      particle.oldy = particle.y + (particle.y - particle.oldy) * rebound;
    }
    if (particle.y - radius < 0) {
      particle.y = radius;
      particle.oldy = particle.y + (particle.y - particle.oldy) * rebound;
    }
  }
}

function isMouseoverParticle(particle) {
  let dx = mouseX - particle.x,
      dy = mouseY - particle.y;

  let dis = Math.sqrt(dx**2 + dy**2);
  return dis <= radius;
}

function display() {
  for (const stick of sticks) {
    let currentLength = distance(stick.p0, stick.p1);
    let ratio = currentLength / stick.length;
    let colorIntensity = map(ratio, 0.8, 1.2, 0, 255);

    stroke(colorIntensity, 165, 0);
    line(stick.p0.x, stick.p0.y, stick.p1.x, stick.p1.y);
  }
  for (const particle of particles) {
    if (isMouseoverParticle(particle)) {
      stroke(255, 255, 0);
      fill(0);
      ellipse(particle.x, particle.y, radius * 3, radius * 3);
    }
    noStroke();
    fill(particle.fixed ? 'red' : 'white');
    ellipse(particle.x, particle.y, radius * 2, radius * 2);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  createCloth();
}

function draw() {
  background(45, 45, 45);
  update();
  for (let i = 0; i < 6; i++) updateSticks(); //for stability of sticks and for them to come in equilibrium
  collisions();
  display();
}

function mousePressed() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    let d = dist(mouseX, mouseY, particle.x, particle.y);
    if (d <= radius) {
      particles.splice(i, 1);
      // Remove any sticks connected to this particle
      sticks = sticks.filter(stick => stick.p0 !== particle && stick.p1 !== particle);
      break;
    }
  }
}
