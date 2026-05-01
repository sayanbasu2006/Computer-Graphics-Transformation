/**
 * matrix-display.js
 * Renders transformation matrices as styled HTML tables
 */

function renderMatrix3x3(containerId, matrix, labels = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            let val = matrix[i][j];
            cell.textContent = Number.isInteger(val) ? val : val.toFixed(2);
            row.appendChild(cell);
        }
        
        container.appendChild(row);
    }
}

function renderMatrix4x4(containerId, matrix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        const row = document.createElement('div');
        row.className = 'matrix-row';
        
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            let val = matrix[i][j];
            cell.textContent = Number.isInteger(val) ? val : val.toFixed(2);
            row.appendChild(cell);
        }
        
        container.appendChild(row);
    }
}

function renderCompositeMatrix(containerId, matrices, names) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '1rem';
    
    matrices.forEach((mat, idx) => {
        const matWrapper = document.createElement('div');
        matWrapper.style.marginBottom = '0.5rem';
        
        if (names && names[idx]) {
            const label = document.createElement('div');
            label.textContent = names[idx];
            label.style.fontSize = '0.8rem';
            label.style.color = '#667eea';
            label.style.marginBottom = '0.3rem';
            matWrapper.appendChild(label);
        }
        
        const matDiv = document.createElement('div');
        matDiv.className = 'matrix-display';
        matDiv.style.display = 'inline-flex';
        
        for (let i = 0; i < 3; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                let val = mat[i][j];
                cell.textContent = Number.isInteger(val) ? val : val.toFixed(2);
                row.appendChild(cell);
            }
            
            matDiv.appendChild(row);
        }
        
        matWrapper.appendChild(matDiv);
        wrapper.appendChild(matWrapper);
    });
    
    container.appendChild(wrapper);
}

