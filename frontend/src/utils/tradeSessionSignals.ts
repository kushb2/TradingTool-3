import type { DayDetail, Trade } from "../types";

export interface PriceZone {
  low: number;
  high: number;
}

export interface TradeSessionSignalConfig {
  entryPrice: number;
  entryDayLow?: number;
  stopPrice?: number;
  supportZone?: PriceZone;
  buyZone?: PriceZone;
  bearishBodyThresholdPct?: number;
}

export type SessionSignalKind =
  | "dip_recovery"
  | "dip_in_zone"
  | "bearish_close"
  | "high_vol"
  | "range_compression";

export type DominantSignal = "dip_recovery" | "dip_in_zone" | "bearish_close" | "neutral";

export type LowSeverity = "buy_zone" | "entry_hit" | "none";

export interface SessionSignalRow {
  date: string;
  range: number;
  bodyPct: number;
  supportTouched: boolean;
  isDipRecovery: boolean;
  isDipInZone: boolean;
  isBearishClose: boolean;
  isHighVolume: boolean;
  isRangeCompression: boolean;
  dominantSignal: DominantSignal;
  lowSeverity: LowSeverity;
  signals: SessionSignalKind[];
}

export interface TradeSessionSignalsResult {
  avgVolume: number;
  supportZone: PriceZone | null;
  buyZone: PriceZone | null;
  entryPrice: number | null;
  rowsByDate: Record<string, SessionSignalRow>;
}

function normalizeZone(zone: PriceZone): PriceZone {
  return zone.low <= zone.high ? zone : { low: zone.high, high: zone.low };
}

function parseNumeric(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function deriveSignalConfigFromTrade(trade: Trade): TradeSessionSignalConfig | null {
  const entryPrice = parseNumeric(trade.avg_buy_price);
  if (entryPrice === null) return null;

  const entryDayLow = parseNumeric(trade.today_low);
  const stopPrice = parseNumeric(trade.stop_loss_price);

  return {
    entryPrice,
    entryDayLow: entryDayLow ?? undefined,
    stopPrice: stopPrice ?? undefined,
  };
}

export function computeTradeSessionSignals(
  days: DayDetail[],
  signalConfig?: TradeSessionSignalConfig,
): TradeSessionSignalsResult {
  const avgVolume = days.length > 0
    ? days.reduce((sum, day) => sum + day.volume, 0) / days.length
    : 0;

  const entryPrice = signalConfig?.entryPrice ?? null;
  const threshold = Math.abs(signalConfig?.bearishBodyThresholdPct ?? 1.0);

  const supportZone = (() => {
    if (!signalConfig || entryPrice === null) return null;
    if (signalConfig.supportZone) return normalizeZone(signalConfig.supportZone);

    const fallbackLow = signalConfig.entryDayLow ?? entryPrice;
    const derivedLow = signalConfig.stopPrice !== undefined
      ? Math.min(signalConfig.stopPrice, fallbackLow)
      : fallbackLow;
    return normalizeZone({ low: derivedLow, high: entryPrice });
  })();

  const buyZone = (() => {
    if (!signalConfig || entryPrice === null) return null;
    if (signalConfig.buyZone) return normalizeZone(signalConfig.buyZone);
    return normalizeZone({
      low: entryPrice * 1.01,
      high: entryPrice * 1.04,
    });
  })();

  const ranges = days.map((day) => day.high - day.low);
  const sortedRanges = [...ranges].sort((a, b) => a - b);
  const compressionCount = Math.max(1, Math.ceil(days.length * 0.3));
  const compressionThreshold = sortedRanges.length > 0
    ? sortedRanges[Math.min(compressionCount - 1, sortedRanges.length - 1)]
    : 0;

  const rowsByDate: Record<string, SessionSignalRow> = {};

  days.forEach((day) => {
    const range = day.high - day.low;
    const bodyPct = day.open > 0 ? ((day.close - day.open) / day.open) * 100 : 0;
    const supportTouched = supportZone !== null && day.low <= supportZone.high;
    const isDipRecovery = supportTouched && day.close > day.open;
    const isDipInZone = supportTouched && day.close <= day.open;
    const isBearishClose = bodyPct <= -threshold;
    const isHighVolume = day.volume > avgVolume;
    const isRangeCompression = range <= compressionThreshold;

    const lowSeverity: LowSeverity = (() => {
      if (entryPrice !== null && day.low <= entryPrice) return "entry_hit";
      if (buyZone !== null && day.low >= buyZone.low && day.low <= buyZone.high) return "buy_zone";
      return "none";
    })();

    const dominantSignal: DominantSignal = (() => {
      if (isDipRecovery) return "dip_recovery";
      if (isDipInZone) return "dip_in_zone";
      if (isBearishClose) return "bearish_close";
      return "neutral";
    })();

    const signals: SessionSignalKind[] = [];
    if (isDipRecovery) signals.push("dip_recovery");
    if (isDipInZone) signals.push("dip_in_zone");
    if (isBearishClose) signals.push("bearish_close");
    if (isHighVolume) signals.push("high_vol");
    if (isRangeCompression) signals.push("range_compression");

    rowsByDate[day.date] = {
      date: day.date,
      range,
      bodyPct,
      supportTouched,
      isDipRecovery,
      isDipInZone,
      isBearishClose,
      isHighVolume,
      isRangeCompression,
      dominantSignal,
      lowSeverity,
      signals,
    };
  });

  return {
    avgVolume,
    supportZone,
    buyZone,
    entryPrice,
    rowsByDate,
  };
}
