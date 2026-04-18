/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Eye, FileText, Printer, FileDown, Plus, Send, ShieldCheck, ArrowLeft, Archive } from 'lucide-react';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { getSecureQRDataURL, amountWords } from '../lib/pdf-utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError } from '../lib/firestore-utils';

interface QuotePreviewProps {
  quote: Quote;
  totals: any;
  onBack: () => void;
  onNew: () => void;
}

export function QuotePreview({ quote, totals, onBack, onNew }: QuotePreviewProps) {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const genQr = async () => {
      const secret = localStorage.getItem('aec_hmac_key') || 'AEC-KEY';
      const url = await getSecureQRDataURL(quote, secret);
      setQrUrl(url);
    };
    genQr();
  }, [quote]);

  const handleSave = async (statusOverride?: string) => {
    if (!user) return;
    setIsSaving(true);
    const toastId = toast.loading('Saving quote to cloud...');
    try {
      const dataToSave = {
        ...quote,
        status: (statusOverride || quote.status) as any,
        savedAt: new Date().toISOString(),
        userId: user.uid
      };
      await setDoc(doc(db, 'quotes', quote.id), dataToSave);
      toast.success('Quote saved successfully', { id: toastId });
    } catch (e) {
      handleFirestoreError(e, 'create', 'quotes');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Generating secure PDF...');
    
    try {
      // Lazy load logic for simulation - in real app would use the pdf tool
      // But we can implement a basic version with jsPDF
      const doc = new jsPDF() as any;
      const p = 15;
      const W = 210;
      
      // Header
      doc.setFillColor(26, 77, 46);
      doc.rect(0, 0, W, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('AL ERADAH CHEMICAL WLL', p, 15);
      doc.setFontSize(8);
      doc.text('Premium Chemical Solutions & Distribution', p, 21);
      
      doc.setFontSize(7);
      doc.text('Block 952, Road 5232, Bldg 1828, Raz Zuwayed, Bahrain', p, 28);
      doc.text('+973-17413720 | info@aleradahchemicals.com', p, 33);

      doc.setFillColor(212, 160, 23);
      doc.rect(0, 40, W, 2, 'F');

      let y = 50;
      doc.setTextColor(26, 77, 46);
      doc.setFontSize(12);
      doc.text('COMMERCIAL OFFER', p, y);
      y += 8;

      doc.setFontSize(9);
      doc.text(`TO: ${quote.custName}`, p, y);
      doc.text(`REF: ${quote.quoteRef}`, W - p, y, { align: 'right' });
      y += 5;
      doc.text(`ATTN: ${quote.custAttn}`, p, y);
      doc.text(`DATE: ${quote.quoteDate}`, W - p, y, { align: 'right' });
      
      // Table
      const head = [['#', 'Description', 'Mfr', 'Qty', 'Unit', 'Price', 'Total']];
      const body = quote.items.map((it, i) => [
        i + 1,
        it.desc,
        it.mfr,
        it.qty,
        it.unit,
        it.price.toFixed(3),
        (it.qty * it.price * (1 - it.rowdisc / 100)).toFixed(3)
      ]);

      autoTable(doc, {
        startY: y + 10,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46] },
        styles: { fontSize: 8 }
      });

      y = (doc as any).lastAutoTable.finalY + 10;
      
      // Totals
      doc.text(`Subtotal: ${quote.currency} ${totals.subtotal.toFixed(3)}`, W - p, y, { align: 'right' });
      y += 5;
      doc.text(`VAT (${quote.vat}%): ${quote.currency} ${totals.vatAmount.toFixed(3)}`, W - p, y, { align: 'right' });
      y += 5;
      doc.setFontSize(11);
      doc.text(`Grand Total: ${quote.currency} ${totals.grandTotal.toFixed(3)}`, W - p, y, { align: 'right' });

      // QR Code
      if (qrUrl) {
        doc.addImage(qrUrl, 'PNG', p, y - 10, 30, 30);
      }

      // Digital Signatures
      if (quote.signature && quote.autoSign) {
        doc.addImage(quote.signature, 'PNG', W - 60, y + 20, 40, 15);
        doc.text(quote.approvedBy, W - 40, y + 40, { align: 'center' });
      }

      doc.save(`${quote.quoteRef}_Offer.pdf`);
      toast.success('PDF generated successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
            <Eye className="w-4 h-4 text-emerald-600" /> Offer Preview
            <Badge className={cn(
              "ml-2 uppercase text-[9px]",
              quote.status === 'draft' ? "bg-slate-100 text-slate-700" :
              quote.status === 'sent' ? "bg-blue-100 text-blue-700" :
              "bg-emerald-100 text-emerald-700"
            )}>
              {quote.status}
            </Badge>
          </CardTitle>
          <div className="text-[11px] font-bold text-slate-500">Ref: {quote.quoteRef}</div>
        </CardHeader>
        <CardContent className="p-0">
           {/* Visual Preview Shell */}
           <div className="bg-slate-200 p-8 min-h-[800px] flex justify-center">
              <div className="bg-white w-full max-w-[800px] shadow-2xl rounded-sm overflow-hidden flex flex-col scale-[0.98] origin-top">
                 {/* Header */}
                 <div className="bg-[#1a4d2e] p-8 pb-4 text-white relative">
                    <div className="h-0.5 bg-amber-500 absolute bottom-0 left-0 right-0" />
                    <div className="flex justify-between items-start">
                       <div>
                          <h1 className="text-2xl font-black tracking-tight">AL ERADAH CHEMICAL WLL</h1>
                          <p className="text-[10px] text-emerald-200 italic font-medium">Premium Chemical Solutions & Distribution</p>
                          <div className="mt-4 text-[9px] text-emerald-100 space-y-0.5 opacity-80">
                             <div>Block 952, Road 5232, Bldg 1828, Raz Zuwayed, Bahrain</div>
                             <div>+973-17413720 | info@aleradahchemicals.com</div>
                          </div>
                       </div>
                       <div className="bg-amber-500 text-emerald-900 p-3 rounded-lg text-center font-bold text-[10px] shadow-lg">
                          CR No: 17538-3<br />ISO 9001:2015
                       </div>
                    </div>
                 </div>

                 {/* Body */}
                 <div className="p-8 flex-1 space-y-6">
                    <div className="flex justify-between border-b pb-4">
                       <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Customer</span>
                          <div className="font-black text-lg text-slate-900">{quote.custName || '—'}</div>
                          <div className="text-xs text-slate-600">Attn: {quote.custAttn || '—'}</div>
                          <div className="text-[10px] text-slate-400 whitespace-pre-line">{quote.custAddr}</div>
                       </div>
                       <div className="text-right space-y-1">
                          <div className="flex justify-end gap-4 text-[10px] border-b pb-1">
                             <div className="font-bold text-slate-400">REF: <span className="text-emerald-900 font-black">{quote.quoteRef}</span></div>
                             <div className="font-bold text-slate-400">DATE: <span className="text-emerald-900 font-black">{quote.quoteDate}</span></div>
                          </div>
                          <div className="flex flex-col gap-1 pt-2">
                             <div className="text-[10px] text-slate-400 font-bold uppercase">RFP: <span className="text-slate-900">{quote.rfp || '—'}</span></div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase">Validity: <span className="text-slate-900">{quote.validity} Days</span></div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="text-sm font-black text-emerald-900 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> COMMERCIAL OFFER
                       </div>
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-emerald-950 text-white text-[10px] font-bold uppercase">
                                <th className="p-2 w-8">#</th>
                                <th className="p-2">Description</th>
                                <th className="p-2">Mfr</th>
                                <th className="p-2">Packing</th>
                                <th className="p-2 w-12 text-center">Qty</th>
                                <th className="p-2 w-20 text-right">Price</th>
                                <th className="p-2 w-24 text-right">Total</th>
                             </tr>
                          </thead>
                          <tbody className="text-xs">
                             {quote.items.filter(it => it.desc).map((it, idx) => (
                                <tr key={it.id} className="border-b even:bg-slate-50">
                                   <td className="p-2 text-[10px] font-bold text-slate-400">{idx + 1}</td>
                                   <td className="p-2 font-bold text-emerald-950">{it.desc}</td>
                                   <td className="p-2 text-slate-500 font-medium">{it.mfr}</td>
                                   <td className="p-2 text-slate-500 font-medium">{it.packing}</td>
                                   <td className="p-2 text-center font-bold text-slate-700">{it.qty} {it.unit}</td>
                                   <td className="p-2 text-right text-slate-600 font-medium">{it.price.toFixed(3)}</td>
                                   <td className="p-2 text-right font-black text-emerald-900">{(it.qty * it.price * (1 - it.rowdisc / 100)).toFixed(3)}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>

                    <div className="flex justify-between items-start pt-4">
                       <div className="max-w-[400px]">
                          {qrUrl && (
                             <div className="flex items-center gap-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <img src={qrUrl} className="w-16 h-16 bg-white p-1 border rounded shadow-sm" />
                                <div className="space-y-1">
                                   <div className="text-[9px] font-black text-emerald-900 uppercase flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" /> HMAC SECURED VERIFICATION
                                   </div>
                                   <div className="text-[8px] text-emerald-700 leading-tight">
                                      This document is digitally signed. Scan to verify origin and integrity using Al Eradah secure keys.
                                   </div>
                                </div>
                             </div>
                          )}
                          <div className="mt-4 space-y-1">
                             <div className="text-[10px] font-bold text-emerald-800">TERMS & CONDITIONS:</div>
                             <div className="text-[9px] text-slate-500 grid grid-cols-2 gap-x-4">
                                <div><span className="font-bold">Payment:</span> {quote.payment}</div>
                                <div><span className="font-bold">Lead Time:</span> {quote.leadTime}</div>
                                <div><span className="font-bold">Incoterms:</span> {quote.incoterms}</div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="w-[200px] pt-2">
                          <div className="space-y-2">
                             <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>Subtotal:</span>
                                <span>{quote.currency} {totals.subtotal.toFixed(3)}</span>
                             </div>
                             {totals.discountAmount > 0 && (
                                <div className="flex justify-between text-[11px] font-bold text-red-500">
                                   <span>Discount ({quote.discount}%):</span>
                                   <span>-{quote.currency} {totals.discountAmount.toFixed(3)}</span>
                                </div>
                             )}
                             <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                <span>VAT ({quote.vat}%):</span>
                                <span>{quote.currency} {totals.vatAmount.toFixed(3)}</span>
                             </div>
                             <div className="border-t-2 border-emerald-900 pt-2 flex justify-between text-base font-black text-emerald-950">
                                <span>Total:</span>
                                <span>{quote.currency} {totals.grandTotal.toFixed(3)}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 flex justify-between items-end">
                       <div className="space-y-4">
                          <div className="space-y-0.5">
                             <div className="text-[10px] italic text-slate-400">Yours faithfully,</div>
                             <div className="text-xs font-black text-emerald-950">AL ERADAH CHEMICAL WLL</div>
                          </div>
                          {quote.autoStamp && quote.stamp && (
                             <img src={quote.stamp} className="max-h-20 opacity-80 rotate-[-8deg] ml-4" />
                          )}
                       </div>

                       <div className="text-center space-y-2 min-w-[200px]">
                          <div className="text-[9px] font-bold text-slate-400 uppercase letter-tracking-widest">Authorised Signatory</div>
                          <div className="h-12 flex items-end justify-center">
                             {quote.autoSign && quote.signature ? (
                                <img src={quote.signature} className="max-h-12 object-contain" />
                             ) : (
                                <div className="w-40 border-b border-slate-300" />
                             )}
                          </div>
                          <div className="space-y-0.5">
                             <div className="text-xs font-black text-emerald-900">{quote.approvedBy || '—'}</div>
                             <div className="text-[9px] text-slate-500 font-bold uppercase">{quote.designation}</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="bg-[#1a4d2e] p-4 text-[8px] text-emerald-100 flex justify-between items-center text-center">
                    <div className="flex-1">AL ERADAH CHEMICAL WLL • SECURE OFFER SYSTEM v2.0 • COPYRIGHT 2026</div>
                    <div className="px-4 border-l border-emerald-800">PAGE 1 / 1</div>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-between gap-4 pt-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-xl">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="text-emerald-700 border-emerald-200" onClick={() => handleSave()} disabled={isSaving}>
            <Archive className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Register'}
          </Button>
          <Button variant="outline" className="text-blue-700 border-blue-200" onClick={() => handleSave('sent')} disabled={isSaving}>
            <Send className="w-4 h-4 mr-2" /> Mark as Sent
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={generatePDF} disabled={isGenerating}>
            <FileDown className="w-4 h-4 mr-2" /> {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button variant="default" className="bg-amber-600 hover:bg-amber-700" onClick={onNew}>
            <Plus className="w-4 h-4 mr-2" /> New Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
