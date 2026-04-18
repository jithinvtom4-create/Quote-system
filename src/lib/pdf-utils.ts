/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote } from '../types';
import QRCode from 'qrcode';

// HMAC-SHA256 Helper
export async function computeHMAC(message: string, secret: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', keyMaterial, enc.encode(message));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (e) {
    // Fallback simple hash
    let h = 0;
    const s = message + secret;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16).padStart(8, '0').repeat(4);
  }
}

// Build the canonical message for HVAC
export function buildHMACMessage(quote: Quote): string {
  const sub = quote.items.reduce((acc, item) => {
    return acc + item.qty * item.price * (1 - item.rowdisc / 100);
  }, 0);

  const discAmt = (sub * quote.discount) / 100;
  const beforeVat = sub - discAmt + quote.shipping;
  const vatAmt = (beforeVat * quote.vat) / 100;
  const grand = (beforeVat + vatAmt).toFixed(3);

  return [
    quote.quoteRef,
    quote.rfp,
    quote.custName,
    quote.quoteDate,
    quote.closeDate,
    quote.currency,
    grand,
    sub.toFixed(3),
    String(quote.items.length),
    quote.iban,
    quote.approvedBy,
  ].join('|');
}

// Generate QR Code Data URL with Security
export async function getSecureQRDataURL(quote: Quote, secret: string): Promise<string> {
  const canonMsg = buildHMACMessage(quote);
  const fullHash = await computeHMAC(canonMsg, secret);
  const shortHash = fullHash.substring(0, 16).toUpperCase();

  const lines = [
    `ALERADAH-SECURE-QR`,
    `REF:${quote.quoteRef.substring(0, 20)}`,
    quote.rfp ? `RFP:${quote.rfp.substring(0, 16)}` : '',
    quote.custName ? `TO:${quote.custName.substring(0, 18)}` : '',
    `AMT:${quote.currency} ${(quote.items.reduce((a, i) => a + i.qty * i.price * (1 - i.rowdisc / 100), 0) * (1 - quote.discount / 100) + quote.shipping) * (1 + quote.vat / 100)}`.substring(0, 20),
    `SIG:${shortHash}`,
  ].filter(Boolean);

  return await QRCode.toDataURL(lines.join('\n'), { 
    margin: 2,
    color: { dark: '#1a4d2e', light: '#ffffff' }
  });
}

// Number to Words utility (simplified)
export function amountWords(num: number, curr: string): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thouLabels = ['', 'Thousand', 'Million', 'Billion'];

  function threeToWords(n: number) {
    let s = '';
    const h = Math.floor(n / 100);
    const t = n % 100;
    if (h) s += ones[h] + ' Hundred ';
    if (t) {
      if (h) s += 'and ';
      if (t < 10) s += ones[t] + ' ';
      else if (t < 20) s += teens[t - 10] + ' ';
      else {
        s += tens[Math.floor(t / 10)] + ' ';
        if (t % 10) s += ones[t % 10] + ' ';
      }
    }
    return s;
  }

  function toWords(n: number) {
    if (n === 0) return 'Zero';
    let str = Math.floor(n).toString();
    str = '0'.repeat((3 - (str.length % 3)) % 3) + str;
    const groups = str.match(/\d{3}/g) || [];
    let words = '';
    for (let i = 0; i < groups.length; i++) {
      const g = parseInt(groups[i]);
      if (!g) continue;
      words += threeToWords(g);
      const label = thouLabels[groups.length - i - 1];
      if (label) words += label + ' ';
    }
    return words.trim();
  }

  const currConfig: Record<string, { label: string; subLabel: string; subFactor: number }> = {
    BHD: { label: 'Bahraini Dinars', subLabel: 'Fils', subFactor: 1000 },
    KWD: { label: 'Kuwaiti Dinars', subLabel: 'Fils', subFactor: 1000 },
    OMR: { label: 'Omani Rials', subLabel: 'Baisa', subFactor: 1000 },
    USD: { label: 'US Dollars', subLabel: 'Cents', subFactor: 100 },
    EUR: { label: 'Euros', subLabel: 'Cents', subFactor: 100 },
    SAR: { label: 'Saudi Riyals', subLabel: 'Halalas', subFactor: 100 },
    AED: { label: 'UAE Dirhams', subLabel: 'Fils', subFactor: 100 },
    QAR: { label: 'Qatari Riyals', subLabel: 'Dirhams', subFactor: 100 },
  };

  const cfg = currConfig[curr] || { label: curr, subLabel: 'Cents', subFactor: 100 };
  const intPart = Math.floor(num);
  const fracPart = Math.round((num - intPart) * cfg.subFactor);

  const mainWords = toWords(intPart);
  const fracWords = toWords(fracPart);

  if (fracPart === 0) {
    return `${cfg.label} ${mainWords} Only.`;
  }
  return `${cfg.label} ${mainWords} and ${fracWords} ${cfg.subLabel} Only.`;
}
