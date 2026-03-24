import { CloseOutlined } from "@ant-design/icons";
import { Button, Input, Rate, Select, Space, Spin, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { InstrumentSearch } from "./InstrumentSearch";
import { getJson } from "../utils/api";
import type { CreateStockInput, UpdateStockInput } from "../hooks/useStocks";
import type { InstrumentSearchResult, Stock, StockTag, Trade } from "../types";

interface Props {
  mode: "create" | "view" | "edit";
  stock: Stock | null;
  allTags: StockTag[];
  existingStockTokens: Set<number>;
  onCreate: (payload: CreateStockInput) => Promise<void>;
  onUpdate: (payload: UpdateStockInput) => Promise<void>;
  onClose: () => void;
  onEnterEdit: () => void;
}

const TAG_COLORS = ["blue", "green", "gold", "red", "purple", "cyan"];

export function StockDetailPanel({
  mode,
  stock,
  allTags,
  existingStockTokens,
  onCreate,
  onUpdate,
  onClose,
  onEnterEdit,
}: Props) {
  // Create mode state
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentSearchResult | null>(null);

  // Shared state (create/view/edit)
  const [priority, setPriority] = useState(stock?.priority ?? 0);
  const [notesDraft, setNotesDraft] = useState(stock?.notes ?? "");
  const [tagsDraft, setTagsDraft] = useState<StockTag[]>(stock?.tags ?? []);

  // Tag input UI
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState<string>("blue");

  // Trades
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  // Loading
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Sync draft when stock changes
  useEffect(() => {
    if (stock) {
      setPriority(stock.priority ?? 0);
      setNotesDraft(stock.notes ?? "");
      setTagsDraft(stock.tags ?? []);
    }
  }, [stock]);

  // Load trades when entering view/edit mode
  useEffect(() => {
    if ((mode === "view" || mode === "edit") && stock) {
      setLoadingTrades(true);
      getJson<Trade[]>(`/api/stocks/${stock.id}/trades`)
        .then(setTrades)
        .catch(() => setTrades([]))
        .finally(() => setLoadingTrades(false));
    }
  }, [stock?.id, mode]);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const newTag: StockTag = { name: newTagName.trim(), color: newTagColor };
    if (!tagsDraft.some((t) => t.name === newTag.name)) {
      setTagsDraft([...tagsDraft, newTag]);
      setNewTagName("");
      setNewTagColor("blue");
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setTagsDraft(tagsDraft.filter((t) => t.name !== tagName));
  };

  const handleCreate = async () => {
    if (!selectedInstrument) return;
    setSaving(true);
    try {
      await onCreate({
        symbol: selectedInstrument.trading_symbol,
        instrument_token: selectedInstrument.instrument_token,
        company_name: selectedInstrument.company_name,
        exchange: selectedInstrument.exchange,
        priority: priority > 0 ? priority : undefined,
        notes: notesDraft || undefined,
        tags: tagsDraft.length > 0 ? tagsDraft : undefined,
      });
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Failed to create stock");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!stock) return;
    setSaving(true);
    try {
      await onUpdate({
        priority: priority > 0 ? priority : undefined,
        notes: notesDraft || undefined,
        tags: tagsDraft.length > 0 ? tagsDraft : undefined,
      });
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  const tradeColumns = [
    { title: "Qty", dataIndex: "quantity", key: "qty", width: 50 },
    { title: "Avg Price", dataIndex: "avg_buy_price", key: "avg", width: 80 },
    { title: "SL %", dataIndex: "stop_loss_percent", key: "sl", width: 60, render: (v: string) => `${v}%` },
    { title: "Date", dataIndex: "trade_date", key: "date", width: 90 },
  ];

  return (
    <div
      style={{
        borderTop: "1px solid #e8e8e8",
        background: "#fff",
        padding: "12px 16px",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {contextHolder}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {mode === "create" ? (
          <Typography.Text strong>Add Stock to Watchlist</Typography.Text>
        ) : stock ? (
          <div>
            <Typography.Text strong style={{ fontSize: 14 }}>
              {stock.symbol}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {stock.exchange}
            </Typography.Text>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {mode === "view" && stock && (
            <Button size="small" type="primary" onClick={onEnterEdit}>
              Edit
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ padding: 0, height: "auto" }}
          />
        </div>
      </div>

      {/* Create mode: instrument search */}
      {mode === "create" && (
        <div style={{ display: "flex", gap: 8 }}>
          <InstrumentSearch
            existingStockTokens={existingStockTokens}
            onSelect={setSelectedInstrument}
            value={selectedInstrument}
          />
        </div>
      )}

      {/* Content: Priority + Notes + Tags (horizontal grid) */}
      <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
        {/* Priority */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Priority
          </Typography.Text>
          <Rate
            count={5}
            value={priority}
            onChange={setPriority}
            disabled={mode === "view"}
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Notes */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Notes
          </Typography.Text>
          {mode === "view" && stock ? (
            <Typography.Text
              style={{
                fontSize: 12,
                color: stock.notes ? "#333" : "#bbb",
                whiteSpace: "pre-wrap",
                flex: 1,
                overflow: "auto",
              }}
            >
              {stock.notes || "No notes — click Edit to add"}
            </Typography.Text>
          ) : (
            <Input.TextArea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={2}
              style={{ fontSize: 12, flex: 1 }}
              placeholder="Write thesis, moat analysis, etc..."
              disabled={mode === "view"}
            />
          )}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Tags
          </Typography.Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1, overflow: "auto" }}>
            {tagsDraft.map((tag) => (
              <Tag
                key={tag.name}
                color={tag.color}
                style={{ margin: 0, fontSize: 11 }}
                closable={mode !== "view"}
                onClose={() => handleRemoveTag(tag.name)}
              >
                {tag.name}
              </Tag>
            ))}
          </div>

          {/* Tag input (only in create/edit) */}
          {mode !== "view" && (
            <div style={{ display: "flex", gap: 4 }}>
              <Input
                size="small"
                placeholder="New tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onPressEnter={handleAddTag}
                style={{ fontSize: 11, flex: 1 }}
              />
              <Select
                value={newTagColor}
                onChange={setNewTagColor}
                options={TAG_COLORS.map((c) => ({ label: c, value: c }))}
                size="small"
                style={{ width: 80, fontSize: 11 }}
              />
              <Button size="small" onClick={handleAddTag}>
                +
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Trades section (view/edit only) */}
      {(mode === "view" || mode === "edit") && stock && (
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8 }}>
          <Typography.Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 6 }}>
            Open Positions
          </Typography.Text>
          {loadingTrades ? (
            <Spin size="small" />
          ) : trades.length === 0 ? (
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              No open position
            </Typography.Text>
          ) : (
            <Table
              dataSource={trades}
              columns={tradeColumns}
              rowKey="id"
              size="small"
              pagination={false}
              style={{ fontSize: 11 }}
            />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
        {mode === "create" && (
          <Button
            type="primary"
            size="small"
            loading={saving}
            disabled={!selectedInstrument}
            onClick={() => void handleCreate()}
          >
            Add to Watchlist
          </Button>
        )}
        {mode === "edit" && (
          <>
            <Button size="small" onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" size="small" loading={saving} onClick={() => void handleSave()}>
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
