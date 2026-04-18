/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Quote, QuoteItem, Clause, QuoteStatus } from '../types';
import { DEFAULT_BANK_DETAILS, DEFAULT_IBAN } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

const LOCAL_STORAGE_KEY = 'aec_current_quote';

export function useQuoteForm() {
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (user && parsed.userId !== user.uid) {
           // If user changed, clear local preview or migrate?
           // For now, let's keep it but mark it with new user ID if it was empty
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved quote', e);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const closingDate = nextWeek.toISOString().split('T')[0];

    return {
      id: Date.now().toString(),
      userId: user?.uid || '',
      savedAt: new Date().toISOString(),
      quoteRef: 'AEC-NEW',
      rfp: '',
      closeDate: closingDate,
      quoteDate: today,
      validity: 20,
      incoterms: 'DAP warehouse',
      custName: '',
      custAttn: '',
      custAddr: '',
      custPhone: '',
      custEmail: '',
      payment: '60 days credit from the date of delivery',
      leadTime: '2 days from order confirmation',
      vat: 10,
      discount: 0,
      currency: 'BHD',
      shipping: 0,
      bank: DEFAULT_BANK_DETAILS,
      iban: DEFAULT_IBAN,
      notes: '',
      approvedBy: '',
      designation: '',
      contactNum: '',
      status: 'draft',
      footer: '',
      items: [{
        id: Math.random().toString(36).substr(2, 9),
        desc: '',
        mfr: '',
        origin: '',
        packing: '',
        unit: 'KG',
        qty: 1,
        price: 0,
        rowdisc: 0,
        lead: ''
      }],
      clauses: [],
      autoSign: true,
      autoStamp: true
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quote));
  }, [quote]);

  const updateQuote = useCallback((updates: Partial<Quote>) => {
    setQuote(prev => ({ ...prev, ...updates }));
  }, []);

  const addItem = useCallback(() => {
    setQuote(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(36).substr(2, 9),
          desc: '',
          mfr: '',
          origin: '',
          packing: '',
          unit: 'KG',
          qty: 1,
          price: 0,
          rowdisc: 0,
          lead: ''
        }
      ]
    }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<QuoteItem>) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  }, []);

  const addClause = useCallback(() => {
    setQuote(prev => ({
      ...prev,
      clauses: [
        ...prev.clauses,
        {
          id: Math.random().toString(36).substr(2, 9),
          clause: '',
          confirm: 'confirmed',
          remarks: ''
        }
      ]
    }));
  }, []);

  const updateClause = useCallback((id: string, updates: Partial<Clause>) => {
    setQuote(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  const removeClause = useCallback((id: string) => {
    setQuote(prev => ({
      ...prev,
      clauses: prev.clauses.filter(c => c.id !== id)
    }));
  }, []);

  const resetForm = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const closingDate = nextWeek.toISOString().split('T')[0];

    const newQuote: Quote = {
      id: Date.now().toString(),
      userId: user?.uid || '',
      savedAt: new Date().toISOString(),
      quoteRef: 'AEC-NEW',
      rfp: '',
      closeDate: closingDate,
      quoteDate: today,
      validity: 20,
      incoterms: 'DAP warehouse',
      custName: '',
      custAttn: '',
      custAddr: '',
      custPhone: '',
      custEmail: '',
      payment: '60 days credit from the date of delivery',
      leadTime: '2 days from order confirmation',
      vat: 10,
      discount: 0,
      currency: 'BHD',
      shipping: 0,
      bank: DEFAULT_BANK_DETAILS,
      iban: DEFAULT_IBAN,
      notes: '',
      approvedBy: '',
      designation: '',
      contactNum: '',
      status: 'draft',
      footer: '',
      items: [{
        id: Math.random().toString(36).substr(2, 9),
        desc: '',
        mfr: '',
        origin: '',
        packing: '',
        unit: 'KG',
        qty: 1,
        price: 0,
        rowdisc: 0,
        lead: ''
      }],
      clauses: [],
      autoSign: true,
      autoStamp: true
    };
    setQuote(newQuote);
  }, []);

  // Totals calculations
  const totals = (() => {
    const subtotal = quote.items.reduce((acc, item) => {
      const rowTotal = item.qty * item.price * (1 - item.rowdisc / 100);
      return acc + rowTotal;
    }, 0);

    const discountAmount = (subtotal * quote.discount) / 100;
    const beforeVat = subtotal - discountAmount + quote.shipping;
    const vatAmount = (beforeVat * quote.vat) / 100;
    const grandTotal = beforeVat + vatAmount;

    return {
      subtotal,
      discountAmount,
      beforeVat,
      vatAmount,
      grandTotal
    };
  })();

  return {
    quote,
    updateQuote,
    addItem,
    updateItem,
    removeItem,
    addClause,
    updateClause,
    removeClause,
    resetForm,
    totals
  };
}
