# Tear-off Calendar • Vintage Skeuomorphic Wall Calendar

A realistic vintage skeuomorphic daily tear-off calendar crafted with pure vanilla **HTML5**, **CSS3**, and **JavaScript** (no frameworks, no external libraries, no external assets).

![Tear-off Calendar Preview](calendar-preview.png)

## Features
- **Pure Skeuomorphic Realism**: Burgundy leather backing board with stitched perimeter, antique brass spiral binding rings, warm cream paper with fibrous grain, and stacked page edge shadow simulating hundreds of remaining pages.
- **Interactive 3D Tear-Off**: Click or press <kbd>Space</kbd> / <kbd>Enter</kbd> to tear off today's page with a physics-inspired 3D tumbling animation.
- **Web Audio API Sound Synthesis**: Authentic paper-tear rip sound synthesized dynamically in the browser (zero external audio files). Includes physical mute toggle.
- **Persistent Personal Notes**: Click the handwritten daily quote to open a vintage note editor. Notes are saved per-date in `localStorage`.
- **Accurate Date Engine**: Automatically shows the user's real local date, handles leap years, month transitions, and year boundaries. Features a "Reset to today" button.
- **Full Accessibility & Responsive**: Works across mobile, tablet, and desktop screens with keyboard navigation, screen reader live regions, and `prefers-reduced-motion` support.

## Running Locally

### Option 1: Direct File Opening
Double-click `index.html` or open it directly in any modern web browser (Chrome, Safari, Firefox, Edge, Brave).

### Option 2: Local HTTP Server
Using Python:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## Free Static Hosting

### Netlify Drop
1. Visit [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the project folder containing `index.html`, `style.css`, and `script.js`.
3. Your live URL is generated instantly.

### GitHub Pages
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Build skeuomorphic tear-off calendar"
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.
