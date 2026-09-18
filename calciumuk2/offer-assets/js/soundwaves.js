const canvas = document.getElementById("soundWaves");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

// Configurações das ondas sonoras
const waves = [];
const numWaves = 3;

class SoundWave {
  constructor(index) {
    this.index = index;
    this.amplitude = 40 + index * 10;
    this.frequency = 0.01;
    this.speed = 0.015 + index * 0.005;
    this.offset = (Math.PI * 2 * index) / numWaves;
    this.color = "#5da399";
    this.alpha = 0.08 - index * 0.02;
    this.yOffset = height / 2 + (index - numWaves / 2) * 60;
  }

  draw(time) {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x += 3) {
      const angle = x * this.frequency + time * this.speed + this.offset;
      const y = this.yOffset + Math.sin(angle) * this.amplitude;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }
}

// Criar ondas
for (let i = 0; i < numWaves; i++) {
  waves.push(new SoundWave(i));
}

let time = 0;

function animate() {
  ctx.clearRect(0, 0, width, height);

  time++;

  waves.forEach((wave) => {
    wave.draw(time);
  });

  ctx.globalAlpha = 1;

  requestAnimationFrame(animate);
}

// Redimensionar canvas
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  waves.forEach((wave, index) => {
    wave.yOffset = height / 2 + (index - numWaves / 2) * 60;
  });
});

animate();
