================================================================================
COMPUTER GRAPHICS & ANIMATION - LLT1
2D & 3D Transformation Playground
================================================================================

PROJECT INFO
------------
Course: 21CSE255T - Computer Graphics and Animation
Assignment: LLT1 - Life-Long Learning Task
Team: [Add your team names and register numbers here]

TECHNOLOGY STACK
----------------
- HTML5 Canvas API (2D transformations)
- Three.js r128 (3D transformations via CDN)
- Pure JavaScript (no build tools required)
- CSS3 (responsive styling)

FEATURES
--------
2D Transformations:
  - Draw triangle, rectangle, or custom polygon
  - Translation (X, Y sliders)
  - Rotation (angle + pivot point)
  - Scaling (uniform / non-uniform)
  - Reflection (X-axis, Y-axis, custom line angle)
  - Shear (X, Y axis)
  - Real-time transformation matrix display (3x3)
  - Before/after shape visualization
  - Animation mode
  - Export as PNG image

3D Transformations:
  - Wireframe cube and pyramid
  - 3D Translation (X, Y, Z sliders)
  - 3D Rotation (X, Y, Z axes)
  - 3D Scaling (X, Y, Z)
  - Perspective and Orthographic (Parallel) projection toggle
  - XYZ axes display with labels
  - Real-time transformation matrix display (4x4)
  - Auto-rotate animation

HOW TO RUN
----------
Method 1: Direct Open
  1. Open the folder "Graphics-Transform-Tool" in file explorer
  2. Double-click "index.html" to open in your default web browser
  3. Recommended browsers: Google Chrome, Mozilla Firefox, Microsoft Edge

Method 2: Local Server (optional)
  If you have Python installed:
    python -m http.server 8000
  Then open http://localhost:8000 in browser

Method 3: VS Code Live Server
  Install "Live Server" extension in VS Code
  Right-click index.html -> "Open with Live Server"

IMPORTANT NOTES
---------------
- Internet connection is required for loading Three.js from CDN
- No external API keys or paid software required
- All source files are self-contained in this folder
- The application runs entirely client-side (no backend needed)

FILE STRUCTURE
--------------
Graphics-Transform-Tool/
  index.html          - Main HTML layout and UI structure
  style.css           - Styling and responsive design
  main.js             - Application initialization and event wiring
  engine2d.js         - 2D transformation engine with matrix math
  engine3d.js         - 3D transformation engine using Three.js
  matrix-display.js   - Matrix rendering utilities
  README.txt          - This file

TROUBLESHOOTING
---------------
- If 3D view appears blank, check internet connection (Three.js CDN)
- If canvas appears blurry, zoom out browser (Ctrl/Cmd + 0)
- For best performance, use an updated modern browser

================================================================================

