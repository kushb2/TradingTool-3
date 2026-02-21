import {
  FileTextOutlined,
  MinusOutlined,
  PlusOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Button, Input, Modal, Spin, Tooltip, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { InstrumentSearch } from "../components/InstrumentSearch";
import { StockNotesPanel } from "../components/StockNotesPanel";
import { TelegramChatWidget } from "../components/TelegramChatWidget";
import { useLayout } from "../hooks/useLayout";
import { useWatchlistData } from "../hooks/useWatchlistData";
import type { LayoutData, Stock, Watchlist } from "../types";

const PRIORITY_COLORS = ["", "#bfbfbf", "#52c41a", "#1677ff", "#faad14", "#f5222d"];

export function WatchlistPage() {
  const data = useWatchlistData();
  const { layout, saveLayout } = useLayout();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [activeWatchlistId, setActiveWatchlistId] = useState<number | null>(null);
  const [createWlOpen, setCreateWlOpen] = useState(false);
  const [createWlName, setCreateWlName] = useState("");
  const [createWlDesc, setCreateWlDesc] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  // Build stockId → Tags map
  const stockTagMap = useMemo(() => {
    const tagById = new Map(data.allTags.map((t) => [t.id, t]));
    const map = new Map<number, typeof data.allTags>();
    data.stockTags.forEach((st) => {
      const tag = tagById.get(st.tagId);
      if (!tag) return;
      const existing = map.get(st.stockId) ?? [];
      map.set(st.stockId, [...existing, tag]);
    });
    return map;
  }, [data.stockTags, data.allTags]);

  // Build stockId Map for quick lookup
  const stockById = useMemo(
    () => new Map(data.stocks.map((s) => [s.id, s])),
    [data.stocks],
  );

  // Order watchlists according to saved layout
  const orderedWatchlists = useMemo(() => {
    const orderMap = new Map(layout.watchlistOrder.map((id, i) => [id, i]));
    return [...data.watchlists].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 9999;
      const bi = orderMap.get(b.id) ?? 9999;
      return ai - bi;
    });
  }, [data.watchlists, layout.watchlistOrder]);

  // Set initial active watchlist when data loads
  useEffect(() => {
    if (activeWatchlistId === null && orderedWatchlists.length > 0) {
      setActiveWatchlistId(orderedWatchlists[0].id);
    }
  }, [orderedWatchlists, activeWatchlistId]);

  // Close notes when selected stock is cleared
  useEffect(() => {
    if (!selectedStock) setNotesOpen(false);
  }, [selectedStock]);

  const activeWatchlist = useMemo(
    () => orderedWatchlists.find((w) => w.id === activeWatchlistId) ?? orderedWatchlists[0] ?? null,
    [orderedWatchlists, activeWatchlistId],
  );

  const stocksForWatchlist = (watchlist: Watchlist): Stock[] => {
    const stockOrder = layout.stockOrder[String(watchlist.id)] ?? [];
    const orderMap = new Map(stockOrder.map((id, i) => [id, i]));
    const ids = new Set(
      data.watchlistStocks
        .filter((ws) => ws.watchlistId === watchlist.id)
        .map((ws) => ws.stockId),
    );
    const stocks = [...ids]
      .map((id) => stockById.get(id))
      .filter((s): s is Stock => s !== undefined);
    return stocks.sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 9999;
      const bi = orderMap.get(b.id) ?? 9999;
      return ai - bi;
    });
  };

  const existingStockIdsForWatchlist = (watchlistId: number): Set<number> =>
    new Set(
      data.watchlistStocks
        .filter((ws) => ws.watchlistId === watchlistId)
        .map((ws) => ws.stockId),
    );

  const activeStocks = activeWatchlist ? stocksForWatchlist(activeWatchlist) : [];
  const existingIds = activeWatchlist
    ? existingStockIdsForWatchlist(activeWatchlist.id)
    : new Set<number>();

  const handleCreateWatchlist = async () => {
    if (!createWlName.trim()) return;
    try {
      const wl = await data.createWatchlist(createWlName.trim(), createWlDesc.trim() || undefined);
      saveLayout({ ...layout, watchlistOrder: [...layout.watchlistOrder, wl.id] });
      setCreateWlOpen(false);
      setCreateWlName("");
      setCreateWlDesc("");
      setActiveWatchlistId(wl.id);
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Failed to create watchlist");
    }
  };

  const handleStockAdded = (watchlistId: number, stock: Stock) => {
    const currentOrder = layout.stockOrder[String(watchlistId)] ?? [];
    const next: LayoutData = {
      ...layout,
      stockOrder: { ...layout.stockOrder, [String(watchlistId)]: [...currentOrder, stock.id] },
    };
    saveLayout(next);
  };

  const handleUpdateDescription = async (description: string) => {
    if (!selectedStock) return;
    await data.updateStock(selectedStock.id, { description });
    setSelectedStock((prev) => (prev ? { ...prev, description } : prev));
  };

  const handleUpdatePriority = async (priority: number) => {
    if (!selectedStock) return;
    await data.updateStock(selectedStock.id, { priority });
    setSelectedStock((prev) => (prev ? { ...prev, priority } : prev));
  };

  if (data.loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 48px)" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      {/* ─── Main layout: narrow sidebar + right content ─── */}
      <div style={{ display: "flex", height: "calc(100vh - 48px)" }}>

        {/* ── Left sidebar ───────────────────────────────── */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: "#fff",
            borderRight: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search bar — adds to the active watchlist */}
          <div style={{ padding: "10px 12px 6px" }}>
            {activeWatchlist ? (
              <InstrumentSearch
                watchlistId={activeWatchlist.id}
                existingStockIds={existingIds}
                onStockAdded={(stock) => handleStockAdded(activeWatchlist.id, stock)}
              />
            ) : (
              <Button block type="dashed" icon={<PlusOutlined />} onClick={() => setCreateWlOpen(true)}>
                Create first watchlist
              </Button>
            )}
          </div>

          {/* Active watchlist name + count */}
          {activeWatchlist && (
            <div style={{ padding: "4px 14px 8px", borderBottom: "1px solid #f0f0f0" }}>
              <Typography.Text
                strong
                ellipsis
                style={{ fontSize: 12, color: "#444", maxWidth: 180, display: "inline-block" }}
              >
                {activeWatchlist.name}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
                ({activeStocks.length} / 250)
              </Typography.Text>
            </div>
          )}

          {/* Stock list — scrollable */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {data.error && (
              <div style={{ padding: "8px 16px" }}>
                <Typography.Text type="danger" style={{ fontSize: 11 }}>{data.error}</Typography.Text>
              </div>
            )}
            {activeWatchlist && activeStocks.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Search above to add stocks
                </Typography.Text>
              </div>
            )}
            {activeStocks.map((stock) => (
              <StockRow
                key={stock.id}
                stock={stock}
                tags={stockTagMap.get(stock.id) ?? []}
                isSelected={selectedStock?.id === stock.id}
                onSelect={() => {
                  const next = selectedStock?.id === stock.id ? null : stock;
                  setSelectedStock(next);
                  if (next) setNotesOpen(true);
                }}
                onRemove={() => void data.removeStockFromWatchlist(activeWatchlist!.id, stock.id)}
              />
            ))}
          </div>

          {/* ── Watchlist tabs ─ numbered, one per watchlist ─ */}
          <div
            style={{
              borderTop: "2px solid #f0f0f0",
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "#fafafa",
              flexWrap: "wrap",
            }}
          >
            {orderedWatchlists.map((wl, i) => (
              <Tooltip key={wl.id} title={wl.name} placement="top">
                <Button
                  size="small"
                  type={activeWatchlist?.id === wl.id ? "primary" : "text"}
                  onClick={() => setActiveWatchlistId(wl.id)}
                  style={{ minWidth: 28, height: 28, padding: "0 6px", fontSize: 12 }}
                >
                  {i + 1}
                </Button>
              </Tooltip>
            ))}
            <Tooltip title="New watchlist" placement="top">
              <Button
                size="small"
                type="text"
                icon={<PlusOutlined style={{ fontSize: 10 }} />}
                onClick={() => setCreateWlOpen(true)}
                style={{ minWidth: 28, height: 28, padding: "0 6px" }}
              />
            </Tooltip>
          </div>
        </div>

        {/* ── Right content area (chart / future use) ──── */}
        <div style={{ flex: 1, background: "#f5f7fa" }} />
      </div>

      {/* ─── Notes FAB (bottom-right, left of Telegram) ─── */}
      <div style={{ position: "fixed", bottom: 24, right: 84, zIndex: 1001 }}>
        <Tooltip
          title={selectedStock ? `Notes: ${selectedStock.symbol}` : "Select a stock to open notes"}
          placement="top"
        >
          <Button
            type={notesOpen ? "primary" : "default"}
            shape="circle"
            size="large"
            disabled={!selectedStock}
            icon={<FileTextOutlined />}
            onClick={() => setNotesOpen((v) => !v)}
            style={{ width: 48, height: 48, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          />
        </Tooltip>
      </div>

      {/* ─── Notes panel (opens above FABs) ─────────────── */}
      {notesOpen && selectedStock && (
        <StockNotesPanel
          stock={selectedStock}
          tags={stockTagMap.get(selectedStock.id) ?? []}
          onClose={() => setNotesOpen(false)}
          onUpdateDescription={handleUpdateDescription}
          onUpdatePriority={handleUpdatePriority}
        />
      )}

      {/* ─── Telegram FAB (bottom-right corner) ─────────── */}
      <TelegramChatWidget />

      {/* ─── Create watchlist modal ──────────────────────── */}
      <Modal
        open={createWlOpen}
        title="New Watchlist"
        onOk={() => void handleCreateWatchlist()}
        onCancel={() => { setCreateWlOpen(false); setCreateWlName(""); setCreateWlDesc(""); }}
        okText="Create"
        width={320}
      >
        <Input
          placeholder="Name"
          value={createWlName}
          onChange={(e) => setCreateWlName(e.target.value)}
          onPressEnter={() => void handleCreateWatchlist()}
          autoFocus
          style={{ marginBottom: 8 }}
        />
        <Input.TextArea
          placeholder="Description (optional)"
          value={createWlDesc}
          onChange={(e) => setCreateWlDesc(e.target.value)}
          rows={2}
        />
      </Modal>
    </>
  );
}

