// components/NotificationHandler.js
"use client";
import { useEffect } from 'react';
import NotificationService from '@/lib/notifications';
import Swal from 'sweetalert2';

const NotificationHandler = () => {
  useEffect(() => {
    if (!NotificationService.isSupported()) return;

    const handleReminderEvent = (event) => {
      const { reminder } = event.detail || {};
      if (!reminder) return;

      // Show in-app alert
      Swal.fire({
        title: 'Reminder!',
        html: `
          <div class="text-left">
            <p class="font-semibold">${reminder.cname || 'Customer'}</p>
            <p class="mt-2">${reminder.message || 'No message'}</p>
            <p class="text-sm text-gray-500 mt-2">
              ${reminder.reminder_date || ''} at ${reminder.reminder_time || ''}
            </p>
          </div>
        `,
        icon: 'info',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });

      // Show system notification if permitted
      if (NotificationService.getPermission() === 'granted') {
        NotificationService.show(
          `Reminder: ${reminder.cname || 'Customer'}`,
          { body: reminder.message || 'No message' }
        );
      }
    };

    window.addEventListener('reminder', handleReminderEvent);
    return () => window.removeEventListener('reminder', handleReminderEvent);
  }, []);

  return null;
};

export default NotificationHandler;