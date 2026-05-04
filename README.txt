===============================================================================
  CG TRANSFORMATION PLAYGROUND
  Interactive 2D & 3D Geometric Transformations
  Course: 21CSE255T — Computer Graphics and Animation | LLT1
===============================================================================


HOW TO RUN
==========

  1. Download or clone the project folder.

  2. Open "index.html" directly in any modern web browser:
     - Double-click the file, OR
     - Right-click → Open With → Chrome / Firefox / Edge / Safari

  3. That's it! No installation, no server, no build step required.

  NOTE: An internet connection is needed on first load to fetch
  Three.js and OrbitControls from CDN (cached by browser afterward).

  REQUIREMENTS:
  - Browser: Chrome 80+, Firefox 78+, Edge 80+, or Safari 14+
  - Internet: Only for first load (CDN caching)
  - Server: NOT needed (runs from file:// protocol)


FEATURES
========

  2D Transformations (Left Panel — HTML5 Canvas)
  -----------------------------------------------
  • Shape Selection    — Triangle, Rectangle, or Custom Polygon (click to draw)
  • Translation        — Move shape along X and Y axes (±250 px)
  • Rotation           — Rotate by any angle about a configurable pivot point
  • Scaling            — Uniform and non-uniform (0.1x to 3.0x) about centroid
  • Reflection         — X-axis, Y-axis, or custom line through center
  • Shear              — X-direction and Y-direction shear
  • Composite Matrix   — All transforms combined into a 3×3 homogeneous matrix
  • Ghost Overlay      — Original shape shown as faded overlay for comparison
  • Active Tags        — Visual indicators of which transforms are applied
  • Undo / Redo        — Full history stack (up to 50 states)
  • Animation          — Toggle continuous rotation
  • Export             — Download canvas as PNG image

  3D Transformations (Right Panel — Three.js)
  --------------------------------------------
  • Objects            — Wireframe Cube or Pyramid with vertex dots
  • Ghost Object       — Semi-transparent original at origin
  • 3D Translation     — Move along X, Y, Z axes (±5 units)
  • 3D Rotation        — Rotate about X, Y, Z axes (±180°)
  • 3D Scaling         — Scale along X, Y, Z (0.1x to 3.0x)
  • Projection         — Perspective or Orthographic camera toggle
  • OrbitControls      — Drag to orbit, scroll to zoom, middle-click to pan
  • Display Toggles    — Show/hide axes, labels, grid, ghost object
  • Auto-Rotate        — Toggle smooth continuous 3D rotation
  • 4×4 Matrix         — Live composite transformation matrix display


TECHNOLOGIES USED
=================

  • HTML5              — Page structure, Canvas API for 2D rendering
  • CSS3               — Dark theme, glassmorphism, gradients, transitions
  • JavaScript (ES6+)  — Application logic, matrix math, event handling
  • Canvas API         — 2D shape rendering and transformation visualization
  • Three.js (r128)    — 3D scene, wireframes, camera, WebGL rendering
  • OrbitControls      — Mouse-based 3D camera orbit, zoom, and pan
  • Google Fonts       — Inter (UI) + JetBrains Mono (code/matrix)

  No frameworks (React, Vue, Angular). No build tools (Webpack, Vite).
  Pure vanilla HTML/CSS/JS — runs directly in the browser.


PROJECT STRUCTURE
=================

  Computer-Graphics-Transformation/
  ├── index.html          Split-screen layout with all controls
  ├── style.css           Premium dark theme with glassmorphism
  ├── main.js             App initialization and event wiring
  ├── engine2d.js         2D Canvas engine: matrix math, undo/redo
  ├── engine3d.js         3D Three.js engine: OrbitControls, ghost objects
  ├── matrix-display.js   Renders 3×3 and 4×4 matrices as styled HTML
  ├── README.md           Full documentation (Markdown with badges)
  ├── README.txt          This file (plain text documentation)
  └── TODO.md             Implementation checklist


CONTROLS QUICK REFERENCE
=========================

  2D Panel:
    • Click canvas to add polygon vertices (Custom Polygon mode)
    • Drag sliders for real-time transformation preview
    • Click "Reflect X/Y" buttons to toggle reflections
    • Click "▶ Animate" for continuous rotation
    • Click "↺ Reset" to return to identity
    • Click "⟲ Undo" / "⟳ Redo" to step through history
    • Click "↓ Export" to save as PNG

  3D Panel:
    • Left-click + drag to orbit the 3D camera
    • Scroll wheel to zoom in/out
    • Drag sliders for translation, rotation, and scaling
    • Use checkboxes to toggle axes, labels, grid, ghost object
    • Click "↻ Auto Rotate" for continuous rotation


MATHEMATICAL FOUNDATION
========================

  2D: All transforms use 3×3 homogeneous matrices.
      Composite: M = T × R × Ref × Sh × S
      Result:    P' = M × P  (where P = [x, y, 1]')

  3D: All transforms use 4×4 homogeneous matrices.
      Composite: M = T × Rx × Ry × Rz × S
      Result:    P' = M × P  (where P = [x, y, z, 1]')


===============================================================================
  Built with HTML5 Canvas & Three.js
===============================================================================
