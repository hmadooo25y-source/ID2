// ==================== STATE MANAGEMENT ====================

const state = {
    selectedLayer: 'stamp',
    zoom: 100,
    history: [],
    historyIndex: -1,
    layers: {
        background: {
            visible: true,
            transforms: {}
        },
        stamp: {
            visible: true,
            x: 150,
            y: 300,
            width: 120,
            height: 120,
            rotation: 0,
            opacity: 1,
            scale: 1,
            filters: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                hue: 0,
                blur: 0
            }
        }
    },
    isDragging: false,
    dragStart: { x: 0, y: 0 }
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setupStamp();
    addToHistory('تم تحميل التطبيق');
});

function initializeEventListeners() {
    // Layer selection
    document.querySelectorAll('.layer-item').forEach(item => {
        item.addEventListener('click', selectLayer);
    });

    // Layer visibility toggle
    document.querySelectorAll('.layer-visibility').forEach(btn => {
        btn.addEventListener('click', toggleLayerVisibility);
    });

    // Zoom controls
    document.getElementById('zoom-slider').addEventListener('input', handleZoom);
    document.getElementById('zoom-reset').addEventListener('click', resetZoom);

    // Filters
    document.getElementById('brightness').addEventListener('input', applyFilters);
    document.getElementById('contrast').addEventListener('input', applyFilters);
    document.getElementById('saturation').addEventListener('input', applyFilters);
    document.getElementById('hue').addEventListener('input', applyFilters);
    document.getElementById('blur').addEventListener('input', applyFilters);
    document.getElementById('opacity').addEventListener('input', applyFilters);

    // Position controls
    document.getElementById('pos-x').addEventListener('change', updatePosition);
    document.getElementById('pos-y').addEventListener('change', updatePosition);
    document.getElementById('pos-width').addEventListener('change', updateSize);
    document.getElementById('pos-height').addEventListener('change', updateSize);
    document.getElementById('pos-rotation').addEventListener('change', updateRotation);

    // Alignment buttons
    document.getElementById('align-left').addEventListener('click', () => alignElement('left'));
    document.getElementById('align-center-h').addEventListener('click', () => alignElement('center-h'));
    document.getElementById('align-right').addEventListener('click', () => alignElement('right'));
    document.getElementById('align-top').addEventListener('click', () => alignElement('top'));
    document.getElementById('align-center-v').addEventListener('click', () => alignElement('center-v'));
    document.getElementById('align-bottom').addEventListener('click', () => alignElement('bottom'));

    // Stamp controls
    document.getElementById('delete-stamp').addEventListener('click', deleteStamp);
    document.getElementById('duplicate-stamp').addEventListener('click', duplicateStamp);

    // Bottom toolbar
    document.getElementById('undo-btn').addEventListener('click', undo);
    document.getElementById('redo-btn').addEventListener('click', redo);
    document.getElementById('reset-btn').addEventListener('click', resetStamp);
    document.getElementById('save-btn').addEventListener('click', saveProject);
    document.getElementById('download-btn').addEventListener('click', downloadImage);

    // Quick effects
    document.querySelectorAll('.effect-btn').forEach(btn => {
        btn.addEventListener('click', applyQuickEffect);
    });

    // Stamp dragging
    const stamp = document.getElementById('stamp-container');
    stamp.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', dragElement);
    document.addEventListener('mouseup', stopDragging);

    // Help modal
    document.getElementById('help-btn').addEventListener('click', showHelpModal);
    document.querySelector('.modal-close').addEventListener('click', closeHelpModal);
    document.getElementById('help-modal').addEventListener('click', (e) => {
        if (e.target.id === 'help-modal') closeHelpModal();
    });

    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ==================== LAYER MANAGEMENT ====================

function selectLayer(e) {
    const layerElement = e.currentTarget;
    const layerId = layerElement.dataset.layer;
    
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('active');
    });
    
    layerElement.classList.add('active');
    state.selectedLayer = layerId;
    
    updateStampVisuals();
    updatePropertiesPanel();
}

