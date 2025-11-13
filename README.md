# 🎮 Cosmic Dodger Neon

A upgraded version of the **Cosmic Dodger** HTML5 canvas game:

- **Bigger play area:** `800 × 450` canvas
- **New neon design:** purple glow, smooth starfield background
- **Smoother visuals:** pre-generated stars, controlled asteroid spawn so nothing glitches in the corners
- **Gameplay:**
  - Use **Left/Right** arrows or **A/D** to move
  - Avoid incoming asteroids
  - Score increases over time
  - Difficulty ramps up gradually
  - 3 lives per run
- **Best score** is stored in `localStorage`
- Dark / light mode toggle for the page chrome

## ▶️ Run Locally

Just open `index.html` in a browser.

For a simple static server (optional, but great for GitHub-style setups):

```bash
python -m http.server 8000
```

Then go to:

```text
http://localhost:8000
```

## 🌐 Host on GitHub Pages

1. Create a repo (e.g. `cosmic-dodger-neon`).
2. Add `index.html`, `style.css`, `game.js`, and this `README.md`.
3. Push to GitHub.
4. Enable **GitHub Pages** on the `main` / `docs` branch.
5. Your live game will be available at:

```text
https://<username>.github.io/cosmic-dodger-neon/
```
