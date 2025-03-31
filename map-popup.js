// إنشاء نظام لعرض الخريطة في نافذة منبثقة

// دالة إنشاء أزرار الخريطة المنبثقة
function createMapPopupButton() {
    // إنشاء الزر الرئيسي
    const mapButton = document.createElement('button');
    mapButton.id = 'mapPopupButton';
    mapButton.className = 'map-popup-btn';
    mapButton.innerHTML = '<i class="fas fa-map-marked-alt"></i><span>عرض الخريطة</span>';
    mapButton.title = 'عرض الخريطة في نافذة منبثقة';
    
    // إضافة معالج النقر
    mapButton.addEventListener('click', openMapPopup);
    
    // إضافة الزر إلى الصفحة
    document.body.appendChild(mapButton);
    
    // إضافة التنسيقات الخاصة بالزر
    addMapPopupStyles();
}

// دالة فتح النافذة المنبثقة للخريطة
function openMapPopup() {
    // التحقق من وجود مكتبة Swal (SweetAlert2)
    if (typeof Swal === 'undefined') {
        // إذا لم تكن مكتبة SweetAlert2 موجودة، نستخدم واجهة منبثقة بسيطة
        createSimpleMapModal();
        return;
    }
    
    // استخدام SweetAlert2 لإنشاء نافذة منبثقة جميلة
    Swal.fire({
        title: '<i class="fas fa-map"></i> الخريطة',
        html: '<div id="popupMap" style="width: 100%; height: 70vh;"></div>',
        width: '90%',
        padding: '0',
        background: '#1a1a1a',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'dark-popup',
            title: 'text-white'
        },
        didOpen: () => {
            // إنشاء خريطة جديدة في النافذة المنبثقة
            initializePopupMap();
        }
    });
}

