/**
 * capture-screenshots.js
 * Automated screenshot capture of each transformation state.
 * Run: node capture-screenshots.js
 */
const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const PAGE_URL = 'file://' + path.join(__dirname, 'index.html');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setSlider(page, id, value) {
    await page.evaluate(({id, value}) => {
        const slider = document.getElementById(id);
        if (!slider) return;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(slider, value);
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
    }, {id, value});
    await sleep(300);
}

async function clickButton(page, id) {
    await page.evaluate((id) => {
        const btn = document.getElementById(id);
        if (btn) btn.click();
    }, id);
    await sleep(300);
}

async function resetAll(page) {
    await clickButton(page, 'btn-reset-2d');
    await sleep(200);
}

async function screenshot(page, name, label) {
    // Add a label overlay to the screenshot
    await page.evaluate((label) => {
        let overlay = document.getElementById('screenshot-label');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'screenshot-label';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0;
                background: linear-gradient(135deg, #7c3aed, #06b6d4);
                color: white; font-family: Inter, sans-serif;
                font-size: 18px; font-weight: 700; text-align: center;
                padding: 10px 20px; z-index: 9999;
                letter-spacing: 1px;
            `;
            document.body.prepend(overlay);
        }
        overlay.textContent = label;
    }, label);
    await sleep(200);

    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  ✓ Saved: ${name}.png — "${label}"`);
}

async function removeLabel(page) {
    await page.evaluate(() => {
        const el = document.getElementById('screenshot-label');
        if (el) el.remove();
    });
}

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);

    console.log('Loading application...');
    await page.goto(PAGE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2000);
    console.log('Application loaded.\n');

    // Scroll left panel to show canvas properly
    await page.evaluate(() => {
        document.getElementById('panel-2d').scrollTop = 0;
    });

    // ─── 1. DEFAULT STATE ───
    console.log('Capturing 2D transformation screenshots:');
    await screenshot(page, '01_default_state',
        '📐 Default State — Original Triangle (No Transformation Applied)');
    await removeLabel(page);

    // ─── 2. TRANSLATION ───
    await setSlider(page, 'tx', 120);
    await setSlider(page, 'ty', -80);
    await screenshot(page, '02_translation',
        '➡️ Translation — Tx=120, Ty=-80');
    await removeLabel(page);
    await resetAll(page);

    // ─── 3. ROTATION ───
    await setSlider(page, 'angle', 45);
    await screenshot(page, '03_rotation',
        '🔄 Rotation — θ=45° about Pivot (300, 220)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 4. ROTATION WITH CUSTOM PIVOT ───
    await setSlider(page, 'angle', 60);
    await setSlider(page, 'px', 200);
    await setSlider(page, 'py', 320);
    await screenshot(page, '04_rotation_pivot',
        '🔄 Rotation — θ=60° about Custom Pivot (200, 320)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 5. UNIFORM SCALING ───
    await setSlider(page, 'sx', 1.8);
    await setSlider(page, 'sy', 1.8);
    await screenshot(page, '05_uniform_scaling',
        '🔍 Uniform Scaling — Sx=1.8, Sy=1.8');
    await removeLabel(page);
    await resetAll(page);

    // ─── 6. NON-UNIFORM SCALING ───
    await setSlider(page, 'sx', 2.0);
    await setSlider(page, 'sy', 0.5);
    await screenshot(page, '06_nonuniform_scaling',
        '🔍 Non-Uniform Scaling — Sx=2.0, Sy=0.5');
    await removeLabel(page);
    await resetAll(page);

    // ─── 7. REFLECTION X-AXIS ───
    await clickButton(page, 'reflect-x');
    await screenshot(page, '07_reflection_x',
        '🪞 Reflection — About X-Axis (Horizontal Mirror)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 8. REFLECTION Y-AXIS ───
    await clickButton(page, 'reflect-y');
    await screenshot(page, '08_reflection_y',
        '🪞 Reflection — About Y-Axis (Vertical Mirror)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 9. REFLECTION CUSTOM LINE ───
    await setSlider(page, 'refl-angle', 45);
    await screenshot(page, '09_reflection_custom_line',
        '🪞 Reflection — About Custom Line at 45°');
    await removeLabel(page);
    await resetAll(page);

    // ─── 10. SHEAR X ───
    await setSlider(page, 'shx', 1.0);
    await screenshot(page, '10_shear_x',
        '📐 Shear X — Shx=1.0 (Horizontal Shearing)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 11. SHEAR Y ───
    await setSlider(page, 'shy', 0.8);
    await screenshot(page, '11_shear_y',
        '📐 Shear Y — Shy=0.8 (Vertical Shearing)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 12. COMPOSITE TRANSFORMATION ───
    await setSlider(page, 'tx', 80);
    await setSlider(page, 'ty', -40);
    await setSlider(page, 'angle', 30);
    await setSlider(page, 'sx', 1.4);
    await setSlider(page, 'sy', 1.4);
    await screenshot(page, '12_composite',
        '⚡ Composite — Translate(80,-40) + Rotate(30°) + Scale(1.4)');
    await removeLabel(page);
    await resetAll(page);

    // ─── 13. RECTANGLE SHAPE ───
    await page.evaluate(() => {
        const sel = document.getElementById('shape-select');
        sel.value = 'rectangle';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await sleep(400);
    await setSlider(page, 'angle', 25);
    await setSlider(page, 'sx', 1.3);
    await screenshot(page, '13_rectangle_transform',
        '▬ Rectangle — Rotation(25°) + Scale(1.3)');
    await removeLabel(page);

    // Reset to triangle
    await page.evaluate(() => {
        const sel = document.getElementById('shape-select');
        sel.value = 'triangle';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await resetAll(page);

    // ─── 14. SCROLL TO SHOW MATRIX ───
    await setSlider(page, 'tx', 100);
    await setSlider(page, 'angle', 45);
    await page.evaluate(() => {
        const panel = document.getElementById('panel-2d');
        panel.scrollTop = panel.scrollHeight;
    });
    await sleep(300);
    await screenshot(page, '14_matrix_display',
        '🧮 Live Matrix Display — Composite 3×3 Homogeneous Matrix');
    await removeLabel(page);
    await page.evaluate(() => {
        document.getElementById('panel-2d').scrollTop = 0;
    });
    await resetAll(page);

    // ─── 3D SCREENSHOTS ───
    console.log('\nCapturing 3D transformation screenshots:');

    // Scroll right panel into view
    await page.evaluate(() => {
        document.getElementById('panel-3d').scrollTop = 0;
    });

    // ─── 15. 3D DEFAULT ───
    await screenshot(page, '15_3d_default',
        '🧊 3D Default — Wireframe Cube with XYZ Axes');
    await removeLabel(page);

    // ─── 16. 3D TRANSLATION ───
    await setSlider(page, 'slider-3d-tx', 2.0);
    await setSlider(page, 'slider-3d-ty', 1.5);
    await screenshot(page, '16_3d_translation',
        '➡️ 3D Translation — Tx=2.0, Ty=1.5 (Ghost shows original)');
    await removeLabel(page);
    await clickButton(page, 'btn-reset-3d');
    await sleep(200);

    // ─── 17. 3D ROTATION ───
    await setSlider(page, 'slider-3d-rx', 30);
    await setSlider(page, 'slider-3d-ry', 45);
    await screenshot(page, '17_3d_rotation',
        '🔄 3D Rotation — Rx=30°, Ry=45°');
    await removeLabel(page);
    await clickButton(page, 'btn-reset-3d');
    await sleep(200);

    // ─── 18. 3D SCALING ───
    await setSlider(page, 'slider-3d-sx', 2.0);
    await setSlider(page, 'slider-3d-sy', 0.5);
    await setSlider(page, 'slider-3d-sz', 1.5);
    await screenshot(page, '18_3d_scaling',
        '🔍 3D Non-Uniform Scaling — Sx=2.0, Sy=0.5, Sz=1.5');
    await removeLabel(page);
    await clickButton(page, 'btn-reset-3d');
    await sleep(200);

    // ─── 19. 3D PYRAMID ───
    await page.evaluate(() => {
        const sel = document.getElementById('object3d-select');
        sel.value = 'pyramid';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await sleep(500);
    await setSlider(page, 'slider-3d-ry', 35);
    await screenshot(page, '19_3d_pyramid',
        '🔺 3D Pyramid — Wireframe Pyramid with Ry=35° Rotation');
    await removeLabel(page);

    // ─── 20. 3D MATRIX ───
    await page.evaluate(() => {
        const panel = document.getElementById('panel-3d');
        panel.scrollTop = panel.scrollHeight;
    });
    await sleep(300);
    await screenshot(page, '20_3d_matrix',
        '🧮 3D Matrix Display — 4×4 Homogeneous Transformation Matrix');
    await removeLabel(page);

    console.log(`\n✅ All 20 screenshots saved to: ${SCREENSHOTS_DIR}/`);
    await browser.close();
})();
