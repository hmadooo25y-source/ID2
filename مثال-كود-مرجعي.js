/**
 * ID Card Editor - مثال كود مرجعي
 * للعاملين في التطوير والراغبين في التوسع
 * 
 * استخدام: انسخ الدوال التي تحتاجها
 */

// ============================================
// 1. فئة (Class) شاملة لإدارة البطاقة
// ============================================

class IDCardManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.fields = new Map();
        this.selectedField = null;
        this.undoStack = [];
        this.redoStack = [];
    }

    // إضافة حقل جديد
    addField(id, text, x, y, options = {}) {
        const field = {
            id,
            text,
            x: x || 0,
            y: y || 0,
            fontSize: options.fontSize || 14,
            color: options.color || '#000',
            fontWeight: options.fontWeight || 700,
            rotation: options.rotation || 0,
            opacity: options.opacity || 1,
            element: null
        };

        const el = document.createElement('div');
        el.className = 'field';
        el.id = `field-${id}`;
        el.textContent = text;
        el.style.cssText = this.generateCSS(field);

        el.addEventListener('click', () => this.selectField(id));
        this.container.appendChild(el);

        field.element = el;
        this.fields.set(id, field);
        return field;
    }

    // توليد CSS من البيانات
    generateCSS(field) {
        return `
            position: absolute;
            left: ${field.x}px;
            top: ${field.y}px;
            font-size: ${field.fontSize}px;
            color: ${field.color};
            font-weight: ${field.fontWeight};
            transform: rotate(${field.rotation}deg);
            opacity: ${field.opacity};
        `;
    }

    // اختيار حقل
    selectField(id) {
        if (this.selectedField) {
            this.selectedField.element.classList.remove('selected');
        }
        const field = this.fields.get(id);
        this.selectedField = field;
        field.element.classList.add('selected');
        return field;
    }

    // تحديث خصائص الحقل
    updateField(id, updates) {
        const field = this.fields.get(id);
        if (!field) return;

        this.saveUndoState();

        Object.assign(field, updates);
        field.element.style.cssText = this.generateCSS(field);
        
        return field;
    }

    // التراجع والإعادة
    saveUndoState() {
        const state = this.exportState();
        this.undoStack.push(state);
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const state = this.exportState();
        this.redoStack.push(state);
        const previous = this.undoStack.pop();
        this.importState(previous);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const state = this.exportState();
        this.undoStack.push(state);
        const next = this.redoStack.pop();
        this.importState(next);
    }

    // تصدير البيانات
    exportState() {
        const state = {};
        this.fields.forEach((field, id) => {
            state[id] = {
                text: field.text,
                x: field.x,
                y: field.y,
                fontSize: field.fontSize,
                color: field.color,
                fontWeight: field.fontWeight,
                rotation: field.rotation,
                opacity: field.opacity
            };
        });
        return state;
    }

    // استيراد البيانات
    importState(state) {
        this.container.innerHTML = '';
        this.fields.clear();
        
        Object.entries(state).forEach(([id, data]) => {
            this.addField(id, data.text, data.x, data.y, data);
        });
    }

    // حفظ في localStorage
    save(key = 'idCardData') {
        localStorage.setItem(key, JSON.stringify(this.exportState()));
    }

    // تحميل من localStorage
    load(key = 'idCardData') {
        const data = localStorage.getItem(key);
        if (data) {
            this.importState(JSON.parse(data));
        }
    }

    // تصدير كـ JSON
    toJSON() {
        return JSON.stringify(this.exportState(), null, 2);
    }
}

// ============================================
// 2. مثال الاستخدام
// ============================================

/*
const manager = new IDCardManager('cardContent');

// إضافة حقول
manager.addField('idNum', '4 2264051 6', 30, 10, {
    fontSize: 18,
    color: '#000',
    fontWeight: 900
});

manager.addField('name', 'نورهان', 30, 30, {
    fontSize: 16,
    fontWeight: 700
});

// تحديث
manager.updateField('name', {
    fontSize: 20,
    color: '#0056b3'
});

// حفظ
manager.save();

// تحميل
manager.load();

// التراجع
manager.undo();

// الإعادة
manager.redo();
*/

// ============================================
// 3. معالجات الصور
// ============================================

