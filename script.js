let selected = null;
let currentScale = 1;

// خريطة أسماء العناصر بالعربية
const elementNames = {
    'out-id-num': 'رقم الهوية',
    'row-1': 'الاسم',
    'row-2': 'اسم الأب',
    'row-3': 'اسم الجد',
    'row-4': 'اسم العائلة',
    'row-5': 'اسم الأم',
    'row-6': 'مكان الولادة',
    'row-sex': 'الجنس',
    'row-7': 'الديانة',
    'row-iss-p': 'مكان الإصدار',
    'out-dob-display': 'تاريخ الولادة',
    'out-iss-display': 'تاريخ الإصدار',
    'out-id-num-sub': 'رقم الهوية (الملحق)',
    'row-sub-name': 'الاسم الكامل (الملحق)',
    'row-address': 'العنوان',
    'row-town': 'البلدة',
    'row-status': 'الحالة الشخصية',
    'stamp-obj': 'الختم'
};

function updateSelectedElementDisplay() {
    if (selected && selected.id) {
        const name = elementNames[selected.id] || selected.id;
        document.getElementById('selected-element-name').textContent = `تم تحديد: ${name}`;
        document.getElementById('selected-element-label').textContent = name;
    } else {
        document.getElementById('selected-element-name').textContent = 'اختر عنصر للتعديل';
    }
}

function toggleControlPanel() {
    const panel = document.getElementById('control-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if(panel.style.display === 'block') {
        updateSliders();
    }
}

function closeControlPanel() {
    const panel = document.getElementById('control-panel');
    panel.style.display = 'none';
}

function updateSliders() {
    if (!selected) return;
    const style = window.getComputedStyle(selected);
    
    // للعناصر التي تحتوي على نصوص
    if (selected.id !== 'stamp-obj') {
        const fontSize = parseInt(style.fontSize) || 18;
        const fontWeight = parseInt(style.fontWeight) || 700;
        const letterSpacing = parseInt(style.letterSpacing) || 0;
        const lineHeight = parseFloat(style.lineHeight) / parseFloat(style.fontSize) || 1;
        
        document.getElementById('font-size-slider').value = fontSize;
        document.getElementById('font-size-value').textContent = fontSize + 'px';
        
        document.getElementById('font-weight-slider').value = fontWeight;
        document.getElementById('font-weight-value').textContent = fontWeight;
        
        document.getElementById('letter-spacing-slider').value = letterSpacing;
        document.getElementById('letter-spacing-value').textContent = letterSpacing + 'px';
        
        document.getElementById('line-height-slider').value = lineHeight;
        document.getElementById('line-height-value').textContent = Math.round(lineHeight * 100) + '%';
    } else {
        // للـ stamp
        document.getElementById('font-size-slider').value = 18;
        document.getElementById('font-size-value').textContent = '18px';
        document.getElementById('font-weight-slider').value = 400;
        document.getElementById('font-weight-value').textContent = '400';
        document.getElementById('letter-spacing-slider').value = 0;
        document.getElementById('letter-spacing-value').textContent = '0px';
        document.getElementById('line-height-slider').value = 1;
        document.getElementById('line-height-value').textContent = '100%';
    }
    
    const opacity = parseFloat(style.opacity) || 1;
    document.getElementById('opacity-slider').value = opacity;
    document.getElementById('opacity-value').textContent = Math.round(opacity * 100) + '%';
    
    document.getElementById('scale-slider').value = 1;
    document.getElementById('scale-value').textContent = '100%';
    
    // Reset other sliders
    document.getElementById('blur-slider').value = 0;
    document.getElementById('blur-value').textContent = '0';
    
    document.getElementById('brightness-slider').value = 1;
    document.getElementById('brightness-value').textContent = '100%';
    
    document.getElementById('contrast-slider').value = 1;
    document.getElementById('contrast-value').textContent = '100%';
    
    document.getElementById('rotate-slider').value = 0;
    document.getElementById('rotate-value').textContent = '0°';
    
    document.getElementById('skew-slider').value = 0;
    document.getElementById('skew-value').textContent = '0°';
}

