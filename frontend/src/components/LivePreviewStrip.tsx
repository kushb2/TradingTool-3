import { Badge, Space } from "antd";

interface LivePreviewStripProps {
  avgBuyPrice: string;
  stopLossPercent: string;
  todayLow?: string;
}

export function LivePreviewStrip({
  avgBuyPrice,
  stopLossPercent,
  todayLow,
}: LivePreviewStripProps) {
  if (!avgBuyPrice || !stopLossPercent) {
    return null;
  }

  try {
    const avg = parseFloat(avgBuyPrice);
    const slPercent = parseFloat(stopLossPercent);
    const base = todayLow ? parseFloat(todayLow) : avg;

    if (isNaN(avg) || isNaN(slPercent) || isNaN(base)) {
      return null;
    }

    // Calculate stop loss price
    const slPrice = (avg * (1 - slPercent / 100)).toFixed(2);

    // Calculate GTT targets: 2%, 3%, 5%, 7%, 10%
    const targetPercents = [2, 3, 5, 7, 10];
    const targets = targetPercents.map((percent) => {
      const price = (base * (1 + percent / 100)).toFixed(2);
      const yieldPercent = (((parseFloat(price) - avg) / avg) * 100).toFixed(2);
      return { percent, price, yieldPercent };
    });

    return (
      <div
        style={{
          padding: "12px",
          background: "#fafafa",
          borderRadius: "4px",
          marginTop: "8px",
          border: "1px solid #f0f0f0",
        }}
      >
        <Space wrap style={{ width: "100%" }}>
          <Badge
            count={
              <span
                style={{
                  padding: "4px 8px",
                  background: "#ff4d4f",
                  color: "white",
                  borderRadius: "2px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                SL: ₹{slPrice}
              </span>
            }
            style={{ backgroundColor: "transparent" }}
          />
          {targets.map((t) => (
            <Badge
              key={t.percent}
              count={
                <span
                  style={{
                    padding: "4px 8px",
                    background: "#52c41a",
                    color: "white",
                    borderRadius: "2px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  +{t.percent}%: ₹{t.price} ({t.yieldPercent}%)
                </span>
              }
              style={{ backgroundColor: "transparent" }}
            />
          ))}
        </Space>
      </div>
    );
  } catch (e) {
    console.error("Error calculating preview:", e);
    return null;
  }
}
