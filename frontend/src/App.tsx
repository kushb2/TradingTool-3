import { DeleteOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useStocks } from "./hooks/useStocks";
import { useWatchlistItems } from "./hooks/useWatchlistItems";
import { useWatchlistTags } from "./hooks/useWatchlistTags";
import { useWatchlists } from "./hooks/useWatchlists";
import { useStockTags } from "./hooks/useStockTags";
import type { Stock, Watchlist } from "./types";

type MenuKey =
  | "view-watchlist"
  | "manage-watchlist"
  | "manage-stock"
  | "view-stock";

interface CreateWatchlistFormValues {
  name: string;
  description: string;
}

interface CreateStockFormValues {
  symbol: string;
  instrumentToken: string;
  companyName: string;
  exchange: string;
  description: string;
  priority: number | null;
}

interface UpdateStockFormValues {
  stockId: number;
  companyName: string;
  exchange: string;
  description: string;
  priority: number | null;
}

const ROOT_BG = "#f3f6fb";
const CARD_BG = "#ffffff";
const BORDER = "#d8dee8";

const menuItems: MenuProps["items"] = [
  {
    key: "watchlist-management",
    label: "Watchlist Management",
    children: [
      { key: "view-watchlist", label: "View Watch List" },
      { key: "manage-watchlist", label: "Create or Delete Watchlist" },
      { key: "manage-stock", label: "Create or Update Stock" },
      { key: "view-stock", label: "View Stock" },
    ],
  },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPageMeta(key: MenuKey): { title: string; subtitle: string } {
  if (key === "view-watchlist") {
    return {
      title: "View Watch Lists",
      subtitle: "Inspect watchlists and assign/remove stocks from a selected watchlist.",
    };
  }

  if (key === "manage-watchlist") {
    return {
      title: "Create or Delete Watchlist",
      subtitle: "Create a watchlist with name and description, or delete an existing one.",
    };
  }

  if (key === "manage-stock") {
    return {
      title: "Create or Update Stock",
      subtitle: "Create new stocks and update company name/exchange for existing stocks.",
    };
  }

  return {
    title: "View Stocks",
    subtitle: "Browse all stocks currently stored in the backend database.",
  };
}

function renderError(messageText: string | null): React.ReactNode {
  if (!messageText) {
    return null;
  }

  return <Alert style={{ marginBottom: 12 }} type="error" showIcon message={messageText} />;
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("view-watchlist");
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [stockToAddId, setStockToAddId] = useState<number | null>(null);
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [watchlistTagName, setWatchlistTagName] = useState("");
  const [stockTagName, setStockTagName] = useState("");
  const [selectedStockForTagsId, setSelectedStockForTagsId] = useState<number | null>(null);

  const [messageApi, messageContextHolder] = message.useMessage();

  const [createWatchlistForm] = Form.useForm<CreateWatchlistFormValues>();
  const [createStockForm] = Form.useForm<CreateStockFormValues>();
  const [updateStockForm] = Form.useForm<UpdateStockFormValues>();

  const {
    watchlists,
    loading: watchlistsLoading,
    error: watchlistsError,
    refetch: refetchWatchlists,
    createWatchlist,
    removeWatchlist,
  } = useWatchlists();

  const {
    stocks,
    loading: stocksLoading,
    error: stocksError,
    refetch: refetchStocks,
    createStock,
    updateStock,
  } = useStocks();

  const {
    items: watchlistItems,
    loading: watchlistItemsLoading,
    error: watchlistItemsError,
    refetch: refetchWatchlistItems,
    addStockToWatchlist,
    removeStockFromWatchlist,
  } = useWatchlistItems(selectedWatchlistId);

  const {
    tags: watchlistTags,
    loading: watchlistTagsLoading,
    error: watchlistTagsError,
    refetch: refetchWatchlistTags,
    addTag: addWatchlistTag,
    removeTag: removeWatchlistTag,
  } = useWatchlistTags(selectedWatchlistId);

  const {
    tags: stockTags,
    loading: stockTagsLoading,
    error: stockTagsError,
    refetch: refetchStockTags,
    addTag: addStockTag,
    removeTag: removeStockTag,
  } = useStockTags(selectedStockForTagsId);

  useEffect(() => {
    if (watchlists.length === 0) {
      setSelectedWatchlistId(null);
      return;
    }

    const selectedStillExists =
      selectedWatchlistId !== null &&
      watchlists.some((watchlist) => watchlist.id === selectedWatchlistId);

    if (!selectedStillExists) {
      setSelectedWatchlistId(watchlists[0].id);
    }
  }, [watchlists, selectedWatchlistId]);

  useEffect(() => {
    if (stocks.length === 0) {
      setSelectedStockForTagsId(null);
      return;
    }

    const selectedStillExists =
      selectedStockForTagsId !== null &&
      stocks.some((stock) => stock.id === selectedStockForTagsId);

    if (!selectedStillExists) {
      setSelectedStockForTagsId(stocks[0].id);
    }
  }, [stocks, selectedStockForTagsId]);

  const selectedWatchlist: Watchlist | null = useMemo(() => {
    if (selectedWatchlistId === null) return null;
    return watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) ?? null;
  }, [watchlists, selectedWatchlistId]);

  const stockMap = useMemo(() => {
    return new Map<number, Stock>(stocks.map((stock) => [stock.id, stock]));
  }, [stocks]);

  const stocksInSelectedWatchlist = useMemo(() => {
    return watchlistItems
      .map((item) => stockMap.get(item.stockId))
      .filter((stock): stock is Stock => stock !== undefined);
  }, [watchlistItems, stockMap]);

  const addableStocks = useMemo(() => {
    const existingIds = new Set<number>(watchlistItems.map((item) => item.stockId));
    return stocks.filter((stock) => !existingIds.has(stock.id));
  }, [stocks, watchlistItems]);

  const filteredStocks = useMemo(() => {
    const query = stockSearchTerm.trim().toLowerCase();
    if (query.length === 0) {
      return stocks;
    }

    return stocks.filter((stock) => {
      return (
        stock.symbol.toLowerCase().includes(query) ||
        stock.companyName.toLowerCase().includes(query) ||
        stock.exchange.toLowerCase().includes(query)
      );
    });
  }, [stockSearchTerm, stocks]);

  const watchlistColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => formatDate(value),
      width: 190,
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      render: (_: unknown, watchlist: Watchlist) => (
        <Popconfirm
          title="Delete this watchlist?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => void handleDeleteWatchlist(watchlist.id)}
        >
          <Button danger size="small" icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const stockColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
      width: 120,
    },
    {
      title: "Instrument Token",
      dataIndex: "instrumentToken",
      key: "instrumentToken",
      width: 160,
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Exchange",
      dataIndex: "exchange",
      key: "exchange",
      width: 130,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string | null) => value ?? "-",
      width: 220,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (value: number | null) => (value === null ? "-" : value),
      width: 110,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => formatDate(value),
      width: 190,
    },
  ];

  const watchlistStockColumns = [
    {
      title: "Symbol",
      dataIndex: "symbol",
      key: "symbol",
      render: (value: string) => <Tag color="geekblue">{value}</Tag>,
      width: 120,
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Exchange",
      dataIndex: "exchange",
      key: "exchange",
      width: 120,
    },
    {
      title: "Instrument Token",
      dataIndex: "instrumentToken",
      key: "instrumentToken",
      width: 170,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: unknown, stock: Stock) => (
        <Button
          danger
          size="small"
          onClick={() => void handleRemoveStockFromWatchlist(stock.id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  async function handleCreateWatchlist(values: CreateWatchlistFormValues): Promise<void> {
    try {
      const name = values.name.trim();
      const description = values.description.trim();

      const created = await createWatchlist(name, description);
      setSelectedWatchlistId(created.id);
      createWatchlistForm.resetFields();
      messageApi.success(`Watchlist '${created.name}' created`);
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to create watchlist");
    }
  }

  async function handleDeleteWatchlist(watchlistId: number): Promise<void> {
    try {
      await removeWatchlist(watchlistId);
      messageApi.success("Watchlist deleted");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to delete watchlist");
    }
  }

  async function handleCreateStock(values: CreateStockFormValues): Promise<void> {
    try {
      const parsedInstrumentToken = Number(values.instrumentToken);
      if (!Number.isFinite(parsedInstrumentToken) || parsedInstrumentToken <= 0) {
        messageApi.error("Instrument token must be a positive number");
        return;
      }

      const priorityValue = values.priority;
      if (priorityValue !== null && (!Number.isInteger(priorityValue) || priorityValue <= 0)) {
        messageApi.error("Priority must be a positive integer");
        return;
      }

      const normalizedDescription = values.description.trim();

      await createStock({
        symbol: values.symbol.trim().toUpperCase(),
        instrumentToken: parsedInstrumentToken,
        companyName: values.companyName.trim(),
        exchange: values.exchange.trim().toUpperCase(),
        description: normalizedDescription.length > 0 ? normalizedDescription : undefined,
        priority: priorityValue ?? undefined,
      });

      createStockForm.resetFields();
      createStockForm.setFieldValue("exchange", "NSE");
      createStockForm.setFieldValue("priority", null);
      messageApi.success("Stock created");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to create stock");
    }
  }

  async function handleUpdateStock(values: UpdateStockFormValues): Promise<void> {
    try {
      const payload: {
        companyName?: string;
        exchange?: string;
        description?: string;
        priority?: number;
      } = {};
      const companyName = values.companyName?.trim() ?? "";
      const exchange = values.exchange?.trim().toUpperCase() ?? "";
      const description = values.description?.trim() ?? "";
      const priority = values.priority;

      if (companyName.length > 0) {
        payload.companyName = companyName;
      }
      if (exchange.length > 0) {
        payload.exchange = exchange;
      }
      if (description.length > 0) {
        payload.description = description;
      }
      if (priority !== null) {
        if (!Number.isInteger(priority) || priority <= 0) {
          messageApi.error("Priority must be a positive integer");
          return;
        }
        payload.priority = priority;
      }

      if (Object.keys(payload).length === 0) {
        messageApi.error("Provide at least one field to update");
        return;
      }

      await updateStock(values.stockId, payload);
      messageApi.success("Stock updated");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to update stock");
    }
  }

  async function handleAddStockToWatchlist(): Promise<void> {
    if (selectedWatchlistId === null) {
      messageApi.error("Select a watchlist first");
      return;
    }

    if (stockToAddId === null) {
      messageApi.error("Select a stock to add");
      return;
    }

    try {
      await addStockToWatchlist(stockToAddId);
      setStockToAddId(null);
      messageApi.success("Stock added to watchlist");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to add stock");
    }
  }

  async function handleRemoveStockFromWatchlist(stockId: number): Promise<void> {
    try {
      await removeStockFromWatchlist(stockId);
      messageApi.success("Stock removed from watchlist");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to remove stock");
    }
  }

  async function handleAddWatchlistTag(): Promise<void> {
    const normalizedTag = watchlistTagName.trim();
    if (normalizedTag.length === 0) {
      messageApi.error("Enter a watchlist tag");
      return;
    }

    try {
      await addWatchlistTag(normalizedTag);
      setWatchlistTagName("");
      messageApi.success("Tag added to watchlist");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to add watchlist tag");
    }
  }

  async function handleRemoveWatchlistTag(tagId: number): Promise<void> {
    try {
      await removeWatchlistTag(tagId);
      messageApi.success("Tag removed from watchlist");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to remove watchlist tag");
    }
  }

  async function handleAddStockTag(): Promise<void> {
    const normalizedTag = stockTagName.trim();
    if (normalizedTag.length === 0) {
      messageApi.error("Enter a stock tag");
      return;
    }

    try {
      await addStockTag(normalizedTag);
      setStockTagName("");
      messageApi.success("Tag added to stock");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to add stock tag");
    }
  }

  async function handleRemoveStockTag(tagId: number): Promise<void> {
    try {
      await removeStockTag(tagId);
      messageApi.success("Tag removed from stock");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to remove stock tag");
    }
  }

  function renderViewWatchlistPage(): React.ReactNode {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Card style={{ borderColor: BORDER, background: CARD_BG }}>
          <Space wrap align="end" style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              <Typography.Text strong>Select Watchlist</Typography.Text>
              <br />
              <Typography.Text type="secondary">
                Choose one watchlist to inspect and manage assigned stocks.
              </Typography.Text>
            </div>
            <Space wrap>
              <Select<number>
                style={{ width: 320 }}
                placeholder="Select watchlist"
                value={selectedWatchlistId ?? undefined}
                loading={watchlistsLoading}
                onChange={(value) => setSelectedWatchlistId(value)}
                options={watchlists.map((watchlist) => ({
                  label: `${watchlist.name} (#${watchlist.id})`,
                  value: watchlist.id,
                }))}
              />
              <Button icon={<ReloadOutlined />} onClick={() => void refetchWatchlists()}>
                Refresh Watchlists
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => void refetchWatchlistItems()}>
                Refresh Items
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => void refetchWatchlistTags()}>
                Refresh Tags
              </Button>
            </Space>
          </Space>
          {selectedWatchlist && (
            <Alert
              style={{ marginTop: 12 }}
              type="info"
              showIcon
              message={`${selectedWatchlist.name}`}
              description={selectedWatchlist.description ?? "No description"}
            />
          )}
        </Card>

        {renderError(watchlistsError)}
        {renderError(stocksError)}
        {renderError(watchlistItemsError)}
        {renderError(watchlistTagsError)}

        <Card style={{ borderColor: BORDER, background: CARD_BG }}>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Typography.Text strong>Add Stock to Selected Watchlist</Typography.Text>
            <Space wrap>
              <Select<number>
                style={{ width: 420 }}
                placeholder="Select stock"
                value={stockToAddId ?? undefined}
                onChange={(value) => setStockToAddId(value)}
                loading={stocksLoading}
                options={addableStocks.map((stock) => ({
                  label: `${stock.symbol} - ${stock.companyName}`,
                  value: stock.id,
                }))}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => void handleAddStockToWatchlist()}>
                Add Stock
              </Button>
            </Space>
          </Space>
        </Card>

        <Card
          title="Watchlist Tags"
          style={{ borderColor: BORDER, background: CARD_BG }}
          extra={watchlistTagsLoading ? <Spin size="small" /> : null}
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Space wrap>
              <Input
                style={{ width: 280 }}
                placeholder="Enter watchlist tag"
                value={watchlistTagName}
                onChange={(event) => setWatchlistTagName(event.target.value)}
                onPressEnter={() => void handleAddWatchlistTag()}
              />
              <Button type="primary" onClick={() => void handleAddWatchlistTag()}>
                Add Tag
              </Button>
            </Space>
            <Space wrap>
              {watchlistTags.length === 0 ? (
                <Typography.Text type="secondary">No tags assigned</Typography.Text>
              ) : (
                watchlistTags.map((tag) => (
                  <Tag
                    key={tag.id}
                    color="cyan"
                    closable
                    onClose={(event) => {
                      event.preventDefault();
                      void handleRemoveWatchlistTag(tag.id);
                    }}
                  >
                    {tag.name}
                  </Tag>
                ))
              )}
            </Space>
          </Space>
        </Card>

        <Card
          title="Stocks in Selected Watchlist"
          style={{ borderColor: BORDER, background: CARD_BG }}
          extra={watchlistItemsLoading ? <Spin size="small" /> : null}
        >
          <Table
            rowKey="id"
            size="middle"
            dataSource={stocksInSelectedWatchlist}
            columns={watchlistStockColumns}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: "No stocks in this watchlist" }}
          />
        </Card>
      </Space>
    );
  }

  function renderManageWatchlistPage(): React.ReactNode {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {renderError(watchlistsError)}

        <Card title="Create Watchlist" style={{ borderColor: BORDER, background: CARD_BG }}>
          <Form<CreateWatchlistFormValues>
            layout="vertical"
            form={createWatchlistForm}
            onFinish={(values) => void handleCreateWatchlist(values)}
            initialValues={{ name: "", description: "" }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, whitespace: true, message: "Enter watchlist name" }]}
            >
              <Input placeholder="Growth opportunities" />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, whitespace: true, message: "Enter watchlist description" }]}
            >
              <Input.TextArea rows={3} placeholder="Long-term stocks to track" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Create Watchlist
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title="Delete Watchlist"
          style={{ borderColor: BORDER, background: CARD_BG }}
          extra={
            <Button icon={<ReloadOutlined />} onClick={() => void refetchWatchlists()}>
              Refresh
            </Button>
          }
        >
          <Table
            rowKey="id"
            size="middle"
            loading={watchlistsLoading}
            dataSource={watchlists}
            columns={watchlistColumns}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: "No watchlists available" }}
          />
        </Card>
      </Space>
    );
  }

  function renderManageStockPage(): React.ReactNode {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {renderError(stocksError)}
        {renderError(stockTagsError)}

        <Card title="Create Stock" style={{ borderColor: BORDER, background: CARD_BG }}>
          <Form<CreateStockFormValues>
            layout="vertical"
            form={createStockForm}
            onFinish={(values) => void handleCreateStock(values)}
            initialValues={{
              symbol: "",
              instrumentToken: "",
              companyName: "",
              exchange: "NSE",
              description: "",
              priority: null,
            }}
          >
            <Form.Item
              label="Symbol"
              name="symbol"
              rules={[{ required: true, whitespace: true, message: "Enter stock symbol" }]}
            >
              <Input placeholder="RELIANCE" />
            </Form.Item>

            <Form.Item
              label="Instrument Token"
              name="instrumentToken"
              rules={[{ required: true, whitespace: true, message: "Enter instrument token" }]}
            >
              <Input placeholder="738561" />
            </Form.Item>

            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[{ required: true, whitespace: true, message: "Enter company name" }]}
            >
              <Input placeholder="Reliance Industries Ltd" />
            </Form.Item>

            <Form.Item
              label="Exchange"
              name="exchange"
              rules={[{ required: true, whitespace: true, message: "Enter exchange" }]}
            >
              <Input placeholder="NSE" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Optional stock description" />
            </Form.Item>

            <Form.Item label="Priority" name="priority">
              <InputNumber style={{ width: "100%" }} min={1} precision={0} placeholder="Optional priority" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Create Stock
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title="Update Stock"
          style={{ borderColor: BORDER, background: CARD_BG }}
          extra={
            <Button icon={<ReloadOutlined />} onClick={() => void refetchStocks()}>
              Refresh
            </Button>
          }
        >
          <Form<UpdateStockFormValues>
            layout="vertical"
            form={updateStockForm}
            onFinish={(values) => void handleUpdateStock(values)}
          >
            <Form.Item
              label="Select Stock"
              name="stockId"
              rules={[{ required: true, message: "Select a stock" }]}
            >
              <Select<number>
                showSearch
                placeholder="Select stock to update"
                optionFilterProp="label"
                onChange={(stockId) => {
                  const stock = stocks.find((entry) => entry.id === stockId);
                  if (!stock) return;

                  updateStockForm.setFieldsValue({
                    stockId,
                    companyName: stock.companyName,
                    exchange: stock.exchange,
                    description: stock.description ?? "",
                    priority: stock.priority ?? null,
                  });
                }}
                options={stocks.map((stock) => ({
                  label: `${stock.symbol} - ${stock.companyName}`,
                  value: stock.id,
                }))}
              />
            </Form.Item>

            <Form.Item label="Company Name" name="companyName">
              <Input placeholder="Updated company name" />
            </Form.Item>

            <Form.Item label="Exchange" name="exchange">
              <Input placeholder="NSE" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Optional updated description" />
            </Form.Item>

            <Form.Item label="Priority" name="priority">
              <InputNumber style={{ width: "100%" }} min={1} precision={0} placeholder="Optional priority" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit">
                Update Stock
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title="Stock Tags"
          style={{ borderColor: BORDER, background: CARD_BG }}
          extra={stockTagsLoading ? <Spin size="small" /> : null}
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Space wrap>
              <Select<number>
                style={{ width: 340 }}
                placeholder="Select stock for tags"
                value={selectedStockForTagsId ?? undefined}
                onChange={(value) => setSelectedStockForTagsId(value)}
                options={stocks.map((stock) => ({
                  label: `${stock.symbol} - ${stock.companyName}`,
                  value: stock.id,
                }))}
              />
              <Button icon={<ReloadOutlined />} onClick={() => void refetchStockTags()}>
                Refresh Tags
              </Button>
            </Space>
            <Space wrap>
              <Input
                style={{ width: 280 }}
                placeholder="Enter stock tag"
                value={stockTagName}
                onChange={(event) => setStockTagName(event.target.value)}
                onPressEnter={() => void handleAddStockTag()}
              />
              <Button type="primary" onClick={() => void handleAddStockTag()}>
                Add Tag
              </Button>
            </Space>
            <Space wrap>
              {stockTags.length === 0 ? (
                <Typography.Text type="secondary">No tags assigned</Typography.Text>
              ) : (
                stockTags.map((tag) => (
                  <Tag
                    key={tag.id}
                    color="geekblue"
                    closable
                    onClose={(event) => {
                      event.preventDefault();
                      void handleRemoveStockTag(tag.id);
                    }}
                  >
                    {tag.name}
                  </Tag>
                ))
              )}
            </Space>
          </Space>
        </Card>
      </Space>
    );
  }

  function renderViewStockPage(): React.ReactNode {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {renderError(stocksError)}

        <Card
          style={{ borderColor: BORDER, background: CARD_BG }}
          extra={
            <Space>
              <Input
                placeholder="Search by symbol/company/exchange"
                value={stockSearchTerm}
                onChange={(event) => setStockSearchTerm(event.target.value)}
                style={{ width: 280 }}
              />
              <Button icon={<ReloadOutlined />} onClick={() => void refetchStocks()}>
                Refresh
              </Button>
            </Space>
          }
        >
          <Table
            rowKey="id"
            size="middle"
            loading={stocksLoading}
            dataSource={filteredStocks}
            columns={stockColumns}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "No stocks available" }}
          />
        </Card>
      </Space>
    );
  }

  function renderPageContent(): React.ReactNode {
    if (activeMenu === "view-watchlist") {
      return renderViewWatchlistPage();
    }

    if (activeMenu === "manage-watchlist") {
      return renderManageWatchlistPage();
    }

    if (activeMenu === "manage-stock") {
      return renderManageStockPage();
    }

    return renderViewStockPage();
  }

  const pageMeta = getPageMeta(activeMenu);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#2563eb",
          colorBgLayout: ROOT_BG,
          colorBgContainer: CARD_BG,
          colorBorder: BORDER,
          borderRadius: 10,
          fontSize: 14,
        },
      }}
    >
      {messageContextHolder}

      <Layout style={{ width: "100vw", minHeight: "100vh", background: ROOT_BG }}>
        <Layout style={{ background: "transparent" }}>
          <Layout.Content style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Typography.Title level={3} style={{ marginBottom: 4 }}>
                {pageMeta.title}
              </Typography.Title>
              <Typography.Text type="secondary">{pageMeta.subtitle}</Typography.Text>
            </div>

            {renderPageContent()}
          </Layout.Content>

          <Layout.Sider
            width={320}
            theme="light"
            style={{
              background: CARD_BG,
              borderLeft: `1px solid ${BORDER}`,
              padding: "16px 12px",
            }}
          >
            <Typography.Title level={5} style={{ margin: "0 0 8px 4px" }}>
              Right Panel
            </Typography.Title>
            <Typography.Text type="secondary" style={{ margin: "0 0 12px 4px", display: "block" }}>
              Use this tab to open each watchlist management page.
            </Typography.Text>

            <Menu
              mode="inline"
              items={menuItems}
              selectedKeys={[activeMenu]}
              defaultOpenKeys={["watchlist-management"]}
              onClick={(info) => setActiveMenu(info.key as MenuKey)}
            />
          </Layout.Sider>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
