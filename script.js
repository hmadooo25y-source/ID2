let selected = null;
let currentScale = 1;

function toggleControlPanel() {
    const panel = document.getElementById('control-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if(panel.style.display === 'block') {
        updateSliders();
    }
}

function updateSliders() {
    if (!selected) return;
    const style = window.getComputedStyle(selected);
    
    const fontSize = parseInt(style.fontSize) || 18;
    const fontWeight = parseInt(style.fontWeight) || 700;
    const opacity = parseFloat(style.opacity) || 1;
    
    document.getElementById('font-size-slider').value = fontSize;
    document.getElementById('font-size-value').textContent = fontSize + 'px';
    
    document.getElementById('font-weight-slider').value = fontWeight;
    document.getElementById('font-weight-value').textContent = fontWeight;
    
    document.getElementById('opacity-slider').value = opacity;
    document.getElementById('opacity-value').textContent = Math.round(opacity * 100) + '%';
    
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
    selected.style.transform = `rotate(${value}deg) skewX(${getSkewValue()}deg)`;
    document.getElementById('rotate-value').textContent = value + '°';
}

function applySkew(value) {
    if (!selected) return;
    const rotate = document.getElementById('rotate-slider').value || 0;
    selected.style.transform = `rotate(${rotate}deg) skewX(${value}deg)`;
    document.getElementById('skew-value').textContent = value + '°';
}

function applyTextColor(color) {
    if (!selected) return;
    selected.style.color = color;
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
        {ar:'in-address-ar', he:'in-address-he', out:'row-address'},
        {ar:'in-town-ar', he:'in-town-he', out:'row-town'},
        {ar:'in-status-ar', he:'in-status-he', out:'row-status'}
    ];
    
    map.forEach(f => {
        const row = document.getElementById(f.out);
        if(row) {
            const arSpan = row.querySelector('.ar');
            const heSpan = row.querySelector('.he');
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

    document.getElementById('screen-input').classList.remove('active');
    document.getElementById('screen-preview').classList.add('active');
    
    fitCardToScreen(); // تناسب الحجم عند فتح المعاينة
}

// دالة لتصغير البطاقة برمجياً لتناسب أي شاشة
function fitCardToScreen() {
    const area = document.getElementById('capture-area');
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // حساب المقياس بناءً على عرض الشاشة مع ترك مساحة للحواف
    let scaleW = (screenWidth - 30) / 750;
    let scaleH = (screenHeight - 150) / 1060;
    
    currentScale = Math.min(scaleW, scaleH); // نأخذ الأصغر لضمان ظهور البطاقة كاملة
    
    area.style.transform = `scale(${currentScale})`;
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

function changeWeight(val) {
    if (!selected) return;
    let cur = parseInt(window.getComputedStyle(selected).fontWeight) || 400;
    let next = cur + val;
    if(next > 900) next = 400; // إعادة تعيين
    selected.style.fontWeight = next;
}

function rotateItem(val) {
    if (!selected) return;
    let trans = selected.style.transform || "rotate(0deg)";
    let deg = parseInt(trans.replace(/[^\d.-]/g, '')) || 0;
    selected.style.transform = `rotate(${deg + val}deg)`;
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

function goBack() { 
    document.getElementById('screen-preview').classList.remove('active'); 
    document.getElementById('screen-input').classList.add('active'); 
}

// التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    // النقر المزدوج لملء الشاشة
    document.getElementById('capture-area').addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (selected) selected.classList.remove('selected');
        document.body.classList.toggle('fullscreen-mode');
        // تعديل التكبير في وضع ملء الشاشة
        if(document.body.classList.contains('fullscreen-mode')) {
            document.getElementById('capture-area').style.transform = `scale(${currentScale * 1.1})`;
        } else {
            fitCardToScreen();
        }
    });

    // تحديد العناصر
    document.querySelectorAll('.selectable').forEach(el => {
        el.onclick = (e) => { 
            e.stopPropagation(); 
            if (document.body.classList.contains('fullscreen-mode')) return;
            if (selected) selected.classList.remove('selected'); 
            selected = el; 
            selected.classList.add('selected');
            // تحديث الـ sliders تلقائياً
            document.getElementById('control-panel').style.display = 'block';
            updateSliders();
        };
    });

    // رفع الصورة الشخصية
    document.getElementById('in-photo').onchange = (e) => {
        const r = new FileReader(); 
        r.onload = (ev) => {
            document.getElementById('out-photo').src = ev.target.result;
            document.getElementById('preview-upload-photo').src = ev.target.result;
        };
        if(e.target.files[0]) r.readAsDataURL(e.target.files[0]);
    };

    // رفع صورة البطاقة الفارغة (البنية)
    document.getElementById('in-bg-card').onchange = (e) => {
        const r = new FileReader(); 
        r.onload = (ev) => {
            document.getElementById('bg-card-img').src = ev.target.result;
        };
        if(e.target.files[0]) r.readAsDataURL(e.target.files[0]);
    };

    // الحفظ - يحفظ كما يظهر في المعاينة مع جميع التعديلات
    document.getElementById('btn-save').onclick = async () => {
        if (selected) selected.classList.remove('selected');
        
        const area = document.getElementById('capture-area');
        const originalScale = area.style.transform;
        
        // إزالة التصغير للحصول على الدقة الأصلية
        area.style.transform = 'scale(1)';
        
        // ننتظر قليلاً ليتم تحديث واجهة المستخدم
        await new Promise(resolve => setTimeout(resolve, 100));

        html2canvas(area, { 
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            logging: false,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `ID_Card_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // إرجاع التصغير
            area.style.transform = originalScale;
        });
    };
});
