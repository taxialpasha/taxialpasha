// في ملف firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
    authDomain: "messageemeapp.firebaseapp.com",
    databaseURL: "https://messageemeapp-default-rtdb.firebaseio.com",
    projectId: "messageemeapp",
    storageBucket: "messageemeapp.appspot.com",
    messagingSenderId: "255034474844",
    appId: "1:255034474844:web:5e3b7a6bc4b2fb94cc4199"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase services
const database = firebase.database();
const messaging = firebase.messaging();

// Configure FCM with VAPID key
messaging.usePublicVapidKey('BI9cpoewcZa1ftyZ_bGjO0GYa4_cT0HNja4YFd6FwLwHg5c0gQ5iSj_MJZRhMxKdgJ0-d-_rEXcpSQ_cx7GqCSc');

// دالة لتحديث token الإشعارات للمستخدم
async function updateNotificationToken(userId) {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await messaging.getToken();
            await database.ref(`users/${userId}/notificationToken`).set(token);
            console.log('تم تحديث token الإشعارات بنجاح');
        }
    } catch (error) {
        console.error('خطأ في تحديث token الإشعارات:', error);
    }
}

// الاستماع لتحديثات الـ token
messaging.onTokenRefresh(async () => {
    try {
        const token = await messaging.getToken();
        const userId = localStorage.getItem('userId');
        if (userId) {
            await database.ref(`users/${userId}/notificationToken`).set(token);
        }
    } catch (error) {
        console.error('Error updating notification token:', error);
    }
});

// معالجة الإشعارات عندما يكون التطبيق مفتوحاً
messaging.onMessage((payload) => {
    console.log('Message received:', payload);
    
    // إنشاء وإظهار الإشعار
    const notification = payload.notification;
    locationNotificationSystem.showInAppNotification({
        title: notification.title,
        body: notification.body,
        icon: notification.icon
    });

    // تشغيل صوت الإشعار
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(error => console.log('Unable to play notification sound:', error));
});

// دالة للتحقق من صلاحيات الموقع
async function checkLocationPermission() {
    if ('permissions' in navigator) {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state === 'granted';
        } catch (error) {
            console.error('خطأ في التحقق من صلاحيات الموقع:', error);
            return false;
        }
    }
    return !!navigator.geolocation;
}

// Register Service Worker for background notifications
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            messaging.useServiceWorker(registration);
            console.log('Service Worker registered successfully');
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}
// تصدير المتغيرات والدوال
export { handleUserRegistration, handleDriverRegistration };