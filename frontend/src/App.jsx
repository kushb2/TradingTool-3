import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Layout,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import { createChart, LineSeries } from "lightweight-charts";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const DEFAULT_API_BASE_URL = "https://tradingtool-3-service.onrender.com";

const watchlistRows = [
  { key: "1", symbol: "RELIANCE", price: "2,938.30", move: "+0.91%" },
  { key: "2", symbol: "INFY", price: "1,982.10", move: "-0.35%" },
  { key: "3", symbol: "TCS", price: "4,275.80", move: "+0.42%" },
];

const watchlistColumns = [
  { title: "Symbol", dataIndex: "symbol", key: "symbol" },
  { title: "Price", dataIndex: "price", key: "price" },
  {
    title: "Move",
    dataIndex: "move",
    key: "move",
    render: (value) => {
      const color = value.startsWith("-") ? "red" : "green";
      return <Tag color={color}>{value}</Tag>;
    },
  },
];

function LightweightChartsReactPanel() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#ffffff" },
        textColor: "#1f1f1f",
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      width: containerRef.current.clientWidth,
      height: 260,
      rightPriceScale: {
        borderColor: "#d9d9d9",
      },
      timeScale: {
        borderColor: "#d9d9d9",
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#1677ff",
      lineWidth: 2,
    });

    lineSeries.setData([
      { time: "2026-02-10", value: 98.2 },
      { time: "2026-02-11", value: 101.6 },
      { time: "2026-02-12", value: 100.1 },
      { time: "2026-02-13", value: 103.4 },
      { time: "2026-02-14", value: 102.2 },
      { time: "2026-02-15", value: 106.1 },
      { time: "2026-02-16", value: 104.8 },
      { time: "2026-02-17", value: 108.3 },
      { time: "2026-02-18", value: 107.2 },
      { time: "2026-02-19", value: 110.6 },
    ]);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      const target = entries[0];
      if (!target) {
        return;
      }
      chart.applyOptions({
        width: Math.floor(target.contentRect.width),
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", minHeight: 260 }} />
  );
}

async function readResponseBody(response) {
  const responseText = await response.text();
  if (responseText.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return { message: responseText };
  }
}

