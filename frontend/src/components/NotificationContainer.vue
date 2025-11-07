<template>
  <div class="notifications-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          {{ getIcon(notification.type) }}
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { notifications, removeNotification } from '../utils/notifications';

export default {
  name: 'NotificationContainer',
  setup() {
    const getIcon = (type) => {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      return icons[type] || icons.info;
    };

    return {
      notifications,
      removeNotification,
      getIcon
    };
  }
};
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  pointer-events: none;
}

.notification {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  pointer-events: all;
  min-width: 320px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #28a745;
  background: linear-gradient(to right, #d4edda 0%, white 10%);
}

.notification-error {
  border-left-color: #dc3545;
  background: linear-gradient(to right, #f8d7da 0%, white 10%);
}

.notification-warning {
  border-left-color: #ffc107;
  background: linear-gradient(to right, #fff3cd 0%, white 10%);
}

.notification-info {
  border-left-color: #17a2b8;
  background: linear-gradient(to right, #d1ecf1 0%, white 10%);
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #555;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

/* Animations */
.notification-enter-active {
  animation: slideIn 0.3s ease-out;
}

.notification-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .notifications-container {
    top: 70px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification {
    min-width: auto;
    width: 100%;
  }

  .notification:hover {
    transform: none;
  }
}
</style>
