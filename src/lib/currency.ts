// Exchange rates relative to USD (simplified - in production use an API)
const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.50,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.97,
  KRW: 1320.50,
  SGD: 1.34,
  HKD: 7.82,
  NZD: 1.64,
}

export const supportedCurrencies = Object.keys(exchangeRates)

export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  MXN: '$',
  BRL: 'R$',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
}

export function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = exchangeRates[from] || 1
  const toRate = exchangeRates[to] || 1
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  const convertedAmount = usdAmount * toRate
  
  return Math.round(convertedAmount * 100) / 100
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getDisplayCurrency(currency: string): string {
  return `${currencySymbols[currency] || currency} ${currency}`
}