// دالة إنشاء نافذة منبثقة بسيطة (احتياطية)
function createSimpleMapModal() {
    // إنشاء النافذة المنبثقة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'map-modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'map-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'map-modal-header';
    modalHeader.innerHTML = '<h3><i class="fas fa-map"></i> الخريطة</h3><button class="map-modal-close">&times;</button>';
    
    const modalBody = document.createElement('div');
    modalBody.className = 'map-modal-body';
    modalBody.innerHTML = '<div id="popupMap" style="width: 100%; height: 70vh;"></div>';
    
    // تجميع النافذة
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // إضافة معالج للإغلاق
    const closeButton = modalHeader.querySelector('.map-modal-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    // إغلاق النافذة عند النقر خارجها
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    // تهيئة الخريطة
    initializePopupMap();
}

// دالة تهيئة الخريطة في النافذة المنبثقة
function initializePopupMap() {
    // التحقق من وجود مكتبة Leaflet
    if (typeof L === 'undefined') {
        const popupMap = document.getElementById('popupMap');
        if (popupMap) {
            popupMap.innerHTML = '<div class="map-error">عذراً، لا يمكن تحميل الخريطة. مكتبة Leaflet غير متوفرة.</div>';
        }
        return;
    }
    
    // إنشاء مرجع لعنصر الخريطة
    const popupMap = document.getElementById('popupMap');
    if (!popupMap) return;
    
    // بيانات الموقع الافتراضي (بغداد)
    const defaultLocation = [33.3152, 44.3661];
    
    // إنشاء خريطة جديدة
    const map = L.map('popupMap', {
        center: defaultLocation,
        zoom: 12,
        zoomControl: false
    });
    
    // إضافة طبقة الخريطة
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // إضافة زر التحكم بالتكبير/التصغير
    L.control.zoom({
        position: 'bottomright',
        zoomInTitle: 'تكبير',
        zoomOutTitle: 'تصغير'
    }).addTo(map);
    
    // إضافة زر الموقع الحالي
    L.control.locate({
        position: 'bottomright',
        strings: {
            title: 'أظهر موقعي'
        },
        flyTo: true,
        cacheLocation: true,
        showPopup: false,
        locateOptions: {
            enableHighAccuracy: true,
            watch: false
        }
    }).addTo(map);
    
    // محاولة نسخ العلامات من الخريطة الأصلية
    copyMarkersToPopupMap(map);
    
    // تحديث حجم الخريطة بعد التهيئة
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
}

// دالة نسخ العلامات من الخريطة الأصلية
function copyMarkersToPopupMap(popupMap) {
    try {
        // محاولة الوصول إلى الخريطة الأصلية
        if (window.map && window.markerLayer) {
            // طبقة العلامات الجديدة
            const newMarkerLayer = L.layerGroup().addTo(popupMap);
            
            // نسخ العلامات من طبقة العلامات الأصلية
            window.markerLayer.eachLayer(function(layer) {
                if (layer instanceof L.Marker) {
                    // نسخ العلامة
                    const clonedMarker = L.marker(layer.getLatLng(), {
                        icon: layer.options.icon,
                        title: layer.options.title,
                        driverId: layer.options.driverId
                    });
                    
                    // نسخ النافذة المنبثقة إذا وجدت
                    if (layer.getPopup()) {
                        clonedMarker.bindPopup(layer.getPopup().getContent());
                    }
                    
                    // إضافة إلى الطبقة الجديدة
                    clonedMarker.addTo(newMarkerLayer);
                }
            });
            
            // التركيز على المنطقة التي تحتوي على العلامات
            if (newMarkerLayer.getLayers().length > 0) {
                const group = L.featureGroup(newMarkerLayer.getLayers());
                popupMap.fitBounds(group.getBounds(), {
                    padding: [50, 50]
                });
            }
        } else if (window.driversMarkers && window.driversMarkers.length > 0) {
            // إذا كانت العلامات محفوظة في مصفوفة
            const newMarkerLayer = L.layerGroup().addTo(popupMap);
            
            window.driversMarkers.forEach(marker => {
                const clonedMarker = L.marker(marker.getLatLng(), {
                    icon: marker.options.icon
                });
                
                if (marker.getPopup()) {
                    clonedMarker.bindPopup(marker.getPopup().getContent());
                }
                
                clonedMarker.addTo(newMarkerLayer);
            });
            
            // التركيز على المنطقة التي تحتوي على العلامات
            const group = L.featureGroup(newMarkerLayer.getLayers());
            if (group.getBounds().isValid()) {
                popupMap.fitBounds(group.getBounds(), {
                    padding: [50, 50]
                });
            }
        }
    } catch (error) {
        console.error('Error copying markers:', error);
    }
}
// دالة إنشاء زر الخريطة المنبثقة
function createMapPopupButton() {
    // إنشاء الزر
    const mapButton = document.createElement('button');
    mapButton.id = 'mapPopupButton';
    mapButton.className = 'map-popup-btn';
    mapButton.innerHTML = '<i class="fas fa-map-marked-alt"></i>'; // فقط الأيقونة بدون نص
    mapButton.title = 'عرض الخريطة في نافذة منبثقة'; // نص تلميح يظهر عند التحويم
    
    // إضافة معالج النقر
    mapButton.addEventListener('click', openMapPopup);
    
    // إضافة الزر إلى الصفحة
    document.body.appendChild(mapButton);
    
    // إضافة التنسيقات الخاصة بالزر
    addMapPopupStyles();
}

// دالة إضافة التنسيقات
function addMapPopupStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* تنسيقات زر الخريطة المنبثقة */
        .map-popup-btn {
            position: fixed;
            top: 50%; /* وضع الزر في منتصف الصفحة عمودياً */
            right: 20px; /* المسافة من اليمين */
            transform: translateY(-50%); /* ضبط المحاذاة العمودية */
            width: 50px; /* عرض أصغر للزر */
            height: 50px; /* ارتفاع أصغر للزر */
            border-radius: 50%; /* شكل دائري */
            background-color: #FFD700; /* لون خلفية أصفر ذهبي */
            color: #000000; /* لون النص أسود */
            border: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center; /* محاذاة الأيقونة في الوسط */
            justify-content: center; /* محاذاة الأيقونة في الوسط */
            transition: all 0.3s ease;
            padding: 0;
        }
        
        /* تكبير الأيقونة */
        .map-popup-btn i {
            font-size: 22px;
        }
        
        /* تأثير التحويم */
        .map-popup-btn:hover {
            transform: translateY(-50%) scale(1.1); /* الحفاظ على المحاذاة العمودية مع تكبير الزر */
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
        }
        
        /* تأثير الضغط */
        .map-popup-btn:active {
            transform: translateY(-50%) scale(0.95); /* الحفاظ على المحاذاة العمودية مع تصغير الزر */
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        /* تنسيقات النافذة المنبثقة البسيطة */
        .map-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .map-modal-content {
            width: 90%;
            max-width: 1000px;
            max-height: 90vh;
            background-color: #1a1a1a;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            animation: scaleIn 0.3s ease;
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); }
            to { transform: scale(1); }
        }
        
        .map-modal-header {
            padding: 15px;
            background-color: #242424;
            color: #FFD700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
        }
        
        .map-modal-header h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .map-modal-close {
            background: none;
            border: none;
            color: #FFD700;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .map-modal-close:hover {
            transform: scale(1.2);
        }
        
        .map-modal-body {
            flex-grow: 1;
            padding: 0;
            overflow: hidden;
        }
        
        .map-error {
            padding: 20px;
            text-align: center;
            color: #ff6b6b;
            font-weight: bold;
        }
        
        /* تنسيقات نافذة SweetAlert المخصصة */
        .dark-popup {
            background-color: #1a1a1a !important;
            color: #FFFFFF !important;
            border-radius: 15px !important;
        }
        
        .text-white {
            color: #FFD700 !important;
            font-size: 1.5rem !important;
        }
        
        /* تخصيص أنماط الخريطة في النافذة المنبثقة */
        #popupMap .leaflet-control-zoom,
        #popupMap .leaflet-control-locate {
            margin-bottom: 30px !important;
        }
        
        /* تعديل للهواتف المحمولة */
        @media (max-width: 768px) {
            .map-popup-btn {
                right: 15px; /* تقريب الزر من الحافة اليمنى على الشاشات الصغيرة */
            }
        }
    `;
    document.head.appendChild(style);
}

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير بسيط لضمان تحميل جميع المكتبات
    setTimeout(createMapPopupButton, 1000);
});

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير بسيط لضمان تحميل جميع المكتبات
    setTimeout(createMapPopupButton, 1000);
});

// تحديث موضع الزر عند تغير حجم النافذة
window.addEventListener('resize', function() {
    // تعديل موضع الزر إذا لزم الأمر
    const mapButton = document.getElementById('mapPopupButton');
    if (mapButton) {
        // يمكن إضافة تعديلات هنا
    }
});

// إضافة دوال مساعدة للواجهة

// دالة لتحديث موضع زر الخريطة
function updateMapButtonPosition(bottomOffset) {
    const mapButton = document.getElementById('mapPopupButton');
    if (mapButton) {
        mapButton.style.bottom = `${bottomOffset}px`;
    }
}

// دالة إظهار أو إخفاء زر الخريطة
function toggleMapButton(show) {
    const mapButton = document.getElementById('mapPopupButton');
    if (mapButton) {
        mapButton.style.display = show ? 'flex' : 'none';
    }
}


// نظام عرض الخريطة في نافذة منبثقة محسّن

// متغيرات عالمية
let popupMapInstance = null;
let popupMarkerLayer = null;
let popupDriversData = [];

// دالة إنشاء أزرار الخريطة المنبثقة
function createMapPopupButton() {
    // إنشاء الزر الرئيسي
    const mapButton = document.createElement('button');
    mapButton.id = 'mapPopupButton';
    mapButton.className = 'map-popup-btn';
    mapButton.innerHTML = '<i class="fas fa-map-marked-alt"></i>';
    mapButton.title = 'عرض الخريطة في نافذة منبثقة';
    
    // إضافة معالج النقر
    mapButton.addEventListener('click', openMapPopup);
    
    // إضافة الزر إلى الصفحة
    document.body.appendChild(mapButton);
    
    // إضافة التنسيقات الخاصة بالزر
    addMapPopupStyles();
}

// دالة فتح النافذة المنبثقة للخريطة
function openMapPopup() {
    // التحقق من وجود مكتبة Swal (SweetAlert2)
    if (typeof Swal === 'undefined') {
        // إذا لم تكن مكتبة SweetAlert2 موجودة، نستخدم واجهة منبثقة بسيطة
        createSimpleMapModal();
        return;
    }
    
    // استخدام SweetAlert2 لإنشاء نافذة منبثقة جميلة
    Swal.fire({
        title: '<i class="fas fa-map"></i> الخريطة',
        html: `
            <div class="popup-map-container">
                <div id="popupMap" style="width: 100%; height: 70vh;"></div>
                <div class="popup-location-filter" style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000; background: rgba(0,0,0,0.7); border-radius: 10px; padding: 10px; max-width: 100%; overflow-x: auto; white-space: nowrap;">
                    <div class="location-chips" id="popupLocationFilter" style="display: flex; gap: 8px;">
                        <span class="location-chip active" data-location="all" style="background: #FFD700; color: #000; padding: 5px 10px; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 0.9rem;">
                            <i class="fas fa-globe"></i>
                            الكل
                        </span>
                        <span class="location-chip" data-location="بغداد" style="background: rgba(255,255,255,0.2); color: #fff; padding: 5px 10px; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 0.9rem;">
                            <i class="fas fa-map-marker-alt"></i>
                            بغداد
                        </span>
                        <span class="location-chip" data-location="البصرة" style="background: rgba(255,255,255,0.2); color: #fff; padding: 5px 10px; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 0.9rem;">
                            <i class="fas fa-map-marker-alt"></i>
                            البصرة
                        </span>
                        <span class="location-chip" data-location="أربيل" style="background: rgba(255,255,255,0.2); color: #fff; padding: 5px 10px; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 0.9rem;">
                            <i class="fas fa-map-marker-alt"></i>
                            أربيل
                        </span>
                        <span class="location-chip" data-location="الموصل" style="background: rgba(255,255,255,0.2); color: #fff; padding: 5px 10px; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 0.9rem;">
                            <i class="fas fa-map-marker-alt"></i>
                            الموصل
                        </span>
                    </div>
                </div>
                <div class="popup-controls" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; gap: 10px;">
                    <button id="popupUserLocationBtn" class="popup-control-btn" style="background: #FFD700; color: #000; border: none; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.2); cursor: pointer;">
                        <i class="fas fa-location-arrow"></i>
                    </button>
                    <button id="popupSearchNearbyBtn" class="popup-control-btn" style="background: #fff; color: #333; border: none; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.2); cursor: pointer;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div id="popupRadiusControl" class="radius-control" style="display: none; position: absolute; bottom: 75px; left: 50%; transform: translateX(-50%); z-index: 1000; background: rgba(0,0,0,0.7); border-radius: 10px; padding: 10px; min-width: 200px;">
                    <label style="color: #fff; display: block; text-align: center; margin-bottom: 5px;">نطاق البحث: <span id="popupRadiusValue">5</span> كم</label>
                    <input type="range" id="popupRadiusSlider" min="1" max="20" value="5" style="width: 100%;">
                </div>
            </div>
        `,
        width: '90%',
        padding: '0',
        background: '#1a1a1a',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            popup: 'dark-popup',
            title: 'text-white',
            htmlContainer: 'p-0'
        },
        didOpen: () => {
            // إنشاء خريطة جديدة في النافذة المنبثقة
            initializePopupMap();
            
            // تهيئة المناطق في الفلتر
            initPopupLocationFilter();
            
            // تهيئة أزرار التحكم
            initPopupControls();
        }
    });
}

// دالة إنشاء نافذة منبثقة بسيطة (احتياطية)
function createSimpleMapModal() {
    // إنشاء النافذة المنبثقة
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'map-modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'map-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'map-modal-header';
    modalHeader.innerHTML = '<h3><i class="fas fa-map"></i> الخريطة</h3><button class="map-modal-close">&times;</button>';
    
    const modalBody = document.createElement('div');
    modalBody.className = 'map-modal-body';
    modalBody.innerHTML = `
        <div class="popup-map-container">
            <div id="popupMap" style="width: 100%; height: 70vh;"></div>
            <div class="popup-location-filter" style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000; background: rgba(0,0,0,0.7); border-radius: 10px; padding: 10px; overflow-x: auto; white-space: nowrap;">
                <div class="location-chips" id="popupLocationFilter">
                    <!-- سيتم إضافة المناطق بشكل ديناميكي -->
                </div>
            </div>
            <div class="popup-controls" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; gap: 10px;">
                <button id="popupUserLocationBtn" class="popup-control-btn">
                    <i class="fas fa-location-arrow"></i>
                </button>
                <button id="popupSearchNearbyBtn" class="popup-control-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
            <div id="popupRadiusControl" class="radius-control" style="display: none;">
                <label>نطاق البحث: <span id="popupRadiusValue">5</span> كم</label>
                <input type="range" id="popupRadiusSlider" min="1" max="20" value="5">
            </div>
        </div>
    `;
    
    // تجميع النافذة
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // إضافة معالج للإغلاق
    const closeButton = modalHeader.querySelector('.map-modal-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    // إغلاق النافذة عند النقر خارجها
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    // تهيئة الخريطة
    initializePopupMap();
    
    // تهيئة المناطق في الفلتر
    initPopupLocationFilter();
    
    // تهيئة أزرار التحكم
    initPopupControls();
}

// دالة تهيئة فلتر المناطق في النافذة المنبثقة
function initPopupLocationFilter() {
    const popupLocationFilter = document.getElementById('popupLocationFilter');
    if (!popupLocationFilter) return;
    
    // إضافة معالجات الأحداث للمناطق
    const locationChips = popupLocationFilter.querySelectorAll('.location-chip');
    locationChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // إزالة الحالة النشطة من جميع الخيارات
            locationChips.forEach(c => {
                c.classList.remove('active');
                c.style.background = 'rgba(255,255,255,0.2)';
                c.style.color = '#fff';
            });
            
            // إضافة الحالة النشطة للخيار المحدد
            chip.classList.add('active');
            chip.style.background = '#FFD700';
            chip.style.color = '#000';
            
            // تحديث السائقين حسب المنطقة المختارة
            const location = chip.getAttribute('data-location');
            loadPopupDriversByLocation(location);
        });
    });
}

// دالة تهيئة أزرار التحكم في النافذة المنبثقة
function initPopupControls() {
    // زر تحديد موقع المستخدم
    const userLocationBtn = document.getElementById('popupUserLocationBtn');
    if (userLocationBtn) {
        userLocationBtn.addEventListener('click', () => {
            popupGetCurrentLocation();
        });
    }
    
    // زر البحث عن السائقين في الجوار
    const searchNearbyBtn = document.getElementById('popupSearchNearbyBtn');
    if (searchNearbyBtn) {
        searchNearbyBtn.addEventListener('click', () => {
            togglePopupRadiusControl();
        });
    }
    
    // شريط تحديد نطاق البحث
    const radiusSlider = document.getElementById('popupRadiusSlider');
    const radiusValue = document.getElementById('popupRadiusValue');
    if (radiusSlider && radiusValue) {
        radiusSlider.addEventListener('input', () => {
            radiusValue.textContent = radiusSlider.value;
        });
        
        radiusSlider.addEventListener('change', () => {
            searchNearbyDrivers(parseFloat(radiusSlider.value));
        });
    }
}

// دالة تبديل ظهور عنصر تحديد نطاق البحث
function togglePopupRadiusControl() {
    const radiusControl = document.getElementById('popupRadiusControl');
    if (radiusControl) {
        if (radiusControl.style.display === 'none' || !radiusControl.style.display) {
            radiusControl.style.display = 'block';
        } else {
            radiusControl.style.display = 'none';
        }
    }
}

// دالة تحديد الموقع الحالي للمستخدم في النافذة المنبثقة
async function popupGetCurrentLocation() {
    if (!navigator.geolocation || !popupMapInstance) {
        showPopupToast('خدمة تحديد الموقع غير متوفرة في متصفحك', 'error');
        return;
    }
    
    try {
        // إظهار مؤشر التحميل
        showPopupLoading();
        
        // الحصول على الموقع
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
        
        const { latitude, longitude } = position.coords;
        
        // إنشاء أو تحديث علامة المستخدم
        updatePopupUserMarker(latitude, longitude);
        
        // تحريك الخريطة إلى موقع المستخدم
        popupMapInstance.flyTo([latitude, longitude], 16, {
            animate: true,
            duration: 1.5
        });
        
        // البحث عن السائقين في الجوار
        searchNearbyDrivers(5); // نطاق افتراضي 5 كم
        
        hidePopupLoading();
        showPopupToast('تم تحديد موقعك بنجاح', 'success');
    } catch (error) {
        hidePopupLoading();
        let errorMessage = 'حدث خطأ في تحديد الموقع';
        
        switch (error.code) {
            case 1: // PERMISSION_DENIED
                errorMessage = 'تم رفض الوصول إلى الموقع. يرجى السماح للتطبيق باستخدام خدمة الموقع';
                break;
            case 2: // POSITION_UNAVAILABLE
                errorMessage = 'معلومات الموقع غير متوفرة حالياً';
                break;
            case 3: // TIMEOUT
                errorMessage = 'انتهت مهلة طلب الموقع';
                break;
        }
        
        showPopupToast(errorMessage, 'error');
    }
}

// دالة تحديث علامة المستخدم على الخريطة المنبثقة
function updatePopupUserMarker(latitude, longitude) {
    if (!popupMapInstance || !popupMarkerLayer) return;
    
    // البحث عن علامة المستخدم الحالية
    let userMarker = popupMarkerLayer.getLayers().find(
        layer => layer.options.isUserMarker
    );
    
    // تعريف أيقونة مخصصة للمستخدم
    const userIcon = L.divIcon({
        html: `
            <div style="position: relative;">
                <div style="width: 50px; height: 50px; background: rgba(0, 123, 255, 0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; background: #007bff; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); z-index: 2; border: 2px solid #fff;">
                    <i class="fas fa-user"></i>
                </div>
            </div>
        `,
        className: 'user-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    });
    
    if (userMarker) {
        // تحديث موقع العلامة
        userMarker.setLatLng([latitude, longitude]);
    } else {
        // إنشاء علامة جديدة
        userMarker = L.marker([latitude, longitude], {
            icon: userIcon,
            zIndexOffset: 1000,
            isUserMarker: true // علامة خاصة لتمييز علامة المستخدم
        });
        
        userMarker.bindPopup('موقعك الحالي').addTo(popupMarkerLayer);
    }
    
    // تحديث الموقع الحالي للمستخدم (متغير عالمي)
    window.popupUserLocation = { lat: latitude, lng: longitude };
}

// دالة البحث عن السائقين في الجوار
function searchNearbyDrivers(radius) {
    if (!window.popupUserLocation || !popupMapInstance || !popupMarkerLayer) {
        showPopupToast('يرجى تحديد موقعك أولاً', 'warning');
        return;
    }
    
    // إظهار مؤشر التحميل
    showPopupLoading();
    
    // جلب بيانات السائقين من Firebase
    firebase.database().ref('drivers').once('value')
        .then(snapshot => {
            // مسح جميع علامات السائقين (مع الاحتفاظ بعلامة المستخدم)
            clearPopupDriverMarkers();
            
            const userLat = window.popupUserLocation.lat;
            const userLng = window.popupUserLocation.lng;
            let nearbyDrivers = [];
            
            snapshot.forEach(driverSnapshot => {
                const driver = driverSnapshot.val();
                const driverId = driverSnapshot.key;
                
                // التحقق من وجود إحداثيات للسائق
                if (driver && driver.coordinates && driver.coordinates.lat && driver.coordinates.lng) {
                    // حساب المسافة بين المستخدم والسائق
                    const distance = calculateDistance(
                        userLat,
                        userLng,
                        driver.coordinates.lat,
                        driver.coordinates.lng
                    );
                    
                    // إضافة السائق إذا كان ضمن النطاق المحدد
                    if (distance <= radius) {
                        nearbyDrivers.push({
                            ...driver,
                            id: driverId,
                            distance: distance
                        });
                    }
                }
            });
            
            // ترتيب السائقين حسب المسافة (الأقرب أولاً)
            nearbyDrivers.sort((a, b) => a.distance - b.distance);
            
            // إضافة علامات السائقين إلى الخريطة
            nearbyDrivers.forEach(driver => {
                addPopupDriverMarker(driver);
            });
            
            // إظهار رسالة نتائج البحث
            if (nearbyDrivers.length > 0) {
                showPopupToast(`تم العثور على ${nearbyDrivers.length} سائق في نطاق ${radius} كم`, 'success');
                
                // تحديث حدود الخريطة لتشمل جميع العلامات
                fitPopupMapToMarkers();
            } else {
                showPopupToast(`لم يتم العثور على سائقين في نطاق ${radius} كم`, 'info');
            }
            
            hidePopupLoading();
        })
        .catch(error => {
            console.error('Error searching for nearby drivers:', error);
            showPopupToast('حدث خطأ أثناء البحث عن السائقين', 'error');
            hidePopupLoading();
        });
}

// دالة حساب المسافة بين نقطتين
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

// دالة إنشاء المحتوى المنبثق للسائق
function createPopupDriverPopup(driver) {
    // التحقق من حالة الموافقة والنشاط
    const isApproved = driver.approved === true;
    const isPending = driver.approvalStatus === 'pending';
    const isActive = driver.active && isApproved;
    
    // تحديد حالة السائق ونصها
    const statusText = isApproved ? (isActive ? 'متاح' : 'مشغول') : (isPending ? 'قيد المراجعة' : 'غير مفعل');
    const statusColor = isApproved ? (isActive ? '#2ECC40' : '#FF4136') : '#FFD700';
    
    // تحديد النجوم للتقييم
    const rating = driver.rating || 5.0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating - fullStars) >= 0.5;
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '<i class="fas fa-star" style="color: #FFD700;"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt" style="color: #FFD700;"></i>';
        } else {
            starsHtml += '<i class="far fa-star" style="color: #FFD700;"></i>';
        }
    }
    
    // تقدير وقت الوصول (إذا كانت المسافة متوفرة)
    let arrivalTime = '';
    if (driver.distance !== undefined) {
        // افتراض سرعة متوسطة 30 كم/ساعة
        const timeInMinutes = Math.ceil((driver.distance * 60) / 30);
        arrivalTime = `<div class="info-row">
            <i class="fas fa-clock" style="color: #FFD700;"></i>
            <span>${timeInMinutes} دقيقة للوصول</span>
        </div>`;
    }
    
    // إنشاء المحتوى المنبثق
    return `
        <div class="driver-popup">
            <div class="driver-popup-header" style="text-align: center; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 215, 0, 0.3); margin-bottom: 10px;">
                <div class="popup-status" style="display: inline-block; padding: 3px 10px; margin-bottom: 10px; font-size: 12px; border-radius: 20px; background: ${statusColor}; color: ${isActive ? '#fff' : '#000'};">
                    ${statusText}
                </div>
                <img src="${driver.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527'}" 
                     alt="${driver.name}"
                     style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #FFD700; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; object-fit: cover;">
                <h4 style="font-size: 16px; margin: 5px 0; font-weight: bold; color: #FFFFFF;">${driver.name}</h4>
                <div class="driver-rating" style="margin-bottom: 10px;">
                    ${starsHtml}
                    <span style="margin-right: 5px; color: #FFFFFF;">${rating.toFixed(1)}</span>
                </div>
            </div>
            
            <div class="driver-popup-info" style="margin-bottom: 15px;">
                <div class="info-row" style="display: flex; align-items: center; margin-bottom: 5px; color: #FFFFFF;">
                    <i class="fas fa-car" style="margin-left: 10px; color: #FFD700;"></i>
                    <span>${driver.carType || 'غير محدد'} ${driver.carModel || ''}</span>
                </div>
                <div class="info-row" style="display: flex; align-items: center; margin-bottom: 5px; color: #FFFFFF;">
                    <i class="fas fa-map-marker-alt" style="margin-left: 10px; color: #FFD700;"></i>
                    <span>${driver.location || 'غير محدد'}</span>
                </div>
                <div class="info-row" style="display: flex; align-items: center; margin-bottom: 5px; color: #FFFFFF;">
                    <i class="fas fa-route" style="margin-left: 10px; color: #FFD700;"></i>
                    <span>${driver.trips || 0} رحلة</span>
                </div>
                ${driver.distance !== undefined ? `
                <div class="info-row" style="display: flex; align-items: center; margin-bottom: 5px; color: #FFFFFF;">
                    <i class="fas fa-ruler" style="margin-left: 10px; color: #FFD700;"></i>
                    <span>${driver.distance.toFixed(1)} كم</span>
                </div>
                ` : ''}
                ${arrivalTime}
            </div>
            
            <div class="driver-popup-actions" style="display: flex; justify-content: space-between; gap: 10px;">
                <button onclick="openChatWindow('${driver.id}')" 
                        class="chat-btn" 
                        style="flex: 1; padding: 8px 0; border-radius: 20px; background: #FFD700; color: #000; border: none; font-weight: bold; cursor: pointer;"
                        ${!isApproved ? 'disabled' : ''}>
                    <i class="fas fa-comment"></i>
                    مراسلة
                </button>
                <button onclick="viewDriverLocation('${driver.id}')" 
                        class="location-btn" 
                        style="flex: 1; padding: 8px 0; border-radius: 20px; background: ${isActive ? '#333' : '#555'}; color: #FFD700; border: 1px solid #FFD700; font-weight: bold; cursor: pointer;"
                        ${!isApproved ? 'disabled' : ''}>
                    <i class="fas fa-map-marker-alt"></i>
                    الموقع
                </button>
            </div>
            
            ${!isApproved ? `
            <div class="approval-notice" style="margin-top: 10px; padding: 5px; background: rgba(255, 0, 0, 0.1); border-radius: 5px; color: ${isPending ? '#FFD700' : '#FF4136'}; text-align: center; font-size: 12px;">
                ${isPending ? 'هذا السائق قيد المراجعة' : 'هذا السائق غير مفعل حالياً'}
            </div>
            ` : ''}
        </div>
    `;
}

// تحويل الدرجات إلى راديان
function toRad(degrees) {
    return degrees * Math.PI / 180;
}

// دالة مسح علامات السائقين
function clearPopupDriverMarkers() {
    if (!popupMarkerLayer) return;
    
    // حفظ علامة المستخدم
    let userMarker = null;
    popupMarkerLayer.eachLayer(layer => {
        if (layer.options.isUserMarker) {
            userMarker = layer;
        } else {
            popupMarkerLayer.removeLayer(layer);
        }
    });
    
    // إعادة إنشاء طبقة العلامات مع علامة المستخدم فقط
    popupMarkerLayer.clearLayers();
    
    if (userMarker) {
        userMarker.addTo(popupMarkerLayer);
    }
}
// دالة تهيئة الخريطة في النافذة المنبثقة
function initializePopupMap() {
    // التحقق من وجود مكتبة Leaflet
    if (typeof L === 'undefined') {
        const popupMap = document.getElementById('popupMap');
        if (popupMap) {
            popupMap.innerHTML = '<div class="map-error">عذراً، لا يمكن تحميل الخريطة. مكتبة Leaflet غير متوفرة.</div>';
        }
        return;
    }
    
    // إنشاء مرجع لعنصر الخريطة
    const popupMap = document.getElementById('popupMap');
    if (!popupMap) return;
    
    // بيانات الموقع الافتراضي (بغداد)
    const defaultLocation = [33.3152, 44.3661];
    
    // إنشاء خريطة جديدة
    popupMapInstance = L.map('popupMap', {
        center: defaultLocation,
        zoom: 12,
        zoomControl: false
    });
    
    // تعريف طبقات الخريطة المختلفة
    const layers = {
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19
        }),
        dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CartoDB',
            maxZoom: 19
        })
    };
    
    // إضافة الطبقة الافتراضية
    layers.street.addTo(popupMapInstance);
    
    // إضافة زر التحكم بالطبقات
    L.control.layers({
        "خريطة الشوارع": layers.street,
        "قمر صناعي": layers.satellite,
        "خريطة داكنة": layers.dark
    }, null, {
        position: 'topleft',
        collapsed: true
    }).addTo(popupMapInstance);
    
    // إضافة زر التكبير/التصغير
    L.control.zoom({
        position: 'bottomright',
        zoomInTitle: 'تكبير',
        zoomOutTitle: 'تصغير'
    }).addTo(popupMapInstance);
    
    // إضافة مقياس المسافة
    L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false,
        maxWidth: 200
    }).addTo(popupMapInstance);
    
    // إنشاء طبقة العلامات
    popupMarkerLayer = L.layerGroup().addTo(popupMapInstance);
    
    // محاولة نسخ العلامات من الخريطة الأصلية
    copyMarkersToPopupMap();
    
    // تحديث حجم الخريطة بعد التهيئة
    setTimeout(() => {
        popupMapInstance.invalidateSize();
    }, 300);
}

// دالة نسخ العلامات من الخريطة الأصلية إلى الخريطة المنبثقة
function copyMarkersToPopupMap() {
    try {
        if (!popupMapInstance || !popupMarkerLayer) return;
        
        // عرض مؤشر التحميل
        showPopupLoading();
        
        // تحميل بيانات السائقين من Firebase
        firebase.database().ref('drivers').once('value')
            .then(snapshot => {
                const drivers = [];
                
                snapshot.forEach(childSnapshot => {
                    const driver = childSnapshot.val();
                    const driverId = childSnapshot.key;
                    
                    if (driver && driver.coordinates) {
                        drivers.push({
                            ...driver,
                            id: driverId
                        });
                    }
                });
                
                // حفظ بيانات السائقين
                popupDriversData = drivers;
                
                // إضافة علامات السائقين إلى الخريطة
                drivers.forEach(driver => {
                    addPopupDriverMarker(driver);
                });
                
                // تحديث حدود الخريطة لتشمل جميع العلامات
                fitPopupMapToMarkers();
                
                hidePopupLoading();
            })
            .catch(error => {
                console.error('Error loading drivers:', error);
                hidePopupLoading();
                showPopupToast('حدث خطأ في تحميل بيانات السائقين', 'error');
            });
    } catch (error) {
        console.error('Error copying markers:', error);
        hidePopupLoading();
    }
}

// دالة إضافة علامة سائق إلى الخريطة المنبثقة
function addPopupDriverMarker(driver) {
    if (!popupMapInstance || !popupMarkerLayer || !driver.coordinates) return;
    
    // التحقق من حالة الموافقة
    const isApproved = driver.approved === true;
    const isPending = driver.approvalStatus === 'pending';
    const isActive = driver.active && isApproved;
    
    // تحديد لون المؤشر حسب الحالة
    const statusColor = isActive ? '#2ECC40' : '#FF4136';
    
    // إنشاء أيقونة مخصصة
    const icon = L.divIcon({
        className: 'popup-driver-marker',
        html: `
            <div class="driver-marker ${isActive ? 'active' : 'inactive'}">
                <div class="marker-pulse" style="border-color: ${statusColor}"></div>
                <div class="marker-container">
                    <img src="${driver.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527'}" 
                         alt="${driver.name}"
                         onerror="this.src='https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527';"
                         style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${statusColor}; object-fit: cover;">
                    <div class="marker-status" style="position: absolute; bottom: -2px; right: -2px; width: 15px; height: 15px; border-radius: 50%; background-color: ${statusColor}; border: 2px solid #fff;"></div>
                </div>
            </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 50]
    });

    // إنشاء المؤشر مع معلومات إضافية
    const marker = L.marker([driver.coordinates.lat, driver.coordinates.lng], {
        icon: icon,
        title: driver.name,
        driverId: driver.id,
        riseOnHover: true,
        zIndexOffset: isActive ? 1000 : 0
    });

    // إضافة النافذة المنبثقة المحسنة
    marker.bindPopup(createPopupDriverPopup(driver), {
        className: `popup-custom-driver ${isActive ? 'active' : 'inactive'}`,
        minWidth: 280,
        maxWidth: 320,
        autoClose: false,
        closeButton: true
    });

    // إضافة معالجات الأحداث
    marker.on('click', function() {
        // فتح النافذة المنبثقة
        this.openPopup();
    });

    // إضافة المؤشر إلى طبقة المؤشرات
    marker.addTo(popupMarkerLayer);

    return marker;
}