export default function App() {
  const apiBaseUrl = useMemo(() => {
    const rawValue = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
    return rawValue.trim().replace(/\/+$/, "");
  }, []);

  const [backendHealth, setBackendHealth] = useState({
    isLoading: true,
    status: "",
    error: "",
  });

  const [chatHistory, setChatHistory] = useState([]);
  const [textMessage, setTextMessage] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [excelCaption, setExcelCaption] = useState("");
  const [imageFileList, setImageFileList] = useState([]);
  const [excelFileList, setExcelFileList] = useState([]);
  const [isSendingText, setIsSendingText] = useState(false);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [isSendingExcel, setIsSendingExcel] = useState(false);

  const appendChatHistory = (sender, text) => {
    setChatHistory((current) => [
      ...current,
      {
        key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sender,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const sendRequest = async (path, requestInit) => {
    const response = await fetch(`${apiBaseUrl}${path}`, requestInit);
    const payload = await readResponseBody(response);

    if (!response.ok || payload.ok === false) {
      const errorMessage =
        payload.telegramDescription ??
        payload.message ??
        `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return payload;
  };

  const handleSendText = async () => {
    const trimmedMessage = textMessage.trim();
    if (trimmedMessage.length === 0 || isSendingText) {
      return;
    }

    setIsSendingText(true);
    appendChatHistory("You", trimmedMessage);

    try {
      const payload = await sendRequest("/api/telegram/send/text", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmedMessage }),
      });
      setTextMessage("");
      appendChatHistory("Telegram", payload.message ?? "Text sent successfully.");
    } catch (error) {
      appendChatHistory(
        "Error",
        error instanceof Error ? error.message : "Failed to send text.",
      );
    } finally {
      setIsSendingText(false);
    }
  };

  const handleSendImage = async () => {
    const selectedFile = imageFileList[0]?.originFileObj ?? null;
    if (!selectedFile || isSendingImage) {
      return;
    }

    setIsSendingImage(true);
    appendChatHistory("You", `Image selected: ${selectedFile.name}`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);
      if (imageCaption.trim().length > 0) {
        formData.append("caption", imageCaption.trim());
      }

      const payload = await sendRequest("/api/telegram/send/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      setImageFileList([]);
      setImageCaption("");
      appendChatHistory("Telegram", payload.message ?? "Image sent successfully.");
    } catch (error) {
      appendChatHistory(
        "Error",
        error instanceof Error ? error.message : "Failed to send image.",
      );
    } finally {
      setIsSendingImage(false);
    }
  };

  const handleSendExcel = async () => {
    const selectedFile = excelFileList[0]?.originFileObj ?? null;
    if (!selectedFile || isSendingExcel) {
      return;
    }

    setIsSendingExcel(true);
    appendChatHistory("You", `Excel selected: ${selectedFile.name}`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);
      if (excelCaption.trim().length > 0) {
        formData.append("caption", excelCaption.trim());
      }

      const payload = await sendRequest("/api/telegram/send/excel", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      setExcelFileList([]);
      setExcelCaption("");
      appendChatHistory(
        "Telegram",
        payload.message ?? "Excel file sent successfully.",
      );
    } catch (error) {
      appendChatHistory(
        "Error",
        error instanceof Error ? error.message : "Failed to send Excel file.",
      );
    } finally {
      setIsSendingExcel(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await readResponseBody(response);
        const status =
          typeof payload?.status === "string" ? payload.status : "unknown";

        if (!isActive) {
          return;
        }

        setBackendHealth({
          isLoading: false,
          status,
          error: "",
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setBackendHealth({
          isLoading: false,
          status: "",
          error: error instanceof Error ? error.message : "Request failed",
        });
      }
    };

    void checkHealth();
    return () => {
      isActive = false;
    };
  }, [apiBaseUrl]);

  return (
    <Layout>
      <Header>
        <Title level={3} style={{ color: "white", margin: 0 }}>
          TradingTool-3
        </Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <Card>
            <Title level={4}>React Setup</Title>
            <Paragraph>
              Frontend is configured with React + Ant Design, and the requested{" "}
              <Text code>lightweight-charts-react</Text> dependency.
            </Paragraph>
            <Paragraph>
              Backend base URL: <Text code>{apiBaseUrl}</Text>
            </Paragraph>
            {backendHealth.isLoading ? (
              <Alert
                type="info"
                showIcon
                title="Checking Render backend connection..."
              />
            ) : backendHealth.error ? (
              <Alert
                type="error"
                showIcon
                title="Backend check failed"
                description={backendHealth.error}
              />
            ) : (
              <Alert
                type="success"
                showIcon
                title={`Backend status: ${backendHealth.status}`}
              />
            )}
          </Card>

          <Card title="Telegram Sender">
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {chatHistory.length === 0 ? (
                  <Text type="secondary">No messages yet.</Text>
                ) : (
                  <Space orientation="vertical" size={10} style={{ width: "100%" }}>
                    {chatHistory.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: 8,
                          padding: 10,
                        }}
                      >
                        <Space orientation="vertical" size={2} style={{ width: "100%" }}>
                          <Space>
                            <Tag color={item.sender === "You" ? "blue" : "green"}>
                              {item.sender}
                            </Tag>
                            <Text type="secondary">{item.time}</Text>
                          </Space>
                          <Text>{item.text}</Text>
                        </Space>
                      </div>
                    ))}
                  </Space>
                )}
              </div>

              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={textMessage}
                  placeholder="Type message text..."
                  onChange={(event) => setTextMessage(event.target.value)}
                  onPressEnter={handleSendText}
                />
                <Button
                  type="primary"
                  loading={isSendingText}
                  onClick={handleSendText}
                >
                  Send Text
                </Button>
              </Space.Compact>

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card size="small" title="Send Image">
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Upload
                        maxCount={1}
                        accept="image/*"
                        beforeUpload={() => false}
                        fileList={imageFileList}
                        onChange={({ fileList }) =>
                          setImageFileList(fileList.slice(-1))
                        }
                      >
                        <Button>Select Image</Button>
                      </Upload>
                      <Input
                        placeholder="Optional caption"
                        value={imageCaption}
                        onChange={(event) => setImageCaption(event.target.value)}
                      />
                      <Button
                        type="primary"
                        loading={isSendingImage}
                        disabled={imageFileList.length === 0}
                        onClick={handleSendImage}
                      >
                        Send Image
                      </Button>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card size="small" title="Send Excel">
                    <Space orientation="vertical" style={{ width: "100%" }}>
                      <Upload
                        maxCount={1}
                        accept=".xlsx,.xls"
                        beforeUpload={() => false}
                        fileList={excelFileList}
                        onChange={({ fileList }) =>
                          setExcelFileList(fileList.slice(-1))
                        }
                      >
                        <Button>Select Excel File</Button>
                      </Upload>
                      <Input
                        placeholder="Optional caption"
                        value={excelCaption}
                        onChange={(event) => setExcelCaption(event.target.value)}
                      />
                      <Button
                        type="primary"
                        loading={isSendingExcel}
                        disabled={excelFileList.length === 0}
                        onClick={handleSendExcel}
                      >
                        Send Excel
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Watchlist (Ant Design Table)">
                <Table
                  columns={watchlistColumns}
                  dataSource={watchlistRows}
                  pagination={false}
                  size="middle"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Chart Module">
                <LightweightChartsReactPanel />
                <Divider />
                <Paragraph type="secondary">
                  UI components are built with Ant Design only, with no custom
                  stylesheet files.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Space>
      </Content>
      <Footer style={{ textAlign: "center" }}>TradingTool-3 Frontend</Footer>
    </Layout>
  );
}
