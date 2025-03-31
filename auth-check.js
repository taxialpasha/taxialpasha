// دالة معدلة لفتح نافذة المحادثة مع التحقق من تسجيل الدخول
function openChatWindow(driverId, driverImage, driverName, driverCard) {
    // التحقق من حالة تسجيل الدخول أولاً
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // إذا لم يكن المستخدم مسجل الدخول، نعرض نافذة تسجيل الدخول
        showLoginPrompt('يجب تسجيل الدخول أو إنشاء حساب للتمكن من مراسلة السائق');
        return;
    }
    
    currentChatDriverId = driverId;
    currentDriverImage = driverImage || '';
    currentDriverName = driverName || '';
    currentDriverCard = driverCard || '';

    // تحديث بيانات السائق في النافذة
    const driverImageEl = document.getElementById('driverImage');
    const driverNameEl = document.getElementById('driverName');
    const driverCardInfoEl = document.getElementById('driverCardInfo');
    
    if (driverImageEl) driverImageEl.src = driverImage || 'default-driver.png';
    if (driverNameEl) driverNameEl.textContent = driverName || 'السائق';
    if (driverCardInfoEl) driverCardInfoEl.textContent = driverCard ? `بطاقة: ${driverCard}` : '';

    // تحديث بيانات المستخدم المسجل الدخول في رأس نافذة المحادثة
    const userName = currentUser.fullName || currentUser.name || 'المستخدم';
    const userPhoto = currentUser.photoUrl || 'default-avatar.png';

    let userInfoEl = document.getElementById('userInfoInChat');
    if (!userInfoEl) {
        // إنشاء عنصر جديد إذا لم يكن موجودًا وإضافته إلى رأس المحادثة
        userInfoEl = document.createElement('div');
        userInfoEl.id = 'userInfoInChat';
        userInfoEl.style.display = 'flex';
        userInfoEl.style.alignItems = 'center';
        userInfoEl.style.gap = '8px';
        // إضافته بعد معلومات السائق
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.appendChild(userInfoEl);
        }
    }
    userInfoEl.innerHTML = `
        <img src="${userPhoto}" alt="صورة المستخدم" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
        <span style="color: #fff; font-weight: bold;">${userName}</span>
    `;

    // إعادة ضبط النافذة: إظهار إدخال الرحلة
    const tripSelection = document.getElementById('tripSelection');
    const chatFooter = document.querySelector('.chat-footer');
    const chatMessages = document.getElementById('chatMessages');
    
    if (tripSelection) tripSelection.classList.remove('d-none');
    if (chatFooter) chatFooter.classList.add('d-none');
    if (chatMessages) chatMessages.classList.add('d-none');

    // إظهار النافذة
    const chatModalEl = document.getElementById('chatModal');
    if (chatModalEl) {
        const chatModal = new bootstrap.Modal(chatModalEl);
        chatModal.show();
    }
}

// دالة للتحقق من حالة تسجيل الدخول قبل القيام بأي إجراء يتطلب تسجيل الدخول
function checkAuthBeforeAction(action, message) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // إذا لم يكن المستخدم مسجل الدخول، نعرض نافذة تسجيل الدخول
        showLoginPrompt(message || 'يجب تسجيل الدخول أو إنشاء حساب للقيام بهذا الإجراء');
        return false;
    }
    
    // إذا كان المستخدم مسجل الدخول، نقوم بتنفيذ الإجراء
    if (typeof action === 'function') {
        action();
    }
    
    return true;
}

// دالة عرض نافذة تأكيد تسجيل الدخول
function showLoginPrompt(message) {
    Swal.fire({
        title: 'مطلوب تسجيل الدخول',
        text: message || 'يجب تسجيل الدخول أو إنشاء حساب للمتابعة',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'تسجيل الدخول',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#FFD700',
        cancelButtonColor: '#6c757d',
        background: '#1a1a1a',
        color: '#FFFFFF',
        showDenyButton: true,
        denyButtonText: 'إنشاء حساب',
        denyButtonColor: '#28a745'
    }).then((result) => {
        if (result.isConfirmed) {
            // فتح نافذة تسجيل الدخول
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        } else if (result.isDenied) {
            // فتح نافذة إنشاء حساب
            const regModal = new bootstrap.Modal(document.getElementById('userRegistrationModal'));
            regModal.show();
        }
    });
}

