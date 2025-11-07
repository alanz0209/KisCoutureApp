// Système de notifications pour remplacer les alert()
import { ref } from 'vue';

export const notifications = ref([]);

let notificationId = 0;

export function showNotification(title, message, type = 'info', duration = 4000) {
  const id = notificationId++;
  
  const notification = {
    id,
    title,
    message,
    type, // 'success', 'error', 'warning', 'info'
    show: true
  };

  notifications.value.push(notification);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }

  // Request notification permission for mobile
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Show native notification if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    const icon = getIconForType(type);
    new Notification(title, {
      body: message,
      icon: icon,
      badge: icon,
      tag: `kis-couture-${id}`,
      requireInteraction: false,
      silent: false
    });
  }

  return id;
}

export function removeNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
}

function getIconForType(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.info;
}

// Request notification permission on app load
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
}
