import { useState, useEffect, useCallback } from 'react';
import useApi from '../shared/useApi';

/**
 * Hook for managing quotations data and operations
 * @returns {Object} Quotations data and operations
 */
const useQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, error } = useApi();

  // Fetch all quotations
  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get('/quotations');
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Add new quotation
  const addQuotation = useCallback(async (quotationData) => {
    try {
      const newQuotation = await post('/quotations', quotationData);
      setQuotations(prev => [...prev, newQuotation]);
      return newQuotation;
    } catch (err) {
      console.error('Error adding quotation:', err);
      throw err;
    }
  }, [post]);

  // Update quotation
  const updateQuotation = useCallback(async (quotationId, quotationData) => {
    try {
      const updatedQuotation = await put(`/quotations/${quotationId}`, quotationData);
      setQuotations(prev => 
        prev.map(quotation => 
          quotation.id === quotationId ? updatedQuotation : quotation
        )
      );
      return updatedQuotation;
    } catch (err) {
      console.error('Error updating quotation:', err);
      throw err;
    }
  }, [put]);

  // Delete quotation
  const deleteQuotation = useCallback(async (quotationId) => {
    try {
      await del(`/quotations/${quotationId}`);
      setQuotations(prev => prev.filter(quotation => quotation.id !== quotationId));
    } catch (err) {
      console.error('Error deleting quotation:', err);
      throw err;
    }
  }, [del]);

  // Update quotation status
  const updateQuotationStatus = useCallback(async (quotationId, status) => {
    try {
      const quotation = quotations.find(q => q.id === quotationId);
      if (!quotation) throw new Error('Quotation not found');

      const updatedQuotation = await put(`/quotations/${quotationId}`, {
        ...quotation,
        status
      });

      setQuotations(prev => 
        prev.map(q => q.id === quotationId ? updatedQuotation : q)
      );

      return updatedQuotation;
    } catch (err) {
      console.error('Error updating quotation status:', err);
      throw err;
    }
  }, [quotations, put]);

  // Get quotation by ID
  const getQuotationById = useCallback((quotationId) => {
    return quotations.find(quotation => quotation.id === quotationId);
  }, [quotations]);

  // Get quotations by customer
  const getQuotationsByCustomer = useCallback((customerId) => {
    return quotations.filter(quotation => quotation.customer_id === customerId);
  }, [quotations]);

  // Get quotations by status
  const getQuotationsByStatus = useCallback((status) => {
    return quotations.filter(quotation => quotation.status === status);
  }, [quotations]);

  // Get expired quotations
  const getExpiredQuotations = useCallback(() => {
    const now = new Date();
    return quotations.filter(quotation => 
      new Date(quotation.valid_until) < now && quotation.status !== 'Expired'
    );
  }, [quotations]);

  // Search quotations
  const searchQuotations = useCallback((query) => {
    if (!query.trim()) return quotations;
    
    const lowercaseQuery = query.toLowerCase();
    return quotations.filter(quotation =>
      quotation.title?.toLowerCase().includes(lowercaseQuery) ||
      quotation.quote_number?.toLowerCase().includes(lowercaseQuery) ||
      quotation.customer_name?.toLowerCase().includes(lowercaseQuery) ||
      quotation.status?.toLowerCase().includes(lowercaseQuery)
    );
  }, [quotations]);

  // Get quotation statistics
  const getQuotationStats = useCallback(() => {
    const stats = {
      total: quotations.length,
      draft: 0,
      sent: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      totalValue: 0,
      acceptanceRate: 0,
    };

    let sentCount = 0;
    let acceptedCount = 0;

    quotations.forEach(quotation => {
      switch (quotation.status?.toLowerCase()) {
        case 'draft':
          stats.draft++;
          break;
        case 'sent':
          stats.sent++;
          sentCount++;
          break;
        case 'accepted':
          stats.accepted++;
          acceptedCount++;
          sentCount++;
          break;
        case 'rejected':
          stats.rejected++;
          sentCount++;
          break;
        case 'expired':
          stats.expired++;
          break;
      }

      if (quotation.total_amount) {
        stats.totalValue += quotation.total_amount;
      }
    });

    // Calculate acceptance rate
    if (sentCount > 0) {
      stats.acceptanceRate = (acceptedCount / sentCount) * 100;
    }

    return stats;
  }, [quotations]);

  // Generate quote number
  const generateQuoteNumber = useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QT-${year}${month}${day}-${random}`;
  }, []);

  // Load quotations on mount
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  return {
    quotations,
    loading,
    error,
    fetchQuotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    updateQuotationStatus,
    getQuotationById,
    getQuotationsByCustomer,
    getQuotationsByStatus,
    getExpiredQuotations,
    searchQuotations,
    getQuotationStats,
    generateQuoteNumber,
  };
};

export default useQuotations;