// تعديل دالة viewDriverLocation للتحقق من تسجيل الدخول أيضًا
function viewDriverLocation(driverId) {
    // التحقق من حالة تسجيل الدخول للاطلاع على موقع السائق (اختياري)
    // يمكنك التعليق على هذا التحقق إذا كنت ترغب بعرض الموقع بدون تسجيل دخول
    
    /*
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showLoginPrompt('يجب تسجيل الدخول أو إنشاء حساب للاطلاع على موقع السائق');
        return;
    }
    */
    
    database.ref(`drivers/${driverId}`).once('value', (snapshot) => {
        const driver = snapshot.val();
        if (driver && driver.coordinates) {
            // التحقق من حالة الموافقة
            const isApproved = driver.approved === true;
            const isPending = driver.approvalStatus === 'pending';
            const { lat, lng } = driver.coordinates;

            map.flyTo([lat, lng], 15, {
                animate: true,
                duration: 1.5
            });

            markerLayer.clearLayers();

            // تعديل مظهر العلامة حسب حالة الموافقة
            const driverMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    html: `
                        <div style="position: relative; text-align: center;" class="${isApproved ? 'approved' : (isPending ? 'pending' : 'not-approved')}">
                            <img src="${driver.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527'}" 
                                 alt="صورة السائق" 
                                 style="width: 50px; height: 50px; border: 3px solid #FFD700; 
                                 border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                                 filter: ${!isApproved ? 'grayscale(100%)' : 'none'};
                                 opacity: ${!isApproved ? '0.7' : '1'};">
                            <i class="fas fa-taxi" 
                               style="position: absolute; bottom: -5px; right: 50%; transform: translateX(50%); 
                               color: ${isApproved ? '#FFD700' : '#999'}; font-size: 1.5rem;"></i>
                            ${!isApproved ? `
                            <div class="status-badge" style="position: absolute; top: -10px; right: -10px; 
                                 background: ${isPending ? '#FFD700' : '#dc3545'}; color: ${isPending ? '#000' : '#fff'};
                                 padding: 3px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">
                                ${isPending ? 'قيد المراجعة' : 'غير مفعل'}
                            </div>` : ''}
                        </div>
                    `,
                    className: 'driver-marker',
                    iconSize: [60, 60],
                    iconAnchor: [25, 50]
                }),
            }).addTo(markerLayer);

            // تحديث محتوى النافذة المنبثقة
            const popupContent = `
                <div style="text-align: center; font-family: 'Segoe UI', sans-serif; min-width: 200px; 
                     background: #000000; border-radius: 10px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    ${!isApproved ? `
                    <div class="status-banner" style="background: ${isPending ? '#FFD700' : '#dc3545'}; 
                         color: ${isPending ? '#000' : '#fff'}; padding: 5px; margin: -15px -15px 15px -15px; 
                         border-radius: 10px 10px 0 0; font-weight: bold;">
                        ${isPending ? 'هذا السائق قيد المراجعة' : 'هذا السائق غير مفعل حالياً'}
                    </div>
                    ` : ''}
                    
                    <div class="driver-popup-header" style="margin-bottom: 10px;">
                        <img src="${driver.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527'}" 
                             alt="صورة السائق" 
                             style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #FFD700; 
                             margin-bottom: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                             filter: ${!isApproved ? 'grayscale(100%)' : 'none'};">
                        <h5 style="color: #FFFFFF; font-weight: bold; margin: 8px 0;">${driver.name}</h5>
                    </div>
                    
                    <div class="driver-popup-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 15px;">
                        <div style="text-align: center;">
                            <div style="font-weight: bold; color: #FFD700;">
                                <i class="fas fa-star"></i> ${driver.rating ? driver.rating.toFixed(1) : '5.0'}
                            </div>
                            <div style="font-size: 0.8rem; color: #FFFFFF;">التقييم</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-weight: bold; color: #FFD700;">
                                <i class="fas fa-route"></i> ${driver.trips || 0}
                            </div>
                            <div style="font-size: 0.8rem; color: #FFFFFF;">الرحلات</div>
                        </div>
                    </div>
                    
                    <div class="driver-popup-info" style="margin-bottom: 15px; text-align: right; color: #FFFFFF;">
                        <p style="margin: 5px 0;">
                            <i class="fas fa-car" style="color: #FFD700; margin-left: 5px;"></i>
                            ${driver.carType} - ${driver.carModel}
                        </p>
                        <p style="margin: 5px 0;">
                            <i class="fas fa-map-marker-alt" style="color: #FFD700; margin-left: 5px;"></i>
                            ${driver.location}
                        </p>
                        <p style="margin: 5px 0;">
                            <i class="fas fa-phone" style="color: #FFD700; margin-left: 5px;"></i>
                            ${driver.phone}
                        </p>
                    </div>
            
                    <div class="driver-popup-actions" style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                        <button onclick="openChatWindow('${driverId}')" 
                                style="background: #FFD700; color: #333; border: none; padding: 8px 15px; 
                                border-radius: 20px; cursor: ${isApproved ? 'pointer' : 'not-allowed'}; 
                                font-weight: bold; display: flex; align-items: center; justify-content: center; 
                                gap: 5px; transition: all 0.3s ease; opacity: ${isApproved ? '1' : '0.5'};"
                                ${!isApproved ? 'disabled' : ''}>
                            <i class="fas fa-comment"></i>
                            ${isApproved ? 'مراسلة السائق' : 'غير متاح حالياً'}
                        </button>
                    </div>

                    ${!isApproved ? `
                        <div class="approval-notice">
                            ${isPending ?
                                'هذا السائق قيد المراجعة. سيتم تفعيل الحساب قريباً.' :
                                'هذا الحساب غير مفعل. يرجى انتظار الموافقة.'}
                        </div>
                    ` : ''}
                </div>
            `;

            driverMarker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            }).openPopup();

            scrollToMap();

            // تعديل رسالة التأكيد حسب حالة الموافقة
            if (isApproved) {
                Swal.fire({
                    title: '🚖 تم تحديد موقع السائق!',
                    html: `
                        <p style="font-size: 1rem; color: #555;">
                            السائق <b>${driver.name}</b> بانتظارك.
                        </p>
                        <p style="color: #666;">هل ترغب بمراسلته الآن؟</p>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#FFD700',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '📨 نعم، مراسلة السائق',
                    cancelButtonText: '❌ إغلاق',
                }).then((result) => {
                    if (result.isConfirmed) {
                        openChatWindow(driverId);
                    }
                });
            } else {
                Swal.fire({
                    title: 'تنبيه!',
                    html: `
                        <p style="font-size: 1rem; color: #555;">
                            السائق <b>${driver.name}</b> ${isPending ? 'قيد المراجعة' : 'غير مفعل حالياً'}.
                        </p>
                        <p style="color: #666;">لا يمكن التواصل مع السائق حتى يتم تفعيل حسابه.</p>
                    `,
                    icon: 'warning',
                    confirmButtonColor: '#6c757d',
                    confirmButtonText: 'حسناً'
                });
            }
        } else {
            showToast('لم يتم العثور على موقع السائق.', 'error');
        }
    });
}

// تعديل باقي دوال التفاعل مع السائق للتحقق من تسجيل الدخول
function bookDriver(driverId) {
    // التحقق من حالة تسجيل الدخول لحجز السائق
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showLoginPrompt('يجب تسجيل الدخول أو إنشاء حساب لحجز السائق');
        return;
    }
    
    showLoading();
    database.ref(`drivers/${driverId}`).once('value', (snapshot) => {
        const driver = snapshot.val();
        if (driver && driver.active) {
            setTimeout(() => {
                hideLoading();
                database.ref(`drivers/${driverId}`).update({
                    active: false // تعيين الحالة إلى "مشغول"
                }).then(() => {
                    showToast(`تم إرسال طلب الحجز إلى ${driver.name}`);
                    window.location.href = `tel:${driver.phone}`;
                    loadDrivers(); // تحديث حالة السائقين في الواجهة
                });
            }, 1500);
        } else {
            hideLoading();
            showToast('السائق غير متاح حالياً', 'error');
        }
    });
}

// تعديل دالة الإضافة إلى المفضلة للتحقق من تسجيل الدخول
function addToFavorites(driverId) {
    // التحقق من حالة تسجيل الدخول للإضافة إلى المفضلة
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showLoginPrompt('يجب تسجيل الدخول أو إنشاء حساب لإضافة السائق إلى المفضلة');
        return;
    }
    
    const driverCard = document.querySelector(`[data-driver-id="${driverId}"]`);
    if (driverCard) {
        const favoritesContainer = document.getElementById('favoritesContainer');
        if (favoritesContainer) {
            const clonedCard = driverCard.cloneNode(true);
            favoritesContainer.appendChild(clonedCard);
            showToast('تمت إضافة السائق إلى المفضلة', 'success');
            
            // حفظ إلى التخزين المحلي أو قاعدة البيانات
            saveFavoriteDriver(driverId, currentUser.uid);
        } else {
            showToast('خطأ في إضافة السائق إلى المفضلة', 'error');
        }
    }
}

// دالة حفظ السائق المفضل إلى قاعدة البيانات
function saveFavoriteDriver(driverId, userId) {
    database.ref(`favorites/${userId}/${driverId}`).set({
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log('تم حفظ السائق في المفضلة');
    }).catch(error => {
        console.error('خطأ في حفظ السائق المفضل:', error);
    });
}