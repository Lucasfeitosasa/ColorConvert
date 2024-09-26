const slider = document.getElementById('hue-slider');
const canvas = document.getElementById('color-canvas');
const ctx = canvas.getContext('2d');
let hue = 0;


const thumb = document.createElement('div');
thumb.className = 'thumb';
document.body.appendChild(thumb);


function drawColorPicker(hue) {
    const width = canvas.width;
    const height = canvas.height;

    const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, 'white');
    whiteGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);

    const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, 'transparent');
    blackGradient.addColorStop(1, 'black');

    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, width, height);
}


function getColorFromCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pixel = ctx.getImageData(x, y, 1, 1).data;

    document.body.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    document.getElementById('red').value = pixel[0];
    document.getElementById('green').value = pixel[1];
    document.getElementById('blue').value = pixel[2];

    colors();
    
    thumb.style.left = `${event.clientX}px`;
    thumb.style.top = `${event.clientY}px`;
}

slider.addEventListener('input', function() {
    const value = (this.value - this.min) / (this.max - this.min); 
    hue = value * 360; 
    this.style.setProperty('--thumb-color', `hsl(${hue}, 100%, 50%)`);
});


document.getElementById('hue-slider').addEventListener('input', function() {
    hue = this.value;
    drawColorPicker(hue);
});


function colors() {
    const red = document.getElementById("red").value;
    const green = document.getElementById("green").value;
    const blue = document.getElementById("blue").value; 

    document.body.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
    document.getElementById("outputred").innerHTML = red;
    document.getElementById("outputgreen").innerHTML = green;
    document.getElementById("outputblue").innerHTML = blue;

    const [c, m, y, k] = rgbToCmyk(red, green, blue);
    document.getElementById('cmyk').value = `${(c * 100).toFixed(0)}, ${(m * 100).toFixed(0)}, ${(y * 100).toFixed(0)}, ${(k * 100).toFixed(0)}`;

    const [h, s, l] = rgbToHsl(red, green, blue);
    document.getElementById('hsl').value = `${h}, ${s}%, ${l}%`;
}


function rgbToCmyk(r, g, b) {
    const k = Math.min(1 - r / 255, 1 - g / 255, 1 - b / 255);
    const c = (1 - r / 255 - k) / (1 - k) || 0;
    const m = (1 - g / 255 - k) / (1 - k) || 0;
    const y = (1 - b / 255 - k) / (1 - k) || 0;
    return [c, m, y, k];
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; 
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}


function updateFromCMYK() {
    const cmykInput = document.getElementById('cmyk').value.split(',').map(val => parseFloat(val.trim()));
    

    if (cmykInput.length === 4) {
        const validValues = cmykInput.every(val => !isNaN(val) && val >= 0 && val <= 100);
        if (validValues) {
            const [c, m, y, k] = cmykInput.map(val => val / 100);
            const r = 255 * (1 - c) * (1 - k);
            const g = 255 * (1 - m) * (1 - k);
            const b = 255 * (1 - y) * (1 - k);
            
            document.getElementById('red').value = r.toFixed(0);
            document.getElementById('green').value = g.toFixed(0);
            document.getElementById('blue').value = b.toFixed(0);
            
            colors();
        }
    }
}


function updateFromHSL() {
    const hslInput = document.getElementById('hsl').value.split(',').map(val => parseFloat(val.trim()));


    if (hslInput.length === 3 && hslInput.every(val => !isNaN(val))) {
        const [h, s, l] = hslInput;
        const r = hslToRgb(h, s / 100, l / 100);
        
        document.getElementById('red').value = r[0];
        document.getElementById('green').value = r[1];
        document.getElementById('blue').value = r[2];
        
        colors();
    }
}


function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; 
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h / 360 + 1 / 3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, h / 360 - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


document.getElementById('cmyk').addEventListener('input', updateFromCMYK);
document.getElementById('hsl').addEventListener('input', updateFromHSL);


canvas.addEventListener('click', getColorFromCanvas);
canvas.addEventListener('mousemove', function(event) {
    if (event.buttons === 1) {
        getColorFromCanvas(event);
    }
});

window.onload = function() {
    drawColorPicker(hue);
};
