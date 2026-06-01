const button = document.getElementById('button');
const rainbowBg = document.querySelector('.rainbow-bg');

const NYAN_URL = 'assets/nyan-cat.gif';
const AUDIO_URL = 'assets/nyan.mp3';
const LOOP_START = 8.0;
const LOOP_END   = 35.0;

const loader = document.getElementById('loader');
const content = document.querySelector('.content');
let gifReady = false, audioReady = false;

function checkReady() {
  if (gifReady && audioReady) {
    loader.classList.add('hidden');
    content.classList.add('visible');
  }
}

// Preload GIF
const gifPreload = new Image();
gifPreload.onload = () => { gifReady = true; checkReady(); };
gifPreload.src = NYAN_URL;

// Preload and decode audio on page load so click is instant
const audioCtx = new AudioContext();
let audioBuffer = null;
fetch(AUDIO_URL)
  .then(r => r.arrayBuffer())
  .then(buf => audioCtx.decodeAudioData(buf))
  .then(decoded => { audioBuffer = decoded; audioReady = true; checkReady(); });

function spawnOne() {
  const el = document.createElement('div');
  el.textContent = '🖕🏻';
  el.className = 'finger';
  const center = Math.random() < 0.45;
  el.style.left = (center ? 25 + Math.random() * 50 : Math.random() * 96 + 2) + 'vw';
  el.style.top  = (center ? 20 + Math.random() * 60 : Math.random() * 96 + 2) + 'vh';
  const roll = Math.random();
  const size = roll < 0.15
    ? Math.random() * 150 + 250
    : Math.random() * 150 + 30;
  el.style.fontSize = size + 'px';
  el.style.zIndex = Math.floor(Math.random() * 900) + 100;
  const duration = Math.random() * 400 + 300;
  el.style.animation = `fingerPop ${duration}ms ease-out forwards`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration + 50);
}

function spawnNyan() {
  const el = document.createElement('img');
  el.src = NYAN_URL;
  const zIndex = Math.floor(Math.random() * 900) + 100;
  el.style.cssText = `position:fixed;top:0;left:0;z-index:${zIndex};pointer-events:none;`;
  const roll = Math.random();
  const size = roll < 0.08 ? Math.random() * 300 + 600
             : roll < 0.18 ? Math.random() * 200 + 300
             : roll < 0.4  ? Math.random() * 100 + 150
             :                Math.random() * 80  + 30;
  el.style.height = size + 'px';
  el.style.width = 'auto';

  const dir = Math.floor(Math.random() * 4);
  const W = window.innerWidth, H = window.innerHeight;
  const pad = size * 2;
  const duration = Math.random() * 2500 + 1200;
  let from, to, flip;

  if (dir === 0) {
    const y = Math.random() * H;
    from = { x: -pad, y }; to = { x: W + pad, y }; flip = '';
  } else if (dir === 1) {
    const y = Math.random() * H;
    from = { x: W + pad, y }; to = { x: -pad, y }; flip = ' scaleX(-1)';
  } else if (dir === 2) {
    const x = Math.random() * W;
    from = { x, y: -pad }; to = { x, y: H + pad }; flip = ' rotate(90deg)';
  } else {
    const x = Math.random() * W;
    from = { x, y: H + pad }; to = { x, y: -pad }; flip = ' rotate(-90deg)';
  }

  document.body.appendChild(el);
  el.animate([
    { transform: `translate(${from.x}px,${from.y}px)${flip}` },
    { transform: `translate(${to.x}px,${to.y}px)${flip}` }
  ], { duration, easing: 'linear', fill: 'forwards' }).onfinish = () => el.remove();
}

function loadAndPlay() {
  audioCtx.resume().then(() => {
    const sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.loopStart = LOOP_START;
    sourceNode.loopEnd = LOOP_END;
    sourceNode.connect(audioCtx.destination);
    sourceNode.start(0, LOOP_START);
  });
}

button.addEventListener('click', function () {
  button.style.display = 'none';
  loadAndPlay();

  rainbowBg.style.opacity = '0.9';
  rainbowBg.style.filter = 'brightness(1.5) saturate(2)';
  setTimeout(() => {
    rainbowBg.style.opacity = '0.7';
    rainbowBg.style.filter = 'brightness(1.2) saturate(1.5)';
  }, 300);

  (function scheduleNyan() {
    setTimeout(() => {
      const burst = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < burst; i++) setTimeout(spawnNyan, Math.random() * 200);
      scheduleNyan();
    }, Math.random() * 600 + 200);
  })();

  setInterval(() => {
    const burst = Math.floor(Math.random() * 6) + 4;
    for (let i = 0; i < burst; i++) setTimeout(spawnOne, Math.random() * 150);
  }, 120);
});
