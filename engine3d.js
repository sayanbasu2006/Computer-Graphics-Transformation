/**
 * engine3d.js
 * 3D Geometric Transformations Engine using Three.js
 * Implements 3D translation, rotation, scaling with perspective/orthographic projection
 */

class Engine3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Camera (starts as perspective)
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100);
        this.camera.position.set(5, 5, 8);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Axes helper
        this.axesHelper = new THREE.AxesHelper(3);
        this.scene.add(this.axesHelper);
        
        // Axis labels
        this.axisLabels = [];
        this.createAxisLabels();
        
        // Grid
        this.gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        this.scene.add(this.gridHelper);
        
        // Current object
        this.currentObject = null;
        this.objectType = 'cube';
        
        // Transformation parameters
        this.params = {
            tx: 0, ty: 0, tz: 0,
            rx: 0, ry: 0, rz: 0,
            sx: 1, sy: 1, sz: 1
        };
        
        // Animation
        this.animating = false;
        this.animationId = null;
        
        // Projection mode
        this.projectionMode = 'perspective';
        
        // Create initial object
        this.createObject('cube');
        
        // Start render loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    createAxisLabels() {
        const createLabel = (text, position, color) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;
            context.font = 'Bold 40px Arial';
            context.fillStyle = color;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 32, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.copy(position);
            sprite.scale.set(0.5, 0.5, 0.5);
            this.scene.add(sprite);
            this.axisLabels.push(sprite);
        };
        
        createLabel('X', new THREE.Vector3(3.3, 0, 0), '#ff0000');
        createLabel('Y', new THREE.Vector3(0, 3.3, 0), '#00ff00');
        createLabel('Z', new THREE.Vector3(0, 0, 3.3), '#0000ff');
    }
    
    createObject(type) {
        // Remove existing object
        if (this.currentObject) {
            this.scene.remove(this.currentObject);
        }
        
        this.objectType = type;
        
        if (type === 'cube') {
            this.currentObject = this.createWireframeCube();
        } else if (type === 'pyramid') {
            this.currentObject = this.createWireframePyramid();
        }
        
        this.scene.add(this.currentObject);
        this.applyTransforms();
    }
    
    createWireframeCube() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, material);
        
        // Add vertex points
        const vertices = geometry.attributes.position.array;
        const pointsGeometry = new THREE.BufferGeometry();
        const uniqueVertices = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const v = [vertices[i], vertices[i+1], vertices[i+2]];
            const key = v.map(x => Math.round(x * 100)).join(',');
            if (!uniqueVertices.find(uv => uv.key === key)) {
                uniqueVertices.push({ key, pos: v });
            }
        }
        const positions = new Float32Array(uniqueVertices.length * 3);
        uniqueVertices.forEach((uv, i) => {
            positions[i*3] = uv.pos[0];
            positions[i*3+1] = uv.pos[1];
            positions[i*3+2] = uv.pos[2];
        });
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointsMaterial = new THREE.PointsMaterial({ color: 0x00ff88, size: 0.08 });
        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        
        const group = new THREE.Group();
        group.add(wireframe);
        group.add(points);
        
        return group;
    }
    
    createWireframePyramid() {
        const geometry = new THREE.ConeGeometry(1.5, 2.5, 4);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xff6b6b, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, material);
        
        // Add vertex points
        const vertices = geometry.attributes.position.array;
        const pointsGeometry = new THREE.BufferGeometry();
        const uniqueVertices = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const v = [vertices[i], vertices[i+1], vertices[i+2]];
            const key = v.map(x => Math.round(x * 100)).join(',');
            if (!uniqueVertices.find(uv => uv.key === key)) {
                uniqueVertices.push({ key, pos: v });
            }
        }
        const positions = new Float32Array(uniqueVertices.length * 3);
        uniqueVertices.forEach((uv, i) => {
            positions[i*3] = uv.pos[0];
            positions[i*3+1] = uv.pos[1];
            positions[i*3+2] = uv.pos[2];
        });
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointsMaterial = new THREE.PointsMaterial({ color: 0xff6b6b, size: 0.08 });
        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        
        const group = new THREE.Group();
        group.add(wireframe);
        group.add(points);
        
        return group;
    }
    
    // ===== Transformation Matrices =====
    
    translationMatrix3D(tx, ty, tz) {
        return [
            [1, 0, 0, tx],
            [0, 1, 0, ty],
            [0, 0, 1, tz],
            [0, 0, 0, 1]
        ];
    }
    
    rotationMatrixX(angleDeg) {
        const rad = angleDeg * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [
            [1, 0, 0, 0],
            [0, cos, -sin, 0],
            [0, sin, cos, 0],
            [0, 0, 0, 1]
        ];
    }
    
    rotationMatrixY(angleDeg) {
        const rad = angleDeg * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [
            [cos, 0, sin, 0],
            [0, 1, 0, 0],
            [-sin, 0, cos, 0],
            [0, 0, 0, 1]
        ];
    }
    
    rotationMatrixZ(angleDeg) {
        const rad = angleDeg * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [
            [cos, -sin, 0, 0],
            [sin, cos, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }
    
    scalingMatrix3D(sx, sy, sz) {
        return [
            [sx, 0, 0, 0],
            [0, sy, 0, 0],
            [0, 0, sz, 0],
            [0, 0, 0, 1]
        ];
    }
    
    multiplyMatrices4x4(a, b) {
        const result = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }
    
    getCompositeMatrix3D() {
        const p = this.params;
        let M = [
            [1,0,0,0],
            [0,1,0,0],
            [0,0,1,0],
            [0,0,0,1]
        ];
        
        // Order: Scale -> Rotate(Z,Y,X) -> Translate
        M = this.multiplyMatrices4x4(this.translationMatrix3D(p.tx, p.ty, p.tz), M);
        M = this.multiplyMatrices4x4(this.rotationMatrixX(p.rx), M);
        M = this.multiplyMatrices4x4(this.rotationMatrixY(p.ry), M);
        M = this.multiplyMatrices4x4(this.rotationMatrixZ(p.rz), M);
        M = this.multiplyMatrices4x4(this.scalingMatrix3D(p.sx, p.sy, p.sz), M);
        
        return M;
    }
    
    // ===== Apply Transforms =====
    
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
        const matrix = this.getCompositeMatrix3D();
        renderMatrix4x4('matrix-3d', matrix);
    }
    
    // ===== Projection =====
    
    setProjection(mode) {
        this.projectionMode = mode;
        
        const oldPos = this.camera.position.clone();
        const oldLookAt = new THREE.Vector3(0, 0, 0);
        
        this.scene.remove(this.camera);
        
        if (mode === 'perspective') {
            this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100);
        } else {
            const frustumSize = 6;
            const aspect = this.width / this.height;
            this.camera = new THREE.OrthographicCamera(
                frustumSize * aspect / -2,
                frustumSize * aspect / 2,
                frustumSize / 2,
                frustumSize / -2,
                0.1,
                100
            );
        }
        
        this.camera.position.copy(oldPos);
        this.camera.lookAt(oldLookAt);
    }
    
    // ===== Display Options =====
    
    setAxesVisible(visible) {
        this.axesHelper.visible = visible;
        this.axisLabels.forEach(label => label.visible = visible);
    }
    
    setLabelsVisible(visible) {
        this.axisLabels.forEach(label => label.visible = visible);
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
        
        const animate = () => {
            if (!this.animating) return;
            
            this.params.ry = (this.params.ry + 1) % 360;
            this.params.rx = (this.params.rx + 0.5) % 360;
            
            // Update sliders
            const rySlider = document.getElementById('3d-ry');
            const rxSlider = document.getElementById('3d-rx');
            const ryVal = document.getElementById('val-3d-ry');
            const rxVal = document.getElementById('val-3d-rx');
            
            if (rySlider) {
                rySlider.value = this.params.ry > 180 ? this.params.ry - 360 : this.params.ry;
                if (ryVal) ryVal.textContent = Math.round(this.params.ry);
            }
            if (rxSlider) {
                rxSlider.value = this.params.rx > 180 ? this.params.rx - 360 : this.params.rx;
                if (rxVal) rxVal.textContent = Math.round(this.params.rx);
            }
            
            this.applyTransforms();
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
            tx: 0, ty: 0, tz: 0,
            rx: 0, ry: 0, rz: 0,
            sx: 1, sy: 1, sz: 1
        };
        this.applyTransforms();
    }
    
    // ===== Render Loop =====
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        if (this.projectionMode === 'perspective') {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        } else {
            const frustumSize = 6;
            const aspect = this.width / this.height;
            this.camera.left = frustumSize * aspect / -2;
            this.camera.right = frustumSize * aspect / 2;
            this.camera.top = frustumSize / 2;
            this.camera.bottom = frustumSize / -2;
            this.camera.updateProjectionMatrix();
        }
        
        this.renderer.setSize(this.width, this.height);
    }
}

