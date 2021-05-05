// ZOMBIESTORM - created by Reid Brockmeier 2021

// All assets and code used was made by Reid Brockmeier.
// Background and Healthpacks were made in Photoshop, and
// sounds were self recorded and edited in Premiere Pro.
// All other objects were drawn using the P5.js library.

// ZOMBIESTORM is a keyboard and mouse controlled, round based
// zombie survival game, where each round is more difficult
// than the last.

// How to play: 
//  Movement:   W = Up | S = Down | A = Left | D = Right 

//  Firing:   Aim with the cursor and hold left click to shoot. 
 
//  Health:   Collect health packs to heal mid-round. After each 
//  round, you will automatically heal up to 100. 

//  Objective: Avoid being hit by the Zombies and kill all of 
//  them to progress to the next round. Each round increases 
//  in difficulty with more Zombies with more health. See how
//  many rounds you can survive!

let x = 0;
let y = 0;
let a = 0;
let z = 1000;
let angle;
let player, gun;
let zombies = [];
let hps = [];
let newRound = 1;
let numZom = 10;
let zomHealth = 100;
let startTime = 0;
let currTime;
let o = 1;
let roundNum = 1;
let roundSurvived = 0;
let highRound = 0;
let heart, bg, healthpack, play, how, back;
let gameState = 0;
let titleMade = 0;
let song, shot, hit, gotHit, playerDied, zomDied, roundStart, gameOver, buttonSound, healSound;
let zomNoise = []
let titleColor = 150;
let colorChange = 0;
let howShown = 0;

function preload() {
  heart = loadImage("heart.png");
  bg = loadImage("zgbg.jpg");
  healthpack = loadImage("healthpack.png");

  song = loadSound("Relief.mp3");
  shot = loadSound("shots.mp3");
  hit = loadSound("hit.mp3");
  gotHit = loadSound("gotHit.mp3");
  playerDied = loadSound("playerDied.mp3");
  zomDied = loadSound("zomDied.mp3");
  zomNoise[0] = loadSound("zomNoise.mp3");
  zomNoise[1] = loadSound("zomNoise_1.mp3");
  zomNoise[2] = loadSound("zomNoise_2.mp3");
  roundStart = loadSound("NEW ROUND.mp3");
  gameOver = loadSound("game over.mp3");
  buttonSound = loadSound("buttonSound.mp3");
  healSound = loadSound("healSound.mp3");
}

function setup() {
  createCanvas(800, 600);
  player = new Player();
  gun = new Gun();

  how = createButton('HOW TO PLAY');
  
  how.size(100, 50);
  how.mousePressed(instructions);

  back = createButton('BACK');
  
  back.size(100, 50);
  back.mousePressed(goBack);
  back.hide();

  play = createButton('PLAY');
  
  play.size(100, 50);
  play.mousePressed(played);

  zomNoise[0].setVolume(0.5);
  zomNoise[1].setVolume(0.5);
  zomNoise[2].setVolume(0.5);
  shot.setVolume(0.5);
  song.setVolume(0.5);
  healSound.setVolume(0.2);
  playerDied.setVolume(0.4);
  gameOver.setVolume(0.7);
  song.loop();
}

