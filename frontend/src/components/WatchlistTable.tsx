import { Table, Tag } from "antd";
import type { TableColumnsType } from "antd";

interface WatchlistRow {
  key: string;
  symbol: string;
  price: string;
  move: string;
}

const columns: TableColumnsType<WatchlistRow> = [
  { title: "Symbol", dataIndex: "symbol", key: "symbol" },
  { title: "Price", dataIndex: "price", key: "price" },
  {
    title: "Move",
    dataIndex: "move",
    key: "move",
    render: (value: string) => (
      <Tag color={value.startsWith("-") ? "red" : "green"}>{value}</Tag>
    ),
  },
];

// TODO: Replace with real API data from /watchlist endpoint
const mockRows: WatchlistRow[] = [
  { key: "1", symbol: "RELIANCE", price: "2,938.30", move: "+0.91%" },
  { key: "2", symbol: "INFY", price: "1,982.10", move: "-0.35%" },
  { key: "3", symbol: "TCS", price: "4,275.80", move: "+0.42%" },
];

export function WatchlistTable() {
  return (
    <Table<WatchlistRow>
      columns={columns}
      dataSource={mockRows}
      pagination={false}
      size="middle"
    />
  );
}