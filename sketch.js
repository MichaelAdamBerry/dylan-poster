const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const p5 = require("p5");

// Attach p5.js it to global scope
new p5();

/* defining global variables that are randomly generated 
  so that these values are not regenerated on every animation frame
  ie - only animate what we want to animate
*/

const circleRange = random.range(1, 20);
const noiseCoords = [];
const getNoiseCoords = () => {};
for (let i = 0; i < 100; i++) {
  const xVal = random.range(-270, 270);
  const yVal = random.range(-700, 300);
  noiseCoords.push({ x: xVal, y: yVal });
}

getNoiseCoords();

const settings = {
  // Tell canvas-sketch we're using p5.js
  p5: true,
  // Turn on a render loop (it's off by default in canvas-sketch)
  animate: true,
  fps: 24,
  // We can specify WebGL context if we want
  context: "webgl",
  // Optional loop duration
  duration: 6,
  // Enable MSAA
  attributes: {
    antialias: true
  },
  dimensions: [595, 842]
};

// Optionally preload before you load the sketch
let img;
let myFont;
window.preload = () => {
  // Preload sounds/images/etc..
  img = loadImage("with-glasses.png");
  myFont = loadFont("Rampage.otf");
};

canvasSketch(() => {
  // Inside this is a bit like p5.js 'setup' function
  // ...

  // Attach events to window to receive them
  //img.filter(BLUR);
  //img.filter(ERODE);
  img.filter(POSTERIZE, 4);

  ellipseMode(CENTER);

  background("#222");
  textFont(myFont);
  textSize(100);
  //noStroke();
  window.mouseClicked = event => {
    console.log("Mouse clicked", event);
  };

  // Return a renderer to 'draw' the p5.js content
  return ({ playhead, width, height, time }) => {
    clear();
    random.setSeed(99);
    //color vars
    let black = color(0, 0, 0);
    let red = color(255, 0, 0);

    //define the 'hair circle' variables so we generate random coords within
    const hairCenterX = 1;
    const hairCenterY = 1;
    const hairR = width / 2 - 110;

    const target = (x, y, animate, speed) => {
      push();
      const getTranslateSpeed = function(s) {
        if (animate === true) {
          return time * s;
        } else {
          return false;
        }
      };
      let translateSpeed = getTranslateSpeed(speed);
      let circleCount = circleRange;
      let circArr = [];
      let baseStroke = 0.5;
      for (let i = 0; i < circleCount; i++) {
        let circ = { rad: random.range(10, 50), stroke: random.range(0.5, 5) };
        circArr.push(circ);
      }
      circArr.sort((a, b) => b.rad - a.rad);
      //draw largest circle first to ensure a filled background

      //fill("#000");
      noStroke();
      circle(x, y, circArr[circArr.length - 1].rad);
      if (!translateSpeed === false) {
        translate(0, translateSpeed);
      }
      circArr.forEach((d, i, a) => {
        let color = i % 2 === 0 || i === a.length - 1 ? red : black;
        fill(color);
        ellipse(x, y, d.rad, d.rad);
      });
      pop();
    };

    const drawHairTargets = count => {
      for (let i = 0; i < count; i++) {
        // get random x and y coordinates for target only within the hair circle
        let r = hairR * Math.sqrt(random.value());
        let theta = random.value() * 2 * Math.PI;
        let xVal = hairCenterX * r * Math.cos(theta);
        let yVal = hairCenterY * r * Math.sin(theta);
        target(xVal, yVal - 170);
      }
    };

    //add the face image
    const drawImg = img => {
      image(img, -350, -250);
      tint(250, 200, 0);
    };

    //mask the top of image to appear to be behind the hairline
    const drawHairline = () => {
      let y = -209;
      let add = 30;
      let xRight = 0;
      let xLeft = -5;
      for (let i = 0; i < 5; i++) {
        target(xRight, y);
        target(xLeft, y);
        xRight += add;
        xLeft -= add;
        y += 5;
      }
    };

    const drawNoiseTargets = function(animate, speed, sidesOnly) {
      const getStatic = function() {
        let topLeft = noiseCoords.filter(d => d.x < -100 && d.y < -350);
        let topRight = noiseCoords.filter(d => d.x > 100 && d.y < -350);
        let bottomCoordsOnly = noiseCoords.filter(d => d.y > 50);
        return topLeft.concat(topRight).concat(bottomCoordsOnly);
      };

      const getSides = function() {
        return noiseCoords.filter(d => d.x > 80 && d.x < -80);
      };

      const getFullNoise = function() {
        return noiseCoords.slice(0);
      };
      const animated = animate ? true : false;

      let coords;
      if (sidesOnly === true && animated === true) {
        coords = getSides();
      } else if (animated === true && sidesOnly === false) {
        coords = getFullNoise();
      } else {
        coords = getStatic();
      }

      coords.forEach(obj => {
        // target function takese 3 arguments
        //x and y values Numbers required
        //animated  boolean flag wheather to animate
        //speed number to interate translateY
        let translateSpeed = speed;
        target(obj.x, obj.y, animated, translateSpeed);
      });
    };

    const drawText = () => {
      push();
      textSize(140);
      textAlign(CENTER, CENTER);
      rotate(0.1);
      fill(196, 170, 80);
      text("Not", -110, 200);
      rotate(-0.2);
      fill(220, 200, 80);
      text("not", 200, 180);
      fill(200, 190, 100);
      rotate(0.1);
      text("Bob Dylan", 90, 300);
      pop();
      fill("red");
    };

    const leftLens = () => {
      push();
      fill("black");
      beginShape();
      vertex(-100, -110);
      vertex(-20, -110);
      vertex(-20, -60);
      vertex(-100, -60);
      endShape(CLOSE);
      pop();
    };

    const rightLens = () => {
      push();
      fill("#2f2f2f");

      ellipse(63, -89, 80, 50);
      rotate(-1);
      pop();
    };

    const glasses = () => {
      leftLens();
      rightLens();
    };

    // creates the pattern on the face
    const drawLines = () => {
      const coords = [];
      let change = 2;
      let changeRight = 0;
      for (let j = 0; j < 15; j++) {
        let startX = 0;
        let startY = 70;
        let endX = 0;
        let endY = -150;
        let count = 13;
        for (let i = 0; i < 18; i++) {
          noStroke();
          push();
          let col = startX > 130 ? 0 : "red";
          let opac = startX > 130 ? 0 : 1;
          fill(col);

          rotate(0.1);
          ellipse(startX, startY - i * 20, 1 + i * 0.1, 3 + i * 0.4);
          pop();

          push();
          fill(col);
          rotate(-0.1);
          ellipse(endX, startY - i * 20, 1 + i * 0.1, 3 + i * 0.4);
          pop();
          let objA = {
            x: startX,
            y: startY - i * 20,
            r: 1 + i * 0.3
          };
          let objB = {
            x: endX,
            y: startY - i * 20,
            r: 1 + i * 0.3
          };

          coords.push(objA);
          coords.push(objB);

          startX += changeRight;
          endX -= changeRight;
        }
        changeRight = j * change;
      }
    };
    push();

    //drawNoiseTargets takes 3 parameters
    //animate - bool to animate or not
    //speed - speed to translateY
    //sidesOnly - bool flage filters out center of of x plane

    //animate noise targets behind the face
    drawNoiseTargets(true, 20, false);
    pop();
    //add more noise to the sides
    push();
    drawNoiseTargets(true, 60, true);
    pop();

    drawHairTargets(800);

    drawImg(img);

    drawLines();

    drawHairline();
    // drawNoiseTargets();

    glasses();

    drawText();
    //console.log("width and height are", width, height);
    //add static noise that does not animate
    drawNoiseTargets(false, 0, false);
  };
}, settings);