function toggleLayerVisibility(e) {
    e.stopPropagation();
    const layer = e.currentTarget.dataset.layer;
    state.layers[layer].visible = !state.layers[layer].visible;
    
    e.currentTarget.classList.toggle('hidden');
    
    const layerElement = document.getElementById(`${layer}-layer`);
    if (layerElement) {
        layerElement.style.opacity = state.layers[layer].visible ? '1' : '0';
        layerElement.style.pointerEvents = state.layers[layer].visible ? 'auto' : 'none';
    }
    
    addToHistory(`${layer === 'background' ? 'تم إخفاء الخلفية' : 'تم إخفاء الختم'}`);
}

// ==================== STAMP MANIPULATION ====================

function setupStamp() {
    const stampContainer = document.getElementById('stamp-container');
    updateStampPosition();
    updateStampVisuals();
}

function updateStampPosition() {
    const container = document.getElementById('stamp-container');
    const s = state.layers.stamp;
    
    container.style.left = s.x + 'px';
    container.style.top = s.y + 'px';
    container.style.width = s.width + 'px';
    container.style.height = s.height + 'px';
    container.style.transform = `rotate(${s.rotation}deg) scale(${s.scale})`;
}

function updateStampVisuals() {
    const container = document.getElementById('stamp-container');
    const s = state.layers.stamp;
    
    if (state.selectedLayer === 'stamp') {
        container.classList.add('active');
        document.getElementById('pos-x').value = Math.round(s.x);
        document.getElementById('pos-y').value = Math.round(s.y);
        document.getElementById('pos-width').value = Math.round(s.width);
        document.getElementById('pos-height').value = Math.round(s.height);
        document.getElementById('pos-rotation').value = s.rotation;
    } else {
        container.classList.remove('active');
    }
    
    updateStampPosition();
}

function startDragging(e) {
    if (state.selectedLayer !== 'stamp') return;
    if (e.target.closest('.stamp-controls')) return;
    
    state.isDragging = true;
    state.dragStart = {
        x: e.clientX,
        y: e.clientY,
        elementX: state.layers.stamp.x,
        elementY: state.layers.stamp.y
    };
}

function dragElement(e) {
    if (!state.isDragging || state.selectedLayer !== 'stamp') return;
    
    const deltaX = e.clientX - state.dragStart.x;
    const deltaY = e.clientY - state.dragStart.y;
    
    state.layers.stamp.x = state.dragStart.elementX + deltaX / (state.zoom / 100);
    state.layers.stamp.y = state.dragStart.elementY + deltaY / (state.zoom / 100);
    
    updateStampPosition();
}

function stopDragging() {
    if (state.isDragging) {
        state.isDragging = false;
        addToHistory('تم تحريك الختم');
    }
}

// ==================== ZOOM CONTROL ====================

function handleZoom(e) {
    state.zoom = parseInt(e.target.value);
    const wrapper = document.querySelector('.canvas-wrapper');
    wrapper.style.transform = `scale(${state.zoom / 100})`;
    document.getElementById('zoom-value').textContent = state.zoom + '%';
}

function resetZoom() {
    state.zoom = 100;
    document.getElementById('zoom-slider').value = 100;
    document.querySelector('.canvas-wrapper').style.transform = 'scale(1)';
    document.getElementById('zoom-value').textContent = '100%';
}

// ==================== FILTERS & EFFECTS ====================

function applyFilters(e) {
    const s = state.layers.stamp;
    const stamp = document.getElementById('stamp-layer');
    
    s.filters.brightness = parseInt(document.getElementById('brightness').value);
    s.filters.contrast = parseInt(document.getElementById('contrast').value);
    s.filters.saturation = parseInt(document.getElementById('saturation').value);
    s.filters.hue = parseInt(document.getElementById('hue').value);
    s.filters.blur = parseInt(document.getElementById('blur').value);
    s.opacity = parseInt(document.getElementById('opacity').value) / 100;
    
    const filterString = `
        brightness(${s.filters.brightness}%)
        contrast(${s.filters.contrast}%)
        saturate(${s.filters.saturation}%)
        hue-rotate(${s.filters.hue}deg)
        blur(${s.filters.blur}px)
    `;
    
    stamp.style.filter = filterString;
    stamp.style.opacity = s.opacity;
    
    updateValueDisplays();
    addToHistory('تم تطبيق المرشحات');
}

