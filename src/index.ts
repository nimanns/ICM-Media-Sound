import "p5/lib/addons/p5.sound";
import p5, { Distortion, FFT, Image, Oscillator, Renderer, Reverb } from "p5";
import { noteFreqs } from "./Notes";
let cnv: Renderer;
const parent: HTMLDivElement = document.querySelector("div#parent")!;

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;
type Note = `${"A" | "B" | "C" | "D" | "E" | "F" | "G"}${IntRange<0, 8>}`;

let waveform: any;

const sketch = (p5: p5) => {
  class GuitarString {
    x: number;
    y: number;
    width: number;
    height: number;
    openNote: Note;
    selectedFret: IntRange<1, 25>;
    range: number;
    numFrets: number;
    selectedNote: Note;
    fretBoardWidth: number = 0;
    oscillator: Oscillator;
    constructor(x: number, y: number, openNote: Note) {
      this.x = x;
      this.y = y;
      this.openNote = openNote;
      this.width = 300;
      this.height = 50;
      this.selectedFret = 1;
      this.range = 70;
      this.numFrets = 24;
      this.oscillator = new Oscillator();
      this.oscillator.amp(0);
      this.oscillator.setType("sawtooth");
      this.oscillator.start();
      let range = this.range;
      for (let i = 0; i < this.numFrets; i++) {
        this.fretBoardWidth += range - i;
        range--;
      }
    }

    show() {
      let range: number = this.range;
      for (let i = 0; i < this.numFrets; i++) {
        if (i === this.selectedFret - 1) {
          p5.fill("#9c6143");
        } else {
          p5.fill("#4A2C29");
        }
        p5.stroke("black");
        p5.strokeWeight(2);
        p5.rect(i * range + this.x, this.y, range - i, 30);
        if (i === this.selectedFret - 1) {
          p5.fill("white");
          p5.circle(i * range + (range - i) / 2 + this.x, this.y + 30 / 2, 10);
          p5.noFill();
        }
        range--;
      }
      p5.strokeWeight(3);
      p5.stroke("silver");
      let vibrate;
      if (this.oscillator.getAmp() !== 0) {
        vibrate = p5.random(-3, 3);
      } else {
        vibrate = 0;
      }
      p5.line(
        this.x,
        this.y + 30 / 2 + vibrate,
        this.fretBoardWidth + 600,
        this.y + 30 / 2 + vibrate
      );
      p5.strokeWeight(1);
    }

    select(mouseX: number, mouseY: number): Boolean {
      let range = this.range;
      for (let i = 0; i < this.numFrets; i++) {
        if (
          mouseX > i * range + this.x &&
          mouseY > this.y &&
          mouseX < (i + 1) * (range - 1) + this.x &&
          mouseY < this.y + 30
        ) {
          //@ts-ignore
          this.selectedFret = i + 1;
          return true;
        }
        range--;
      }
      return false;
    }

    strum(mouseX: number, mouseY: number): Boolean {
      if (
        mouseX > this.x + this.fretBoardWidth - 20 &&
        mouseX < this.x + this.fretBoardWidth - 20 + 590 &&
        mouseY > this.y + 30 / 4 &&
        mouseY < this.y + 30 / 4 + 15
      ) {
        if (this.oscillator.getAmp() === 0) {
          this.oscillator.start();
          this.oscillator.freq(
            Object.values(noteFreqs)[
              Object.keys(noteFreqs).indexOf(this.openNote) + this.selectedFret
            ]
          );
          this.oscillator.amp(0.5, 0.5);
          this.oscillator.amp(0, 1);
        }

        return true;
      }
      return false;
    }
  }

  class DistortionPedal {
    distortion: Distortion;
    x: number;
    y: number;
    width: number;
    height: number;
    bg: Image;
    knob: Image;
    outputRotate: number = 0;
    distRotate: number = 0;
    outputRotateAllowed: Boolean = false;
    distRotateAllowed: Boolean = false;
    distAmount: number = 0.2;
    outPut: number = 0.5;
    constructor(x: number, y: number, width: number, height: number) {
      this.distortion = new Distortion(this.distAmount, "4x");
      this.distortion.drywet(0.3);
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.bg = p5.loadImage("Dist.png");
      this.knob = p5.loadImage("DistKnob.png");
    }

    show() {
      if (this.bg && this.knob) {
        p5.image(
          this.bg,
          this.x,
          this.y,
          this.bg.width / 1.4,
          this.bg.height / 1.4
        );
        // p5.circle(220 + this.x, 69 + this.y, 200);
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.translate(220 + this.x, 69 + this.y);
        p5.rotate(this.distRotate);
        p5.image(this.knob, 0, 0, 90, 90);
        p5.pop();
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.translate(130 + this.x, 69 + this.y);
        p5.rotate(this.outputRotate);
        p5.image(this.knob, 0, 0, 90, 90);
        p5.pop();
        this.distortion.amp(this.outPut, 0.2);
        if (this.distAmount < 0) {
          this.distortion.set(0);
          this.distortion.drywet(this.distAmount);
        } else {
          this.distortion.set(this.distAmount);
          this.distortion.drywet(this.distAmount);
        }
      }
    }

    mouseDragged(mouseX: number, mouseY: number) {
      if (
        mouseX > 220 + this.x - 45 &&
        mouseX < 220 + this.x + 90 - 45 &&
        mouseY > 69 + this.y - 45 &&
        mouseY < 69 + this.y + 90 - 45
      ) {
        this.distRotateAllowed = true;
      }
      if (
        mouseX > 130 + this.x - 45 &&
        mouseX < 130 + this.x + 90 - 45 &&
        mouseY > 69 + this.y - 45 &&
        mouseY < 69 + this.y + 90 - 45
      ) {
        this.outputRotateAllowed = true;
      }
    }
  }

  class ReverbPedal {
    reverb: Reverb;
    revBody: Image;
    revKnob: Image;
    knobRotate: number = 0;
    knobRotateAllowed: Boolean = false;
    revAmount: number = 0.5;
    x: number;
    y: number;
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.reverb = new Reverb();
      this.revBody = p5.loadImage("Reverb.png");
      this.revKnob = p5.loadImage("RevKnob.png");
    }
    show() {
      if (this.revBody && this.revKnob) {
        p5.image(
          this.revBody,
          this.x,
          this.y,
          this.revBody.width / 2.5,
          this.revBody.height / 2.5
        );
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.translate(400, 100);
        p5.rotate(this.knobRotate);
        p5.image(
          this.revKnob,
          0,
          0,
          this.revKnob.width / 5,
          this.revKnob.height / 5
        );
        p5.pop();
        this.reverb.drywet(this.revAmount);
      }
    }

    mouseDragged(mouseX: number, mouseY: number) {
      if (
        mouseX > 400 - this.revKnob.width / 5 &&
        mouseX < 400 + this.revKnob.width / 5 &&
        mouseY > 100 - this.revKnob.height / 5 &&
        mouseY < 100 + this.revKnob.height / 5
      ) {
        this.knobRotateAllowed = true;
      }
    }
  }
  let oscs = [];
  let strrings: GuitarString[] = [];
  let cnv: any;
  let guitar: Image;
  let floor: Image;
  let started: Boolean = false;
  let dist: DistortionPedal;
  let rev: ReverbPedal;
  let cable: Image;
  let fft: FFT;
  p5.preload = () => {
    guitar = p5.loadImage("guitar.png");
    floor = p5.loadImage("floor.png");
    cable = p5.loadImage("Cable.png");
  };

  p5.setup = () => {
    p5.angleMode(p5.DEGREES);
    cnv = p5.createCanvas(1920, 1080);
    const tuning: Note[] = ["E4", "B3", "G3", "D3", "A2", "E2"];
    const btn = p5.createButton("Start");
    p5.background(0);
    btn.position(40, 40);
    btn.addClass("startbtn");
    btn.mouseClicked(() => {
      for (let i = 0; i < 6; i++) {
        strrings.push(new GuitarString(30, 400 + i * 30, tuning[i]));
        strrings[i].oscillator.disconnect();
      }
      started = true;
      btn.hide();
    });
    //@ts-ignore
    // document.querySelector("Button").click();
    dist = new DistortionPedal(500, 0, 200, 300);
    rev = new ReverbPedal(200, -10);
    fft = new FFT(0.5, 256);
  };
  let mouseY: number = -10;
  p5.draw = () => {
    if (started) {
      waveform = fft.waveform();
      p5.background(255, 255);
      if (guitar && floor) {
        p5.image(floor, 0, 0, 1920, 1080);
        p5.image(guitar, 0, -72, 1920, 1031);
      }
      for (let strring of strrings) {
        strring.show();
        strring.oscillator.connect(dist.distortion);
      }
      dist.distortion.disconnect();
      dist.distortion.connect(rev.reverb);
      if (cable) {
        p5.fill("black");
        p5.rect(802, 0, 40, 150);
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.scale(-1, -1);
        p5.image(cable, -760, -142, cable.width / 2, cable.height / 2);
        p5.pop();
        p5.rect(490, 0, 40, 150);
        p5.rect(515, 0, 40, 150);
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.scale(-1, -1);
        p5.image(cable, -450, -192, cable.width / 2, cable.height / 2);
        p5.pop();
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.scale(1, -1);
        p5.image(cable, 600, -142, cable.width / 2, cable.height / 2);
        p5.pop();
        p5.rect(265, 0, 40, 150);
        p5.push();
        p5.imageMode(p5.CENTER);
        p5.scale(1, -1);
        p5.image(cable, 350, -146, cable.width / 2, cable.height / 2);
        p5.pop();
      }
      dist.show();
      rev.show();
      if (dist.distRotateAllowed) {
        // dist.distRotate = p5.constrain(
        //   p5.map(p5.mouseY, 70, 400, -100, 100),
        //   -100,
        //   100
        // );
        // dist.distAmount = p5.constrain(
        //   p5.map(p5.mouseY, 40, 400, 0, 100) / 100,
        //   0,
        //   1
        // );
      }
      if (dist.distRotateAllowed) {
        if (p5.mouseY < mouseY) {
          if (dist.distRotate < 100) {
            dist.distRotate = dist.distRotate += 10;
            dist.distAmount = p5.constrain((dist.distAmount += 0.1), 0, 1);
          }
        } else if (p5.mouseY > mouseY) {
          if (dist.distRotate > -100) {
            dist.distRotate = dist.distRotate -= 10;
            dist.distAmount = p5.constrain((dist.distAmount -= 0.1), 0, 1);
          }
        }
        mouseY = p5.mouseY;
      }
      if (dist.outputRotateAllowed) {
        if (p5.mouseY < mouseY) {
          dist.outputRotate = p5.constrain(
            (dist.outputRotate += 10),
            -100,
            100
          );
          dist.outPut = p5.constrain((dist.outPut += 0.1), 0, 1);
        } else if (p5.mouseY > mouseY) {
          dist.outputRotate = p5.constrain(
            (dist.outputRotate -= 10),
            -100,
            100
          );
          dist.outPut = p5.constrain((dist.outPut -= 0.1), 0, 1);
        }
        mouseY = p5.mouseY;
      }
      if (rev.knobRotateAllowed) {
        if (p5.mouseY < mouseY) {
          rev.knobRotate = p5.constrain((rev.knobRotate += 10), -100, 100);
          rev.revAmount = p5.constrain((rev.revAmount += 0.1), 0, 1);
        } else if (p5.mouseY > mouseY) {
          rev.knobRotate = p5.constrain((rev.knobRotate -= 10), -100, 100);
          rev.revAmount = p5.constrain((rev.revAmount -= 0.1), 0, 1);
        }
      }
      mouseY = p5.mouseY;
    }
    p5.noFill();
    p5.strokeWeight(3);
    p5.push();
    p5.translate(40, 800);
    p5.beginShape();
    for (let i = 0; i < waveform?.length; i++) {
      p5.curveVertex(i * 2, waveform[i] * 500);
    }
    p5.endShape();
    p5.pop();
  };
  p5.mousePressed = () => {
    for (let strring of strrings) {
      if (strring.select(p5.mouseX, p5.mouseY)) break;
    }
    dist.mouseDragged(p5.mouseX, p5.mouseY);
    rev.mouseDragged(p5.mouseX, p5.mouseY);
  };
  //@ts-ignore
  p5.mouseMoved = () => {
    for (let strring of strrings) {
      // if (strring.strum(p5.mouseX, p5.mouseY)) break;
      strring.strum(p5.mouseX, p5.mouseY);
    }
  };
  p5.mouseDragged = () => {};
  p5.mouseReleased = () => {
    dist.distRotateAllowed = false;
    dist.outputRotateAllowed = false;
    rev.knobRotateAllowed = false;
  };
  p5.windowResized = () => {
    // p5.resizeCanvas(window.innerWidth, window.innerHeight - 50);
  };
};

let guit = new p5(sketch, parent);
