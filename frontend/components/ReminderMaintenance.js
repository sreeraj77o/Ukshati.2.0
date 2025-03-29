import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiAlertCircle, FiUser, FiClock, FiCalendar, FiMessageSquare, FiTrash2 } from 'react-icons/fi';

const ReminderMaintenance = () => {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    message: '',
    date: '',
    time: '',
    customerId: ''
  });

  // Service Worker Setup
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(reg => {
          console.log('Service Worker registered');
          reg.update();
        })
        .catch(err => console.error('SW registration failed:', err));

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'REMINDER_TRIGGERED') {
          new Audio(event.data.sound).play().catch(console.error);
          setReminders(prev => prev.filter(r => r.rid !== event.data.reminder.rid));
        }
      });
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, remindersRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/reminders')
        ]);

        const [customersData, remindersData] = await Promise.all([
          customersRes.json(),
          remindersRes.json()
        ]);

        setCustomers(customersData.customers || []);
        setReminders(remindersData);
      } catch (error) {
        showError('Loading Error', 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showError = (title, message) => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      background: '#1f2937',
      color: '#fff'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save reminder');

      setReminders(prev => [...prev, data]);
      setFormData({ message: '', date: '', time: '', customerId: '' });
      
      Swal.fire({
        icon: 'success',
        title: 'Reminder Added!',
        text: 'Notification will appear at scheduled time',
        background: '#1f2937',
        color: '#fff'
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        text: error.message,
        background: '#1f2937',
        color: '#fff'
      });
    }
  };

  const deleteReminder = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete Reminder?',
      text: "This cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#1f2937',
      color: '#fff'
    });

    if (isConfirmed) {
      try {
        await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' });
        setReminders(prev => prev.filter(r => r.rid !== id));
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message,
          background: '#1f2937',
          color: '#fff'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* UI remains same as previous implementation */}
    </div>
  );
};

export default ReminderMaintenance;