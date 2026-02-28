import { create } from 'zustand';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: 'CA$',
  EUR: '€',
  GBP: '£',
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code + ' ';
}

export function formatSalary(value: number, currencyCode: string): string {
  return `${getCurrencySymbol(currencyCode)}${Math.round(value / 1000)}k`;
}

function loadExchangeRates(): Record<string, Record<string, number>> {
  try {
    const stored = localStorage.getItem('exchangeRates');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

interface CurrencyStore {
  currencies: string[];
  exchangeRates: Record<string, Record<string, number>>;
  displayCurrency: string | null;
  setCurrencies: (currencies: string[]) => void;
  setExchangeRate: (from: string, to: string, rate: number) => void;
  setDisplayCurrency: (currency: string | null) => void;
  allRatesAvailable: () => boolean;
  hasRatesForCurrency: (target: string) => boolean;
  convertSalary: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currencies: [],
  exchangeRates: loadExchangeRates(),
  displayCurrency: null,

  setCurrencies: (currencies) => set({ currencies }),

  setExchangeRate: (from, to, rate) => {
    set((state) => {
      const newRates = { ...state.exchangeRates };
      if (!newRates[from]) newRates[from] = {};
      newRates[from] = { ...newRates[from], [to]: rate };
      localStorage.setItem('exchangeRates', JSON.stringify(newRates));
      return { exchangeRates: newRates };
    });
  },

  setDisplayCurrency: (currency) => set({ displayCurrency: currency }),

  allRatesAvailable: () => {
    const { currencies, exchangeRates } = get();
    if (currencies.length <= 1) return true;
    for (const from of currencies) {
      for (const to of currencies) {
        if (from === to) continue;
        if (!exchangeRates[from]?.[to]) return false;
      }
    }
    return true;
  },

  hasRatesForCurrency: (target) => {
    const { currencies, exchangeRates } = get();
    for (const from of currencies) {
      if (from === target) continue;
      if (!exchangeRates[from]?.[target]) return false;
    }
    return true;
  },

  convertSalary: (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    const rate = get().exchangeRates[fromCurrency]?.[toCurrency];
    if (!rate) return amount;
    return Math.round((amount * rate) / 1000) * 1000;
  },
}));
