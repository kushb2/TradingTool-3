import { InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Typography } from "antd";
import { useMemo } from "react";
import { useWatchlistData } from "../hooks/useWatchlistData";

/**
 * Graph view — shows tags as theme nodes and stocks as stock nodes.
 * Requires @antv/g6 to be installed:  npm install @antv/g6
 *
 * Currently renders a placeholder until G6 is added as a dependency.
 */
export function GraphPage() {
  const data = useWatchlistData();

  // Build a preview of what the graph would contain
  const tagNodes = data.allTags;
  const stockNodes = data.stocks.filter((s) =>
    data.stockTags.some((st) => st.stockId === s.id),
  );
  const edgeCount = data.stockTags.length;

  const summary = useMemo(
    () =>
      `${tagNodes.length} theme nodes · ${stockNodes.length} stock nodes · ${edgeCount} connections`,
    [tagNodes, stockNodes, edgeCount],
  );

  return (
    <div style={{ padding: "24px" }}>
      <Typography.Title level={5} style={{ marginBottom: 8 }}>
        Conviction Map
      </Typography.Title>
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
        Force-directed graph — tags are theme clusters, node size = priority.
      </Typography.Text>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="Graph dependency not installed"
        description={
          <div>
            <p style={{ marginBottom: 8 }}>
              Install AntV G6 to enable the graph view:
            </p>
            <code style={{ background: "#f5f5f5", padding: "4px 8px", borderRadius: 4 }}>
              npm install @antv/g6
            </code>
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              Once installed, this page will render a force-directed graph with:
            </p>
            <ul style={{ marginTop: 4 }}>
              <li>Tag nodes (theme clusters) in blue</li>
              <li>Stock nodes sized by priority (1–5)</li>
              <li>Edges from stocks to their tags</li>
              <li>Click a stock node to open the notes panel</li>
            </ul>
            <p style={{ marginTop: 8, color: "#888" }}>{summary}</p>
          </div>
        }
        style={{ maxWidth: 540 }}
      />
    </div>
  );
}