// ─── Stock row component ────────────────────────────────────────────────────

interface StockRowProps {
  stock: Stock;
  tags: ReturnType<typeof useWatchlistData>["allTags"];
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function StockRow({ stock, tags, isSelected, onSelect, onRemove }: StockRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 14px 7px 11px",
        cursor: "pointer",
        background: isSelected ? "#e6f4ff" : hovered ? "#f5f5f5" : "transparent",
        // Left accent border shows active selection — same pattern Kite uses
        borderLeft: isSelected ? "3px solid #1677ff" : "3px solid transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Typography.Text
            strong
            style={{ fontSize: 13, color: isSelected ? "#1677ff" : "#1f1f1f" }}
          >
            {stock.symbol}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 10 }}>
            {stock.exchange}
          </Typography.Text>
        </div>
        {/* Company name visible on hover */}
        {hovered && (
          <Typography.Text
            type="secondary"
            ellipsis
            style={{ fontSize: 10, display: "block", maxWidth: 180 }}
          >
            {stock.companyName}
          </Typography.Text>
        )}
      </div>

      {/* Right side: priority star (hidden on hover) + remove button */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {stock.priority != null && stock.priority > 0 && !hovered && (
          <StarFilled style={{ fontSize: 8, color: PRIORITY_COLORS[stock.priority] ?? "#bfbfbf" }} />
        )}
        {hovered && (
          <Tooltip title="Remove from watchlist">
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined style={{ fontSize: 10, color: "#ff4d4f" }} />}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ padding: "0 3px", height: 18 }}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
