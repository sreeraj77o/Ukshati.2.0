import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ScrollToTopButton from '@/components/scrollup';
import { motion } from 'framer-motion';
import BackButton from '@/components/BackButton';
import { FiSearch, FiPlus, FiRefreshCw, FiX, FiEdit } from 'react-icons/fi';
import { CardSkeleton, TableSkeleton } from '@/components/skeleton';

// Price formatting utility
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const num = typeof price === 'number' ? price : Number(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const RatesManagement = () => {
  const router = useRouter();
  const [unratedItems, setUnratedItems] = useState([]);
  const [rates, setRates] = useState([]);
  const [allRates, setAllRates] = useState([]); // Store all rates for client-side filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    unrated: false,
    rates: false,
    adding: false,
    updating: false
  });
  const [notification, setNotification] = useState(null);

  // Form state for adding new rates
  const [newRates, setNewRates] = useState({});
  // Form state for editing existing rates
  const [editingRates, setEditingRates] = useState({});

  // Initialize form states when data loads
  useEffect(() => {
    if (unratedItems.length > 0) {
      const initialNewRates = {};
      unratedItems.forEach(item => {
        initialNewRates[item.stock_id] = {
          price: formatPrice(item.price_pu)
        };
      });
      setNewRates(initialNewRates);
    }
  }, [unratedItems]);

  useEffect(() => {
    if (rates.length > 0) {
      const initialEditingRates = {};
      rates.forEach(rate => {
        initialEditingRates[rate.rate_id] = {
          price: formatPrice(rate.price_pu),
          quantity: rate.quantity ? rate.quantity.toString() : '1'
        };
      });
      setEditingRates(initialEditingRates);
    }
  }, [rates]);

  // Fetch data functions
  const fetchUnratedItems = async () => {
    setLoading(prev => ({ ...prev, unrated: true }));
    try {
      const res = await fetch('/api/rates/getUnratedItems');
      const data = await res.json();
      setUnratedItems(data);
    } catch (error) {
      console.error('Failed to fetch unrated items:', error);
      showNotification('Failed to load unrated items', 'error');
    } finally {
      setLoading(prev => ({ ...prev, unrated: false }));
    }
  };

  const fetchRates = async (search = '') => {
    setLoading(prev => ({ ...prev, rates: true }));
    try {
      const res = await fetch(`/api/rates/searchRates?search=${search}`);
      const data = await res.json();
      setRates(data);
      if (search === '') setAllRates(data); // Store all rates when no search term
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      showNotification('Failed to load rates', 'error');
    } finally {
      setLoading(prev => ({ ...prev, rates: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    fetchUnratedItems();
    fetchRates();
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      if (searchValue.length < 3) {
        // Client-side filter for short queries
        const filtered = allRates.filter(rate =>
          rate.item_name.toLowerCase().includes(searchValue.toLowerCase())
        );
        setRates(filtered);
      } else {
        // Server-side search for longer queries
        fetchRates(searchValue);
      }
    }, 300),
    [allRates]
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    fetchRates('');
  };

  // Handle form changes
  const handleNewRateChange = (itemId, field, value) => {
    setNewRates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleEditRateChange = (rateId, field, value) => {
    setEditingRates(prev => ({
      ...prev,
      [rateId]: {
        ...prev[rateId],
        [field]: value
      }
    }));
  };

  // Form handlers
  const handleAddRate = async (itemId) => {
    const rateData = newRates[itemId];
    if (!rateData || rateData.price === undefined || rateData.price === '') {
      showNotification('Please enter a valid price', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, adding: true }));
    try {
      const res = await fetch('/api/rates/addRate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          price_pu: parseFloat(rateData.price) || 0
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      showNotification('Rate added successfully', 'success');
      fetchUnratedItems();
      fetchRates(searchTerm);
    } catch (error) {
      console.error('Error adding rate:', error);
      showNotification(error.message || 'Failed to add rate', 'error');
    } finally {
      setLoading(prev => ({ ...prev, adding: false }));
    }
  };

  const handleUpdateRate = async (rateId) => {
    const rateData = editingRates[rateId];
    if (!rateData || rateData.price === undefined || rateData.price === '') {
      showNotification('Please enter a valid price', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, updating: true }));
    try {
      const res = await fetch('/api/rates/updateRate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_id: rateId,
          quantity: parseInt(rateData.quantity) || 1,
          price_pu: parseFloat(rateData.price) || 0
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      showNotification('Rate updated successfully', 'success');
      fetchRates(searchTerm);
    } catch (error) {
      console.error('Error updating rate:', error);
      showNotification(error.message || 'Failed to update rate', 'error');
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Helper functions
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
      <ScrollToTopButton />

      <div className="absolute top-4 left-4 z-10">
        <BackButton
          label="Back"
          route="/quotation/home"
        />
      </div>

      <div className="w-full px-4 py-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-16 mt-8">Rates Management</h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/80 p-8 rounded-xl shadow-xl w-full max-w-4xl mx-auto border border-gray-800"
        >

            {/* Notification */}
            {notification && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`mb-6 p-4 rounded-lg border ${notification.type === 'success'
                  ? 'bg-green-900/50 border-green-400 text-green-100'
                  : 'bg-red-900/50 border-red-400 text-red-100'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span>{notification.message}</span>
                  <button
                    onClick={() => setNotification(null)}
                    className="text-white hover:text-gray-300"
                  >
                    <FiX />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Add New Rates Section */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Add Rates for Unrated Items</h2>

              {loading.unrated && unratedItems.length === 0 ? (
                <div className="space-y-4">
                  <CardSkeleton count={3} />
                </div>
              ) : unratedItems.length > 0 ? (
                <div className="space-y-4">
                  {unratedItems.map(item => (
                    <motion.div
                      key={item.stock_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 rounded-lg bg-gray-700"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{item.item_name}</h3>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <p className="text-sm text-gray-400">Stock Quantity</p>
                              <p>{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Current Price</p>
                              <p>₹{formatPrice(item.price_pu)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Set Rate Price</p>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newRates[item.stock_id]?.price || ''}
                              onChange={(e) => handleNewRateChange(item.stock_id, 'price', e.target.value)}
                              className="p-2 bg-gray-600 rounded text-white w-full"
                              placeholder="Enter rate price"
                              required
                            />
                          </div>

                          <motion.button
                            onClick={() => handleAddRate(item.stock_id)}
                            disabled={loading.adding}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-green-600 rounded font-medium flex items-center justify-center h-full"
                          >
                            {loading.adding ? (
                              <FiRefreshCw className="animate-spin mr-2" />
                            ) : (
                              <FiPlus className="mr-2" />
                            )}
                            Add Rate
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  All stock items have rates defined.
                </div>
              )}
            </section>

            {/* Edit Existing Rates Section */}
            <section>
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Edit Existing Rates</h2>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search item name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="flex-grow p-3 bg-gray-700 rounded-l-lg text-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="p-3 bg-gray-700 text-gray-400 hover:text-white"
                    >
                      <FiX />
                    </button>
                  )}
                  <button
                    onClick={() => fetchRates(searchTerm)}
                    className="p-3 bg-blue-600 rounded-r-lg hover:bg-blue-700 transition-colors"
                    disabled={loading.rates}
                  >
                    {loading.rates ? (
                      <FiRefreshCw className="animate-spin text-xl" />
                    ) : (
                      <FiSearch className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {loading.rates && rates.length === 0 ? (
                <div className="space-y-4">
                  <TableSkeleton rows={3} columns={3} />
                </div>
              ) : rates.length > 0 ? (
                <div className="space-y-4">
                  {rates.map(rate => (
                    <motion.div
                      key={rate.rate_id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 rounded-lg bg-gray-700"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{rate.item_name}</h3>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div>
                              <p className="text-sm text-gray-400">Stock Quantity</p>
                              <p>{rate.quantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Current Rate</p>
                              <p>₹{formatPrice(rate.price_pu)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Stock Price</p>
                              <p>₹{formatPrice(rate.stock_price)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Update Rate</p>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingRates[rate.rate_id]?.price || ''}
                              onChange={(e) => handleEditRateChange(rate.rate_id, 'price', e.target.value)}
                              className="p-2 bg-gray-600 rounded text-white w-full"
                              required
                            />
                          </div>

                          <motion.button
                            onClick={() => handleUpdateRate(rate.rate_id)}
                            disabled={loading.updating}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-blue-600 rounded font-medium flex items-center justify-center h-full"
                          >
                            {loading.updating ? (
                              <FiRefreshCw className="animate-spin mr-2" />
                            ) : (
                              <FiEdit className="mr-2" />
                            )}
                            Update
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? 'No rates found matching your search' : 'Search for items to edit rates'}
                </div>
              )}
            </section>
          </motion.div>
      </div>
    </div>
  );
};

export default RatesManagement;