function applyFontSize(value) {
    if (!selected) return;
    selected.style.fontSize = value + 'px';
    document.getElementById('font-size-value').textContent = value + 'px';
}

function applyFontWeight(value) {
    if (!selected) return;
    selected.style.fontWeight = value;
    document.getElementById('font-weight-value').textContent = value;
}

function applyBlur(value) {
    if (!selected) return;
    updateFilter(selected, 'blur', value + 'px');
    document.getElementById('blur-value').textContent = value;
}

function applyBrightness(value) {
    if (!selected) return;
    updateFilter(selected, 'brightness', value);
    document.getElementById('brightness-value').textContent = Math.round(value * 100) + '%';
}

function applyContrast(value) {
    if (!selected) return;
    updateFilter(selected, 'contrast', value);
    document.getElementById('contrast-value').textContent = Math.round(value * 100) + '%';
}

function applyOpacity(value) {
    if (!selected) return;
    selected.style.opacity = value;
    document.getElementById('opacity-value').textContent = Math.round(value * 100) + '%';
}

function applyRotate(value) {
    if (!selected) return;
    const skewVal = getSkewValue();
    const scaleVal = document.getElementById('scale-slider').value || 1;
    
    if (selected.id === 'stamp-obj') {
        selected.style.transform = `translate(-50%, -50%) scale(${scaleVal}) rotate(${value}deg) skewX(${skewVal}deg)`;
    } else {
        selected.style.transform = `rotate(${value}deg) skewX(${skewVal}deg) scale(${scaleVal})`;
    }
    document.getElementById('rotate-value').textContent = value + '°';
}

function applySkew(value) {
    if (!selected) return;
    const rotateVal = document.getElementById('rotate-slider').value || 0;
    const scaleVal = document.getElementById('scale-slider').value || 1;
    
    if (selected.id === 'stamp-obj') {
        selected.style.transform = `translate(-50%, -50%) scale(${scaleVal}) rotate(${rotateVal}deg) skewX(${value}deg)`;
    } else {
        selected.style.transform = `rotate(${rotateVal}deg) skewX(${value}deg) scale(${scaleVal})`;
    }
    document.getElementById('skew-value').textContent = value + '°';
}

function applyTextColor(color) {
    if (!selected) return;
    selected.style.color = color;
}

function applyScale(value) {
    if (!selected) return;
    
    // للعنصر stamp الذي يستخدم translate
    if (selected.id === 'stamp-obj') {
        selected.style.transform = `translate(-50%, -50%) scale(${value})`;
    } else {
        selected.style.transform = `scale(${value})`;
    }
    document.getElementById('scale-value').textContent = Math.round(value * 100) + '%';
}

function applyLetterSpacing(value) {
    if (!selected) return;
    selected.style.letterSpacing = value + 'px';
    document.getElementById('letter-spacing-value').textContent = value + 'px';
}

function applyLineHeight(value) {
    if (!selected) return;
    selected.style.lineHeight = value;
    document.getElementById('line-height-value').textContent = Math.round(value * 100) + '%';
}

function resetElement() {
    if (!selected) return;
    selected.style.cssText = '';
    selected.classList.remove('selected');
    selected.classList.add('selected');
    updateSliders();
}

function updateFilter(element, filterType, value) {
    let currentFilter = element.style.filter || '';
    const filterRegex = new RegExp(filterType + '\\([^)]+\\)', 'g');
    
    if (filterRegex.test(currentFilter)) {
        currentFilter = currentFilter.replace(filterRegex, `${filterType}(${value})`);
    } else {
        currentFilter += ` ${filterType}(${value})`;
    }
    element.style.filter = currentFilter.trim();
}

function getSkewValue() {
    return document.getElementById('skew-slider').value || 0;
}

