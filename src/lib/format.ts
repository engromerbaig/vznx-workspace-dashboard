export function formatPKR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'PKR 0';
  return 'Rs ' + Math.floor(num).toLocaleString('en-US', { maximumFractionDigits: 0 });
}