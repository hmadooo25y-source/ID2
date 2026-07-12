let selected = null;

function processAndShow() {
    saveState();
    const map = [
        {ar:'in-name-ar', he:'in-name-he', out:'row-1'},
        {ar:'in-father-ar', he:'in-father-he', out:'row-2'},
        {ar:'in-grand-ar', he:'in-grand-he', out:'row-3'},
        {ar:'in-family-ar', he:'in-family-he', out:'row-4'},
        {ar:'in-mother-ar', he:'in-mother-he', out:'row-5'},
        {ar:'in-pob-ar', he:'in-pob-he', out:'row-6'},
        {ar:'in-sex-ar', he:'in-sex-he', out:'row-sex'},
        {ar:'in-rel-ar', he:'in-rel-he', out:'row-7'},
        {ar:'in-iss-ar', he:'in-iss-he', out:'row-iss-p'}
    ];
    
    map.forEach(f => {
        const row = document.getElementById(f.out);
        if(row) {
            row.querySelector('.ar').innerText = document.getElementById(f.ar).value;
            row.querySelector('.he').innerText = document.getElementById(f.he).value;
        }
    });

    document.getElementById('out-id-num').innerText = document.getElementById('in-id-num').value;
    document.getElementById('out-dob-display').innerText = `${document.getElementById('dob-d').value}/${document.getElementById('dob-m').value}/${document.getElementById('dob-y').value}`;
    document.getElementById('out-iss-display').innerText = `${document.getElementById('iss-d').value} ${document.getElementById('iss-m').value} ${document.getElementById('iss-y').value}`;
    
    document.getElementById('screen-input').classList.remove('active');
    document.getElementById('screen-preview').classList.add('active');
}

function move(dir) {
    if (!selected) return;
    let t = parseInt(window.getComputedStyle(selected).top), l = parseInt(window.getComputedStyle(selected).left);
    selected.style.right = 'auto'; 
    if (dir === 'up') selected.style.top = (t - 1) + "px";
    if (dir === 'down') selected.style.top = (t + 1) + "px";
    if (dir === 'left') selected.style.left = (l - 1) + "px";
    if (dir === 'right') selected.style.left = (l + 1) + "px";
}

function changeSize(val) {
    if (!selected) return;
    let cur = parseFloat(window.getComputedStyle(selected).fontSize);
    selected.style.fontSize = (cur * val) + "px";
    if(selected.classList.contains('stamp-element')) {
        let w = parseInt(window.getComputedStyle(selected).width);
        selected.style.width = (w * val) + "px";
    }
}

function rotateItem(val) {
    if (!selected) return;
    let trans = selected.style.transform || "rotate(0deg)";
    let deg = parseInt(trans.replace(/[^\d.-]/g, '')) || 0;
    selected.style.transform = `rotate(${deg + val}deg)`;
}

function adjustHebrewOffset(val) {
    if (!selected) return;
    const he = selected.querySelector('.he');
    if (he) {
        let cur = parseInt(window.getComputedStyle(he).marginRight) || 30;
        he.style.marginRight = (cur + val) + "px";
    }
}

function changeWeight(val) {
    if (!selected || selected.classList.contains('stamp-element')) return;
    let cur = parseInt(window.getComputedStyle(selected).fontWeight) || 400;
    selected.style.fontWeight = (cur + val);
}

function applyDeepInk(val) {
    if (!selected) return;
    selected.style.filter = selected.classList.contains('stamp-element') ? 
        `drop-shadow(0 0 ${val*0.6}px rgba(0,32,128,0.7)) blur(${val/20}px)` : `blur(${val/12}px)`;
}

function applyNoise() {
    const nl = document.getElementById('noise-layer');
    nl.style.display = (nl.style.display === 'block') ? 'none' : 'block';
}

function makeUltraRealistic() {
    document.getElementById('capture-area').classList.toggle('ultra-real');
}

function saveState() {
    const data = { inputs: {} };
    document.querySelectorAll('.save-me').forEach(el => data.inputs[el.id] = el.value);
    localStorage.setItem('id_platinum_v12', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('id_platinum_v12');
    if (saved) {
        const data = JSON.parse(saved);
        for (const id in data.inputs) if (document.getElementById(id)) document.getElementById(id).value = data.inputs[id];
    }
}

function goBack() { 
    document.getElementById('screen-preview').classList.remove('active'); 
    document.getElementById('screen-input').classList.add('active'); 
}

function clearAllData() { if(confirm("مسح كافة البيانات؟")) { localStorage.clear(); location.reload(); } }

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    const slider = document.getElementById('scroll-container');
    const area = document.getElementById('capture-area');
    let isDown = false, startX, scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        if(e.target === slider || e.target === area) {
            isDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        }
    });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeft - (x - startX) * 2;
    });

    area.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (selected) selected.classList.remove('selected');
        document.body.classList.toggle('fullscreen-mode');
    });

    document.querySelectorAll('.selectable').forEach(el => {
        el.onclick = (e) => { 
            e.stopPropagation(); 
            if (document.body.classList.contains('fullscreen-mode')) return;
            if (selected) selected.classList.remove('selected'); 
            selected = el; 
            selected.classList.add('selected'); 
        };
    });

    document.getElementById('in-photo').onchange = (e) => {
        const r = new FileReader(); 
        r.onload = (ev) => document.getElementById('out-photo').src = ev.target.result;
        r.readAsDataURL(e.target.files[0]);
    };

    document.getElementById('btn-save').onclick = () => {
        if (selected) selected.classList.remove('selected');
        html2canvas(area, { scale: 3 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `ID_MASTER_PLATINUM.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    };
});