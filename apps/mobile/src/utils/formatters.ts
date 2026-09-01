/**
 * Formats a numeric or decimal string value into Indian Rupee (INR) currency representation.
 * Examples: 1250.5 -> "₹1,250.50", "5000" -> "₹5,000.00"
 */
export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') {
    return '₹0.00';
  }

  const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericValue)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Formats ISO date string into human readable display string.
 */
export function formatDateDisplay(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}
