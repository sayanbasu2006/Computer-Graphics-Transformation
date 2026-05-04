/**
 * engine3d.js
 * ============================================================
 * 3D Geometric Transformations Engine using Three.js
 * 
 * Features:
 *   - Wireframe cube and pyramid with vertex dots
 *   - Ghost (original) object overlay
 *   - OrbitControls for mouse-based camera interaction
 *   - Translation, Rotation (X/Y/Z), Scaling
 *   - Perspective & Orthographic projection toggle
 *   - Auto-rotate animation
 *   - 4×4 homogeneous transformation matrix display
 * ============================================================
 */

class Engine3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth || 600;
        this.height = this.container.clientHeight || 400;

        // ── Scene ──
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e14);

        // ── Camera (Perspective default) ──
        this.perspCamera = new THREE.PerspectiveCamera(
            55, this.width / this.height, 0.1, 100
        );
        this.perspCamera.position.set(5, 4, 7);
        this.perspCamera.lookAt(0, 0, 0);

        const frustum = 5;
        const aspect = this.width / this.height;
        this.orthoCamera = new THREE.OrthographicCamera(
            -frustum * aspect / 2, frustum * aspect / 2,
            frustum / 2, -frustum / 2, 0.1, 100
        );
        this.orthoCamera.position.set(5, 4, 7);
        this.orthoCamera.lookAt(0, 0, 0);

        this.projectionMode = 'perspective';
        this.camera = this.perspCamera;

        // ── Renderer ──
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // ── OrbitControls ──
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.08;
            this.controls.minDistance = 3;
            this.controls.maxDistance = 25;
        } else {
            this.controls = null;
        }

        // ── Axes helper ──
        this.axesHelper = new THREE.AxesHelper(3);
        this.scene.add(this.axesHelper);

        // ── Axis labels ──
        this.axisLabels = [];
        this.createAxisLabels();

        // ── Grid ──
        this.gridHelper = new THREE.GridHelper(10, 10, 0x2d333b, 0x1a1f26);
        this.scene.add(this.gridHelper);

        // ── Ambient light (so we can see materials if needed) ──
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        // ── Objects ──
        this.currentObject = null;   // transformed wireframe
        this.ghostObject = null;     // original ghost wireframe
        this.objectType = 'cube';

        // ── Params ──
        this.params = {
            tx: 0, ty: 0, tz: 0,
            rx: 0, ry: 0, rz: 0,
            sx: 1, sy: 1, sz: 1
        };

        // ── Animation ──
        this.animating = false;
        this.animationId = null;

        // ── Display toggles ──
        this.showGhost = true;

        // ── Create initial object & start render loop ──
        this.createObject('cube');
        this.renderLoop();
        window.addEventListener('resize', () => this.onResize());
    }

    // =============================================================
    //  AXIS LABELS
    // =============================================================

    createAxisLabels() {
        const makeLabel = (text, pos, color) => {
            const c = document.createElement('canvas');
            const g = c.getContext('2d');
            c.width = 64; c.height = 64;
            g.font = 'Bold 40px Inter, Arial';
            g.fillStyle = color;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(text, 32, 32);

            const tex = new THREE.CanvasTexture(c);
            const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
            const sprite = new THREE.Sprite(mat);
            sprite.position.copy(pos);
            sprite.scale.set(0.5, 0.5, 0.5);
            this.scene.add(sprite);
            this.axisLabels.push(sprite);
        };

        makeLabel('X', new THREE.Vector3(3.4, 0, 0), '#ff6b6b');
        makeLabel('Y', new THREE.Vector3(0, 3.4, 0), '#51cf66');
        makeLabel('Z', new THREE.Vector3(0, 0, 3.4), '#339af0');
    }

    // =============================================================
    //  OBJECT CREATION
    // =============================================================

    createObject(type) {
        // Remove existing objects
        if (this.currentObject) this.scene.remove(this.currentObject);
        if (this.ghostObject) this.scene.remove(this.ghostObject);

        this.objectType = type;

        if (type === 'cube') {
            this.currentObject = this.makeWireframe(
                new THREE.BoxGeometry(2, 2, 2), 0x06b6d4
            );
            this.ghostObject = this.makeWireframe(
                new THREE.BoxGeometry(2, 2, 2), 0x8b949e, 0.2
            );
        } else {
            this.currentObject = this.makeWireframe(
                new THREE.ConeGeometry(1.4, 2.4, 4), 0xff6b6b
            );
            this.ghostObject = this.makeWireframe(
                new THREE.ConeGeometry(1.4, 2.4, 4), 0x8b949e, 0.2
            );
        }

        this.scene.add(this.currentObject);
        this.scene.add(this.ghostObject);
        this.ghostObject.visible = this.showGhost;
        this.applyTransforms();
    }

    /**
     * Build a wireframe group: EdgesGeometry lines + vertex Points.
     * @param {THREE.BufferGeometry} geom
     * @param {number} color - hex color
     * @param {number} [opacity=1]
     * @returns {THREE.Group}
     */
    makeWireframe(geom, color, opacity) {
        const group = new THREE.Group();
        const opac = opacity !== undefined ? opacity : 1;

        // Edges
        const edges = new THREE.EdgesGeometry(geom);
        const lineMat = new THREE.LineBasicMaterial({
            color, transparent: opac < 1, opacity: opac
        });
        group.add(new THREE.LineSegments(edges, lineMat));

        // Vertex dots
        const verts = geom.attributes.position.array;
        const unique = new Map();
        for (let i = 0; i < verts.length; i += 3) {
            const key = `${(verts[i]*100|0)},${(verts[i+1]*100|0)},${(verts[i+2]*100|0)}`;
            if (!unique.has(key)) unique.set(key, [verts[i], verts[i+1], verts[i+2]]);
        }
        const pos = new Float32Array(unique.size * 3);
        let idx = 0;
        unique.forEach(v => { pos[idx++] = v[0]; pos[idx++] = v[1]; pos[idx++] = v[2]; });
        const pGeom = new THREE.BufferGeometry();
        pGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const pMat = new THREE.PointsMaterial({
            color, size: 0.1, transparent: opac < 1, opacity: opac
        });
        group.add(new THREE.Points(pGeom, pMat));

        return group;
    }

    // =============================================================
    //  4×4 MATRIX MATH
    // =============================================================

    mat4Identity() {
        return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
    }

    mat4Mul(A, B) {
        const C = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                for (let k = 0; k < 4; k++)
                    C[i][j] += A[i][k] * B[k][j];
        return C;
    }

    mat4Translate(tx, ty, tz) {
        return [[1,0,0,tx],[0,1,0,ty],[0,0,1,tz],[0,0,0,1]];
    }

    mat4RotX(deg) {
        const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        return [[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]];
    }

    mat4RotY(deg) {
        const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]];
    }

    mat4RotZ(deg) {
        const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]];
    }

    mat4Scale(sx, sy, sz) {
        return [[sx,0,0,0],[0,sy,0,0],[0,0,sz,0],[0,0,0,1]];
    }

    /**
     * Composite 4×4 matrix: T × Rx × Ry × Rz × S
     */
    getCompositeMatrix3D() {
        const p = this.params;
        let M = this.mat4Identity();
        M = this.mat4Mul(this.mat4Scale(p.sx, p.sy, p.sz), M);
        M = this.mat4Mul(this.mat4RotZ(p.rz), M);
        M = this.mat4Mul(this.mat4RotY(p.ry), M);
        M = this.mat4Mul(this.mat4RotX(p.rx), M);
        M = this.mat4Mul(this.mat4Translate(p.tx, p.ty, p.tz), M);
        return M;
    }

    // =============================================================
    //  APPLY TRANSFORMS
    // =============================================================

    applyTransforms() {
        if (!this.currentObject) return;
        const p = this.params;

        this.currentObject.position.set(p.tx, p.ty, p.tz);
        this.currentObject.rotation.set(
            p.rx * Math.PI / 180,
            p.ry * Math.PI / 180,
            p.rz * Math.PI / 180
        );
        this.currentObject.scale.set(p.sx, p.sy, p.sz);

        // Update matrix display
        if (typeof renderMatrix4x4 === 'function')
            renderMatrix4x4('matrix-3d', this.getCompositeMatrix3D());
    }

    // =============================================================
    //  PROJECTION & DISPLAY
    // =============================================================

    setProjection(mode) {
        this.projectionMode = mode;
        const pos = this.camera.position.clone();

        if (mode === 'perspective') {
            this.camera = this.perspCamera;
        } else {
            this.camera = this.orthoCamera;
        }

        this.camera.position.copy(pos);
        this.camera.lookAt(0, 0, 0);

        // Reconnect OrbitControls to new camera
        if (this.controls) {
            this.controls.object = this.camera;
            this.controls.update();
        }
    }

    setAxesVisible(v) {
        this.axesHelper.visible = v;
    }

    setLabelsVisible(v) {
        this.axisLabels.forEach(l => l.visible = v);
    }

    setGridVisible(v) {
        this.gridHelper.visible = v;
    }

    setGhostVisible(v) {
        this.showGhost = v;
        if (this.ghostObject) this.ghostObject.visible = v;
    }

    // =============================================================
    //  ANIMATION
    // =============================================================

    toggleAnimation() {
        this.animating ? this.stopAnimation() : this.startAnimation();
    }

    startAnimation() {
        this.animating = true;
        const tick = () => {
            if (!this.animating) return;

            this.params.ry = (this.params.ry + 0.8) % 360;
            this.params.rx = (this.params.rx + 0.3) % 360;

            // Sync sliders
            this.syncSlider('slider-3d-ry', 'val-3d-ry', this.params.ry);
            this.syncSlider('slider-3d-rx', 'val-3d-rx', this.params.rx);

            this.applyTransforms();
            this.animationId = requestAnimationFrame(tick);
        };
        tick();
    }

    stopAnimation() {
        this.animating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /** Helper to sync a slider and its value display */
    syncSlider(sliderId, valId, value) {
        const s = document.getElementById(sliderId);
        const v = document.getElementById(valId);
        const display = value > 180 ? Math.round(value - 360) : Math.round(value);
        if (s) s.value = display;
        if (v) v.textContent = display;
    }

    // =============================================================
    //  RESET
    // =============================================================

    reset() {
        this.stopAnimation();
        this.params = {
            tx: 0, ty: 0, tz: 0,
            rx: 0, ry: 0, rz: 0,
            sx: 1, sy: 1, sz: 1
        };
        this.applyTransforms();
    }

    // =============================================================
    //  RENDER LOOP
    // =============================================================

    renderLoop() {
        requestAnimationFrame(() => this.renderLoop());
        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        if (this.width === 0 || this.height === 0) return;

        const aspect = this.width / this.height;

        // Update perspective camera
        this.perspCamera.aspect = aspect;
        this.perspCamera.updateProjectionMatrix();

        // Update orthographic camera
        const f = 5;
        this.orthoCamera.left = -f * aspect / 2;
        this.orthoCamera.right = f * aspect / 2;
        this.orthoCamera.top = f / 2;
        this.orthoCamera.bottom = -f / 2;
        this.orthoCamera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }
}