// دالة تحميل السائقين حسب المنطقة
function loadPopupDriversByLocation(location) {
    if (!popupMarkerLayer) return;
    
    // مسح جميع العلامات الحالية
    clearPopupDriverMarkers();
    
    // عرض مؤشر التحميل
    showPopupLoading();
    
    // فلترة السائقين حسب المنطقة
    let filteredDrivers = [];
    
    if (location === 'all') {
        // عرض جميع السائقين
        filteredDrivers = popupDriversData;
    } else {
        // فلترة السائقين حسب المنطقة المحددة
        filteredDrivers = popupDriversData.filter(driver => 
            driver.location && driver.location.includes(location)
        );
    }
    
    // إضافة العلامات المفلترة
    filteredDrivers.forEach(driver => {
        addPopupDriverMarker(driver);
    });
    
    // تحديث حدود الخريطة
    if (filteredDrivers.length > 0) {
        fitPopupMapToMarkers();
        showPopupToast(`تم عرض ${filteredDrivers.length} سائق في ${location === 'all' ? 'جميع المناطق' : location}`, 'info');
    } else {
        showPopupToast(`لا يوجد سائقين في ${location}`, 'warning');
    }
    
    hidePopupLoading();
}

// دالة ضبط حدود الخريطة لتشمل جميع العلامات
function fitPopupMapToMarkers() {
    if (!popupMapInstance || !popupMarkerLayer) return;
    
    const markers = popupMarkerLayer.getLayers();
    if (markers.length === 0) return;
    
    // استثناء علامة المستخدم من الحدود
    const driverMarkers = markers.filter(marker => !marker.options.isUserMarker);
    
    if (driverMarkers.length > 0) {
        const group = L.featureGroup(driverMarkers);
        popupMapInstance.fitBounds(group.getBounds(), {
            padding: [50, 50],
            maxZoom: 15
        });
    }
}

