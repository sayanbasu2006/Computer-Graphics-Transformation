/**
 * main.js
 * Main application logic - wires UI controls to 2D and 3D engines
 */

// Global engine instances
let engine2d = null;
let engine3d = null;

document.addEventListener('DOMContentLoaded', () => {
    init2D();
    init3D();
    initTabs();
});

// ===== 2D Initialization =====
function init2D() {
    engine2d = new Engine2D('canvas2d');
    
    // Shape selection
    document.getElementById('shape-select').addEventListener('change', (e) => {
        const type = e.target.value;
        engine2d.setShape(type);
        
        const drawBtn = document.getElementById('btn-draw-polygon');
        const clearBtn = document.getElementById('btn-clear-polygon');
        
        if (type === 'polygon') {
            drawBtn.classList.remove('hidden');
            clearBtn.classList.remove('hidden');
        } else {
            drawBtn.classList.add('hidden');
            clearBtn.classList.add('hidden');
        }
    });
    
    // Canvas click for polygon drawing
    document.getElementById('canvas2d').addEventListener('click', (e) => {
        if (!engine2d.isDrawingPolygon) return;
        
        const rect = e.target.getBoundingClientRect();
        const scaleX = e.target.width / rect.width;
        const scaleY = e.target.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        engine2d.addPolygonPoint(x, y);
    });
    
    document.getElementById('btn-draw-polygon').addEventListener('click', () => {
        engine2d.finishPolygon();
    });
    
    document.getElementById('btn-clear-polygon').addEventListener('click', () => {
        engine2d.clearPolygon();
    });
    
    // Translation controls
    bindSlider('tx', (val) => { engine2d.params.tx = val; engine2d.draw(); });
    bindSlider('ty', (val) => { engine2d.params.ty = val; engine2d.draw(); });
    
    // Rotation controls
    bindSlider('angle', (val) => { engine2d.params.angle = val; engine2d.draw(); });
    bindSlider('px', (val) => { engine2d.params.px = val; engine2d.draw(); });
    bindSlider('py', (val) => { engine2d.params.py = val; engine2d.draw(); });
    
    // Scaling controls
    bindSlider('sx', (val) => { engine2d.params.sx = val; engine2d.draw(); });
    bindSlider('sy', (val) => { engine2d.params.sy = val; engine2d.draw(); });
    
    // Reflection controls
    document.getElementById('reflect-x').addEventListener('click', (e) => {
        engine2d.params.reflectX = !engine2d.params.reflectX;
        e.target.classList.toggle('active');
        engine2d.draw();
    });
    
    document.getElementById('reflect-y').addEventListener('click', (e) => {
        engine2d.params.reflectY = !engine2d.params.reflectY;
        e.target.classList.toggle('active');
        engine2d.draw();
    });
    
    bindSlider('refl-angle', (val) => { engine2d.params.reflAngle = val; engine2d.draw(); });
    
    // Shear controls
    bindSlider('shx', (val) => { engine2d.params.shx = val; engine2d.draw(); });
    bindSlider('shy', (val) => { engine2d.params.shy = val; engine2d.draw(); });
    
    // Action buttons
    document.getElementById('btn-animate-2d').addEventListener('click', (e) => {
        engine2d.toggleAnimation();
        e.target.textContent = engine2d.animating ? 'Stop Animation' : 'Animate Rotation';
        e.target.style.background = engine2d.animating ? '#e53e3e' : '#48bb78';
    });
    
    document.getElementById('btn-reset-2d').addEventListener('click', () => {
        resetSliders2D();
        engine2d.reset();
        document.getElementById('btn-animate-2d').textContent = 'Animate Rotation';
        document.getElementById('btn-animate-2d').style.background = '#48bb78';
        document.getElementById('reflect-x').classList.remove('active');
        document.getElementById('reflect-y').classList.remove('active');
    });
    
    document.getElementById('btn-export-2d').addEventListener('click', () => {
        engine2d.exportImage();
    });
}

