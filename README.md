<p align="center">
  <img src="https://img.shields.io/badge/Course-21CSE255T-7c3aed?style=for-the-badge&labelColor=0d1117" alt="Course">
  <img src="https://img.shields.io/badge/LLT1-Computer%20Graphics-06b6d4?style=for-the-badge&labelColor=0d1117" alt="LLT1">
  <img src="https://img.shields.io/badge/Status-Complete-3fb950?style=for-the-badge&labelColor=0d1117" alt="Status">
</p>

<h1 align="center">◈ CG Transformation Playground</h1>

<p align="center">
  <strong>An interactive, browser-based educational tool for visualizing<br>2D and 3D geometric transformations in Computer Graphics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-Canvas%20API-e34f26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Dark%20Theme-1572b6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black" alt="JS">
  <img src="https://img.shields.io/badge/Three.js-r128-000000?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js">
</p>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [How to Run](#-how-to-run)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Mathematical Foundation](#-mathematical-foundation)
- [Controls & Usage Guide](#-controls--usage-guide)
- [Architecture Overview](#-architecture-overview)

---

## 🎯 About the Project

This project is a **complete, beginner-friendly web application** built as part of the **Computer Graphics and Animation (21CSE255T)** course. It provides an interactive environment to learn and experiment with geometric transformations — the fundamental operations in computer graphics that allow objects to be moved, rotated, scaled, reflected, and distorted.

### Why This Tool?

Traditional CG courses teach transformations through static textbook diagrams and manual matrix multiplication. This tool bridges the gap by providing:

- **Real-time visualization** — See the effect of every transformation instantly
- **Live matrix display** — Watch the 3×3 / 4×4 transformation matrix update as you adjust parameters
- **Composite transformations** — Understand how multiple transforms combine into a single matrix
- **Side-by-side comparison** — Original shape (ghost) vs. transformed shape always visible
- **Split-screen layout** — 2D and 3D transformations viewable simultaneously

---

## 🚀 How to Run

> **No installation required. No server. No build step. No dependencies to install.**

### Quick Start

1. **Download** or **clone** this repository:
   ```bash
   git clone https://github.com/your-username/Computer-Graphics-Transformation.git
   ```

2. **Open `index.html`** in any modern web browser:
   - Double-click the file, **or**
   - Right-click → "Open with" → Chrome / Firefox / Edge / Safari

3. **That's it!** The application loads and runs entirely in the browser.

### Requirements

| Requirement | Details |
|-------------|---------|
| Browser | Chrome 80+, Firefox 78+, Edge 80+, Safari 14+ |
| Internet | Required on **first load** only (to fetch Three.js from CDN; cached after) |
| Server | **Not needed** — runs from `file://` protocol |
| Installation | **None** — zero dependencies to install |

---

## ✨ Features

### 🔷 2D Transformations (HTML5 Canvas)

| Feature | Description |
|---------|-------------|
| **Shape Selection** | Triangle, Rectangle, or Custom Polygon (click on canvas to draw vertices) |
| **Translation** | Slide shape along X and Y axes with independent sliders (±250 px) |
| **Rotation** | Rotate by any angle (−360° to +360°) about a **configurable pivot point** |
| **Scaling** | Uniform and non-uniform scaling (0.1× to 3.0×) about the shape's centroid |
| **Reflection** | Reflect across X-axis, Y-axis, or a **custom line** through the canvas center |
| **Shear** | Apply X-direction and Y-direction shear (−2.0 to +2.0) |
| **Composite Matrix** | All transforms combined into a single **3×3 homogeneous matrix**, displayed live |
| **Active Transform Tags** | Visual indicators showing which transformations are currently applied |
| **Ghost Overlay** | Original shape displayed as a semi-transparent overlay for comparison |
| **Undo / Redo** | Full history stack (up to 50 states) for reverting and re-applying changes |
| **Animate Rotation** | Toggle continuous rotation animation |
| **Export as PNG** | Download the current canvas state as a high-quality PNG image |

### 🔶 3D Transformations (Three.js)

| Feature | Description |
|---------|-------------|
| **Object Selection** | Wireframe Cube or Wireframe Pyramid (with visible vertex dots) |
| **3D Translation** | Move along X, Y, Z axes (±5.0 units) |
| **3D Rotation** | Rotate about X, Y, Z axes independently (±180°) |
| **3D Scaling** | Scale along X, Y, Z axes (0.1× to 3.0×) |
| **Perspective Camera** | Realistic depth perception with foreshortening |
| **Orthographic Camera** | Parallel projection (no perspective distortion) — switchable |
| **OrbitControls** | Drag to orbit, scroll to zoom, middle-click to pan |
| **Ghost Object** | Semi-transparent original wireframe at origin for comparison |
| **Axis Helper** | Color-coded XYZ axes with labeled endpoints (R=X, G=Y, B=Z) |
| **Grid Plane** | Reference grid on the ground plane |
| **Auto-Rotate** | Toggle smooth continuous rotation animation |
| **4×4 Matrix** | Live composite transformation matrix display |
| **Display Toggles** | Show/hide axes, labels, grid, and ghost object independently |

### 🎨 UI / UX

| Feature | Description |
|---------|-------------|
| **Split-Screen Layout** | 2D (left) and 3D (right) always visible simultaneously |
| **Dark Premium Theme** | Deep dark background with purple/cyan gradient accents |
| **Glassmorphism Cards** | Frosted-glass control panels with subtle border glow on hover |
| **Custom Sliders** | Gradient-track sliders with glowing thumb indicators |
| **Matrix Highlighting** | Non-identity matrix values are color-highlighted for easy identification |
| **Responsive Design** | Stacks vertically on screens narrower than 1000px |
| **Modern Typography** | Inter (UI) + JetBrains Mono (code/matrices) via Google Fonts |
| **Smooth Transitions** | All interactions have subtle CSS transitions and animations |

### 🏆 Bonus Features

| Feature | Description |
|---------|-------------|
| ✅ **Undo / Redo** | Full transformation history with keyboard-style undo/redo |
| ✅ **Animation Toggle** | Real-time rotation animation for both 2D and 3D |
| ✅ **Export Canvas** | Download 2D canvas as PNG image |

---

## 📁 Project Structure

```
Computer-Graphics-Transformation/
│
├── index.html              # Main HTML layout
│                            # Split-screen structure, all controls,
│                            # CDN imports for Three.js & OrbitControls
│
├── style.css               # Complete dark-theme stylesheet
│                            # CSS custom properties, glassmorphism,
│                            # responsive breakpoints, custom sliders
│
├── main.js                 # Application entry point
│                            # Event wiring, slider bindings,
│                            # undo/redo management, reset logic
│
├── engine2d.js             # 2D Transformation Engine
│                            # Canvas rendering, 3×3 matrix math,
│                            # all 2D transforms, undo/redo history,
│                            # animation, shape management, export
│
├── engine3d.js             # 3D Transformation Engine
│                            # Three.js scene setup, OrbitControls,
│                            # wireframe objects, ghost overlay,
│                            # 4×4 matrix math, projection switching
│
├── matrix-display.js       # Matrix Renderer
│                            # Renders 3×3 and 4×4 matrices as
│                            # styled HTML with value highlighting
│
├── README.md               # This file
├── README.txt              # Plain-text version of documentation
└── TODO.md                 # Implementation tracking checklist
```

---

## 🛠 Technologies Used

| Technology | Purpose | Details |
|------------|---------|---------|
| **HTML5** | Structure & Layout | Semantic HTML5 elements, Canvas API for 2D rendering |
| **CSS3** | Styling & Theming | Custom properties, glassmorphism, gradients, transitions, responsive grid |
| **JavaScript (ES6+)** | Application Logic | Classes, arrow functions, template literals, destructuring |
| **Canvas API** | 2D Rendering | Manual pixel-level drawing of shapes, grids, transformations |
| **Three.js (r128)** | 3D Rendering | WebGL-based 3D scene with camera, lighting, wireframes |
| **OrbitControls** | 3D Interaction | Mouse-based camera orbiting, zooming, and panning |
| **Google Fonts** | Typography | Inter (UI text) and JetBrains Mono (code/matrix values) |

> **No frameworks** (React, Vue, Angular) are used. No build tools (Webpack, Vite) are needed.  
> The entire application is **pure vanilla HTML/CSS/JS** that runs directly in the browser.

---

## 📐 Mathematical Foundation

### 2D Transformations — Homogeneous Coordinates (3×3 Matrices)

All 2D transformations use **homogeneous coordinates** `[x, y, 1]ᵀ` and are represented as **3×3 matrices**, enabling composition through matrix multiplication.

#### Translation
```
┌ 1  0  tx ┐   
│ 0  1  ty │   P' = T · P
└ 0  0   1 ┘   
```

#### Rotation (about pivot point)
```
┌ cosθ  -sinθ  0 ┐
│ sinθ   cosθ  0 │   R(θ) with pivot: T(px,py) · R(θ) · T(-px,-py)
└  0      0    1 ┘
```

#### Scaling (about centroid)
```
┌ Sx  0  0 ┐
│ 0  Sy  0 │   S with center: T(cx,cy) · S · T(-cx,-cy)
└ 0   0  1 ┘
```

#### Reflection
```
X-axis: ┌ 1  0  0 ┐    Y-axis: ┌-1  0  0 ┐    Line at angle θ: ┌ cos2θ  sin2θ  0 ┐
        │ 0 -1  0 │            │ 0  1  0 │                     │ sin2θ -cos2θ  0 │
        └ 0  0  1 ┘            └ 0  0  1 ┘                     └   0      0    1 ┘
```

#### Shear
```
X-Shear: ┌ 1  Shx  0 ┐    Y-Shear: ┌  1   0  0 ┐
         │ 0   1   0 │             │ Shy  1  0 │
         └ 0   0   1 ┘             └  0   0  1 ┘
```

#### Composite Transformation
```
M_composite = T · R · Ref · Sh · S

The final transformed point: P' = M_composite · P
```

### 3D Transformations — 4×4 Homogeneous Matrices

3D transformations extend to **4×4 matrices** with homogeneous coordinates `[x, y, z, 1]ᵀ`.

```
Composite: M = T(tx,ty,tz) · Rx(θx) · Ry(θy) · Rz(θz) · S(sx,sy,sz)
```

---

## 🎮 Controls & Usage Guide

### 2D Panel (Left Side)

| Control | Action |
|---------|--------|
| **Shape Dropdown** | Select Triangle, Rectangle, or Custom Polygon |
| **Canvas Click** | Add vertices when "Custom Polygon" is selected |
| **✓ Finish / ✕ Clear** | Complete or reset the custom polygon |
| **Tx / Ty Sliders** | Translate the shape along X and Y |
| **Angle (θ) Slider** | Set rotation angle in degrees |
| **Pivot X / Y Sliders** | Set the rotation center point |
| **Sx / Sy Sliders** | Set X and Y scale factors |
| **Reflect X / Y Buttons** | Toggle axis reflections (click to activate/deactivate) |
| **Custom Line Angle** | Set angle for reflection about a custom line |
| **Shx / Shy Sliders** | Apply shearing deformation |
| **▶ Animate** | Toggle continuous rotation animation |
| **↺ Reset** | Reset all transformations to identity |
| **⟲ Undo / ⟳ Redo** | Step through transformation history |
| **↓ Export** | Download canvas as PNG |

### 3D Panel (Right Side)

| Control | Action |
|---------|--------|
| **Object Dropdown** | Switch between Cube and Pyramid |
| **Tx / Ty / Tz Sliders** | Translate in 3D space |
| **Rx / Ry / Rz Sliders** | Rotate about each axis |
| **Sx / Sy / Sz Sliders** | Scale along each axis |
| **Projection Dropdown** | Switch Perspective ↔ Orthographic |
| **Checkboxes** | Toggle axes, labels, grid, and ghost object |
| **↻ Auto Rotate** | Toggle continuous 3D rotation |
| **↺ Reset** | Reset all 3D transformations |
| **Mouse Drag** | Orbit the camera around the scene |
| **Scroll Wheel** | Zoom in/out |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│  ┌──────────────────────┬──────────────────────────────┐    │
│  │    2D Panel (Left)   │      3D Panel (Right)        │    │
│  │  ┌────────────────┐  │  ┌────────────────────────┐  │    │
│  │  │  Canvas (2D)   │  │  │  Three.js Container    │  │    │
│  │  └────────────────┘  │  └────────────────────────┘  │    │
│  │  ┌────────────────┐  │  ┌────────────────────────┐  │    │
│  │  │   Controls     │  │  │      Controls          │  │    │
│  │  └────────────────┘  │  └────────────────────────┘  │    │
│  │  ┌────────────────┐  │  ┌────────────────────────┐  │    │
│  │  │  3×3 Matrix    │  │  │    4×4 Matrix          │  │    │
│  │  └────────────────┘  │  └────────────────────────┘  │    │
│  └──────────────────────┴──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌────────────┐   ┌────────────┐   ┌──────────────────┐
│  main.js   │──▶│ engine2d.js│──▶│matrix-display.js │
│ (wiring)   │   │ (Canvas)   │   │ (renders matrices)│
│            │──▶│ engine3d.js│──▶│                  │
│            │   │ (Three.js) │   │                  │
└────────────┘   └────────────┘   └──────────────────┘
      │
      ▼
┌────────────┐
│ style.css  │
│ (theming)  │
└────────────┘
```

### Data Flow

1. **User adjusts a slider** → `main.js` captures the `input` event
2. **`main.js` updates engine params** → calls `engine2d.draw()` or `engine3d.applyTransforms()`
3. **Engine computes composite matrix** → applies to shape vertices / Three.js object
4. **Matrix is rendered** → `matrix-display.js` updates the HTML matrix table
5. **On slider release** (`change` event) → state is pushed to undo history

---

<p align="center">
  <strong>21CSE255T — Computer Graphics and Animation | LLT1</strong><br>
  <sub>Built with ❤️ using HTML5 Canvas & Three.js</sub>
</p>
