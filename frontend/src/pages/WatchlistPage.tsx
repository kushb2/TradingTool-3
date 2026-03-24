import {
  FileTextOutlined,
  MinusOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Button, Spin, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { InstrumentSearch } from "../components/InstrumentSearch";
import { StockNotesPanel } from "../components/StockNotesPanel";
import { TelegramChatWidget } from "../components/TelegramChatWidget";
import { useStocks, type UpdateStockInput } from "../hooks/useStocks";
import type { Stock } from "../types";

const PRIORITY_COLORS = ["", "#bfbfbf", "#52c41a", "#1677ff", "#faad14", "#f5222d"];

export function WatchlistPage() {
  const { stocks, allTags, loading, error, filterByTag, createStock, updateStock, deleteStock } =
    useStocks();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const visibleStocks = filterByTag(selectedTag);

  // Sync selectedStock with latest data (notes/priority/tags may have changed)
  useEffect(() => {
    if (!selectedStock) return;
    const updated = stocks.find((s) => s.id === selectedStock.id);
    if (updated) setSelectedStock(updated);
  }, [stocks]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedStock) setNotesOpen(false);
  }, [selectedStock]);

  const handleStockAdded = async (stock: Stock) => {
    try {
      await createStock({
        symbol: stock.symbol,
        instrument_token: stock.instrument_token,
        company_name: stock.company_name,
        exchange: stock.exchange,
      });
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Failed to add stock");
    }
  };

  const handleUpdate = async (payload: UpdateStockInput) => {
    if (!selectedStock) return;
    try {
      const updated = await updateStock(selectedStock.id, payload);
      setSelectedStock(updated);
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Failed to update stock");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 48px)" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <div style={{ display: "flex", height: "calc(100vh - 48px)" }}>

        {/* ── Tag filter sidebar ───────────────── */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            background: "#fff",
            borderRight: "1px solid #e8e8e8",
            overflowY: "auto",
            padding: "12px 0",
          }}
        >
          <div style={{ padding: "0 12px 8px", borderBottom: "1px solid #f0f0f0", marginBottom: 4 }}>
            <Typography.Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
              FILTER BY TAG
            </Typography.Text>
          </div>

          {/* "All Stocks" option */}
          <SidebarItem
            label={`All Stocks (${stocks.length})`}
            active={selectedTag === null}
            color={undefined}
            onClick={() => setSelectedTag(null)}
          />

          {allTags.map((tag) => {
            const count = filterByTag(tag.name).length;
            return (
              <SidebarItem
                key={tag.name}
                label={`${tag.name} (${count})`}
                active={selectedTag === tag.name}
                color={tag.color}
                onClick={() => setSelectedTag(tag.name)}
              />
            );
          })}

          {allTags.length === 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 11, padding: "0 12px" }}>
              No tags yet
            </Typography.Text>
          )}
        </div>

        {/* ── Main content ─────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#f5f7fa", padding: "16px" }}>
          {error && (
            <Typography.Text type="danger" style={{ display: "block", marginBottom: 12, fontSize: 12 }}>
              {error}
            </Typography.Text>
          )}

          {/* Add stock search */}
          <div style={{ marginBottom: 16, maxWidth: 480 }}>
            <InstrumentSearch
              existingStockTokens={new Set(stocks.map((s) => s.instrument_token))}
              onStockAdded={(stock) => void handleStockAdded(stock)}
            />
          </div>

          {/* Stock list */}
          {visibleStocks.length === 0 ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {selectedTag ? `No stocks tagged "${selectedTag}".` : "No stocks yet — search above to add one."}
            </Typography.Text>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 640 }}>
              {visibleStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  isSelected={selectedStock?.id === stock.id}
                  onSelect={() => {
                    const next = selectedStock?.id === stock.id ? null : stock;
                    setSelectedStock(next);
                    if (next) setNotesOpen(true);
                  }}
                  onRemove={() => {
                    void deleteStock(stock.id).catch((e: Error) =>
                      messageApi.error(e.message),
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Notes FAB ─────────────────────── */}
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

      {/* ─── Notes panel ───────────────────── */}
      {notesOpen && selectedStock && (
        <StockNotesPanel
          stock={selectedStock}
          onClose={() => setNotesOpen(false)}
          onUpdate={handleUpdate}
        />
      )}

      <TelegramChatWidget />
    </>
  );
}

// ─── Sidebar item ───────────────────────────────────────────────────────────

function SidebarItem({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string | undefined;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "7px 12px",
        cursor: "pointer",
        background: active ? "#e6f4ff" : "transparent",
        borderLeft: active ? "3px solid #1677ff" : "3px solid transparent",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
      }}
    >
      {color && (
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      )}
      <Typography.Text style={{ fontSize: 12, color: active ? "#1677ff" : "#333" }}>
        {label}
      </Typography.Text>
    </div>
  );
}

// ─── Stock row ──────────────────────────────────────────────────────────────

function StockRow({
  stock,
  isSelected,
  onSelect,
  onRemove,
}: {
  stock: Stock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
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
        padding: "10px 14px",
        cursor: "pointer",
        background: isSelected ? "#e6f4ff" : "#fff",
        borderRadius: 8,
        border: isSelected ? "1px solid #91caff" : "1px solid #f0f0f0",
        transition: "background 0.1s",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Typography.Text strong style={{ fontSize: 13, color: isSelected ? "#1677ff" : "#1f1f1f" }}>
            {stock.symbol}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 10 }}>
            {stock.exchange}
          </Typography.Text>
          {stock.tags.map((tag) => (
            <Tag key={tag.name} color={tag.color} style={{ margin: 0, fontSize: 10 }}>
              {tag.name}
            </Tag>
          ))}
        </div>
        {hovered && (
          <Typography.Text type="secondary" style={{ fontSize: 10, display: "block", marginTop: 2 }}>
            {stock.company_name}
          </Typography.Text>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {stock.priority != null && stock.priority > 0 && !hovered && (
          <StarFilled style={{ fontSize: 8, color: PRIORITY_COLORS[stock.priority] ?? "#bfbfbf" }} />
        )}
        {hovered && (
          <Tooltip title="Delete stock">
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
