/**
 * main.js
 * ============================================================
 * Application entry point — wires UI controls to 2D and 3D
 * transformation engines. Handles event binding, tab switching,
 * slider synchronization, and undo/redo management.
 * ============================================================
 */

let engine2d = null;
let engine3d = null;

// =============================================================
//  INITIALIZATION
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
    init2D();
    init3D();

    // Trigger initial 3D resize after layout settles
    setTimeout(() => {
        if (engine3d) engine3d.onResize();
    }, 200);
});

// =============================================================
//  2D SETUP
// =============================================================

function init2D() {
    engine2d = new Engine2D('canvas2d');

    // ── Shape Selection ──
    const shapeSelect = document.getElementById('shape-select');
    const polyBtns = document.getElementById('polygon-btns');

    shapeSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        engine2d.setShape(type);
        polyBtns.classList.toggle('hidden', type !== 'polygon');
    });

    // ── Polygon drawing ──
    document.getElementById('canvas2d').addEventListener('click', (e) => {
        if (!engine2d.isDrawingPolygon) return;
        const rect = e.target.getBoundingClientRect();
        const scaleX = e.target.width / rect.width;
        const scaleY = e.target.height / rect.height;
        engine2d.addPolygonPoint(
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        );
    });

    document.getElementById('btn-draw-polygon').addEventListener('click', () => {
        engine2d.finishPolygon();
    });

    document.getElementById('btn-clear-polygon').addEventListener('click', () => {
        engine2d.clearPolygon();
    });

    // ── Sliders ──
    // Translation
    bindSlider('tx', v => { engine2d.params.tx = v; engine2d.draw(); });
    bindSlider('ty', v => { engine2d.params.ty = v; engine2d.draw(); });

    // Rotation
    bindSlider('angle', v => { engine2d.params.angle = v; engine2d.draw(); });
    bindSlider('px', v => { engine2d.params.px = v; engine2d.draw(); });
    bindSlider('py', v => { engine2d.params.py = v; engine2d.draw(); });

    // Scaling
    bindSlider('sx', v => { engine2d.params.sx = v; engine2d.draw(); });
    bindSlider('sy', v => { engine2d.params.sy = v; engine2d.draw(); });

    // Shear
    bindSlider('shx', v => { engine2d.params.shx = v; engine2d.draw(); });
    bindSlider('shy', v => { engine2d.params.shy = v; engine2d.draw(); });

    // Reflection angle
    bindSlider('refl-angle', v => { engine2d.params.reflAngle = v; engine2d.draw(); });

    // ── Reflection toggle buttons ──
    document.getElementById('reflect-x').addEventListener('click', (e) => {
        engine2d.pushHistory();
        engine2d.params.reflectX = !engine2d.params.reflectX;
        e.target.classList.toggle('active');
        engine2d.draw();
        updateUndoRedoButtons();
    });

    document.getElementById('reflect-y').addEventListener('click', (e) => {
        engine2d.pushHistory();
        engine2d.params.reflectY = !engine2d.params.reflectY;
        e.target.classList.toggle('active');
        engine2d.draw();
        updateUndoRedoButtons();
    });

    // ── Animate ──
    const animBtn = document.getElementById('btn-animate-2d');
    animBtn.addEventListener('click', () => {
        engine2d.toggleAnimation();
        animBtn.textContent = engine2d.animating ? '■ Stop' : '▶ Animate';
        animBtn.classList.toggle('active-anim', engine2d.animating);
    });

    // ── Reset ──
    document.getElementById('btn-reset-2d').addEventListener('click', () => {
        resetSliders2D();
        engine2d.reset();
        animBtn.textContent = '▶ Animate';
        animBtn.classList.remove('active-anim');
        document.getElementById('reflect-x').classList.remove('active');
        document.getElementById('reflect-y').classList.remove('active');
        updateUndoRedoButtons();
    });

    // ── Export ──
    document.getElementById('btn-export-2d').addEventListener('click', () => {
        engine2d.exportImage();
    });

    // ── Undo / Redo ──
    document.getElementById('btn-undo-2d').addEventListener('click', () => {
        if (engine2d.undo()) {
            syncSlidersToParams();
            updateUndoRedoButtons();
        }
    });

    document.getElementById('btn-redo-2d').addEventListener('click', () => {
        if (engine2d.redo()) {
            syncSlidersToParams();
            updateUndoRedoButtons();
        }
    });

    // Push history on slider mouseup / touchend (debounced save)
    document.querySelectorAll('#panel-2d .styled-slider').forEach(slider => {
        slider.addEventListener('change', () => {
            engine2d.pushHistory();
            updateUndoRedoButtons();
        });
    });
}

// =============================================================
//  3D SETUP
// =============================================================

