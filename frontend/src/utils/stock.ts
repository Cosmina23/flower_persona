import { FLOWERS, INITIAL_STOCK_PER_FLOWER, type FlowerKey } from "../data/questions";

const LOCAL_STORAGE_STOCK_KEY = "quiz_flower_stock_v1";

export type Stock = Record<FlowerKey, number>;

export function defaultStock(): Stock {
  return FLOWERS.reduce((acc, flower) => {
    acc[flower] = INITIAL_STOCK_PER_FLOWER;
    return acc;
  }, {} as Stock);
}

function sanitizeStock(candidate: Partial<Record<string, unknown>>): Stock {
  const clean = {} as Stock;
  for (const flower of FLOWERS) {
    const raw = candidate?.[flower];
    const val = Number(raw);
    clean[flower] = Number.isFinite(val)
      ? Math.max(0, Math.floor(val))
      : INITIAL_STOCK_PER_FLOWER;
  }
  return clean;
}

export function loadStock(): Stock {
  const raw = localStorage.getItem(LOCAL_STORAGE_STOCK_KEY);
  if (!raw) {
    const stock = defaultStock();
    saveStock(stock);
    return stock;
  }
  try {
    const parsed = JSON.parse(raw);
    const stock = sanitizeStock(parsed);
    saveStock(stock);
    return stock;
  } catch {
    const stock = defaultStock();
    saveStock(stock);
    return stock;
  }
}

export function saveStock(stock: Stock): void {
  localStorage.setItem(LOCAL_STORAGE_STOCK_KEY, JSON.stringify(stock));
}

export function allStockEmpty(stock: Stock): boolean {
  return FLOWERS.every((flower) => stock[flower] === 0);
}