function draw() {
  how.position(windowWidth / 2 - 50, windowHeight / 2 + 50);
  back.position(windowWidth / 2 - 50, windowHeight / 2 + 200);
  play.position(windowWidth / 2 - 50, windowHeight / 2 - 25);
  
  imageMode(CORNER);
  
  if (gameState == 0) {
    background(0);
    if (titleMade == 0) {
      makeZombies(numZom);
      titleMade = 1;
    }
    for (let i = 0; i < zombies.length; i++) {
      for (let t = i; t < zombies.length; t++) {
        if (t != i) {
          zombies[i].collide(zombies[t].zombieX, zombies[t].zombieY);
        }
      }
      zombies[i].display();
      zombies[i].move();
    }
    if (colorChange == 0) {
      titleColor = lerp(titleColor, 0, 0.01);
    } else if (colorChange == 1) {
      titleColor = lerp(titleColor, 150, 0.01);
    }
    if (titleColor < 5 && colorChange == 0) {
      colorChange = 1;
    } else if (titleColor > 145 && colorChange == 1) {
      colorChange = 0;
    }
    noStroke();
    fill(150 - titleColor, titleColor, 0);
    textSize(50);
    text("ZOMBIESTORM", 210, 150);

    if (howShown == 1) {
      fill(255);
      textSize(20);
      text(" Movement:   W = Up | S = Down | A = Left | D = Right \n \n" +
        " Firing:   Aim with the cursor and hold left click to shoot. \n \n" +
        " Health:   Collect health packs to heal mid-round. After each \n" +
        " round, you will automatically heal up to 100. \n \n" +
        " Objective: Avoid being hit by the Zombies and kill all of \n" +
        " them to progress to the next round. Each round increases \n" +
        " in difficulty with more Zombies with more health. See how \n" +
        " many rounds you can survive!", 130, 225);
    }
  } else if (gameState == 1) {
    push();
    movement();
    image(bg, -1000, -1000);
    pop();

    gun.shoot();
    gun.display();

    player.display();
    fill('red');
    textSize(30);
    text("Round " + roundNum, 50, 50);

    movement();

    if (newRound == 0) {
      if (roundNum == 5) {
        zombies[0] = new Boss(1000);
      } else {
        makeZombies(numZom);
      }
      roundSurvived = roundNum - 1;
      newRound = 1;
    }
    if (newRound == 2) {
      for (let i = 0; i < zombies.length; i++) {
        zombies.splice(i, 1);
      }
      currTime = millis() - startTime;
      player.heal();

      if (z == 400) {
        roundStart.play();
      }

      if (currTime > 7500) {

        newRound = 0;
        z = 1000;
      }
      z -= 3;
    }
    for (let l = 0; l < hps.length; l++) {
      hps[l].collect();
      hps[l].display();

      if (hps[l].collected == 1) {
        currTime = millis() - startTime;
        player.heal();

        if (currTime > 100) {

          hps.splice(l, 1);
        }
      }
    }

    for (let i = 0; i < zombies.length; i++) {
      if (zombies[i].health <= 0) {
        zombies.splice(i, 1);
        zomDied.play();
      } else {
        for (let t = i; t < zombies.length; t++) {
          if (t != i) {
            zombies[i].collide(zombies[t].zombieX, zombies[t].zombieY);
          }
        }
        zombies[i].shot();
        zombies[i].display();
        zombies[i].move();
        player.hit(zombies[i].zombieX, zombies[i].zombieY, zombies[i].size);
      }
    }

    if (zombies.length == 0 && newRound == 1) {
      numZom = round(numZom * 1.1);
      zomHealth = round(zomHealth * 1.05);
      startTime = millis();
      roundNum++;
      song.stop();
      song.loop();
      newRound = 2;
    }
  } else if (gameState == 2) {
    background(0, 7);
    if (roundSurvived > highRound) {
      highRound = roundSurvived;
    }
    fill('red');
    textSize(50);
    text("GAME OVER", width / 2 - 160, 150);
    textSize(30);
    text("Rounds Survived: " + roundSurvived, width / 2 - 140, 210);
    text("Highscore: " + highRound, width / 2 - 85, 260);
    x = 0;
    y = 0;
    a = 0;
    for (let i = 0; i < zombies.length; i++) {
      zombies.splice(i, 1);
    }
    numZom = 10;
    zomHealth = 100;
    newRound = 1;
    roundNum = 1;
    play.show();
  }

}

function movement() {
  translate(x, y);

  if (keyIsDown(87) && y < 1000) {
    y += 2;
  }
  if (keyIsDown(83) && y > -1000) {
    y -= 2;
  }
  if (keyIsDown(65) && x < 800) {
    x += 2;
  }
  if (keyIsDown(68) && x > -950) {
    x -= 2;
  }
}

function makeZombies(number) {

  for (let i = 0; i < number; i++) {
    if (i == 20 || i == 30 || i == 40) {
      zombies[i] = new Boss(zomHealth * 10);
    } else {
      zombies[i] = new Zombie(zomHealth);
    }
  }
  for (let l = 0; l < 3; l++) {
    hps[l] = new Healthpack();
  }

}

