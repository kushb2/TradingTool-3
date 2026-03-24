import { AutoComplete, Button, DatePicker, Input, InputNumber, Spin, message } from "antd";
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
    stock_id: 0,
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
      stock_id: option.instrument.instrument_token,
      nse_symbol: option.instrument.trading_symbol,
      symbolInput: option.instrument.trading_symbol,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.nse_symbol || formData.stock_id === 0) {
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
      stock_id: formData.stock_id,
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

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        padding: "10px 12px",
        background: "#fafafa",
        borderRadius: "6px",
        border: "1px solid #e8e8e8",
        marginBottom: "12px",
        flexWrap: "wrap",
      }}
    >
      {/* Stock autocomplete */}
      {instrumentsLoading ? (
        <Spin size="small" />
      ) : (
        <AutoComplete
          style={{ width: 180 }}
          size="small"
          options={instrumentOptions}
          value={formData.symbolInput}
          onChange={(val) => setFormData((prev) => ({ ...prev, symbolInput: val }))}
          onSelect={handleInstrumentSelect}
          onClear={() => setFormData((prev) => ({ ...prev, stock_id: 0, nse_symbol: "", symbolInput: "" }))}
          allowClear
          placeholder="Stock (e.g. INFY)"
          filterOption={(inputValue, option) =>
            (option as any)?.searchText?.includes(inputValue.toLowerCase()) ?? false
          }
        />
      )}

      <InputNumber
        size="small"
        min={1}
        placeholder="Qty"
        value={formData.quantity}
        onChange={(val) => setFormData((prev) => ({ ...prev, quantity: val }))}
        style={{ width: 80 }}
      />

      <Input
        size="small"
        type="number"
        step="0.01"
        placeholder="Avg Price ₹"
        value={formData.avg_buy_price}
        onChange={(e) => setFormData((prev) => ({ ...prev, avg_buy_price: e.target.value }))}
        style={{ width: 110 }}
      />

      <Input
        size="small"
        type="number"
        step="0.01"
        placeholder="Today's Low ₹"
        value={formData.today_low}
        onChange={(e) => setFormData((prev) => ({ ...prev, today_low: e.target.value }))}
        style={{ width: 120 }}
      />

      <Input
        size="small"
        type="number"
        step="0.1"
        placeholder="SL %"
        value={formData.stop_loss_percent}
        onChange={(e) => setFormData((prev) => ({ ...prev, stop_loss_percent: e.target.value }))}
        style={{ width: 70 }}
      />

      <DatePicker
        size="small"
        value={dayjs(formData.trade_date)}
        onChange={(date) =>
          setFormData((prev) => ({ ...prev, trade_date: date?.format("YYYY-MM-DD") || prev.trade_date }))
        }
        style={{ width: 120 }}
      />

      <Input
        size="small"
        placeholder="Notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
        style={{ flex: 1, minWidth: 140 }}
      />

      <Button
        type="primary"
        size="small"
        loading={loading}
        onClick={handleSubmit}
      >
        Add
      </Button>
    </div>
  );
}