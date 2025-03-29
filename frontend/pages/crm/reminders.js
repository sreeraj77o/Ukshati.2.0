"use client";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiAlertCircle, FiUser, FiClock, FiCalendar, FiMessageSquare, FiTrash2, FiPlus } from 'react-icons/fi';
import StarryBackground from '@/components/StarryBackground';
import BackButton from '@/components/BackButton';

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
  const [activeTab, setActiveTab] = useState('upcoming');

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/crm/reminder' })
        .then(registration => {
          console.log('Service Worker registered');
          return navigator.serviceWorker.ready;
        })
        .then(registration => {
          registration.active.postMessage('startBackgroundChecks');
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, remindersRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/reminders')
        ]);

        if (!customersRes.ok || !remindersRes.ok) throw new Error('Failed to load data');
        
        const customersData = await customersRes.json();
        const remindersData = await remindersRes.json();

        // Ensure we're working with arrays
        setCustomers(Array.isArray(customersData.customers) ? customersData.customers : []);
        setReminders(Array.isArray(remindersData) ? remindersData : []);
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
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#4f46e5'
    });
  };

  const showSuccess = (title, message) => {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#4f46e5'
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
        body: JSON.stringify({
          message: formData.message,
          reminder_date: formData.date,
          reminder_time: formData.time,
          cid: formData.customerId
        })
      });
      window.location.reload();
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save reminder');
      }

      // Update local state instead of reloading
      const [newReminder] = await fetch('/api/reminders').then(res => res.json());
      setReminders(newReminder);
      
      // Reset form
      setFormData({
        message: '',
        date: '',
        time: '',
        customerId: ''
      });

      showSuccess('Reminder Added!', 'Your reminder has been scheduled successfully');

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        html: `<div class="text-left">
                <p>${error.message}</p>
                ${error.details ? `<p class="text-sm text-gray-500 mt-2">${error.details}</p>` : ''}
              </div>`,
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const deleteReminder = async (rid) => {
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
        
        if (!response.ok) {
          throw new Error('Failed to delete reminder');
        }
        window.location.reload();
        // Update local state
        setReminders(prev => prev.filter(r => r.rid !== Number(rid)));
        
        showSuccess('Deleted!', 'Reminder has been deleted');
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
  };

  // Filter reminders based on active tab
  const filteredReminders = Array.isArray(reminders) ? reminders.filter(reminder => {
    const now = new Date();
    const reminderDate = new Date(reminder.datetime);
    
    if (activeTab === 'upcoming') {
      return reminderDate > now;
    } else if (activeTab === 'past') {
      return reminderDate <= now;
    }
    return true;
  }) : [];

  // Sort reminders by date
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    return new Date(a.datetime) - new Date(b.datetime);
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <BackButton route='/crm/home'/>
      <StarryBackground/>
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Reminder Management
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Schedule and manage customer reminders efficiently
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-700/50">
              <div className="flex items-center mb-6">
                <FiPlus className="text-indigo-500 mr-2 text-xl" />
                <h2 className="text-xl font-semibold text-white">
                  Create New Reminder
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Select */}
                <div className="space-y-2">
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-300">
                    <FiUser className="inline mr-2" />
                    Customer
                  </label>
                  <select
                    id="customerId"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white appearance-none"
                    disabled={loading}
                    required
                  >
                    <option value="" className="text-gray-400">Select a customer...</option>
                    {loading ? (
                      <option disabled className="text-gray-400">Loading customers...</option>
                    ) : (
                      customers.map(customer => (
                        <option 
                          key={customer.cid} 
                          value={customer.cid}
                          className="bg-gray-800 text-white"
                        >
                          {customer.cname}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    <FiMessageSquare className="inline mr-2" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                    rows="3"
                    placeholder="Enter reminder message..."
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                      <FiCalendar className="inline mr-2" />
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300">
                      <FiClock className="inline mr-2" />
                      Time
                    </label>
                    <input
                      id="time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center mt-4 shadow-lg hover:shadow-indigo-500/20"
                >
                  Schedule Reminder
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Reminders List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-gray-700/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FiAlertCircle className="text-indigo-500 mr-2 text-xl" />
                  <h2 className="text-xl font-semibold text-white">
                    Your Reminders
                  </h2>
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-2 bg-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      activeTab === 'upcoming' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      activeTab === 'past' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Past
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      activeTab === 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-400">Loading reminders...</p>
                </div>
              ) : sortedReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiAlertCircle className="text-gray-500 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-300">No reminders found</h3>
                  <p className="text-gray-500 mt-1">
                    {activeTab === 'upcoming' 
                      ? "You don't have any upcoming reminders" 
                      : activeTab === 'past' 
                        ? "No past reminders found" 
                        : "No reminders created yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedReminders.map(reminder => {
                    const reminderDate = new Date(reminder.datetime);
                    const now = new Date();
                    const isPast = reminderDate <= now;
                    
                    return (
                      <div 
                        key={reminder.rid} 
                        className={`bg-gray-700/50 rounded-xl p-4 flex items-start justify-between transition-all hover:bg-gray-600/50 border-l-4 ${
                          isPast ? 'border-red-500/50' : 'border-indigo-500/50'
                        }`}
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-indigo-400" />
                            <h3 className="font-medium text-white">{reminder.cname}</h3>
                          </div>
                          <div className="flex items-start gap-2">
                            <FiMessageSquare className="text-indigo-400 mt-1 flex-shrink-0" />
                            <p className="text-gray-300">{reminder.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiClock className="text-indigo-400" />
                            <p className={`text-sm ${
                              isPast ? 'text-red-400' : 'text-indigo-400'
                            }`}>
                              {reminderDate.toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {isPast && (
                                <span className="ml-2 px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-full">
                                  Past Due
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.rid)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-600 transition-colors"
                          aria-label="Delete reminder"
                        >
                          <FiTrash2 className="text-xl" />
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