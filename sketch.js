const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const p5 = require("p5");

// Attach p5.js it to global scope
new p5();

const circleRange = random.range(1, 20);
const noiseCoords = [];
const getNoiseCoords = () => {};
for (let i = 0; i < 300; i++) {
  const xVal = random.range(-270, 270);
  const yVal = random.range(-700, 300);
  noiseCoords.push({ x: xVal, y: yVal });
}

getNoiseCoords();
console.log(noiseCoords);

const settings = {
  // Tell canvas-sketch we're using p5.js
  p5: true,
  // Turn on a render loop (it's off by default in canvas-sketch)
  animate: true,
  // We can specify WebGL context if we want
  context: "webgl",
  // Optional loop duration
  duration: 6,
  // Enable MSAA
  attributes: {
    antialias: true
  },
  dimensions: "A4"
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

  fill("#ED225D");
  textFont(myFont);
  textSize(36);
  text("p5*js", 10, 50);

  background(0);
  //noStroke();
  window.mouseClicked = event => {
    console.log("Mouse clicked", event);
  };

  // Return a renderer to 'draw' the p5.js content
  return ({ playhead, width, height }) => {
    clear();
    random.setSeed(99);
    //color vars
    let black = color(0, 0, 0);
    let red = color(255, 0, 0);

    //define the 'hair circle' variables so we generate random coords within
    const hairCenterX = 1;
    const hairCenterY = 1;
    const hairR = width / 2 - 110;

    const target = (x, y, animate) => {
      let circleCount = circleRange;
      let circArr = [];
      let baseStroke = 0.5;
      for (let i = 0; i < circleCount; i++) {
        let circ = { rad: random.range(10, 50), stroke: random.range(0.5, 5) };
        circArr.push(circ);
      }
      circArr.sort((a, b) => b.rad - a.rad);
      //draw largest circle first to ensure a filled background

      fill("#000");
      circle(x, y, circArr[circArr.length - 1].rad);
      circArr.forEach((d, i, a) => {
        let color = i % 2 === 0 ? red : black;
        noStroke();
        fill(color);
        ellipse(x, y, d.rad, d.rad);
        if (animate) {
          translate(0, playhead * 3);
        }
      });
    };

    const drawHairTargets = count => {
      for (let i = 0; i < count; i++) {
        // get random x and y coordinates for target only within the hair circle
        let r = hairR * Math.sqrt(random.value());
        let theta = random.value() * 2 * Math.PI;
        let xVal = hairCenterX * r * Math.cos(theta);
        let yVal = hairCenterY * r * Math.sin(theta);
        // const w = width / 2;
        // const h = height / 2;
        // const xVal = random.range(-270, 270);
        // const yVal = random.range(-370, 300);
        target(xVal, yVal - 170);
      }
    };
    const drawImg = img => {
      image(img, -350, -250);
      tint(250, 200, 0);
    };
    const drawHairline = () => {
      let y = -205;
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

    const drawNoiseTargets = () => {
      noiseCoords.forEach(obj => {
        target(obj.x, obj.y + playhead, true);
      });
    };

    //clear();
    // normalMaterial();
    // // rotateX(playhead * 2 * PI);
    // // rotateZ(playhead * 2 * PI);
    // cylinder(20, 50);

    drawHairTargets(800);

    //drawFace();
    drawImg(img);
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
          let col = startX > 130 ? 0 : "red";
          let opac = startX > 130 ? 0 : 1;
          fill(col);

          ellipse(startX, startY - i * 20, 1 + i * 0.1, 3 + i * 0.4);

          ellipse(endX, startY - i * 20, 1 + i * 0.1, 3 + i * 0.4);

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
      console.log(coords);
    };
    drawLines();

    drawHairline();
    drawNoiseTargets();

    //hairCirc();
    console.log("width and height are", width, height);
  };
}, settings);
