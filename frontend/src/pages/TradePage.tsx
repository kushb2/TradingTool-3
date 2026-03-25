import { BookOutlined, CalculatorOutlined, CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Drawer, Spin, Tabs, Typography } from "antd";
import { useState } from "react";
import { QuickCalculatorTab } from "../components/QuickCalculatorTab";
import { TelegramChatWidget } from "../components/TelegramChatWidget";
import { TradeEntryForm } from "../components/TradeEntryForm";
import { TradeJournalTable } from "../components/TradeJournalTable";
import { useTradeData } from "../hooks/useTradeData";

const { Text } = Typography;

export function TradePage() {
  const { trades, loading, error, createTrade, closeTrade, deleteTrade } = useTradeData();
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCreateTrade = async (payload: any) => {
    setSubmitting(true);
    try {
      await createTrade(payload);
      setDrawerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openTrades = trades.filter((t) => !t.trade.close_price);
  const closedTrades = trades.filter((t) => !!t.trade.close_price);

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load trades"
        description={error}
        showIcon
        style={{ margin: "16px" }}
      />
    );
  }

  return (
    <>
      <Spin spinning={loading}>
        <div style={{ padding: "20px 24px", background: "#f5f6fa", minHeight: "calc(100vh - 48px)" }}>
          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <Text strong style={{ fontSize: 20, letterSpacing: 0.3 }}>TRADE BOOK</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {openTrades.length} open · {closedTrades.length} closed
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ background: "#00b386", borderColor: "#00b386", fontWeight: 600 }}
            >
              Add Trade
            </Button>
          </div>

          {/* Main tabs: Journal / Calculator */}
          <div style={{ background: "white", borderRadius: 10, border: "1px solid #e8e8e8" }}>
            <Tabs
              defaultActiveKey="journal"
              style={{ padding: "0 16px" }}
              tabBarStyle={{ marginBottom: 0, borderBottom: "1px solid #f0f0f0" }}
              items={[
                {
                  key: "journal",
                  label: (
                    <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: 0.3 }}>
                      <BookOutlined style={{ marginRight: 6 }} />
                      POSITIONS
                    </span>
                  ),
                  children: (
                    // Nested tabs: OPEN / CLOSED
                    <Tabs
                      defaultActiveKey="open"
                      size="small"
                      style={{ padding: "0 0" }}
                      tabBarStyle={{ marginBottom: 0, paddingLeft: 4 }}
                      items={[
                        {
                          key: "open",
                          label: (
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              OPEN ({openTrades.length})
                            </span>
                          ),
                          children: (
                            <div style={{ padding: "12px 0 8px" }}>
                              <TradeJournalTable
                                trades={openTrades}
                                onClose={closeTrade}
                                onDelete={deleteTrade}
                              />
                            </div>
                          ),
                        },
                        {
                          key: "closed",
                          label: (
                            <span style={{ fontSize: 12, fontWeight: 600 }}>
                              <CheckCircleOutlined style={{ marginRight: 4, color: "#00b386" }} />
                              CLOSED ({closedTrades.length})
                            </span>
                          ),
                          children: (
                            <div style={{ padding: "12px 0 8px" }}>
                              <TradeJournalTable
                                trades={closedTrades}
                                onClose={closeTrade}
                                onDelete={deleteTrade}
                                isClosed
                              />
                            </div>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "calculator",
                  label: (
                    <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: 0.3 }}>
                      <CalculatorOutlined style={{ marginRight: 6 }} />
                      CALCULATOR
                    </span>
                  ),
                  children: (
                    <div style={{ padding: "16px" }}>
                      <QuickCalculatorTab />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Spin>

      {/* Add Trade Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 700, fontSize: 16 }}>New Position</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={380}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <TradeEntryForm onSubmit={handleCreateTrade} loading={submitting} />
      </Drawer>

      <TelegramChatWidget />
    </>
  );
}
