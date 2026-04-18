/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuoteStatus = 'draft' | 'sent' | 'review' | 'approved' | 'rejected' | 'won';

export interface QuoteItem {
  id: string;
  desc: string;
  mfr: string;
  origin: string;
  packing: string;
  unit: string;
  qty: number;
  price: number;
  rowdisc: number;
  lead: string;
}

export interface Clause {
  id: string;
  clause: string;
  confirm: 'confirmed' | 'partial' | 'noted' | 'not-accepted';
  remarks: string;
}

export interface Customer {
  id: string;
  name: string;
  attn: string;
  addr: string;
  phone: string;
  email: string;
}

export interface Quote {
  id: string;
  userId: string;
  savedAt: string;
  quoteRef: string;
  rfp: string;
  closeDate: string;
  quoteDate: string;
  validity: number;
  incoterms: string;
  custName: string;
  custAttn: string;
  custAddr: string;
  custPhone: string;
  custEmail: string;
  payment: string;
  leadTime: string;
  vat: number;
  discount: number;
  currency: string;
  shipping: number;
  bank: string;
  iban: string;
  notes: string;
  approvedBy: string;
  designation: string;
  contactNum: string;
  status: QuoteStatus;
  footer: string;
  items: QuoteItem[];
  clauses: Clause[];
  signature?: string;
  stamp?: string;
  autoSign: boolean;
  autoStamp: boolean;
}

export interface Template {
  name: string;
  data: Partial<Quote>;
}
