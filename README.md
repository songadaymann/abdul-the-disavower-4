# Abdul the Disavower

A 16-bit-style platformer protagonist sprite study featuring Abdul El-Sayed: idle, run, and the fictional **disavow** spell.

**Live:** No hosted game yet. This repository contains the sprite pack and a local animated preview.

## Preview

From the repository root:

```sh
python3 -m http.server 8780
```

Open <http://localhost:8780>. No dependencies or credentials are required. Use the controls to pause the animations, change facing direction, and inspect transparency against a light or dark background.

## Sprite pack

- `assets/abdul/abdul-sprites.png`: transparent RGBA atlas, 1774 × 887 pixels, 18 frames; rows are idle, run, and disavow.
- `assets/abdul/atlas.json`: source rectangles, stable foot pivots, durations in milliseconds, and a spell-release event. The burst has a wider frame, so use these rectangles rather than assuming a uniform grid.
- `assets/abdul/prompts.json`: original generation and refinement prompts, created with built-in image generation.

All frames face right. Mirror around the pivot to face left. Idle and run loop; play disavow once and then return to idle. The preview repeats disavow after a short idle hold for inspection. The release event occurs on its fifth frame. Render with image smoothing disabled to retain the pixel-art appearance. This is generated 16-bit-style artwork at presentation resolution, rather than a hand-authored native-resolution pixel atlas.

## License

Code: [MIT](LICENSE), copyright Jonathan Mann. Generated artwork: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), credited to Jonathan Mann (Song A Day). See [ASSETS.md](ASSETS.md) for provenance and excluded reference material.