function played() {
  buttonSound.play();
  gameState = 1;
  newRound = 2;
  startTime = millis();
  song.stop();
  song.loop();
  play.hide();
  how.hide();
}

function instructions() {
  buttonSound.play();
  howShown = 1;
  how.hide();
  play.hide();
  back.show();
}

function goBack() {
  buttonSound.play();
  howShown = 0;
  how.show();
  play.show();
  back.hide();
}

class Player {
  constructor() {
    this.health = 100;
    this.hitPlayed = 0;
    this.currentTime = 0;
    this.startTime = 0;
  }
  hit(thisx, thisy, size) {
    if (dist(400 - x, 500 - y, thisx, thisy) < (size + 20)) {
      background(255, 0, 0, 50);
      this.health -= 0.5;

      if (this.hitPlayed == 0) {
        this.hitPlayed = 1;
        this.startTime = millis();
        gotHit.play();
      }
      this.currentTime = millis() - this.startTime;
      if (this.currentTime > 500) {
        this.hitPlayed = 0;
      }
    }
    if (this.health < 0) {
      gameState = 2;
      playerDied.play();
      gameOver.play();
    }
  }
  heal() {
    if (this.health < 100) {
      this.health++;
      healSound.play();
    }

  }
  display() {

    push();
    noStroke();
    fill(0);
    ellipse(width / 2, 500, 60);

    image(heart, 262, 562, 25, 25);

    noStroke();
    fill('red');
    textSize(18);
    text(this.health, 515, 580);

    fill('red');
    textSize(30);
    text("ROUND " + roundNum + " STARTING NOW", z, height / 2);

    stroke(0);
    strokeWeight(15)
    line(300, 575, 500, 575);

    stroke('red');
    strokeWeight(10)
    line(400 - this.health, 575, 400 + this.health, 575);

    pop();
  }
}

class Gun {
  constructor() {
    this.bulletX = 0;
    this.bulletY = 0;

  }
  display() {
    push();
    angle = Math.atan2(mouseY - 500, mouseX - 400);
    translate(400, 500);
    rotate(angle + radians(-90));
    stroke(0);
    strokeWeight(5);
    line(0, 70, 0, 0);
    pop();
  }
  shoot() {
    push();
    if (mouseIsPressed) {
      if (this.bulletY < 600) {
        angle = Math.atan2(mouseY - 500, mouseX - 400);
        translate(400, 500);
        rotate(angle + radians(-90));
        fill('yellow');
        ellipse(this.bulletX, this.bulletY, 10);

        this.bulletY = lerp(this.bulletY, 700, 0.15);
        if (this.bulletY < 150) {
          shot.play();
          o = 1;
        }
      } else {
        this.bulletX = 0;
        this.bulletY = 0;
      }

    } else {
      this.bulletX = 0;
      this.bulletY = 0;
    }
    pop();
  }
}
class Zombie {
  constructor(health) {
    this.zombieX = random(-800, 800);
    this.zombieY = random(-800, 800);
    this.health = health;
    this.color = 100;
    this.size = 50;
    this.played = 1;
    this.startTime = millis();
  }
  move() {
    if (gameState == 0) {
      this.zombieX = lerp(this.zombieX, mouseX, 0.01);
      this.zombieY = lerp(this.zombieY, mouseY, 0.01);
    } else if (gameState == 1) {
      this.zombieX = lerp(this.zombieX, 400 - x, 0.01);
      this.zombieY = lerp(this.zombieY, 475 - y, 0.01);

      if (this.zombieY > 800 - y) {
        this.zombieY = -y;
      }
    }
  }
  collide(thisx, thisy) {
    if (dist(this.zombieX, this.zombieY, thisx, thisy) < (50)) {
      if (this.zombieX > 400 - x) {
        this.zombieX = lerp(this.zombieX, this.zombieX + 100, 0.02);
      } else {
        this.zombieX = lerp(this.zombieX, this.zombieX - 100, 0.02);
      }
      this.zombieY = lerp(this.zombieY, this.zombieY + 50, 0.02);
    }
  }
  shot() {
    if (dist(this.zombieX, this.zombieY, mouseX - x, mouseY - y) < (25) && mouseIsPressed) {
      this.health -= 3;
      this.color -= 2;

      if (o == 1) {
        hit.play();
        o = 0;
      }
    }
    if (this.played == 0) {
      this.played = 1;
      this.startTime = millis();
      zomNoise[random([0, 1, 2])].play();
    }
    this.currentTime = millis() - this.startTime;
    if (this.currentTime > random(2000, 50000)) {
      this.played = 0;
    }
  }
  display() {
    push();

    if (gameState == 0) {
      angle = Math.atan2((mouseY) - this.zombieY, (mouseX) - this.zombieX);
    } else {
      angle = Math.atan2((500 - y) - this.zombieY, (400 - x) - this.zombieX);
    }
    translate(this.zombieX, this.zombieY);
    rotate(angle + radians(-90));
    stroke(45, this.color, 0);
    strokeWeight(10);
    line(12, 40, 12, 0);
    line(-12, 40, -12, 0);
    pop();

    noStroke();
    fill(45, this.color, 0);
    ellipse(this.zombieX, this.zombieY, this.size);

  }
}
class Boss {

