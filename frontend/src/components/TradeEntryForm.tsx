import { AutoComplete, Button, DatePicker, Form, Input, InputNumber, Spin, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useInstrumentSearch } from "../hooks/useInstrumentSearch";
import type { CreateTradeInput } from "../types";

interface TradeEntryFormProps {
  onSubmit: (payload: CreateTradeInput) => Promise<void>;
  loading?: boolean;
}

export function TradeEntryForm({ onSubmit, loading = false }: TradeEntryFormProps) {
  const { allInstruments, loading: instrumentsLoading } = useInstrumentSearch();

  const emptyForm = {
    instrument_token: 0,
    company_name: "",
    exchange: "",
    nse_symbol: "",
    symbolInput: "",
    quantity: null as number | null,
    avg_buy_price: "",
    today_low: "",
    stop_loss_percent: "",
    notes: "",
    trade_date: dayjs().format("YYYY-MM-DD"),
  };

  const [formData, setFormData] = useState(emptyForm);

  const instrumentOptions = allInstruments
    .filter((i) => i.instrument_type === "EQ")
    .map((inst) => ({
      value: inst.trading_symbol,
      label: `${inst.trading_symbol} — ${inst.company_name}`,
      instrument: inst,
      searchText: `${inst.trading_symbol} ${inst.company_name}`.toLowerCase(),
    }));

  const handleInstrumentSelect = (_: string, option: (typeof instrumentOptions)[0]) => {
    setFormData((prev) => ({
      ...prev,
      instrument_token: option.instrument.instrument_token,
      company_name: option.instrument.company_name,
      exchange: option.instrument.exchange,
      nse_symbol: option.instrument.trading_symbol,
      symbolInput: option.instrument.trading_symbol,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.nse_symbol || formData.instrument_token === 0) {
      message.error("Select a stock");
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      message.error("Enter quantity");
      return;
    }
    if (!formData.avg_buy_price) {
      message.error("Enter avg buy price");
      return;
    }
    if (!formData.stop_loss_percent) {
      message.error("Enter stop loss %");
      return;
    }

    await onSubmit({
      instrument_token: formData.instrument_token,
      company_name: formData.company_name,
      exchange: formData.exchange,
      nse_symbol: formData.nse_symbol,
      quantity: formData.quantity,
      avg_buy_price: formData.avg_buy_price,
      today_low: formData.today_low || undefined,
      stop_loss_percent: formData.stop_loss_percent,
      notes: formData.notes || undefined,
      trade_date: formData.trade_date,
    });

    setFormData(emptyForm);
    message.success("Trade added");
  };

  // Calculated values for live preview
  const avgPriceNum = parseFloat(formData.avg_buy_price);
  const slPctNum = parseFloat(formData.stop_loss_percent);
  const qtyNum = formData.quantity || 0;
  const stopLossPrice =
    avgPriceNum > 0 && slPctNum > 0
      ? (avgPriceNum * (1 - slPctNum / 100)).toFixed(2)
      : null;
  const riskAmount =
    avgPriceNum > 0 && slPctNum > 0 && qtyNum > 0
      ? ((avgPriceNum * slPctNum) / 100) * qtyNum
      : null;

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="Stock">
        {instrumentsLoading ? (
          <Spin size="small" />
        ) : (
          <AutoComplete
            style={{ width: "100%" }}
            options={instrumentOptions}
            value={formData.symbolInput}
            onChange={(val) => setFormData((prev) => ({ ...prev, symbolInput: val }))}
            onSelect={handleInstrumentSelect}
            onClear={() => setFormData((prev) => ({ ...prev, instrument_token: 0, company_name: "", exchange: "", nse_symbol: "", symbolInput: "" }))}
            allowClear
            placeholder="Search stock..."
            filterOption={(inputValue, option) =>
              (option as any)?.searchText?.includes(inputValue.toLowerCase()) ?? false
            }
          />
        )}
      </Form.Item>

      <Form.Item label="Quantity">
        <InputNumber
          style={{ width: "100%" }}
          min={1}
          placeholder="Qty"
          value={formData.quantity}
          onChange={(val) => setFormData((prev) => ({ ...prev, quantity: val }))}
        />
      </Form.Item>

      <Form.Item label="Avg Buy Price (₹)">
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.avg_buy_price}
          onChange={(e) => setFormData((prev) => ({ ...prev, avg_buy_price: e.target.value }))}
        />
      </Form.Item>

      <Form.Item label="Today's Low (₹)">
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.today_low}
          onChange={(e) => setFormData((prev) => ({ ...prev, today_low: e.target.value }))}
        />
      </Form.Item>

      <Form.Item label="Stop Loss (%)">
        <Input
          type="number"
          step="0.1"
          placeholder="e.g., 5.0"
          value={formData.stop_loss_percent}
          onChange={(e) => setFormData((prev) => ({ ...prev, stop_loss_percent: e.target.value }))}
        />
      </Form.Item>

      <Form.Item label="Trade Date">
        <DatePicker
          style={{ width: "100%" }}
          value={dayjs(formData.trade_date)}
          onChange={(date) =>
            setFormData((prev) => ({ ...prev, trade_date: date?.format("YYYY-MM-DD") || prev.trade_date }))
          }
        />
      </Form.Item>

      <Form.Item label="Notes">
        <Input.TextArea
          rows={3}
          placeholder="Optional notes..."
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </Form.Item>

      {/* Live risk preview */}
      {stopLossPrice && riskAmount !== null && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fff1f0",
            border: "1px solid #ffa39e",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>Stop price</span>
            <span style={{ fontWeight: 700, color: "#cf1322", fontSize: 13 }}>₹{stopLossPrice}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "#8c8c8c" }}>Max risk</span>
            <span style={{ fontWeight: 700, color: "#cf1322", fontSize: 13 }}>
              ₹{riskAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      <Button
        type="primary"
        block
        size="middle"
        loading={loading}
        onClick={handleSubmit}
        style={{ marginTop: 4, background: "#00b386", borderColor: "#00b386", fontWeight: 600 }}
      >
        Add to Book
      </Button>
    </Form>
  );
}