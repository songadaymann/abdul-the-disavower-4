const pause = document.querySelector('#pause');
const direction = document.querySelector('#direction');
const background = document.querySelector('#background');
const status = document.querySelector('#status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
let facingLeft = false;
let elapsed = 0;
let previous;

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
  const response = await fetch('./assets/abdul/atlas.json');
  if (!response.ok) throw new Error(`Frame data: ${response.status}`);
  const atlas = await response.json();
  const image = new Image();
  image.src = new URL(`./assets/abdul/${atlas.image}`, location.href).href;
  await image.decode();
  const views = Object.entries(atlas.animations).map(([name, animation]) => {
    const canvas = document.getElementById(name);
    return { canvas, context: canvas.getContext('2d'), animation };
  });
  status.hidden = true;
  const render = (now) => {
    if (previous !== undefined && !paused) elapsed += Math.min(now - previous, 100);
    previous = now;
    for (const { canvas, context, animation } of views) {
      const frame = frameAt(animation, elapsed);
      const { x, y, w, h } = frame.rect;
      const scale = 0.78;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = false;
      context.save();
      context.translate(canvas.width / 2, 280);
      context.scale(facingLeft ? -1 : 1, 1);
      context.drawImage(image, x, y, w, h,
        Math.round(-frame.pivot.x * scale), Math.round(-frame.pivot.y * scale),
        Math.round(w * scale), Math.round(h * scale));
      context.restore();
    }
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
} catch (error) {
  status.textContent = 'The sprite preview could not load. Serve this folder with a local web server and reload.';
  console.error(error);
}
