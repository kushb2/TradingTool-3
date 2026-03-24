export interface Watchlist {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: number;
  symbol: string;
  instrument_token: number;
  company_name: string;
  exchange: string;
  description: string | null;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export interface WatchlistStock {
  id: number;
  watchlist_id: number;
  stock_id: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StockTag {
  id: number;
  stock_id: number;
  tag_id: number;
  created_at: string;
}

export interface WatchlistTag {
  id: number;
  watchlist_id: number;
  tag_id: number;
  created_at: string;
}

export interface StockNote {
  id: number;
  stock_id: number;
  content: string;
  created_at: string;
}

export interface UserLayout {
  id: number;
  layout_data: string; // raw JSON string: { watchlistOrder: number[], stockOrder: Record<string, number[]> }
  updated_at: string;
}

export interface LayoutData {
  watchlistOrder: number[];
  stockOrder: Record<string, number[]>; // key is watchlistId string
}

export interface InstrumentSearchResult {
  instrument_token: number;
  trading_symbol: string;
  company_name: string;
  exchange: string;
  instrument_type: string;
}

export interface GttTarget {
  percent: number;
  price: string;
  yield_percent: string;
}

export interface Trade {
  id: number;
  stock_id: number;
  nse_symbol: string;
  quantity: number;
  avg_buy_price: string;
  today_low: string | null;
  stop_loss_percent: string;
  stop_loss_price: string;
  notes: string | null;
  trade_date: string;
  created_at: string;
  updated_at: string;
}

export interface TradeWithTargets {
  trade: Trade;
  gtt_targets: GttTarget[];
  total_invested: string;
}

export interface CreateTradeInput {
  stock_id: number;
  nse_symbol: string;
  quantity: number;
  avg_buy_price: string;
  today_low?: string;
  stop_loss_percent: string;
  notes?: string;
  trade_date?: string;
}