function processAndShow() {
    saveState();
    
    // ربط الحقول 
    const map = [
        {ar:'in-name-ar', he:'in-name-he', out:'row-1'},
        {ar:'in-father-ar', he:'in-father-he', out:'row-2'},
        {ar:'in-grand-ar', he:'in-grand-he', out:'row-3'},
        {ar:'in-family-ar', he:'in-family-he', out:'row-4'},
        {ar:'in-mother-ar', he:'in-mother-he', out:'row-5'},
        {ar:'in-pob-ar', he:'in-pob-he', out:'row-6'},
        {ar:'in-sex-ar', he:'in-sex-he', out:'row-sex'},
        {ar:'in-rel-ar', he:'in-rel-he', out:'row-7'},
        {ar:'in-iss-ar', he:'in-iss-he', out:'row-iss-p'},
    ];
    
    map.forEach(f => {
        const elem = document.getElementById(f.out);
        if(elem) {
            let arSpan = elem.querySelector('.ar');
            let heSpan = elem.querySelector('.he');
            if(arSpan) arSpan.innerText = document.getElementById(f.ar).value;
            if(heSpan) heSpan.innerText = document.getElementById(f.he).value;
        }
    });

    document.getElementById('out-id-num').innerText = document.getElementById('in-id-num').value;
    document.getElementById('out-id-num-sub').innerText = document.getElementById('in-id-num').value;
    document.getElementById('out-dob-display').innerText = document.getElementById('in-dob').value;
    document.getElementById('out-iss-display').innerText = document.getElementById('in-iss-date').value;
    
    const subNameRow = document.getElementById('row-sub-name');
    const arName = subNameRow.querySelector('.ar');
    const heName = subNameRow.querySelector('.he');
    if(arName) arName.innerText = document.getElementById('in-family-ar').value + " " + document.getElementById('in-name-ar').value;
    if(heName) heName.innerText = document.getElementById('in-family-he').value + " " + document.getElementById('in-name-he').value;

    // إضافة الخاتم/الختم إذا كان موجوداً
    const stampImg = document.getElementById('stamp-obj');
    if (stampImg) {
        stampImg.src = '/mnt/user-data/uploads/stamp.png';
    }

    document.getElementById('screen-input').classList.remove('active');
    document.getElementById('screen-preview').classList.add('active');
    
    fitCardToScreen();
}

// دالة لتصغير البطاقة برمجياً لتناسب أي شاشة
function fitCardToScreen() {
    const canvas = document.getElementById('id-card-canvas');
    if (!canvas) return;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 150; // ترك مساحة للـ header والـ toolbar
    
    // حساب المقياس بناءً على عرض الشاشة مع ترك مساحة للحواف
    let scaleW = (screenWidth - 30) / 750;
    let scaleH = screenHeight / 1060;
    
    currentScale = Math.min(scaleW, scaleH); // نأخذ الأصغر لضمان ظهور البطاقة كاملة
    
    canvas.style.transform = `scale(${currentScale})`;
}

// التحديث عند تغيير حجم النافذة
window.addEventListener('resize', () => {
    if(document.getElementById('screen-preview').classList.contains('active')) {
        fitCardToScreen();
    }
});

// أدوات التحرير
function toggleDpad() {
    const dpad = document.getElementById('dpad');
    dpad.style.display = dpad.style.display === 'flex' ? 'none' : 'flex';
}

function move(dir) {
    if (!selected) return alert('الرجاء تحديد النص المراد تحريكه أولاً بالضغط عليه.');
    let t = parseInt(window.getComputedStyle(selected).top) || 0;
    let l = parseInt(window.getComputedStyle(selected).left) || 0;
    
    if (dir === 'up') selected.style.top = (t - 1) + "px";
    if (dir === 'down') selected.style.top = (t + 1) + "px";
    if (dir === 'left') selected.style.left = (l - 1) + "px";
    if (dir === 'right') selected.style.left = (l + 1) + "px";
}

