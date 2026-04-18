/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const UNITS = [
  'DRUM', 'PAILS', 'GALLON', 'EACH', 'PCS', 'KG', 'LTR', 'MT', 'IBC', 'LBS', 
  'METER', 'TABLET', 'PACKET', 'SET', 'BOX', 'BAG', 'CARTON', 'PALLET', 'OTHER'
];

export const CURRENCIES = ['BHD', 'USD', 'EUR', 'SAR', 'AED', 'KWD', 'OMR', 'QAR'];

export const PAYMENT_TERMS = [
  '60 days credit from the date of delivery',
  '30 days credit from the date of delivery',
  '45 days credit from the date of delivery',
  '90 days credit from the date of delivery',
  '120 days credit from the date of delivery',
  'Advance 50% and balance against delivery',
  'Advance 100%',
  'Letter of Credit (L/C)',
  'Cash Against Documents (CAD)',
  'Net 7 days'
];

export const INCOTERMS = [
  'DAP warehouse', 'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP', 'FOB', 'CFR', 'CIF'
];

export const CONFIRM_OPTS = [
  { value: 'confirmed', label: '✓ Confirmed', color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'partial', label: '~ Partially Confirmed', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'noted', label: 'ℹ Noted', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'not-accepted', label: '✗ Not Accepted', color: 'text-red-700 bg-red-50 border-red-200' }
] as const;

export const DEFAULT_BANK_DETAILS = `Kuwait Finance House B.S.C. (c)
Account: 0006684444001
Swift: AUBBBHBM
Currency: BHD`;

export const DEFAULT_IBAN = 'BH67AUBB00006684444001';

export const PRODUCT_CATALOG = [
  { desc: 'SODIUM HYPOCHLORITE (12-15%)', mfr: 'AEC-INTERNAL', origin: 'UAE', packing: '30 KG PAIL', unit: 'PAILS', price: 4.500 },
  { desc: 'HYDROCHLORIC ACID (32%)', mfr: 'GULF-CHLORINE', origin: 'BAHRAIN', packing: '25 KG PAIL', unit: 'PAILS', price: 6.200 },
  { desc: 'CAUSTIC SODA FLAKES (98% min)', mfr: 'INTERNAL', origin: 'GCC', packing: '25 KG BAG', unit: 'BAG', price: 7.800 },
  { desc: 'SULPHURIC ACID (98%)', mfr: 'SUL-TEK', origin: 'GCC', packing: '30 KG DRUM', unit: 'DRUM', price: 5.500 },
  { desc: 'ALUMINIUM SULPHATE (COAGULANT)', mfr: 'ALUM-CORP', origin: 'GCC', packing: '25 KG BAG', unit: 'BAG', price: 3.200 },
  { desc: 'CHLORINE GAS (99.9%)', mfr: 'GCC-GAS', origin: 'GCC', packing: '68 KG CYLINDER', unit: 'PCS', price: 125.000 },
  { desc: 'POTASSIUM PERMANGANATE', mfr: 'CARUS', origin: 'USA', packing: '25 KG DRUM', unit: 'DRUM', price: 45.000 },
  { desc: 'CALCIUM HYPOCHLORITE (70%)', mfr: 'HTH', origin: 'USA', packing: '45 KG DRUM', unit: 'DRUM', price: 58.500 },
];

export const CUSTOMER_DIRECTORY = [
  { name: 'National Water Authority', attn: 'Eng. Ahmed Al-Malki', phone: '+973 17224466', email: 'ahmed@nwa.gov.bh', addr: 'Bldg 55, Road 12, Manama, Bahrain' },
  { name: 'Gulf Industrial Corp', attn: 'Siddharth Rao', phone: '+973 17448899', email: 'procurement@gic.com', addr: 'Hidd Industrial Area, Bahrain' },
  { name: 'Bahrain Petrochemical', attn: 'Laila Hussain', phone: '+973 17772211', email: 'laila@bapco.bh', addr: 'Sitra Refinery, Bahrain' },
];

export const CLAUSE_TEMPLATES: { name: string, clauses: { clause: string, confirm: 'confirmed' | 'partial' | 'noted' | 'not-accepted', remarks: string }[] }[] = [
  {
    name: 'Standard Local Delivery',
    clauses: [
      { clause: 'Delivery within 3-5 working days from receipt of LPO.', confirm: 'confirmed', remarks: '' },
      { clause: 'Payment: 30 days credit from delivery.', confirm: 'confirmed', remarks: '' },
      { clause: 'Prices are inclusive of delivery within Bahrain.', confirm: 'confirmed', remarks: '' }
    ]
  },
  {
    name: 'Export (GCC) Terms',
    clauses: [
      { clause: 'Delivery: EXW Bahrain Warehouse.', confirm: 'noted', remarks: 'Customer to arrange collection' },
      { clause: 'Payment: 100% Advance.', confirm: 'confirmed', remarks: '' },
      { clause: 'Validity: 7 days due to raw material volatility.', confirm: 'confirmed', remarks: '' }
    ]
  }
];
