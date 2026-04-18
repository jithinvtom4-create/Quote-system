/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { 
  Archive, Search, RefreshCw, FileSpreadsheet, Trash2, 
  FolderOpen, FileDown, ArrowUpDown, ChevronUp, ChevronDown,
  FilterX, Calendar as CalendarIcon, Loader2
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError } from '../lib/firestore-utils';

type SortKey = 'quoteRef' | 'custName' | 'quoteDate' | 'status' | 'grandTotal';
type SortOrder = 'asc' | 'desc';

export function QuoteRegister() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({
    key: 'quoteDate',
    order: 'desc'
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      orderBy('savedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Quote);
      setQuotes(docs);
      setLoading(false);
      
      // Migration logic: If Firestore is empty, check localStorage
      if (docs.length === 0) {
        const local = localStorage.getItem('aec_register');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.forEach(async (quote: Quote) => {
                await setDoc(doc(db, 'quotes', quote.id), {
                  ...quote,
                  userId: user.uid
                });
              });
              toast.success('Migrated existing quotes to cloud');
            }
          } catch (e) {
            console.error('Migration error:', e);
          }
        }
      }
    }, (error) => {
      console.error('Firestore listen error:', error);
      handleFirestoreError(error, 'list', 'quotes');
    });

    return unsubscribe;
  }, [user]);

  const calculateGrandTotal = (q: Quote) => {
    if (!q.items) return 0;
    const subtotal = q.items.reduce((acc, item) => {
      return acc + (item.qty * item.price * (1 - item.rowdisc / 100));
    }, 0);
    const discAmt = (subtotal * (q.discount || 0)) / 100;
    const beforeVat = subtotal - discAmt + (q.shipping || 0);
    const vatAmt = (beforeVat * (q.vat || 0)) / 100;
    return beforeVat + vatAmt;
  };

  const handleRevision = async (q: Quote) => {
    if (!user) return;
    try {
      const rev = {
        ...q,
        id: Math.random().toString(36).substr(2, 9),
        quoteRef: `${q.quoteRef.split('-REV')[0]}-REV${Math.floor(Math.random() * 100)}`,
        savedAt: new Date().toISOString(),
        status: 'draft' as const,
        userId: user.uid
      };
      await setDoc(doc(db, 'quotes', rev.id), rev);
      toast.success('Revision created as draft');
    } catch (e) {
      handleFirestoreError(e, 'create', 'quotes');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await deleteDoc(doc(db, 'quotes', id));
      toast.success('Quote deleted');
    } catch (e) {
      handleFirestoreError(e, 'delete', `quotes/${id}`);
    }
  };

  const filteredAndSortedQuotes = useMemo(() => {
    let result = quotes.filter(q => {
      const matchesSearch = 
        q.custName.toLowerCase().includes(search.toLowerCase()) || 
        q.quoteRef.toLowerCase().includes(search.toLowerCase()) || 
        q.rfp.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      
      let matchesDate = true;
      if (startDate || endDate) {
        try {
          const qDate = parseISO(q.quoteDate);
          const start = startDate ? parseISO(startDate) : new Date(0);
          const end = endDate ? parseISO(endDate) : new Date(8640000000000000);
          matchesDate = isWithinInterval(qDate, { start, end });
        } catch (e) {
          matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortConfig.key === 'grandTotal') {
        aVal = calculateGrandTotal(a);
        bVal = calculateGrandTotal(b);
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }

      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [quotes, search, statusFilter, startDate, endDate, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      order: current.key === key && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortConfig.order === 'asc' ? <ChevronUp className="ml-2 h-3 w-3 text-emerald-600" /> : <ChevronDown className="ml-2 h-3 w-3 text-emerald-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
            <Archive className="w-4 h-4 text-emerald-600" /> Professional Quote Register
          </CardTitle>
          <div className="flex gap-2">
             {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Controls Panel */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Ref, Customer, RFP..." 
                    className="pl-8 h-8 text-xs bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs bg-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                    <SelectItem value="sent" className="text-xs">Sent</SelectItem>
                    <SelectItem value="review" className="text-xs">Review</SelectItem>
                    <SelectItem value="approved" className="text-xs">Approved</SelectItem>
                    <SelectItem value="won" className="text-xs">Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Range (Quote Date)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      type="date" 
                      className="pl-8 h-8 text-xs bg-white pr-2"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <span className="text-slate-300 text-xs">—</span>
                  <div className="relative flex-1">
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      type="date" 
                      className="pl-8 h-8 text-xs bg-white pr-2"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
               <div className="text-[10px] text-slate-400 font-medium">
                  Showing {filteredAndSortedQuotes.length} of {quotes.length} total entries
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 text-[10px] font-bold text-slate-500">
                    <FilterX className="h-3 w-3 mr-1" /> Clear Filters
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold text-slate-600">
                    <FileSpreadsheet className="h-3 w-3 mr-1" /> Export CSV
                  </Button>
               </div>
            </div>
          </div>

          <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead 
                    className="text-[11px] font-bold text-slate-600 cursor-pointer select-none"
                    onClick={() => handleSort('quoteRef')}
                  >
                    <div className="flex items-center">Quote Ref <SortIndicator column="quoteRef" /></div>
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600">
                    RFP / Tender
                  </TableHead>
                  <TableHead 
                    className="text-[11px] font-bold text-slate-600 cursor-pointer select-none"
                    onClick={() => handleSort('custName')}
                  >
                    <div className="flex items-center">Customer <SortIndicator column="custName" /></div>
                  </TableHead>
                  <TableHead 
                    className="text-[11px] font-bold text-slate-600 cursor-pointer select-none text-center"
                    onClick={() => handleSort('quoteDate')}
                  >
                    <div className="flex items-center justify-center">Date <SortIndicator column="quoteDate" /></div>
                  </TableHead>
                  <TableHead 
                    className="text-[11px] font-bold text-slate-600 cursor-pointer select-none text-right"
                    onClick={() => handleSort('grandTotal')}
                  >
                    <div className="flex items-center justify-end">Total <SortIndicator column="grandTotal" /></div>
                  </TableHead>
                  <TableHead 
                    className="text-[11px] font-bold text-slate-600 cursor-pointer select-none text-center"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center">Status <SortIndicator column="status" /></div>
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-600 text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                         <Archive className="h-12 w-12 mb-3 opacity-10" />
                         <span className="italic text-xs">No quotes found matching your criteria.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedQuotes.map(q => {
                    const total = calculateGrandTotal(q);
                    return (
                      <TableRow key={q.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="text-xs font-black text-emerald-900">{q.quoteRef}</TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">{q.rfp || '—'}</TableCell>
                        <TableCell className="text-xs font-bold text-slate-700">{q.custName}</TableCell>
                        <TableCell className="text-[10px] text-slate-500 font-bold text-center">
                          {q.quoteDate ? format(parseISO(q.quoteDate), 'dd MMM yyyy') : '—'}
                        </TableCell>
                        <TableCell className="text-xs font-black text-right text-emerald-900">
                          {q.currency} {total.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn(
                            "text-[9px] uppercase font-black px-2 py-0.5",
                            q.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            q.status === 'draft' ? "bg-slate-50 text-slate-600 border-slate-200" :
                            q.status === 'sent' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            q.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          )}>
                            {q.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => handleRevision(q)}
                              title="Create Revision"
                            >
                               <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50">
                               <FolderOpen className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:bg-amber-50">
                               <FileDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:bg-red-50"
                              onClick={() => handleDelete(q.id)}
                            >
                               <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
