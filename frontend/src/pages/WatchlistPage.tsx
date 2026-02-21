import {
  FileTextOutlined,
  MinusOutlined,
  PlusOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Button, Collapse, Modal, Input, Spin, Tag, Tooltip, Typography, message } from "antd";
import { useMemo, useState } from "react";
import { InstrumentSearch } from "../components/InstrumentSearch";
import { StockNotesPanel } from "../components/StockNotesPanel";
import { useLayout } from "../hooks/useLayout";
import { useWatchlistData } from "../hooks/useWatchlistData";
import type { LayoutData, Stock, Watchlist } from "../types";

const PRIORITY_COLORS = ["", "#bfbfbf", "#52c41a", "#1677ff", "#faad14", "#f5222d"];

export function WatchlistPage() {
  const data = useWatchlistData();
  const { layout, saveLayout } = useLayout();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
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

  // Build watchlistId → Tags map
  const watchlistTagMap = useMemo(() => {
    const tagById = new Map(data.allTags.map((t) => [t.id, t]));
    const map = new Map<number, typeof data.allTags>();
    data.watchlistTags.forEach((wt) => {
      const tag = tagById.get(wt.tagId);
      if (!tag) return;
      const existing = map.get(wt.watchlistId) ?? [];
      map.set(wt.watchlistId, [...existing, tag]);
    });
    return map;
  }, [data.watchlistTags, data.allTags]);

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

  // Return stocks for a watchlist, ordered by saved layout
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

  const existingStockIdsForWatchlist = (watchlistId: number): Set<number> => {
    return new Set(
      data.watchlistStocks
        .filter((ws) => ws.watchlistId === watchlistId)
        .map((ws) => ws.stockId),
    );
  };

  const handleCreateWatchlist = async () => {
    if (!createWlName.trim()) return;
    try {
      const wl = await data.createWatchlist(createWlName.trim(), createWlDesc.trim() || undefined);
      // Append to end of layout order
      saveLayout({
        ...layout,
        watchlistOrder: [...layout.watchlistOrder, wl.id],
      });
      setCreateWlOpen(false);
      setCreateWlName("");
      setCreateWlDesc("");
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Failed to create watchlist");
    }
  };

  const handleStockAdded = (watchlistId: number, stock: Stock) => {
    const currentOrder = layout.stockOrder[String(watchlistId)] ?? [];
    const next: LayoutData = {
      ...layout,
      stockOrder: {
        ...layout.stockOrder,
        [String(watchlistId)]: [...currentOrder, stock.id],
      },
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const collapseItems = orderedWatchlists.map((watchlist) => {
    const wlTags = watchlistTagMap.get(watchlist.id) ?? [];
    const stocks = stocksForWatchlist(watchlist);
    const existingIds = existingStockIdsForWatchlist(watchlist.id);

    return {
      key: String(watchlist.id),
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Typography.Text strong style={{ fontSize: 13 }}>
            {watchlist.name}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            ({stocks.length})
          </Typography.Text>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {wlTags.map((tag) => (
              <Tag key={tag.id} color="geekblue" style={{ margin: 0, fontSize: 10, lineHeight: "16px" }}>
                {tag.name}
              </Tag>
            ))}
          </div>
        </div>
      ),
      children: (
        <div>
          {/* Instrument search to add a stock */}
          <div style={{ marginBottom: 12 }}>
            <InstrumentSearch
              watchlistId={watchlist.id}
              existingStockIds={existingIds}
              onStockAdded={(stock) => handleStockAdded(watchlist.id, stock)}
            />
          </div>

          {/* Stock rows */}
          {stocks.length === 0 ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              No stocks yet. Search above to add.
            </Typography.Text>
          ) : (
            stocks.map((stock) => (
              <StockRow
                key={stock.id}
                stock={stock}
                tags={stockTagMap.get(stock.id) ?? []}
                isSelected={selectedStock?.id === stock.id}
                onSelect={() => setSelectedStock(selectedStock?.id === stock.id ? null : stock)}
                onRemove={() => void data.removeStockFromWatchlist(watchlist.id, stock.id)}
              />
            ))
          )}
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: "16px 20px", maxWidth: 520 }}>
      {contextHolder}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Watchlists
        </Typography.Title>
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateWlOpen(true)}
        >
          New Watchlist
        </Button>
      </div>

      {data.error && (
        <Typography.Text type="danger" style={{ display: "block", marginBottom: 12 }}>
          {data.error}
        </Typography.Text>
      )}

      <Collapse
        items={collapseItems}
        defaultActiveKey={orderedWatchlists.map((w) => String(w.id))}
        style={{ background: "#fff", border: "1px solid #f0f0f0" }}
      />

      {/* Notes panel — fixed bottom-right overlay */}
      {selectedStock && (
        <StockNotesPanel
          stock={selectedStock}
          tags={stockTagMap.get(selectedStock.id) ?? []}
          onClose={() => setSelectedStock(null)}
          onUpdateDescription={handleUpdateDescription}
          onUpdatePriority={handleUpdatePriority}
        />
      )}

      {/* Create watchlist modal */}
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
    </div>
  );
}

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
        padding: "6px 8px",
        marginBottom: 2,
        borderRadius: 6,
        cursor: "pointer",
        background: isSelected ? "#e6f4ff" : hovered ? "#fafafa" : "transparent",
        border: isSelected ? "1px solid #91caff" : "1px solid transparent",
        transition: "background 0.1s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        {/* Priority dot */}
        {stock.priority != null && stock.priority > 0 && (
          <StarFilled
            style={{
              fontSize: 8,
              color: PRIORITY_COLORS[stock.priority] ?? "#bfbfbf",
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <Typography.Text strong style={{ fontSize: 12 }}>
            {stock.symbol}
          </Typography.Text>
          {/* Tags visible on hover */}
          {hovered && tags.length > 0 && (
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: 2 }}>
              {tags.map((tag) => (
                <Tag key={tag.id} color="blue" style={{ margin: 0, fontSize: 10, lineHeight: "14px" }}>
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side — note icon + remove button on hover */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {stock.description && (
          <Tooltip title={stock.description.slice(0, 100)}>
            <FileTextOutlined style={{ fontSize: 11, color: "#1677ff" }} />
          </Tooltip>
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
