/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Quote, QuoteItem } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Plus, Trash2, Boxes, Copy, Trash, Import, FileOutput, 
  Archive, Calculator, Layers, ArrowLeft, ArrowRight, BookOpen
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { UNITS, PRODUCT_CATALOG } from '../lib/constants';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError } from '../lib/firestore-utils';

interface QuoteItemsProps {
  quote: Quote;
  updateQuote: (updates: Partial<Quote>) => void;
  addItem: () => void;
  updateItem: (id: string, updates: Partial<QuoteItem>) => void;
  removeItem: (id: string) => void;
  totals: any;
  onNext: () => void;
  onBack: () => void;
}

export function QuoteItems({ quote, updateQuote, addItem, updateItem, removeItem, totals, onNext, onBack }: QuoteItemsProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToRegister = async () => {
    if (!user) return;
    setIsSaving(true);
    const toastId = toast.loading('Saving quote to cloud...');
    try {
      await setDoc(doc(db, 'quotes', quote.id), {
        ...quote,
        savedAt: new Date().toISOString(),
        userId: user.uid
      });
      toast.success('Quote saved to register', { id: toastId });
    } catch (e) {
      handleFirestoreError(e, 'create', 'quotes');
    } finally {
      setIsSaving(false);
    }
  };

  const duplicateLast = () => {
    if (quote.items.length === 0) return;
    const last = quote.items[quote.items.length - 1];
    updateQuote({
      items: [
        ...quote.items,
        {
          ...last,
          id: Math.random().toString(36).substr(2, 9)
        }
      ]
    });
    toast.success('Row duplicated');
  };

  const selectProduct = (p: typeof PRODUCT_CATALOG[0]) => {
    updateQuote({
      items: [
        ...quote.items,
        {
          id: Math.random().toString(36).substr(2, 9),
          ...p,
          qty: 1,
          rowdisc: 0,
          lead: 'Immediate'
        }
      ]
    });
    toast.success(`${p.desc} added to quote`);
  };

  const clearAll = () => {
    if (confirm('Clear all product rows?')) {
      updateQuote({ items: [] });
      addItem();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border rounded-lg">
        <Popover>
          <PopoverTrigger render={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold">
              <BookOpen className="w-3.5 h-3.5" /> Product Catalog
            </Button>
          } />
          <PopoverContent className="w-[450px] p-0" align="start">
             <div className="p-3 border-b bg-slate-50">
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select from Standard Chemical Solutions</div>
             </div>
             <div className="max-h-[350px] overflow-auto">
                <div className="grid grid-cols-1 divide-y">
                   {PRODUCT_CATALOG.map(p => (
                     <button
                        key={p.desc}
                        onClick={() => selectProduct(p)}
                        className="w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                     >
                        <div className="space-y-0.5">
                           <div className="text-xs font-black text-emerald-900 group-hover:text-emerald-700">{p.desc}</div>
                           <div className="flex gap-2 text-[9px] text-slate-400 font-bold uppercase">
                              <span>Mfr: {p.mfr}</span>
                              <span>•</span>
                              <span>{p.packing}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-black text-slate-700">{p.price.toFixed(3)}</div>
                           <div className="text-[8px] text-slate-400 uppercase font-bold">Base Price / {p.unit}</div>
                        </div>
                     </button>
                   ))}
                </div>
             </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold" onClick={() => { for(let i=0; i<5; i++) addItem(); }}>
          <Layers className="w-3.5 h-3.5" /> Add Multiple
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold" onClick={duplicateLast}>
          <Copy className="w-3.5 h-3.5" /> Dup. Last
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold text-destructive hover:text-destructive" onClick={clearAll}>
          <Trash className="w-3.5 h-3.5" /> Clear All
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold">
          <Import className="w-3.5 h-3.5" /> Import CSV
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold">
          <FileOutput className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
              <Boxes className="w-4 h-4 text-emerald-600" /> Products & Pricing
              <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-200">
                {quote.items.length} items
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
                <TableHead className="w-8 text-[11px] font-bold text-emerald-800 text-center">#</TableHead>
                <TableHead className="w-64 text-[11px] font-bold text-emerald-800">Description *</TableHead>
                <TableHead className="w-32 text-[11px] font-bold text-emerald-800">Manufacturer</TableHead>
                <TableHead className="w-24 text-[11px] font-bold text-emerald-800">Origin</TableHead>
                <TableHead className="w-24 text-[11px] font-bold text-emerald-800">Packing</TableHead>
                <TableHead className="w-20 text-[11px] font-bold text-emerald-800">Unit</TableHead>
                <TableHead className="w-20 text-[11px] font-bold text-emerald-800">Qty</TableHead>
                <TableHead className="w-28 text-[11px] font-bold text-emerald-800">Unit Price</TableHead>
                <TableHead className="w-20 text-[11px] font-bold text-emerald-800">Row Disc%</TableHead>
                <TableHead className="w-32 text-[11px] font-bold text-emerald-800">Total</TableHead>
                <TableHead className="w-32 text-[11px] font-bold text-emerald-800">Lead Time</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item, idx) => {
                const rowTotal = item.qty * item.price * (1 - item.rowdisc / 100);
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center text-[10px] font-bold text-emerald-900">{idx + 1}</TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.desc}
                        onChange={(e) => updateItem(item.id, { desc: e.target.value })}
                        className="h-7 text-xs font-semibold"
                        placeholder="Product description"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.mfr}
                        onChange={(e) => updateItem(item.id, { mfr: e.target.value })}
                        className="h-7 text-xs"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.origin}
                        onChange={(e) => updateItem(item.id, { origin: e.target.value })}
                        className="h-7 text-xs"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.packing}
                        onChange={(e) => updateItem(item.id, { packing: e.target.value })}
                        className="h-7 text-xs"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Select value={item.unit} onValueChange={(v) => updateItem(item.id, { unit: v })}>
                        <SelectTrigger className="h-7 text-[10px] px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(u => <SelectItem key={u} value={u} className="text-[10px]">{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                        className="h-7 text-xs text-right pr-1"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number"
                        step="0.001"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                        className="h-7 text-xs text-right pr-1"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        type="number"
                        value={item.rowdisc}
                        onChange={(e) => updateItem(item.id, { rowdisc: Number(e.target.value) })}
                        className="h-7 text-[10px] text-right pr-1"
                      />
                    </TableCell>
                    <TableCell className="p-1 text-[11px] font-bold text-emerald-700 whitespace-nowrap text-right pr-2">
                      {quote.currency} {rowTotal.toFixed(3)}
                    </TableCell>
                    <TableCell className="p-1">
                      <Input 
                        value={item.lead}
                        onChange={(e) => updateItem(item.id, { lead: e.target.value })}
                        className="h-7 text-xs"
                        placeholder="2 weeks"
                      />
                    </TableCell>
                    <TableCell className="p-1">
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t flex justify-between items-center bg-slate-50/50">
          <div className="space-x-2">
            <Button variant="default" size="sm" onClick={addItem} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
            <Button variant="outline" size="sm">
              <Calculator className="w-4 h-4 mr-1" /> Recalculate
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subtotal</div>
              <div className="text-sm font-bold text-slate-900">{quote.currency} {totals.subtotal.toFixed(3)}</div>
            </div>
            {totals.discountAmount > 0 && (
              <div className="text-right">
                <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Discount ({quote.discount}%)</div>
                <div className="text-sm font-bold text-red-600">-{quote.currency} {totals.discountAmount.toFixed(3)}</div>
              </div>
            )}
            <div className="text-right">
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Grand Total</div>
              <div className="text-base font-black text-emerald-900">{quote.currency} {totals.grandTotal.toFixed(3)}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            className="text-emerald-700 border-emerald-200"
            onClick={handleSaveToRegister}
            disabled={isSaving}
          >
            <Archive className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save to Register'}
          </Button>
          <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={onNext}>
            Sign & Stamp <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
