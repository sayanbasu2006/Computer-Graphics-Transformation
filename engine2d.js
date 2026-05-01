/**
 * engine2d.js
 * 2D Geometric Transformations Engine
 * Implements translation, rotation, scaling, reflection, shear using matrix math
 */

class Engine2D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Default shape: triangle centered on canvas
        this.originalShape = [
            {x: 350, y: 180},
            {x: 250, y: 380},
            {x: 450, y: 380}
        ];
        
        this.customPolygon = [];
        this.isDrawingPolygon = false;
        
        // Transformation parameters
        this.params = {
            tx: 0, ty: 0,
            angle: 0,
            px: 350, py: 250,
            sx: 1, sy: 1,
            reflectX: false,
            reflectY: false,
            reflAngle: 0,
            shx: 0, shy: 0
        };
        
        this.animating = false;
        this.animationId = null;
        
        this.drawGrid();
        this.draw();
    }
    
    // ===== Matrix Operations =====
    
    multiplyMatrices(a, b) {
        const result = [[0,0,0],[0,0,0],[0,0,0]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }
    
    identityMatrix() {
        return [[1,0,0],[0,1,0],[0,0,1]];
    }
    
    translationMatrix(tx, ty) {
        return [[1,0,tx],[0,1,ty],[0,0,1]];
    }
    
    rotationMatrix(angleDeg, cx, cy) {
        const rad = angleDeg * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        // T(cx,cy) * R * T(-cx,-cy)
        const t1 = this.translationMatrix(cx, cy);
        const r = [[cos, -sin, 0], [sin, cos, 0], [0, 0, 1]];
        const t2 = this.translationMatrix(-cx, -cy);
        
        return this.multiplyMatrices(this.multiplyMatrices(t1, r), t2);
    }
    
    scalingMatrix(sx, sy, cx, cy) {
        // T(cx,cy) * S * T(-cx,-cy)
        const t1 = this.translationMatrix(cx, cy);
        const s = [[sx, 0, 0], [0, sy, 0], [0, 0, 1]];
        const t2 = this.translationMatrix(-cx, -cy);
        
        return this.multiplyMatrices(this.multiplyMatrices(t1, s), t2);
    }
    
    reflectionMatrixX() {
        return [[1,0,0],[0,-1,0],[0,0,1]];
    }
    
    reflectionMatrixY() {
        return [[-1,0,0],[0,1,0],[0,0,1]];
    }
    
    reflectionMatrixLine(angleDeg) {
        const rad = angleDeg * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const cos2 = Math.cos(2 * rad);
        const sin2 = Math.sin(2 * rad);
        
        return [[cos2, sin2, 0], [sin2, -cos2, 0], [0, 0, 1]];
    }
    
    shearMatrixX(shx) {
        return [[1, shx, 0], [0, 1, 0], [0, 0, 1]];
    }
    
    shearMatrixY(shy) {
        return [[1, 0, 0], [shy, 1, 0], [0, 0, 1]];
    }
    
    // ===== Apply Transformation =====
    
    applyTransform(point, matrix) {
        const x = point.x;
        const y = point.y;
        const newX = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2];
        const newY = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2];
        return {x: newX, y: newY};
    }
    
    getCompositeMatrix() {
        let M = this.identityMatrix();
        const p = this.params;
        
        // Order: Scale -> Shear -> Reflect -> Rotate -> Translate
        // (applied right to left in matrix multiplication)
        
        // Translation
        if (p.tx !== 0 || p.ty !== 0) {
            M = this.multiplyMatrices(this.translationMatrix(p.tx, p.ty), M);
        }
        
        // Rotation about pivot
        if (p.angle !== 0) {
            M = this.multiplyMatrices(this.rotationMatrix(p.angle, p.px, p.py), M);
        }
        
        // Reflection
        if (p.reflectX) {
            M = this.multiplyMatrices(this.reflectionMatrixX(), M);
        }
        if (p.reflectY) {
            M = this.multiplyMatrices(this.reflectionMatrixY(), M);
        }
        if (p.reflAngle !== 0) {
            M = this.multiplyMatrices(this.reflectionMatrixLine(p.reflAngle), M);
        }
        
        // Shear
        if (p.shx !== 0) {
            M = this.multiplyMatrices(this.shearMatrixX(p.shx), M);
        }
        if (p.shy !== 0) {
            M = this.multiplyMatrices(this.shearMatrixY(p.shy), M);
        }
        
        // Scaling about center of shape
        const center = this.getCentroid(this.originalShape);
        if (p.sx !== 1 || p.sy !== 1) {
            M = this.multiplyMatrices(this.scalingMatrix(p.sx, p.sy, center.x, center.y), M);
        }
        
        return M;
    }
    
    getCentroid(points) {
        let cx = 0, cy = 0;
        points.forEach(p => { cx += p.x; cy += p.y; });
        return {x: cx / points.length, y: cy / points.length};
    }
    
    // ===== Drawing =====
    
    drawGrid() {
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        // Axes
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.width/2, 0);
        this.ctx.lineTo(this.width/2, this.height);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height/2);
        this.ctx.lineTo(this.width, this.height/2);
        this.ctx.stroke();
    }
    
    drawShape(points, color, fillColor, lineWidth = 2) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        
        // Draw vertices
        this.ctx.fillStyle = color;
        points.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawPivot(x, y) {
        this.ctx.strokeStyle = '#e53e3e';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y);
        this.ctx.lineTo(x + 10, y);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 10);
        this.ctx.lineTo(x, y + 10);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText(`Pivot (${Math.round(x)}, ${Math.round(y)})`, x + 10, y - 10);
    }
    
    drawReflectionLine() {
        const p = this.params;
        if (p.reflAngle === 0 && !p.reflectX && !p.reflectY) return;
        
        this.ctx.strokeStyle = '#9f7aea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 4]);
        
        const cx = this.width / 2;
        const cy = this.height / 2;
        const rad = p.reflAngle * Math.PI / 180;
        const len = 400;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx - len * Math.cos(rad), cy - len * Math.sin(rad));
        this.ctx.lineTo(cx + len * Math.cos(rad), cy + len * Math.sin(rad));
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Get current shape points
        const shape = this.customPolygon.length > 0 ? this.customPolygon : this.originalShape;
        
        // Draw reflection line if applicable
        this.drawReflectionLine();
        
        // Draw original shape (faded)
        this.drawShape(shape, '#a0aec0', 'rgba(160, 174, 192, 0.15)', 2);
        
        // Calculate transformed shape
        const matrix = this.getCompositeMatrix();
        const transformed = shape.map(p => this.applyTransform(p, matrix));
        
        // Draw transformed shape
        this.drawShape(transformed, '#667eea', 'rgba(102, 126, 234, 0.25)', 3);
        
        // Draw pivot point
        this.drawPivot(this.params.px, this.params.py);
        
        // Update matrix display
        renderMatrix3x3('matrix-2d', matrix);
        
        return matrix;
    }
    
    // ===== Shape Management =====
    
    setShape(type) {
        this.customPolygon = [];
        this.isDrawingPolygon = false;
        
        switch(type) {
            case 'triangle':
                this.originalShape = [
                    {x: 350, y: 180},
                    {x: 250, y: 380},
                    {x: 450, y: 380}
                ];
                break;
            case 'rectangle':
                this.originalShape = [
                    {x: 250, y: 150},
                    {x: 450, y: 150},
                    {x: 450, y: 350},
                    {x: 250, y: 350}
                ];
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
        this.customPolygon.push({x, y});
        this.draw();
    }
    
    finishPolygon() {
        this.isDrawingPolygon = false;
        if (this.customPolygon.length < 3) {
            this.customPolygon = [];
        }
        this.draw();
    }
    
    clearPolygon() {
        this.customPolygon = [];
        this.isDrawingPolygon = true;
        this.draw();
    }
    
    // ===== Animation =====
    
    toggleAnimation() {
        if (this.animating) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }
    
    startAnimation() {
        this.animating = true;
        let startTime = Date.now();
        
        const animate = () => {
            if (!this.animating) return;
            
            const elapsed = (Date.now() - startTime) / 1000;
            this.params.angle = (elapsed * 60) % 360;
            
            // Update slider
            const angleSlider = document.getElementById('angle');
            const angleVal = document.getElementById('val-angle');
            if (angleSlider) angleSlider.value = this.params.angle;
            if (angleVal) angleVal.textContent = Math.round(this.params.angle);
            
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    stopAnimation() {
        this.animating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // ===== Reset =====
    
    reset() {
        this.stopAnimation();
        this.params = {
            tx: 0, ty: 0,
            angle: 0,
            px: 350, py: 250,
            sx: 1, sy: 1,
            reflectX: false,
            reflectY: false,
            reflAngle: 0,
            shx: 0, shy: 0
        };
        this.draw();
    }
    
    // ===== Export =====
    
    exportImage() {
        const link = document.createElement('a');
        link.download = '2d-transformation.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