function updateValueDisplays() {
    document.querySelector('#brightness + .value-display').textContent = 
        document.getElementById('brightness').value + '%';
    document.querySelector('#contrast + .value-display').textContent = 
        document.getElementById('contrast').value + '%';
    document.querySelector('#saturation + .value-display').textContent = 
        document.getElementById('saturation').value + '%';
    document.querySelector('#hue + .value-display').textContent = 
        document.getElementById('hue').value + '°';
    document.querySelector('#blur + .value-display').textContent = 
        document.getElementById('blur').value + 'px';
    document.querySelector('#opacity + .value-display').textContent = 
        document.getElementById('opacity').value + '%';
}

function applyQuickEffect(e) {
    const effect = e.target.closest('.effect-btn').dataset.effect;
    const btn = e.target.closest('.effect-btn');
    
    // Remove active class from all effect buttons
    document.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    resetFilters();
    
    switch(effect) {
        case 'sepia':
            document.getElementById('hue').value = 30;
            document.getElementById('saturation').value = 60;
            break;
        case 'grayscale':
            document.getElementById('saturation').value = 0;
            break;
        case 'vintage':
            document.getElementById('brightness').value = 110;
            document.getElementById('contrast').value = 85;
            document.getElementById('saturation').value = 80;
            break;
        case 'blur':
            document.getElementById('blur').value = 8;
            break;
    }
    
    applyFilters();
    addToHistory(`تم تطبيق تأثير ${effect}`);
}

function resetFilters() {
    document.getElementById('brightness').value = 100;
    document.getElementById('contrast').value = 100;
    document.getElementById('saturation').value = 100;
    document.getElementById('hue').value = 0;
    document.getElementById('blur').value = 0;
    document.getElementById('opacity').value = 100;
}

// ==================== POSITION & TRANSFORMATION ====================

function updatePosition(e) {
    state.layers.stamp.x = parseInt(document.getElementById('pos-x').value);
    state.layers.stamp.y = parseInt(document.getElementById('pos-y').value);
    updateStampPosition();
    addToHistory('تم تحديث الموضع');
}

function updateSize(e) {
    state.layers.stamp.width = parseInt(document.getElementById('pos-width').value);
    state.layers.stamp.height = parseInt(document.getElementById('pos-height').value);
    updateStampPosition();
    addToHistory('تم تحديث الحجم');
}

function updateRotation(e) {
    state.layers.stamp.rotation = parseInt(e.target.value);
    updateStampPosition();
    addToHistory('تم تدوير الختم');
}

// ==================== ALIGNMENT ====================

function alignElement(direction) {
    const wrapper = document.querySelector('.canvas-wrapper');
    const rect = wrapper.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    switch(direction) {
        case 'left':
            state.layers.stamp.x = 10;
            break;
        case 'right':
            state.layers.stamp.x = rect.width - state.layers.stamp.width - 10;
            break;
        case 'center-h':
            state.layers.stamp.x = centerX - state.layers.stamp.width / 2;
            break;
        case 'top':
            state.layers.stamp.y = 10;
            break;
        case 'bottom':
            state.layers.stamp.y = rect.height - state.layers.stamp.height - 10;
            break;
        case 'center-v':
            state.layers.stamp.y = centerY - state.layers.stamp.height / 2;
            break;
    }
    
    updateStampVisuals();
    addToHistory('تم محاذاة العنصر');
}

// ==================== PROPERTIES PANEL ====================

