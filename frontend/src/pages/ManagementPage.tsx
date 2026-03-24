import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Popconfirm,
  Rate,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useStocks } from "../hooks/useStocks";
import type { Stock, StockTag } from "../types";

export function ManagementPage() {
  const { stocks, loading, updateStock, deleteStock } = useStocks();
  const [messageApi, contextHolder] = message.useMessage();

  const columns = [
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      width: 110,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
      ellipsis: true,
    },
    {
      title: "Priority",
      key: "priority",
      width: 130,
      render: (_: unknown, stock: Stock) => (
        <Rate
          count={5}
          value={stock.priority ?? 0}
          onChange={(val) =>
            void updateStock(stock.id, { priority: val }).catch((e: Error) =>
              messageApi.error(e.message),
            )
          }
          style={{ fontSize: 12 }}
        />
      ),
    },
    {
      title: "Tags",
      key: "tags",
      render: (_: unknown, stock: Stock) => (
        <Space wrap size={4}>
          {stock.tags.map((tag) => (
            <Tag
              key={tag.name}
              color={tag.color}
              closable
              style={{ margin: 0 }}
              onClose={(e) => {
                e.preventDefault();
                const newTags = stock.tags.filter((t) => t.name !== tag.name);
                void updateStock(stock.id, { tags: newTags }).catch((err: Error) =>
                  messageApi.error(err.message),
                );
              }}
            >
              {tag.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Notes",
      key: "notes",
      render: (_: unknown, stock: Stock) => (
        <Input.TextArea
          defaultValue={stock.notes ?? ""}
          rows={1}
          autoSize={{ minRows: 1, maxRows: 3 }}
          style={{ fontSize: 12 }}
          onBlur={(e) => {
            const notes = e.target.value.trim();
            if (notes === (stock.notes ?? "")) return;
            void updateStock(stock.id, { notes }).catch((err: Error) =>
              messageApi.error(err.message),
            );
          }}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, stock: Stock) => (
        <Popconfirm
          title="Delete this stock?"
          description="Associated trades will lose the stock link."
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() =>
            void deleteStock(stock.id).catch((e: Error) => messageApi.error(e.message))
          }
        >
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 24px" }}>
      {contextHolder}
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        Master Stock List
      </Typography.Title>
      <Table
        rowKey="id"
        size="small"
        dataSource={stocks}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 30 }}
      />
    </div>
  );
}