// ===== 3D Initialization =====
function init3D() {
    engine3d = new Engine3D('canvas3d-container');
    
    // Object selection
    document.getElementById('object3d-select').addEventListener('change', (e) => {
        engine3d.createObject(e.target.value);
    });
    
    // Translation controls
    bindSlider('3d-tx', (val) => { engine3d.params.tx = val; engine3d.applyTransforms(); });
    bindSlider('3d-ty', (val) => { engine3d.params.ty = val; engine3d.applyTransforms(); });
    bindSlider('3d-tz', (val) => { engine3d.params.tz = val; engine3d.applyTransforms(); });
    
    // Rotation controls
    bindSlider('3d-rx', (val) => { engine3d.params.rx = val; engine3d.applyTransforms(); });
    bindSlider('3d-ry', (val) => { engine3d.params.ry = val; engine3d.applyTransforms(); });
    bindSlider('3d-rz', (val) => { engine3d.params.rz = val; engine3d.applyTransforms(); });
    
    // Scaling controls
    bindSlider('3d-sx', (val) => { engine3d.params.sx = val; engine3d.applyTransforms(); });
    bindSlider('3d-sy', (val) => { engine3d.params.sy = val; engine3d.applyTransforms(); });
    bindSlider('3d-sz', (val) => { engine3d.params.sz = val; engine3d.applyTransforms(); });
    
    // Projection
    document.getElementById('projection-select').addEventListener('change', (e) => {
        engine3d.setProjection(e.target.value);
    });
    
    // Display options
    document.getElementById('show-axes').addEventListener('change', (e) => {
        engine3d.setAxesVisible(e.target.checked);
    });
    
    document.getElementById('show-labels').addEventListener('change', (e) => {
        engine3d.setLabelsVisible(e.target.checked);
    });
    
    // Action buttons
    document.getElementById('btn-animate-3d').addEventListener('click', (e) => {
        engine3d.toggleAnimation();
        e.target.textContent = engine3d.animating ? 'Stop Rotation' : 'Auto Rotate';
        e.target.style.background = engine3d.animating ? '#e53e3e' : '#48bb78';
    });
    
    document.getElementById('btn-reset-3d').addEventListener('click', () => {
        resetSliders3D();
        engine3d.reset();
        document.getElementById('btn-animate-3d').textContent = 'Auto Rotate';
        document.getElementById('btn-animate-3d').style.background = '#48bb78';
    });
}

// ===== Tab Switching =====
function initTabs() {
    const btn2d = document.getElementById('btn-2d');
    const btn3d = document.getElementById('btn-3d');
    const panel2d = document.getElementById('panel-2d');
    const panel3d = document.getElementById('panel-3d');
    
    btn2d.addEventListener('click', () => {
        btn2d.classList.add('active');
        btn3d.classList.remove('active');
        panel2d.classList.add('active');
        panel3d.classList.remove('active');
    });
    
    btn3d.addEventListener('click', () => {
        btn3d.classList.add('active');
        btn2d.classList.remove('active');
        panel3d.classList.add('active');
        panel2d.classList.remove('active');
        
        // Trigger resize to ensure correct rendering
        setTimeout(() => engine3d.onResize(), 100);
    });
}

// ===== Utility Functions =====
function bindSlider(id, callback) {
    const slider = document.getElementById(id);
    const valueSpan = document.getElementById('val-' + id);
    
    if (!slider) return;
    
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (valueSpan) valueSpan.textContent = Number.isInteger(val) ? val : val.toFixed(1);
        callback(val);
    });
}

function resetSliders2D() {
    const sliders = {
        'tx': 0, 'ty': 0,
        'angle': 0,
        'px': 350, 'py': 250,
        'sx': 1, 'sy': 1,
        'refl-angle': 0,
        'shx': 0, 'shy': 0
    };
    
    Object.entries(sliders).forEach(([id, val]) => {
        const slider = document.getElementById(id);
        const valueSpan = document.getElementById('val-' + id);
        if (slider) {
            slider.value = val;
            if (valueSpan) valueSpan.textContent = val;
        }
    });
}

function resetSliders3D() {
    const sliders = {
        '3d-tx': 0, '3d-ty': 0, '3d-tz': 0,
        '3d-rx': 0, '3d-ry': 0, '3d-rz': 0,
        '3d-sx': 1, '3d-sy': 1, '3d-sz': 1
    };
    
    Object.entries(sliders).forEach(([id, val]) => {
        const slider = document.getElementById(id);
        const valueSpan = document.getElementById('val-' + id);
        if (slider) {
            slider.value = val;
            if (valueSpan) valueSpan.textContent = val;
        }
    });
}