// دالة عرض مؤشر التحميل
function showPopupLoading() {
    // التحقق من وجود مؤشر تحميل سابق
    let loader = document.getElementById('popupMapLoader');
    
    if (!loader) {
        // إنشاء مؤشر تحميل جديد
        loader = document.createElement('div');
        loader.id = 'popupMapLoader';
        loader.className = 'popup-map-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-text">جاري التحميل...</div>
        `;
        
        // إضافة أنماط CSS
        const style = document.createElement('style');
        style.textContent = `
            .popup-map-loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 2000;
            }
            
            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255, 215, 0, 0.3);
                border-radius: 50%;
                border-top: 4px solid #FFD700;
                animation: spin 1s linear infinite;
                margin-bottom: 10px;
            }
            
            .loader-text {
                color: #FFD700;
                font-weight: bold;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // إضافة المؤشر إلى الخريطة
        const popupMap = document.getElementById('popupMap');
        if (popupMap) {
            popupMap.style.position = 'relative';
            popupMap.appendChild(loader);
        }
    } else {
        // إظهار المؤشر الموجود
        loader.style.display = 'flex';
    }
}

// دالة إخفاء مؤشر التحميل
function hidePopupLoading() {
    const loader = document.getElementById('popupMapLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// دالة عرض رسالة توست
function showPopupToast(message, type = 'info') {
    // التحقق من وجود مكتبة SweetAlert2
    if (typeof Swal !== 'undefined') {
        // تحديد الأيقونة حسب النوع
        let icon = 'info';
        switch (type) {
            case 'success': icon = 'success'; break;
            case 'error': icon = 'error'; break;
            case 'warning': icon = 'warning'; break;
            default: icon = 'info'; break;
        }
        
        // عرض رسالة SweetAlert
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            icon: icon,
            title: message,
            background: '#333',
            color: '#fff'
        });
    } else {
        // إنشاء عنصر توست بسيط
        const toast = document.createElement('div');
        toast.className = `popup-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        // إضافة أنماط CSS
        const style = document.createElement('style');
        style.textContent = `
            .popup-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 250px;
                max-width: 90%;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                opacity: 0;
                transform: translateY(-20px);
                animation: toastIn 0.3s ease forwards, toastOut 0.3s ease 2.7s forwards;
            }
            
            .toast-content {
                padding: 12px 15px;
                display: flex;
                align-items: center;
            }
            
            .popup-toast.info { background-color: #3498db; }
            .popup-toast.success { background-color: #2ecc71; }
            .popup-toast.warning { background-color: #f39c12; }
            .popup-toast.error { background-color: #e74c3c; }
            
            .toast-message {
                color: white;
                flex-grow: 1;
                font-weight: bold;
            }
            
            @keyframes toastIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes toastOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        
        // إضافة التوست إلى الصفحة
        document.body.appendChild(toast);
        
        // إزالة التوست بعد فترة
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
}

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تأخير بسيط لضمان تحميل جميع المكتبات
    setTimeout(createMapPopupButton, 1000);
});