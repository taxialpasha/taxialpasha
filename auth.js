// auth.js
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initialize();
    }

    initialize() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateUIWithUserData(this.currentUser);
        }
    }

    async handleRegistration(formData, userType) {
        try {
            const photoFile = formData.get('userPhoto') || formData.get('driverPhoto');
            let photoUrl = '';
            
            if (photoFile) {
                const storageRef = firebase.storage().ref();
                const photoRef = storageRef.child(`users/${Date.now()}_${photoFile.name}`);
                const uploadTask = await photoRef.put(photoFile);
                photoUrl = await uploadTask.ref.getDownloadURL();
            }

            const userData = {
                id: `USER_${Date.now()}`,
                name: formData.get('fullName'),
                photo: photoUrl,
                email: formData.get('email'),
                phone: formData.get('phone'),
                userType: userType,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // حفظ في Firebase
            await firebase.database().ref(`users/${userData.id}`).set(userData);

            // حفظ في التخزين المحلي
            localStorage.setItem('currentUser', JSON.stringify(userData));
            this.currentUser = userData;

            // تحديث واجهة المستخدم
            this.updateUIWithUserData(userData);

            // إغلاق النافذة المنبثقة
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });

            // إزالة backdrop بشكل يدوي
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            // إزالة class modal-open من body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            return true;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.resetUI();
        
        // إغلاق أي نوافذ منبثقة مفتوحة
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });

        // إزالة backdrop وإعادة تعيين حالة الصفحة
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // إظهار رسالة نجاح تسجيل الخروج
        showToast('تم تسجيل الخروج بنجاح');
    }

    updateUIWithUserData(userData) {
        // تحديث زر الملف الشخصي في الشريط العلوي
        const profileBtn = document.querySelector('.user-profile-btn');
        if (profileBtn) {
            profileBtn.innerHTML = `
                <img src="${userData.photo || 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527'}" 
                     alt="${userData.name}" 
                     class="rounded-circle me-2" 
                     style="width: 35px; height: 35px; object-fit: cover;">
                <span class="d-none d-md-inline">${userData.name}</span>
            `;
            
            profileBtn.setAttribute('data-bs-toggle', 'dropdown');
            profileBtn.setAttribute('aria-expanded', 'false');
            
            // إضافة قائمة منسدلة
            const dropdownMenu = document.createElement('ul');
            dropdownMenu.className = 'dropdown-menu dropdown-menu-end';
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>الملف الشخصي</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="authManager.handleLogout()">
                    <i class="fas fa-sign-out-alt me-2"></i>تسجيل الخروج
                </a></li>
            `;
            profileBtn.parentElement.appendChild(dropdownMenu);
        }

        // تحديث الشريط الجانبي
        const sideNavUserInfo = document.querySelector('.side-nav-user-info');
        if (sideNavUserInfo) {
            sideNavUserInfo.innerHTML = `
                <div class="text-center p-4">
                    <img src="${userData.photo || 'https://firebasestorage.googleapis.com/v0/b/messageemeapp.appspot.com/o/driver-images%2F7605a607-6cf8-4b32-aee1-fa7558c98452.png?alt=media&token=5cf9e67c-ba6e-4431-a6a0-79dede15b527'}" 
                         alt="${userData.name}" 
                         class="rounded-circle mb-3"
                         style="width: 80px; height: 80px; object-fit: cover; border: 3px solid #FFD700;">
                    <h6 class="text-white mb-1">${userData.name}</h6>
                    <span class="badge bg-primary mb-3">${userData.userType}</span>
                    <button onclick="authManager.handleLogout()" 
                            class="btn btn-danger btn-sm w-100">
                        <i class="fas fa-sign-out-alt me-2"></i>تسجيل الخروج
                    </button>
                </div>
            `;
        }
    }

    resetUI() {
        const profileBtn = document.querySelector('.user-profile-btn');
        if (profileBtn) {
            profileBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span class="ms-1 d-none d-md-inline">تسجيل</span>
            `;
            profileBtn.setAttribute('data-bs-toggle', 'modal');
            profileBtn.setAttribute('data-bs-target', '#profileModal');
            
            const dropdownMenu = profileBtn.parentElement.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.remove();
            }
        }

        const sideNavUserInfo = document.querySelector('.side-nav-user-info');
        if (sideNavUserInfo) {
            sideNavUserInfo.innerHTML = '';
        }
    }
}

// إنشاء نسخة عالمية من مدير المصادقة
window.authManager = new AuthManager();