"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import { FiAlertCircle, FiUser, FiClock, FiCalendar, FiMessageSquare, FiTrash2, FiPlus, FiBell } from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import { FormSkeleton, TableSkeleton } from "@/components/skeleton";

const ReminderMaintenance = () => {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    date: '',
    time: '',
    customerId: ''
  });
  const [activeTab, setActiveTab] = useState('upcoming');

  // Memoized filtered reminders
  const filteredReminders = useMemo(() => {
    const now = new Date();
    return reminders
      .filter(reminder => {
        const reminderDate = new Date(reminder.datetime);
        return activeTab === 'upcoming' ? reminderDate > now :
              activeTab === 'past' ? reminderDate <= now : true;
      })
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }, [reminders, activeTab]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (!("Notification" in window)) {
        showError("Notifications Not Supported", "Your browser doesn't support notifications");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationsEnabled(true);
        showSuccess("Notifications Enabled", "You'll receive reminder notifications");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showError("Notifications Disabled", "You won't receive reminder notifications");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }, []);

  // Handle reminder notifications
  const setupNotificationListener = useCallback(() => {
    if (!navigator.serviceWorker.controller) return;

    const messageHandler = (event) => {
      if (event.data?.type === 'REMINDER_DUE') {
        const reminder = event.data.reminder;

        if (Notification.permission === 'granted') {
          new Notification('Reminder', {
            body: `${reminder.message} for ${reminder.cname}`,
            icon: '/favicon.ico',
            tag: `reminder-${reminder.rid}`,
            requireInteraction: true
          });
        }

        Swal.fire({
          icon: 'info',
          title: 'Reminder Due',
          text: `${reminder.message} for ${reminder.cname}`,
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);
    return () => navigator.serviceWorker.removeEventListener('message', messageHandler);
  }, []);

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let registration;
      const registerSW = async () => {
        try {
          registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered with scope:', registration.scope);
          setupNotificationListener();

          const readyRegistration = await navigator.serviceWorker.ready;
          if (readyRegistration.active) {
            readyRegistration.active.postMessage('startBackgroundChecks');
            if (Notification.permission === 'granted') {
              setNotificationsEnabled(true);
            }
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerSW();
      return () => {
        if (registration) registration.unregister();
      };
    }
  }, [setupNotificationListener]);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch('/api/reminders');
      if (!response.ok) throw new Error('Failed to load reminders');
      const remindersData = await response.json();
      setReminders(Array.isArray(remindersData) ? remindersData : []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch customers
        const customersRes = await fetch('/api/customers');
        if (!customersRes.ok) throw new Error('Failed to load customers');
        const customersData = await customersRes.json();
        if (isMounted) setCustomers(customersData.customers || []);

        // Fetch reminders
        await fetchReminders();
      } catch (error) {
        showError('Loading Error', 'Failed to load initial data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [fetchReminders]);

  const showError = useCallback((title, message) => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#4f46e5'
    });
  }, []);

  const showSuccess = useCallback((title, message) => {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#4f46e5'
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formData.message,
          reminder_date: formData.date,
          reminder_time: formData.time,
          cid: formData.customerId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save reminder');

      await showSuccess('Reminder Added!', 'Your reminder has been scheduled successfully');
      window.location.reload();

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        text: error.message,
        background: '#1a1a2e',
        color: '#fff'
      });
    }
  }, [formData, showSuccess]);

  const deleteReminder = useCallback(async (rid) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete Reminder?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      background: '#1a1a2e',
      color: '#fff'
    });

    if (isConfirmed) {
      try {
        const response = await fetch(`/api/reminders?rid=${rid}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete reminder');

        await showSuccess('Deleted!', 'Reminder has been deleted');
        window.location.reload();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message,
          background: '#1a1a2e',
          color: '#fff'
        });
      }
    }
  }, [showSuccess]);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 relative bg-black">

      <div className="absolute top-4 left-4 z-10">
        <BackButton route='/crm/home' />
      </div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative z-10 pt-20">

        <div className="text-center space-y-4 px-2 sm:px-4 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">
            Reminder Management
          </h1>

          <button
            onClick={requestNotificationPermission}
            className={`mt-4 inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium rounded-full shadow-sm transition-colors ${
              notificationsEnabled
                ? 'bg-green-700 hover:bg-green-800 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <FiBell className="mr-2 text-sm sm:text-base" />
            {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-4 mt-4">
          {/* Create Reminder Form - Always full width on mobile, then becomes sidebar on xl+ */}
          <div className="xl:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-4 md:p-6 border border-gray-700/50">
              <div className="flex items-center mb-5 sm:mb-6 md:mb-8">
                <FiPlus className="text-indigo-500 mr-3 text-xl sm:text-2xl" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                  Create New Reminder
                </h2>
              </div>

              {loading ? (
                <FormSkeleton fields={4} />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">
                      <FiUser className="inline mr-1 sm:mr-2" />
                      Customer
                    </label>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white text-sm sm:text-base"
                      required
                    >
                      <option value="">Select a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.cid} value={customer.cid}>
                          {customer.cname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300">
                      <FiMessageSquare className="inline mr-1 sm:mr-2" />
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white text-sm sm:text-base"
                      rows="3"
                      placeholder="Enter reminder message..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300">
                        <FiCalendar className="inline mr-1 sm:mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300">
                        <FiClock className="inline mr-1 sm:mr-2" />
                        Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-white text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 sm:py-3 rounded-lg transition-all duration-200 mt-2 sm:mt-4 shadow-md sm:shadow-lg hover:shadow-indigo-500/20 text-sm sm:text-base"
                  >
                    Schedule Reminder
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Reminders List - Full width on mobile, then 2/3 on xl+ */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-4 md:p-6 border border-gray-700/50 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 md:mb-8 gap-2 sm:gap-0">
                <div className="flex items-center">
                  <FiAlertCircle className="text-indigo-500 mr-3 text-xl sm:text-2xl" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                    Your Reminders
                  </h2>
                </div>

                <div className="flex space-x-1 sm:space-x-2 bg-gray-700/50 rounded-lg p-1">
                  {['upcoming', 'past', 'all'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                        activeTab === tab
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={5} columns={3} />
                </div>
              ) : filteredReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <FiAlertCircle className="text-gray-500 text-3xl sm:text-4xl mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-300">No reminders found</h3>
                  <p className="text-gray-500 mt-1 text-xs sm:text-sm">
                    {activeTab === 'upcoming'
                      ? "You don't have any upcoming reminders"
                      : activeTab === 'past'
                        ? "No past reminders found"
                        : "No reminders created yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredReminders.map(reminder => {
                    const reminderDate = new Date(reminder.datetime);
                    const isPast = reminderDate <= new Date();

                    return (
                      <div
                        key={reminder.rid}
                        className={`bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 hover:bg-gray-600/50 border-l-4 ${
                          isPast ? 'border-red-500/50' : 'border-indigo-500/50'
                        }`}
                      >
                        <div className="flex-1 space-y-1 sm:space-y-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiUser className="text-indigo-400 text-sm sm:text-base" />
                            <h3 className="font-medium text-white text-sm sm:text-base">{reminder.cname}</h3>
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <FiMessageSquare className="text-indigo-400 mt-0.5 sm:mt-1 text-sm sm:text-base" />
                            <p className="text-gray-300 text-xs sm:text-sm">{reminder.message}</p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FiClock className="text-indigo-400 text-sm sm:text-base" />
                            <p className={`text-xs sm:text-sm ${isPast ? 'text-red-400' : 'text-indigo-400'}`}>
                              {reminderDate.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {isPast && (
                                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-red-900/30 text-red-400 text-xxs sm:text-xs rounded-full">
                                  Past Due
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.rid)}
                          className="text-red-400 hover:text-red-300 p-1 sm:p-2 rounded-lg hover:bg-gray-600 transition-colors self-end sm:self-auto"
                        >
                          <FiTrash2 className="text-lg sm:text-xl" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderMaintenance;