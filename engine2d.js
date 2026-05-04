/**
 * engine2d.js
 * ============================================================
 * 2D Geometric Transformations Engine
 * Implements all 2D transformations using homogeneous coordinates
 * and 3×3 matrix math on an HTML5 Canvas.
 *
 * Supported transformations:
 *   - Translation (tx, ty)
 *   - Rotation about arbitrary pivot (angle, px, py)
 *   - Scaling (uniform and non-uniform, about shape centroid)
 *   - Reflection (X-axis, Y-axis, custom line through center)
 *   - Shear (X-direction, Y-direction)
 *
 * Features: undo/redo history, animation, composite matrix,
 *           export canvas as PNG.
 * ============================================================
 */

class Engine2D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.W = this.canvas.width;   // 600
        this.H = this.canvas.height;  // 440
        this.cx = this.W / 2;         // center X = 300
        this.cy = this.H / 2;         // center Y = 220

        // Default shape: equilateral-ish triangle centered on canvas
        this.defaultTriangle = [
            { x: 300, y: 120 },
            { x: 200, y: 320 },
            { x: 400, y: 320 }
        ];
        this.defaultRectangle = [
            { x: 220, y: 140 },
            { x: 380, y: 140 },
            { x: 380, y: 300 },
            { x: 220, y: 300 }
        ];

        this.originalShape = this.clonePoints(this.defaultTriangle);
        this.customPolygon = [];
        this.isDrawingPolygon = false;

        // Transformation parameters
        this.params = this.defaultParams();

        // Animation state
        this.animating = false;
        this.animationId = null;

        // Undo/Redo history
        this.history = [];
        this.redoStack = [];
        this.maxHistory = 50;

        // Initial draw
        this.draw();
    }

    /** Return a fresh copy of default parameter values */
    defaultParams() {
        return {
            tx: 0, ty: 0,
            angle: 0,
            px: this.cx, py: this.cy,
            sx: 1, sy: 1,
            reflectX: false,
            reflectY: false,
            reflAngle: 0,
            shx: 0, shy: 0
        };
    }

    /** Deep-clone an array of {x, y} points */
    clonePoints(pts) {
        return pts.map(p => ({ x: p.x, y: p.y }));
    }

    // =============================================================
    //  UNDO / REDO
    // =============================================================

    /** Save current params to the undo history */
    pushHistory() {
        this.history.push(JSON.parse(JSON.stringify(this.params)));
        if (this.history.length > this.maxHistory) this.history.shift();
        this.redoStack = []; // clear redo when new action occurs
    }

    /** Undo: restore previous state */
    undo() {
        if (this.history.length === 0) return false;
        this.redoStack.push(JSON.parse(JSON.stringify(this.params)));
        this.params = this.history.pop();
        this.draw();
        return true;
    }

    /** Redo: re-apply undone state */
    redo() {
        if (this.redoStack.length === 0) return false;
        this.history.push(JSON.parse(JSON.stringify(this.params)));
        this.params = this.redoStack.pop();
        this.draw();
        return true;
    }

    // =============================================================
    //  3×3 MATRIX MATH (Homogeneous Coordinates)
    // =============================================================

    /** Multiply two 3×3 matrices: C = A × B */
    mul(A, B) {
        const C = [[0,0,0],[0,0,0],[0,0,0]];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                for (let k = 0; k < 3; k++)
                    C[i][j] += A[i][k] * B[k][j];
        return C;
    }

    /** 3×3 Identity matrix */
    I3() { return [[1,0,0],[0,1,0],[0,0,1]]; }

    /** Translation matrix */
    matTranslate(tx, ty) {
        return [[1, 0, tx],
                [0, 1, ty],
                [0, 0, 1]];
    }

    /**
     * Rotation matrix about point (cx, cy).
     * Composite: T(cx,cy) · R(θ) · T(-cx,-cy)
     */
    matRotate(deg, cx, cy) {
        const r = deg * Math.PI / 180;
        const c = Math.cos(r), s = Math.sin(r);
        const R = [[c, -s, 0], [s, c, 0], [0, 0, 1]];
        return this.mul(this.mul(this.matTranslate(cx, cy), R),
                        this.matTranslate(-cx, -cy));
    }

    /**
     * Scaling matrix about point (cx, cy).
     * Composite: T(cx,cy) · S · T(-cx,-cy)
     */
    matScale(sx, sy, cx, cy) {
        const S = [[sx, 0, 0], [0, sy, 0], [0, 0, 1]];
        return this.mul(this.mul(this.matTranslate(cx, cy), S),
                        this.matTranslate(-cx, -cy));
    }

    /**
     * Reflection about the X-axis (y = center_y line).
     * Translates center to origin, reflects, translates back.
     */
    matReflectX() {
        const Rf = [[1, 0, 0], [0, -1, 0], [0, 0, 1]];
        return this.mul(this.mul(this.matTranslate(0, this.cy), Rf),
                        this.matTranslate(0, -this.cy));
    }

    /**
     * Reflection about the Y-axis (x = center_x line).
     * Translates center to origin, reflects, translates back.
     */
    matReflectY() {
        const Rf = [[-1, 0, 0], [0, 1, 0], [0, 0, 1]];
        return this.mul(this.mul(this.matTranslate(this.cx, 0), Rf),
                        this.matTranslate(-this.cx, 0));
    }

    /**
     * Reflection about a line through the canvas center at angle θ.
     * Uses: T(cx,cy) · RefLine(θ) · T(-cx,-cy)
     */
    matReflectLine(deg) {
        const r = deg * Math.PI / 180;
        const c2 = Math.cos(2 * r), s2 = Math.sin(2 * r);
        const Rf = [[c2, s2, 0], [s2, -c2, 0], [0, 0, 1]];
        return this.mul(this.mul(this.matTranslate(this.cx, this.cy), Rf),
                        this.matTranslate(-this.cx, -this.cy));
    }

    /** Shear in X-direction */
    matShearX(shx) { return [[1, shx, 0], [0, 1, 0], [0, 0, 1]]; }

    /** Shear in Y-direction */
    matShearY(shy) { return [[1, 0, 0], [shy, 1, 0], [0, 0, 1]]; }

    // =============================================================
    //  COMPOSITE MATRIX
    // =============================================================

    /**
     * Build the composite transformation matrix from all current params.
     * Application order (right to left):
     *   Scale → Shear → Reflect → Rotate → Translate
     */
    getCompositeMatrix() {
        let M = this.I3();
        const p = this.params;
        const centroid = this.getCentroid(this.getActiveShape());

        // 1. Scaling about the shape's centroid
        if (p.sx !== 1 || p.sy !== 1)
            M = this.mul(this.matScale(p.sx, p.sy, centroid.x, centroid.y), M);

        // 2. Shear
        if (p.shx !== 0) M = this.mul(this.matShearX(p.shx), M);
        if (p.shy !== 0) M = this.mul(this.matShearY(p.shy), M);

        // 3. Reflections (centered on canvas)
        if (p.reflectX) M = this.mul(this.matReflectX(), M);
        if (p.reflectY) M = this.mul(this.matReflectY(), M);
        if (p.reflAngle !== 0) M = this.mul(this.matReflectLine(p.reflAngle), M);

        // 4. Rotation about pivot
        if (p.angle !== 0)
            M = this.mul(this.matRotate(p.angle, p.px, p.py), M);

        // 5. Translation
        if (p.tx !== 0 || p.ty !== 0)
            M = this.mul(this.matTranslate(p.tx, p.ty), M);

        return M;
    }

    /** Transform a single point by a 3×3 matrix (homogeneous) */
    transformPoint(pt, M) {
        return {
            x: M[0][0] * pt.x + M[0][1] * pt.y + M[0][2],
            y: M[1][0] * pt.x + M[1][1] * pt.y + M[1][2]
        };
    }

    /** Centroid of a set of points */
    getCentroid(pts) {
        let sx = 0, sy = 0;
        pts.forEach(p => { sx += p.x; sy += p.y; });
        return { x: sx / pts.length, y: sy / pts.length };
    }

    /** Get whatever shape is currently active */
    getActiveShape() {
        return this.customPolygon.length > 0
            ? this.customPolygon
            : this.originalShape;
    }

    /** Get a description of active transformations for display */
    getActiveTransformsList() {
        const p = this.params;
        const tags = [];
        if (p.sx !== 1 || p.sy !== 1) tags.push(`Scale(${p.sx}, ${p.sy})`);
        if (p.shx !== 0) tags.push(`ShearX(${p.shx})`);
        if (p.shy !== 0) tags.push(`ShearY(${p.shy})`);
        if (p.reflectX) tags.push('ReflectX');
        if (p.reflectY) tags.push('ReflectY');
        if (p.reflAngle !== 0) tags.push(`ReflectLine(${p.reflAngle}°)`);
        if (p.angle !== 0) tags.push(`Rotate(${p.angle}°)`);
        if (p.tx !== 0 || p.ty !== 0) tags.push(`Translate(${p.tx}, ${p.ty})`);
        return tags;
    }

    // =============================================================
    //  DRAWING
    // =============================================================

    /** Draw the background grid and axes */
    drawGrid() {
        const ctx = this.ctx;

        // Minor grid lines
        ctx.strokeStyle = 'rgba(48, 54, 61, 0.35)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= this.W; x += 50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.H); ctx.stroke();
        }
        for (let y = 0; y <= this.H; y += 50) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke();
        }

        // Major axes through center
        ctx.strokeStyle = 'rgba(139, 148, 158, 0.25)';
        ctx.lineWidth = 1.5;
        // Vertical axis
        ctx.beginPath(); ctx.moveTo(this.cx, 0); ctx.lineTo(this.cx, this.H); ctx.stroke();
        // Horizontal axis
        ctx.beginPath(); ctx.moveTo(0, this.cy); ctx.lineTo(this.W, this.cy); ctx.stroke();

        // Axis labels
        ctx.fillStyle = 'rgba(139, 148, 158, 0.5)';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText('X', this.W - 15, this.cy - 6);
        ctx.fillText('Y', this.cx + 6, 14);
        ctx.fillText('O', this.cx + 4, this.cy + 14);
    }

    /**
     * Draw a polygon shape with stroke and optional fill.
     * Also draws vertex dots.
     */
    drawShape(pts, strokeColor, fillColor, lineWidth) {
        if (pts.length < 2) return;
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();

        if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Vertex dots
        ctx.fillStyle = strokeColor;
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /** Draw the rotation pivot marker */
    drawPivot(x, y) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#f85149';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Crosshair
        ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
        ctx.setLineDash([]);

        // Center dot
        ctx.fillStyle = '#f85149';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();

        // Label
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Pivot (${Math.round(x)}, ${Math.round(y)})`, x + 8, y - 8);
    }

    /** Draw the reflection line when active */
    drawReflectionLine() {
        const p = this.params;
        if (p.reflAngle === 0 && !p.reflectX && !p.reflectY) return;

        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);

        if (p.reflAngle !== 0) {
            const rad = p.reflAngle * Math.PI / 180;
            const len = 400;
            ctx.beginPath();
            ctx.moveTo(this.cx - len * Math.cos(rad), this.cy - len * Math.sin(rad));
            ctx.lineTo(this.cx + len * Math.cos(rad), this.cy + len * Math.sin(rad));
            ctx.stroke();
        }
        if (p.reflectX) {
            ctx.beginPath(); ctx.moveTo(0, this.cy); ctx.lineTo(this.W, this.cy); ctx.stroke();
        }
        if (p.reflectY) {
            ctx.beginPath(); ctx.moveTo(this.cx, 0); ctx.lineTo(this.cx, this.H); ctx.stroke();
        }
        ctx.setLineDash([]);
    }

    /** Main draw routine — called on every update */
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        // Background
        ctx.fillStyle = '#0a0e14';
        ctx.fillRect(0, 0, this.W, this.H);

        this.drawGrid();

        const shape = this.getActiveShape();
        this.drawReflectionLine();

        // Original shape (ghosted)
        this.drawShape(shape, 'rgba(139,148,158,0.45)', 'rgba(139,148,158,0.06)', 1.5);

        // Composite matrix
        const M = this.getCompositeMatrix();
        const transformed = shape.map(p => this.transformPoint(p, M));

        // Transformed shape (highlighted cyan)
        this.drawShape(transformed, '#06b6d4', 'rgba(6,182,212,0.12)', 2.5);

        // Pivot
        this.drawPivot(this.params.px, this.params.py);

        // Update matrix display
        if (typeof renderMatrix3x3 === 'function')
            renderMatrix3x3('matrix-2d', M);

        // Update active transforms tag display
        this.updateTransformTags();

        return M;
    }

    /** Update the active-transforms element to show which transforms are on */
    updateTransformTags() {
        const el = document.getElementById('active-transforms-2d');
        if (!el) return;
        const tags = this.getActiveTransformsList();
        if (tags.length === 0) {
            el.innerHTML = '<em style="color:var(--text-muted)">No transforms applied (identity)</em>';
        } else {
            el.innerHTML = tags.map(t => `<span class="tf-tag">${t}</span>`).join(' → ');
        }
    }

    // =============================================================
    //  SHAPE MANAGEMENT
    // =============================================================

    setShape(type) {
        this.customPolygon = [];
        this.isDrawingPolygon = false;
        switch (type) {
            case 'triangle':
                this.originalShape = this.clonePoints(this.defaultTriangle);
                break;
            case 'rectangle':
                this.originalShape = this.clonePoints(this.defaultRectangle);
                break;
            case 'polygon':
                this.isDrawingPolygon = true;
                this.originalShape = [];
                break;
        }
        this.draw();
    }

    addPolygonPoint(x, y) {
        if (!this.isDrawingPolygon) return;
        this.customPolygon.push({ x, y });
        this.draw();
    }

    finishPolygon() {
        this.isDrawingPolygon = false;
        if (this.customPolygon.length < 3) this.customPolygon = [];
        this.draw();
    }

    clearPolygon() {
        this.customPolygon = [];
        this.isDrawingPolygon = true;
        this.draw();
    }

    // =============================================================
    //  ANIMATION
    // =============================================================

    toggleAnimation() {
        this.animating ? this.stopAnimation() : this.startAnimation();
    }

    startAnimation() {
        this.animating = true;
        const start = Date.now();
        const tick = () => {
            if (!this.animating) return;
            const t = (Date.now() - start) / 1000;
            this.params.angle = (t * 60) % 360;

            // Sync slider
            const s = document.getElementById('angle');
            const v = document.getElementById('val-angle');
            if (s) s.value = Math.round(this.params.angle);
            if (v) v.textContent = Math.round(this.params.angle);

            this.draw();
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

    // =============================================================
    //  RESET & EXPORT
    // =============================================================

    reset() {
        this.stopAnimation();
        this.params = this.defaultParams();
        this.history = [];
        this.redoStack = [];
        this.draw();
    }

    exportImage() {
        const link = document.createElement('a');
        link.download = '2d-transformation.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}