  constructor(health) {
    this.zombieX = random(-800, 800);
    this.zombieY = random(-800, 800);
    this.health = health;
    this.color = 120;
    this.size = 200;
    this.played = 1;
    this.startTime = millis();
  }
  move() {
    if (gameState == 0) {
      this.zombieX = lerp(this.zombieX, mouseX, 0.01);
      this.zombieY = lerp(this.zombieY, mouseY, 0.01);
    } else if (gameState == 1) {
      this.zombieX = lerp(this.zombieX, 400 - x, 0.01);
      this.zombieY = lerp(this.zombieY, 475 - y, 0.01);

      if (this.zombieY > 800 - y) {
        this.zombieY = -y;
      }
    }
  }
  collide(thisx, thisy) {
    if (dist(this.zombieX, this.zombieY, thisx, thisy) < (200)) {
      if (this.zombieX > 400 - x) {
        this.zombieX = lerp(this.zombieX, this.zombieX + 200, 0.02);
      } else {
        this.zombieX = lerp(this.zombieX, this.zombieX - 200, 0.02);
      }
      this.zombieY = lerp(this.zombieY, this.zombieY + 100, 0.02);
    }
  }
  shot() {
    if (dist(this.zombieX, this.zombieY, mouseX - x, mouseY - y) < (100) && mouseIsPressed) {
      this.health -= 3;
      this.color -= 0.5;

      if (o == 1) {
        hit.play();
        o = 0;
      }
    }
    if (this.played == 0) {
      this.played = 1;
      this.startTime = millis();
      zomNoise[random([0, 1, 2])].play();
    }
    this.currentTime = millis() - this.startTime;
    if (this.currentTime > random(2000, 50000)) {
      this.played = 0;
    }
  }
  display() {
    push();

    if (gameState == 0) {
      angle = Math.atan2((mouseY) - this.zombieY, (mouseX) - this.zombieX);
    } else {
      angle = Math.atan2((500 - y) - this.zombieY, (400 - x) - this.zombieX);
    }
    translate(this.zombieX, this.zombieY);
    rotate(angle + radians(-90));
    stroke(100, this.color, 0);
    strokeWeight(40);
    line(48, 160, 48, 0);
    line(-48, 160, -48, 0);
    pop();

    noStroke();
    fill(100, this.color, 0);
    ellipse(this.zombieX, this.zombieY, this.size);

  }

}

class Healthpack {
  constructor() {
    this.hpX = random(-800, 800);
    this.hpY = random(-800, 800);
    this.collected = 0;
  }
  collect() {
    if (dist(this.hpX, this.hpY, 400 - x, 500 - y) < (50)) {
      this.collected = 1;
      startTime = millis();
    }
  }
  display() {
    imageMode(CENTER);
    image(healthpack, this.hpX, this.hpY, 100, 85);
  }
}