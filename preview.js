const pause = document.querySelector('#pause');
const direction = document.querySelector('#direction');
const background = document.querySelector('#background');
const slowMotion = document.querySelector('#slow-motion');
const status = document.querySelector('#status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
let facingLeft = false;
let elapsed = 0;
let previous;
let playbackRate = 1;

function updatePause() {
  pause.textContent = paused ? 'Play' : 'Pause';
  pause.setAttribute('aria-pressed', String(paused));
}
updatePause();
pause.addEventListener('click', () => { paused = !paused; updatePause(); });
direction.addEventListener('click', () => {
  facingLeft = !facingLeft;
  direction.textContent = facingLeft ? 'Face right' : 'Face left';
  direction.setAttribute('aria-pressed', String(facingLeft));
});
background.addEventListener('click', () => {
  const light = document.documentElement.classList.toggle('light');
  background.textContent = light ? 'Dark background' : 'Light background';
  background.setAttribute('aria-pressed', String(light));
});
slowMotion.addEventListener('click', () => {
  const slow = playbackRate === 1;
  playbackRate = slow ? 0.25 : 1;
  slowMotion.setAttribute('aria-pressed', String(slow));
});

function frameAt(animation, time) {
  const length = animation.frames.reduce((sum, frame) => sum + frame.duration, 0);
  let position = time % (length + (animation.loop ? 0 : 750));
  if (position >= length) return animation.frames[0];
  for (const frame of animation.frames) {
    if (position < frame.duration) return frame;
    position -= frame.duration;
  }
  return animation.frames[0];
}

try {
  const response = await fetch('./assets/abdul/atlas.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Frame data: ${response.status}`);
  const atlas = await response.json();
  const sources = new Set([atlas.image, ...Object.values(atlas.animations).map(animation => animation.image || atlas.image)]);
  const images = new Map(await Promise.all([...sources].map(async source => {
    const image = new Image();
    image.src = new URL(`./assets/abdul/${source}`, location.href).href;
    await image.decode();
    return [source, image];
  })));
  const views = Object.entries(atlas.animations).map(([name, animation]) => {
    const canvas = document.getElementById(name);
    return { canvas, context: canvas.getContext('2d'), animation, image: images.get(animation.image || atlas.image) };
  });
  status.hidden = true;
  const render = (now) => {
    if (previous !== undefined && !paused) elapsed += Math.min(now - previous, 100) * playbackRate;
    previous = now;
    for (const { canvas, context, animation, image } of views) {
      const frame = frameAt(animation, elapsed);
      const { x, y, w, h } = frame.rect;
      const scale = 0.78 * (animation.scale || 1);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = false;
      context.save();
      context.translate(canvas.width / 2, 280);
      context.scale(facingLeft ? -scale : scale, scale);
      context.translate(-frame.pivot.x, -frame.pivot.y);
      if (frame.sourcePolygon) {
        context.beginPath();
        frame.sourcePolygon.forEach(([px, py], index) => {
          if (index === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.closePath();
        context.clip();
      }
      context.drawImage(image, x, y, w, h, 0, 0, w, h);
      context.restore();
    }
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
} catch (error) {
  status.textContent = 'The sprite preview could not load. Serve this folder with a local web server and reload.';
  console.error(error);
}