function init3D() {
    engine3d = new Engine3D('canvas3d-container');

    // ── Object selection ──
    document.getElementById('object3d-select').addEventListener('change', (e) => {
        engine3d.createObject(e.target.value);
    });

    // ── Sliders ──
    // Translation
    bind3DSlider('slider-3d-tx', 'val-3d-tx', v => { engine3d.params.tx = v; engine3d.applyTransforms(); });
    bind3DSlider('slider-3d-ty', 'val-3d-ty', v => { engine3d.params.ty = v; engine3d.applyTransforms(); });
    bind3DSlider('slider-3d-tz', 'val-3d-tz', v => { engine3d.params.tz = v; engine3d.applyTransforms(); });

    // Rotation
    bind3DSlider('slider-3d-rx', 'val-3d-rx', v => { engine3d.params.rx = v; engine3d.applyTransforms(); });
    bind3DSlider('slider-3d-ry', 'val-3d-ry', v => { engine3d.params.ry = v; engine3d.applyTransforms(); });
    bind3DSlider('slider-3d-rz', 'val-3d-rz', v => { engine3d.params.rz = v; engine3d.applyTransforms(); });

    // Scaling
    bind3DSlider('slider-3d-sx', 'val-3d-sx', v => { engine3d.params.sx = v; engine3d.applyTransforms(); });
    bind3DSlider('slider-3d-sy', 'val-3d-sy', v => { engine3d.params.sy = v; engine3d.applyTransforms(); });
    bind3DSlider('slider-3d-sz', 'val-3d-sz', v => { engine3d.params.sz = v; engine3d.applyTransforms(); });

    // ── Projection ──
    document.getElementById('projection-select').addEventListener('change', (e) => {
        engine3d.setProjection(e.target.value);
    });

    // ── Display toggles ──
    document.getElementById('show-axes').addEventListener('change', (e) => {
        engine3d.setAxesVisible(e.target.checked);
    });
    document.getElementById('show-labels').addEventListener('change', (e) => {
        engine3d.setLabelsVisible(e.target.checked);
    });
    document.getElementById('show-grid').addEventListener('change', (e) => {
        engine3d.setGridVisible(e.target.checked);
    });
    document.getElementById('show-ghost').addEventListener('change', (e) => {
        engine3d.setGhostVisible(e.target.checked);
    });

    // ── Animate ──
    const animBtn3d = document.getElementById('btn-animate-3d');
    animBtn3d.addEventListener('click', () => {
        engine3d.toggleAnimation();
        animBtn3d.textContent = engine3d.animating ? '■ Stop Rotate' : '↻ Auto Rotate';
        animBtn3d.classList.toggle('active-anim', engine3d.animating);
    });

    // ── Reset ──
    document.getElementById('btn-reset-3d').addEventListener('click', () => {
        resetSliders3D();
        engine3d.reset();
        animBtn3d.textContent = '↻ Auto Rotate';
        animBtn3d.classList.remove('active-anim');
    });
}

// =============================================================
//  SLIDER UTILITIES
// =============================================================

/**
 * Bind a 2D slider to a callback.
 * The slider ID and value display span follow the convention:
 *   slider id = {id}, value span id = val-{id}
 */
function bindSlider(id, callback) {
    const slider = document.getElementById(id);
    const valSpan = document.getElementById('val-' + id);
    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        if (valSpan) valSpan.textContent = Number.isInteger(v) ? v : v.toFixed(1);
        callback(v);
    });
}

/**
 * Bind a 3D slider with explicit slider and value IDs.
 */
function bind3DSlider(sliderId, valId, callback) {
    const slider = document.getElementById(sliderId);
    const valSpan = document.getElementById(valId);
    if (!slider) return;

    slider.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        if (valSpan) valSpan.textContent = Number.isInteger(v) ? v : v.toFixed(1);
        callback(v);
    });
}

// =============================================================
//  RESET HELPERS
// =============================================================

function resetSliders2D() {
    const defaults = {
        'tx': 0, 'ty': 0,
        'angle': 0, 'px': 300, 'py': 220,
        'sx': 1, 'sy': 1,
        'refl-angle': 0,
        'shx': 0, 'shy': 0
    };

    Object.entries(defaults).forEach(([id, val]) => {
        const s = document.getElementById(id);
        const v = document.getElementById('val-' + id);
        if (s) s.value = val;
        if (v) v.textContent = Number.isInteger(val) ? val : val.toFixed(1);
    });
}

function resetSliders3D() {
    const defaults = {
        'slider-3d-tx': 0, 'slider-3d-ty': 0, 'slider-3d-tz': 0,
        'slider-3d-rx': 0, 'slider-3d-ry': 0, 'slider-3d-rz': 0,
        'slider-3d-sx': 1, 'slider-3d-sy': 1, 'slider-3d-sz': 1
    };

    Object.entries(defaults).forEach(([sliderId, val]) => {
        const s = document.getElementById(sliderId);
        // Derive val span ID: slider-3d-tx → val-3d-tx
        const valId = sliderId.replace('slider-', 'val-');
        const v = document.getElementById(valId);
        if (s) s.value = val;
        if (v) v.textContent = Number.isInteger(val) ? val : val.toFixed(1);
    });
}

// =============================================================
//  UNDO / REDO UI
// =============================================================

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('btn-undo-2d');
    const redoBtn = document.getElementById('btn-redo-2d');
    if (undoBtn) undoBtn.disabled = engine2d.history.length === 0;
    if (redoBtn) redoBtn.disabled = engine2d.redoStack.length === 0;
}

/**
 * After undo/redo, sync all 2D sliders to current engine params.
 */
function syncSlidersToParams() {
    const p = engine2d.params;
    const map = {
        'tx': p.tx, 'ty': p.ty,
        'angle': p.angle, 'px': p.px, 'py': p.py,
        'sx': p.sx, 'sy': p.sy,
        'refl-angle': p.reflAngle,
        'shx': p.shx, 'shy': p.shy
    };

    Object.entries(map).forEach(([id, val]) => {
        const s = document.getElementById(id);
        const v = document.getElementById('val-' + id);
        if (s) s.value = val;
        if (v) v.textContent = Number.isInteger(val) ? val : parseFloat(val).toFixed(1);
    });

    // Sync reflection toggle buttons
    document.getElementById('reflect-x').classList.toggle('active', p.reflectX);
    document.getElementById('reflect-y').classList.toggle('active', p.reflectY);
}
