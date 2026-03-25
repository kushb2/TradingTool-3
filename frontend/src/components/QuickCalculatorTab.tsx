import { Input, InputNumber, Typography } from "antd";
import { useState } from "react";

const { Text } = Typography;

interface TargetRow {
  percent: number;
  price: number;
  perUnit: number;
  totalGain: number;
}

const TARGET_PERCENTS = [2, 3, 5, 7, 8, 9, 10];

// Green gradient: lighter at lower targets, richer at higher
const TARGET_PALETTE = [
  { bg: "#f6ffed", border: "#d9f7be", text: "#389e0d", label: "#52c41a" },
  { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", label: "#16a34a" },
  { bg: "#d9f7be", border: "#95de64", text: "#237804", label: "#22c55e" },
  { bg: "#b7eb8f", border: "#73d13d", text: "#237804", label: "#15803d" },
  { bg: "#95de64", border: "#52c41a", text: "#092b00", label: "#166534" },
  { bg: "#73d13d", border: "#389e0d", text: "#092b00", label: "#14532d" },
  { bg: "#52c41a", border: "#237804", text: "#ffffff", label: "#ffffff" },
];

export function QuickCalculatorTab() {
  const [avgPrice, setAvgPrice] = useState("");
  const [qty, setQty] = useState<number>(1);

  const base = parseFloat(avgPrice);
  const isValid = !isNaN(base) && base > 0;

  const targets: TargetRow[] = isValid
    ? TARGET_PERCENTS.map((p) => {
        const price = base * (1 + p / 100);
        const perUnit = price - base;
        return { percent: p, price, perUnit, totalGain: perUnit * qty };
      })
    : [];

  const totalSpread =
    targets.length > 1
      ? (targets[targets.length - 1].price - targets[0].price) * qty
      : 0;

  return (
    <div>
      {/* Inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "#8c8c8c",
              display: "block",
              marginBottom: 6,
            }}
          >
            AVG BUY PRICE (₹)
          </Text>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 1250.00"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            autoFocus
            size="large"
            style={{ fontWeight: 600, fontSize: 16 }}
            prefix={<Text type="secondary">₹</Text>}
          />
        </div>
        <div>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "#8c8c8c",
              display: "block",
              marginBottom: 6,
            }}
          >
            QTY
          </Text>
          <InputNumber
            min={1}
            value={qty}
            onChange={(val) => setQty(val || 1)}
            size="large"
            style={{ width: "100%", fontWeight: 600 }}
          />
        </div>
      </div>

      {/* Target ladder */}
      {isValid && (
        <>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              color: "#8c8c8c",
              display: "block",
              marginBottom: 10,
            }}
          >
            TARGET LADDER
          </Text>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {targets.map((t, i) => {
              const palette = TARGET_PALETTE[Math.min(i, TARGET_PALETTE.length - 1)];
              return (
                <div
                  key={t.percent}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr 1fr 1fr",
                    alignItems: "center",
                    background: palette.bg,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    gap: 8,
                  }}
                >
                  {/* % badge */}
                  <div>
                    <Text
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: palette.text,
                      }}
                    >
                      +{t.percent}%
                    </Text>
                  </div>

                  {/* Price */}
                  <div>
                    <Text style={{ fontSize: 10, color: palette.label, display: "block", fontWeight: 600 }}>
                      TARGET PRICE
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                      ₹{t.price.toFixed(2)}
                    </Text>
                  </div>

                  {/* Per unit gain */}
                  <div>
                    <Text style={{ fontSize: 10, color: palette.label, display: "block", fontWeight: 600 }}>
                      PER UNIT
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                      +₹{t.perUnit.toFixed(2)}
                    </Text>
                  </div>

                  {/* Total gain */}
                  <div style={{ textAlign: "right" }}>
                    <Text style={{ fontSize: 10, color: palette.label, display: "block", fontWeight: 600 }}>
                      TOTAL GAIN
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                      ₹{t.totalGain.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spread summary */}
          {totalSpread > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: "12px 16px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: "#166534", fontWeight: 600 }}>
                TP1 → TP7 spread × {qty} units
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>
                ₹{totalSpread.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </Text>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isValid && avgPrice !== "" && (
        <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 24, fontSize: 13 }}>
          Enter a valid price to see the target ladder.
        </Text>
      )}
    </div>
  );
}