function updatePropertiesPanel() {
    const panel = document.getElementById('properties-panel');
    
    if (state.selectedLayer === 'stamp') {
        panel.innerHTML = `
            <div style="padding: 12px; border-radius: 8px; background: rgba(30, 64, 175, 0.1);">
                <p style="color: var(--text-secondary); font-size: 12px;">الختم المختار</p>
                <p style="color: var(--text-primary); font-weight: 600;">تحرير الموضع والحجم والفلاتر</p>
            </div>
        `;
    }
}

// ==================== STAMP ACTIONS ====================

function deleteStamp() {
    if (confirm('هل تريد حذف الختم؟')) {
        const container = document.getElementById('stamp-container');
        container.style.display = 'none';
        state.layers.stamp.visible = false;
        addToHistory('تم حذف الختم');
    }
}

function duplicateStamp() {
    const newStamp = JSON.parse(JSON.stringify(state.layers.stamp));
    newStamp.x += 20;
    newStamp.y += 20;
    
    // This would require more complex implementation for multiple stamps
    addToHistory('تم نسخ الختم');
}

function resetStamp() {
    state.layers.stamp = {
        visible: true,
        x: 150,
        y: 300,
        width: 120,
        height: 120,
        rotation: 0,
        opacity: 1,
        scale: 1,
        filters: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            hue: 0,
            blur: 0
        }
    };
    
    resetFilters();
    updateStampVisuals();
    document.getElementById('stamp-layer').style.filter = 'none';
    document.getElementById('stamp-layer').style.opacity = '1';
    document.getElementById('stamp-container').style.display = 'block';
    state.layers.stamp.visible = true;
    
    addToHistory('تم إعادة تعيين الختم');
}

// ==================== HISTORY MANAGEMENT ====================

function addToHistory(action) {
    state.history.push(action);
    state.historyIndex = state.history.length - 1;
    updateHistoryPanel();
}

function updateHistoryPanel() {
    const panel = document.getElementById('history-panel');
    
    if (state.history.length === 0) {
        panel.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-inbox"></i>
                <p>لا يوجد سجل</p>
            </div>
        `;
        return;
    }
    
    panel.innerHTML = state.history.slice(-5).map((item, idx) => `
        <div class="history-item">
            <i class="fas fa-check"></i> ${item}
        </div>
    `).join('');
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        addToHistory('تم التراجع');
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        addToHistory('تم الإعادة');
    }
}

// ==================== SAVE & DOWNLOAD ====================

function saveProject() {
    const projectData = {
        state: JSON.stringify(state),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('stampEditorProject', JSON.stringify(projectData));
    alert('تم حفظ المشروع بنجاح! ✓');
    addToHistory('تم حفظ المشروع');
}

function downloadImage() {
    const canvas = document.querySelector('.canvas-wrapper');
    
    html2canvas(canvas, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
    }).then(canvasElement => {
        const link = document.createElement('a');
        link.href = canvasElement.toDataURL('image/png');
        link.download = `stamp-editor-${new Date().getTime()}.png`;
        link.click();
        addToHistory('تم تحميل الصورة');
    });
}

// ==================== KEYBOARD SHORTCUTS ====================

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            undo();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
            e.preventDefault();
            redo();
        } else if (e.key === 's') {
            e.preventDefault();
            saveProject();
        }
    }
    
    if (e.key === 'Delete' && state.selectedLayer === 'stamp') {
        deleteStamp();
    }
}

// ==================== UI INTERACTIONS ====================

function showHelpModal() {
    document.getElementById('help-modal').classList.add('show');
}

function closeHelpModal() {
    document.getElementById('help-modal').classList.remove('show');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// ==================== INITIALIZATION MESSAGE ====================

console.log('✨ محرر الصور الاحترافي جاهز!');
console.log('الأوامر السريعة:');
console.log('Ctrl+Z - تراجع');
console.log('Ctrl+Y - إعادة');
console.log('Ctrl+S - حفظ');
console.log('Delete - حذف العنصر المختار');
