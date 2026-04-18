/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote, QuoteStatus } from '../types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Info, UserPlus, X, Copy, RotateCcw, RefreshCw, Check, BookUser, FileText } from 'lucide-react';
import { PAYMENT_TERMS, INCOTERMS, CURRENCIES, CUSTOMER_DIRECTORY, CLAUSE_TEMPLATES } from '../lib/constants';
import { ClauseList } from './ClauseList';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';

interface QuoteDetailsProps {
  quote: Quote;
  updateQuote: (updates: Partial<Quote>) => void;
  resetForm: () => void;
}

export function QuoteDetails({ quote, updateQuote, resetForm }: QuoteDetailsProps) {
  const genRef = () => {
    const counter = Math.floor(1000 + Math.random() * 9000);
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const now = new Date();
    const mo = months[now.getMonth()];
    const dd = String(now.getDate()).padStart(2,'0');
    updateQuote({ quoteRef: `AEC-${counter}-${mo}_${dd}` });
  };

  const selectCustomer = (cust: typeof CUSTOMER_DIRECTORY[0]) => {
    updateQuote({
      custName: cust.name,
      custAttn: cust.attn,
      custPhone: cust.phone,
      custEmail: cust.email,
      custAddr: cust.addr
    });
    toast.success(`Customer profile loaded: ${cust.name}`);
  };

  const applyClauseTemplate = (tpl: typeof CLAUSE_TEMPLATES[0]) => {
    const newClauses = tpl.clauses.map(c => ({
      ...c,
      id: Math.random().toString(36).substr(2, 9),
    }));
    updateQuote({ clauses: [...quote.clauses, ...newClauses] });
    toast.success(`Applied ${tpl.name} clauses`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border rounded-lg">
        <Popover>
          <PopoverTrigger render={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold">
              <BookUser className="w-3.5 h-3.5" /> Customer Directory
            </Button>
          } />
          <PopoverContent className="w-80 p-0" align="start">
             <div className="p-3 border-b bg-slate-50">
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Customer Profile</div>
             </div>
             <div className="max-h-[300px] overflow-auto">
                {CUSTOMER_DIRECTORY.map(cust => (
                  <button
                    key={cust.name}
                    onClick={() => selectCustomer(cust)}
                    className="w-full p-3 text-left hover:bg-emerald-50 border-b flex flex-col gap-0.5 transition-colors"
                  >
                    <div className="text-xs font-black text-emerald-900">{cust.name}</div>
                    <div className="text-[10px] text-slate-500">{cust.attn}</div>
                  </button>
                ))}
             </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger render={
            <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold">
              <FileText className="w-3.5 h-3.5" /> Clause Templates
            </Button>
          } />
          <PopoverContent className="w-80 p-0" align="start">
             <div className="p-3 border-b bg-slate-50">
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">T&C Presets</div>
             </div>
             <div className="max-h-[300px] overflow-auto">
                {CLAUSE_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.name}
                    onClick={() => applyClauseTemplate(tpl)}
                    className="w-full p-4 text-left hover:bg-emerald-50 border-b transition-colors group"
                  >
                    <div className="text-xs font-black text-emerald-900 group-hover:text-emerald-700">{tpl.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1">Includes {tpl.clauses.length} clauses</div>
                  </button>
                ))}
             </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold" onClick={() => updateQuote({ custName: '', custAttn: '', custAddr: '', custPhone: '', custEmail: '' })}>
          <X className="w-3.5 h-3.5" /> Clear Customer
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold">
          <Copy className="w-3.5 h-3.5" /> Load Template
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-semibold text-destructive hover:text-destructive" onClick={resetForm}>
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600" /> Quote & Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">RFP / Tender Number</Label>
                <Input 
                  placeholder="e.g. RFQ5379" 
                  value={quote.rfp} 
                  onChange={(e) => updateQuote({ rfp: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">Closing Date</Label>
                <Input 
                  type="date" 
                  value={quote.closeDate} 
                  onChange={(e) => updateQuote({ closeDate: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Quote Reference</Label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={quote.quoteRef} 
                    className="h-8 text-xs bg-slate-50"
                  />
                  <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-600 border-emerald-200" onClick={genRef}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Quote Date</Label>
                <Input 
                  type="date" 
                  value={quote.quoteDate} 
                  onChange={(e) => updateQuote({ quoteDate: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Validity (Days)</Label>
                <Input 
                  type="number" 
                  value={quote.validity} 
                  onChange={(e) => updateQuote({ validity: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Incoterms</Label>
                <Select value={quote.incoterms} onValueChange={(v) => updateQuote({ incoterms: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOTERMS.map(term => <SelectItem key={term} value={term} className="text-xs">{term}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Quote Status</Label>
                <Select value={quote.status} onValueChange={(v: QuoteStatus) => updateQuote({ status: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                    <SelectItem value="sent" className="text-xs">Sent</SelectItem>
                    <SelectItem value="review" className="text-xs">Review</SelectItem>
                    <SelectItem value="approved" className="text-xs">Approved</SelectItem>
                    <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
                    <SelectItem value="won" className="text-xs">Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">Customer Name</Label>
                <Input 
                  placeholder="Company Name" 
                  value={quote.custName} 
                  onChange={(e) => updateQuote({ custName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">Attention</Label>
                <Input 
                  placeholder="Contact Person" 
                  value={quote.custAttn} 
                  onChange={(e) => updateQuote({ custAttn: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Phone</Label>
                <Input 
                  placeholder="+973 ..." 
                  value={quote.custPhone} 
                  onChange={(e) => updateQuote({ custPhone: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Email</Label>
                <Input 
                  type="email" 
                  placeholder="email@company.com" 
                  value={quote.custEmail} 
                  onChange={(e) => updateQuote({ custEmail: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Address</Label>
              <Textarea 
                placeholder="Full Address" 
                rows={2} 
                value={quote.custAddr} 
                onChange={(e) => updateQuote({ custAddr: e.target.value })}
                className="text-xs resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
            Terms, Financial & Authorisation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Payment Terms</Label>
                <Select value={quote.payment} onValueChange={(v) => updateQuote({ payment: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map(term => <SelectItem key={term} value={term} className="text-xs">{term}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">General Lead Time</Label>
                <Input 
                  value={quote.leadTime} 
                  onChange={(e) => updateQuote({ leadTime: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">VAT %</Label>
                <Input 
                  type="number" 
                  value={quote.vat} 
                  onChange={(e) => updateQuote({ vat: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Discount %</Label>
                <Input 
                  type="number" 
                  value={quote.discount} 
                  onChange={(e) => updateQuote({ discount: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Shipping</Label>
                <Input 
                  type="number" 
                  value={quote.shipping} 
                  onChange={(e) => updateQuote({ shipping: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Currency</Label>
                <Select value={quote.currency} onValueChange={(v) => updateQuote({ currency: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(curr => <SelectItem key={curr} value={curr} className="text-xs">{curr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Bank Details</Label>
              <Textarea 
                rows={3} 
                value={quote.bank} 
                onChange={(e) => updateQuote({ bank: e.target.value })}
                className="text-xs resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-2">
                IBAN Number <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">SECURED IN QR</span>
              </Label>
              <Input 
                value={quote.iban} 
                onChange={(e) => updateQuote({ iban: e.target.value })}
                className="h-8 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Approved By</Label>
                <Input 
                  placeholder="Full Name" 
                  value={quote.approvedBy} 
                  onChange={(e) => updateQuote({ approvedBy: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Designation</Label>
                <Input 
                  placeholder="Title / Position" 
                  value={quote.designation} 
                  onChange={(e) => updateQuote({ designation: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Contact Number</Label>
              <Input 
                placeholder="Direct line" 
                value={quote.contactNum} 
                onChange={(e) => updateQuote({ contactNum: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Additional Notes</Label>
              <Textarea 
                placeholder="Any special remarks..." 
                rows={2} 
                value={quote.notes} 
                onChange={(e) => updateQuote({ notes: e.target.value })}
                className="text-xs resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Custom Footer Message</Label>
              <Textarea 
                placeholder="e.g. Thank you for your business..." 
                rows={2} 
                value={quote.footer} 
                onChange={(e) => updateQuote({ footer: e.target.value })}
                className="text-xs resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ClauseList quote={quote} updateQuote={updateQuote} />
    </div>
  );
}