class ImageHandler {
    static async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static resizeImage(src, width, height) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = src;
        });
    }

    static async compressImage(file, maxSize = 500000) {
        let quality = 0.9;
        let canvas = document.createElement('canvas');
        const img = new Image();
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.onload = () => {
                    let size = new Blob([e.target.result]).size;
                    
                    if (size <= maxSize) {
                        resolve(e.target.result);
                        return;
                    }

                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');

                    while (size > maxSize && quality > 0.1) {
                        ctx.drawImage(img, 0, 0);
                        size = new Blob([canvas.toDataURL('image/jpeg', quality)]).size;
                        quality -= 0.1;
                    }

                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// ============================================
// 4. معالجات الحفظ والتصدير
// ============================================

class ExportHandler {
    static async exportPNG(element, filename = 'card.png') {
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = filename;
            link.click();
            
            return true;
        } catch (error) {
            console.error('Export error:', error);
            return false;
        }
    }

    static async exportPDF(element, filename = 'card.pdf') {
        // يتطلب jsPDF و html2pdf
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };
        
        // await html2pdf().set(opt).from(element).save();
    }

    static async exportJSON(data, filename = 'card.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }

    static async importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

// ============================================
// 5. معالجات المدخلات
// ============================================

class InputValidator {
    static validateID(id) {
        // صيغة فلسطينية: 4 2264051 6
        const regex = /^\d{1}\s\d{7}\s\d{1}$/;
        return regex.test(id);
    }

    static validateDate(date) {
        // صيغة: 09/11/2005
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(date)) return false;
        
        const [day, month, year] = date.split('/').map(Number);
        const d = new Date(year, month - 1, day);
        return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
    }

    static validateArabic(text) {
        // التحقق من أن النص عربي فقط
        const regex = /^[\u0600-\u06FF\s]*$/;
        return regex.test(text);
    }

    static sanitizeInput(text) {
        // إزالة الأحرف الخطرة
        return text
            .replace(/[<>\"']/g, '')
            .trim()
            .substring(0, 100);
    }
}

// ============================================
// 6. معالجات الأداء
// ============================================

class PerformanceOptimizer {
    static debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static lazy(callback, options = {}) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        return observer;
    }
}

// ============================================
// 7. أمثلة على الألوان والخطوط
// ============================================

const ColorPalette = {
    primary: '#0056b3',
    secondary: '#667eea',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    dark: '#1a1a1a',
    light: '#f8fafc'
};

const FontPresets = {
    heading: { size: 18, weight: 900 },
    subheading: { size: 16, weight: 700 },
    body: { size: 14, weight: 500 },
    small: { size: 12, weight: 400 }
};

// ============================================
// 8. معالجات الأخطاء
// ============================================

class ErrorHandler {
    static showError(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), duration);
    }

    static async handleAsync(promise, errorMessage) {
        try {
            return await promise;
        } catch (error) {
            console.error(errorMessage, error);
            this.showError(errorMessage);
            throw error;
        }
    }

    static logEvent(event, data = {}) {
        console.log(`[${new Date().toISOString()}] ${event}`, data);
    }
}

// ============================================
// 9. نموذج الاستخدام المتكامل
// ============================================

/*
// تهيئة مدير البطاقة
const cardManager = new IDCardManager('cardContent');
cardManager.load(); // تحميل البيانات المحفوظة

// إضافة مستمعي الأحداث
document.getElementById('nameInput').addEventListener(
    'input',
    PerformanceOptimizer.debounce((e) => {
        cardManager.updateField('name', { text: e.target.value });
        cardManager.save();
    }, 300)
);

// التعامل مع الصور
document.getElementById('photoInput').addEventListener('change', async (e) => {
    const compressed = await ImageHandler.compressImage(e.target.files[0]);
    document.getElementById('cardPhoto').src = compressed;
});

// التصدير
document.getElementById('exportBtn').addEventListener('click', async () => {
    const success = await ExportHandler.exportPNG(
        document.getElementById('card'),
        `ID_Card_${Date.now()}.png`
    );
    
    if (success) {
        ErrorHandler.showError('تم التحميل بنجاح!', 2000);
    } else {
        ErrorHandler.showError('خطأ في التحميل');
    }
});

// التراجع والإعادة
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        cardManager.undo();
    }
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        cardManager.redo();
    }
});
*/

// ============================================
// 10. اختبار الوحدات (Unit Tests)
// ============================================

/*
// اختبار بسيط للتحقق
function testIDFormat() {
    const valid = InputValidator.validateID('4 2264051 6');
    console.assert(valid === true, 'ID format test failed');
}

function testDateValidation() {
    const valid = InputValidator.validateDate('09/11/2005');
    console.assert(valid === true, 'Date validation test failed');
}

function testArabicValidation() {
    const valid = InputValidator.validateArabic('نورهان');
    console.assert(valid === true, 'Arabic validation test failed');
}

// تشغيل الاختبارات
testIDFormat();
testDateValidation();
testArabicValidation();
*/

// ============================================
// ملاحظات للمطورين
// ============================================

/**
 * نقاط قابلة للتوسع:
 * 
 * 1. إضافة قاعدة بيانات (Backend)
 *    - حفظ البطاقات على السيرفر
 *    - مشاركة البطاقات مع الآخرين
 * 
 * 2. واجهة برمجية (API)
 *    - POST /api/cards - حفظ
 *    - GET /api/cards/:id - تحميل
 *    - DELETE /api/cards/:id - حذف
 * 
 * 3. ميزات متقدمة
 *    - توقيع رقمي
 *    - QR Code
 *    - NFC Tags
 *    - تشفير البيانات
 * 
 * 4. التكامل مع جهات خارجية
 *    - Google Drive
 *    - Dropbox
 *    - Azure Storage
 * 
 * 5. الإصدارات المستقبلية
 *    - تطبيق محمول
 *    - دعم التعاون الفوري
 *    - قوالب متعددة
 *    - معالج بصري متقدم
 */

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IDCardManager,
        ImageHandler,
        ExportHandler,
        InputValidator,
        PerformanceOptimizer,
        ErrorHandler
    };
}