function applyNoise() {
    const nl = document.getElementById('noise-layer');
    nl.style.display = (nl.style.display === 'block') ? 'none' : 'block';
}

// التخزين المحلي
function saveState() {
    const data = { inputs: {} };
    document.querySelectorAll('.save-me').forEach(el => data.inputs[el.id] = el.value);
    localStorage.setItem('id_pro_glass', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('id_pro_glass');
    if (saved) {
        const data = JSON.parse(saved);
        for (const id in data.inputs) if (document.getElementById(id)) document.getElementById(id).value = data.inputs[id];
    }
}

function goBackToInput() { 
    if (selected) selected.classList.remove('selected');
    document.getElementById('screen-preview').classList.remove('active'); 
    document.getElementById('screen-input').classList.add('active'); 
}

function downloadCard() {
    if (selected) selected.classList.remove('selected');
    
    const canvas = document.getElementById('id-card-canvas');
    const originalTransform = canvas.style.transform;
    
    // إزالة التصغير للحصول على الدقة الأصلية
    canvas.style.transform = 'scale(1)';
    
    // ننتظر قليلاً ليتم تحديث واجهة المستخدم
    setTimeout(async () => {
        try {
            await html2canvas(canvas, { 
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true
            }).then(canvasEl => {
                const link = document.createElement('a');
                link.download = `ID_Card_${new Date().getTime()}.png`;
                link.href = canvasEl.toDataURL('image/png');
                link.click();
                
                // إرجاع التصغير
                canvas.style.transform = originalTransform;
            }).catch(err => {
                console.error('خطأ في تحميل البطاقة:', err);
                alert('حدث خطأ أثناء تحميل البطاقة. يرجى المحاولة مرة أخرى.');
                canvas.style.transform = originalTransform;
            });
        } catch (error) {
            console.error('خطأ:', error);
            canvas.style.transform = originalTransform;
        }
    }, 100);
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    // تحديد العناصر والـ interactions
    document.querySelectorAll('.selectable').forEach(el => {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        el.onclick = (e) => { 
            e.stopPropagation(); 
            
            if (selected) selected.classList.remove('selected'); 
            selected = el; 
            selected.classList.add('selected');
            
            // تحديث عرض اسم العنصر المحدد
            updateSelectedElementDisplay();
            
            // تحديث الـ sliders تلقائياً وفتح لوحة التحكم
            document.getElementById('control-panel').style.display = 'block';
            updateSliders();
        };
        
        // Drag for stamp only
        if (el.id === 'stamp-obj') {
            el.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(el.style.left) || 0;
                startTop = parseInt(el.style.top) || 0;
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging && el.id === 'stamp-obj') {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    el.style.position = 'absolute';
                    el.style.left = (startLeft + deltaX) + 'px';
                    el.style.top = (startTop + deltaY) + 'px';
                    el.style.transform = 'scale(' + (document.getElementById('scale-slider').value || 1) + ')';
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
    });

    // رفع الصورة الشخصية
    const photoInput = document.getElementById('in-photo');
    if (photoInput) {
        photoInput.onchange = (e) => {
            const r = new FileReader(); 
            r.onload = (ev) => {
                const previewEl = document.getElementById('preview-upload-photo');
                if (previewEl) previewEl.src = ev.target.result;
            };
            if(e.target.files[0]) r.readAsDataURL(e.target.files[0]);
        };
    }

    // رفع صورة البطاقة الفارغة (البنية)
    const bgCardInput = document.getElementById('in-bg-card');
    if (bgCardInput) {
        bgCardInput.onchange = (e) => {
            const r = new FileReader(); 
            r.onload = (ev) => {
                const bgEl = document.getElementById('bg-card');
                if (bgEl) {
                    bgEl.src = ev.target.result;
                    bgEl.style.display = 'block';
                }
            };
            if(e.target.files[0]) r.readAsDataURL(e.target.files[0]);
        };
    }
});
