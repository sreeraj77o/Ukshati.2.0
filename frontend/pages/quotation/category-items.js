import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import ScrollToTopButton from '@/components/scrollup';
import { motion } from 'framer-motion';
import BackButton from '@/components/BackButton';
import { CardSkeleton } from '@/components/skeleton';

const CategoryItemsPage = () => {
  const router = useRouter();
  const {
    categoryId,
    projectId,
    customer,
    selectedItems: selectedItemsStr,
  } = router.query;
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});

  // Safe parsing of URL parameters
  const parseSelectedItems = str => {
    try {
      if (!str) return {};
      const decoded = decodeURIComponent(str);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error parsing selectedItems:', error);
      return {};
    }
  };

  const parsedCustomer = customer ? JSON.parse(customer) : null;
  const initialSelectedItems = parseSelectedItems(selectedItemsStr);

  useEffect(() => {
    if (categoryId) {
      // Fetch items for the current category
      fetch(`/api/items/${categoryId}`)
        .then(res => {
          // Check if the response is ok (status in the range 200-299)
          if (!res.ok) {
            console.warn(`No items found for category ${categoryId}`);
            return [];
          }
          return res.json();
        })
        .then(data => {
          setItems(data || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          setItems([]);
          setIsLoading(false);
        });
    }

    // Initialize selected items
    setSelectedItems(initialSelectedItems);
  }, [categoryId, initialSelectedItems]);

  const handleItemSelection = (item_id, cost) => {
    setSelectedItems(prev => {
      const categoryItems = prev[categoryId] || [];
      const itemExists = categoryItems.some(item => item.item_id === item_id);

      if (itemExists) {
        return {
          ...prev,
          [categoryId]: categoryItems.filter(item => item.item_id !== item_id),
        };
      } else {
        return {
          ...prev,
          [categoryId]: [
            ...categoryItems,
            {
              item_id,
              cost: parseFloat(cost) || 0,
              quantity: 1,
              printSeparately: false,
            },
          ],
        };
      }
    });
  };

  const togglePrintSeparately = item_id => {
    setSelectedItems(prev => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems.map(item => {
        if (item.item_id === item_id) {
          return { ...item, printSeparately: !item.printSeparately };
        }
        return item;
      });

      return {
        ...prev,
        [categoryId]: updatedItems,
      };
    });
  };

  const handleQuantityChange = (item_id, quantity) => {
    const qty = parseInt(quantity) || 1;
    setSelectedItems(prev => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems.map(item =>
        item.item_id === item_id ? { ...item, quantity: qty } : item
      );
      return {
        ...prev,
        [categoryId]: updatedItems,
      };
    });
  };

  const handleSaveAndReturn = () => {
    // Don't clean the selected items - preserve all properties including printSeparately
    router.push({
      pathname: '/quotation/QuoteManager',
      query: {
        projectId,
        selectedItems: encodeURIComponent(JSON.stringify(selectedItems)),
      },
    });
  };

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedItemsForCategory = () => {
    return selectedItems[categoryId] || [];
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
      <ScrollToTopButton />

      <div className="absolute top-4 left-4 z-10">
        <BackButton label="Back" onClick={handleSaveAndReturn} />
      </div>

      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center w-full">
        <h1 className="text-4xl font-bold mb-16 mt-8">Category Items</h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/80 p-8 rounded-xl shadow-xl w-full max-w-4xl mx-auto border border-gray-800"
        >
          <h1 className="text-2xl font-bold mb-2">
            {parsedCustomer?.customer_name}
          </h1>
          <p className="text-gray-400 mb-6">{parsedCustomer?.address}</p>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg text-white"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton count={5} />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => {
                const isSelected = getSelectedItemsForCategory().some(
                  selected => selected.item_id === item.item_id
                );
                const selectedItem = isSelected
                  ? getSelectedItemsForCategory().find(
                      selected => selected.item_id === item.item_id
                    )
                  : null;

                return (
                  <motion.div
                    key={item.item_id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`p-4 rounded-lg ${isSelected ? 'bg-blue-900' : 'bg-gray-700'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleItemSelection(item.item_id, item.price_pu)
                          }
                          className="h-5 w-5"
                        />
                        <div>
                          <h3 className="font-medium">{item.item_name}</h3>
                          <p className="text-sm text-gray-300">
                            Price: ₹{item.price_pu}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={selectedItem?.quantity || 1}
                            onChange={e =>
                              handleQuantityChange(item.item_id, e.target.value)
                            }
                            className="w-16 p-1 bg-gray-600 rounded text-center"
                          />
                          <label className="flex items-center space-x-1">
                            <input
                              type="checkbox"
                              checked={selectedItem?.printSeparately || false}
                              onChange={() =>
                                togglePrintSeparately(item.item_id)
                              }
                              className="h-4 w-4"
                            />
                            <span className="text-xs">Print separately</span>
                          </label>
                          <span className="font-bold">
                            ₹
                            {(
                              selectedItem?.quantity * selectedItem?.cost
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <motion.button
              onClick={handleSaveAndReturn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-green-600 rounded-lg font-medium"
            >
              Save and Return
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryItemsPage;
