/**
 * Format price in Nigerian Naira using Intl.NumberFormat
 * @param {number} price - The price to format
 * @returns {string} Formatted price string (e.g., "₦1,200,000")
 */
export const formatNaira = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
