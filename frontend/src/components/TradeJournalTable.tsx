import { DeleteOutlined } from "@ant-design/icons";
import { Badge, Button, Modal, Space, Table, Tooltip, message } from "antd";
import type { ColumnType } from "antd/es/table";
import { useState } from "react";
import type { TradeWithTargets } from "../types";

interface TradeJournalTableProps {
  trades: TradeWithTargets[];
  onDelete: (tradeId: number) => Promise<void>;
  loading?: boolean;
}

export function TradeJournalTable({
  trades,
  onDelete,
  loading = false,
}: TradeJournalTableProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  const handleDelete = async (tradeId: number) => {
    Modal.confirm({
      title: "Delete Trade?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await onDelete(tradeId);
          message.success("Trade deleted");
        } catch (e) {
          message.error(e instanceof Error ? e.message : "Failed to delete trade");
        }
      },
    });
  };

  const columns: ColumnType<TradeWithTargets>[] = [
    {
      title: "Date",
      dataIndex: ["trade", "trade_date"],
      key: "trade_date",
      width: 100,
      sorter: (a, b) => a.trade.trade_date.localeCompare(b.trade.trade_date),
    },
    {
      title: "Symbol",
      dataIndex: ["trade", "nse_symbol"],
      key: "nse_symbol",
      width: 80,
      render: (symbol, record) => (
        <div>
          <strong>{symbol}</strong>
          <div style={{ fontSize: "12px", color: "#999" }}>
            ₹{(parseFloat(record.total_invested) / record.trade.quantity).toFixed(2)}
            <br />
            invested: ₹{record.total_invested}
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: ["trade", "quantity"],
      key: "quantity",
      width: 60,
      sorter: (a, b) => a.trade.quantity - b.trade.quantity,
    },
    {
      title: "Avg Price",
      dataIndex: ["trade", "avg_buy_price"],
      key: "avg_buy_price",
      width: 90,
      render: (price) => `₹${price}`,
    },
    {
      title: "Today's Low",
      dataIndex: ["trade", "today_low"],
      key: "today_low",
      width: 90,
      render: (low) => (low ? `₹${low}` : "—"),
    },
    {
      title: "Stop Loss",
      dataIndex: ["trade", "stop_loss_price"],
      key: "stop_loss_price",
      width: 110,
      render: (price, record) => (
        <div style={{ fontSize: "12px" }}>
          <strong style={{ color: "#ff4d4f" }}>₹{price}</strong>
          <br />
          ({record.trade.stop_loss_percent}%)
        </div>
      ),
    },
    {
      title: "GTT Targets",
      dataIndex: "gtt_targets",
      key: "gtt_targets",
      width: 280,
      render: (targets: any[]) => (
        <Space direction="vertical" size={4}>
          {targets.map((target: any) => (
            <Badge
              key={target.percent}
              count={
                <span
                  style={{
                    padding: "2px 6px",
                    background: "#52c41a",
                    color: "white",
                    borderRadius: "2px",
                    fontSize: "11px",
                  }}
                >
                  +{target.percent}%: ₹{target.price}
                </span>
              }
              style={{ backgroundColor: "transparent" }}
            />
          ))}
        </Space>
      ),
    },
    {
      title: "Notes",
      dataIndex: ["trade", "notes"],
      key: "notes",
      width: 150,
      render: (notes, record) => {
        if (!notes) return "—";
        const isExpanded = expandedNotes.has(record.trade.id);
        const displayText = isExpanded ? notes : notes.substring(0, 40);
        return (
          <Tooltip title={notes}>
            <span
              onClick={() => {
                const newExpanded = new Set(expandedNotes);
                if (isExpanded) {
                  newExpanded.delete(record.trade.id);
                } else {
                  newExpanded.add(record.trade.id);
                }
                setExpandedNotes(newExpanded);
              }}
              style={{ cursor: "pointer", color: "#1677ff" }}
            >
              {displayText}
              {notes.length > 40 && "..."}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 70,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.trade.id)}
          loading={loading}
        />
      ),
    },
  ];

  return (
    <Table<TradeWithTargets>
      columns={columns}
      dataSource={trades}
      rowKey={(record) => record.trade.id}
      size="small"
      style={{ background: "white", marginTop: "16px", borderRadius: "4px" }}
      scroll={{ x: 1200 }}
      pagination={{ pageSize: 20, showSizeChanger: true }}
    />
  );
}
