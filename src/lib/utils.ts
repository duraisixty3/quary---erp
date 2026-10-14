import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers according to Indian Rupee (INR) numbering system:
 * e.g. 100000 -> "₹ 1,00,000"
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0.00';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with en-IN locale
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Compact Indian Lakhs / Crores display for high-level dashboard metrics
 * e.g. 1,50,000 -> "₹ 1.50 L", 1,20,00,000 -> "₹ 1.20 Cr"
 */
export function formatCompactINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted = '';
  if (abs >= 10000000) {
    formatted = `₹ ${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    formatted = `₹ ${(abs / 100000).toFixed(2)} L`;
  } else if (abs >= 1000) {
    formatted = `₹ ${(abs / 1000).toFixed(1)} k`;
  } else {
    formatted = `₹ ${abs.toFixed(0)}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Standard Indian date display: DD-MM-YYYY
 */
export function formatDateDDMMYYYY(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Metric weight formatting
 */
export function formatWeight(mt: number | undefined | null, unit: string = 'MT'): string {
  if (mt === undefined || mt === null || isNaN(mt)) return `0.00 ${unit}`;
  return `${Number(mt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
}

/**
 * Convert volume (m3, brass) to MT using material density (tonnes per m3)
 * Standard in South Indian quarries:
 * 1 Brass = 100 cubic feet = 2.83168 cubic metres
 */
export function convertToTonnes(quantity: number, unit: string, densityFactorMTperM3: number = 1.6): number {
  if (!quantity) return 0;
  const density = densityFactorMTperM3 > 0 ? densityFactorMTperM3 : 1.6;

  switch (unit) {
    case 'MT':
      return quantity;
    case 'kg':
      return quantity / 1000;
    case 'm3':
      return quantity * density;
    case 'brass':
      return quantity * 2.83168 * density;
    default:
      return quantity;
  }
}

/**
 * Generate unique sequential business numbers:
 * e.g. "INV-2026-0042", "PO-2026-0018", "TRIP-2026-0105"
 */
export function generateDocNumber(prefix: string, count: number): string {
  const currentYear = new Date().getFullYear();
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${currentYear}-${sequence}`;
}
