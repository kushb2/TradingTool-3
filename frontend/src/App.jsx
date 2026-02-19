import { useEffect, useMemo, useState } from "react";
import * as LightweightChartsReact from "lightweight-charts-react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Layout,
  List,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";

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
  const exportedMembers = Object.keys(LightweightChartsReact);

  if (exportedMembers.length === 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message="lightweight-charts-react is installed"
        description="The package currently exposes no public React components. Ant Design UI setup is complete and ready for chart wiring once a chart component export is available."
      />
    );
  }

  return (
    <Space direction="vertical" size="small">
      <Text>Exported members detected from lightweight-charts-react:</Text>
      <Text code>{exportedMembers.join(", ")}</Text>
    </Space>
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
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
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
                message="Checking Render backend connection..."
              />
            ) : backendHealth.error ? (
              <Alert
                type="error"
                showIcon
                message="Backend check failed"
                description={backendHealth.error}
              />
            ) : (
              <Alert
                type="success"
                showIcon
                message={`Backend status: ${backendHealth.status}`}
              />
            )}
          </Card>

          <Card title="Telegram Sender">
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                <List
                  locale={{ emptyText: "No messages yet." }}
                  dataSource={chatHistory}
                  renderItem={(item) => (
                    <List.Item key={item.key}>
                      <Space direction="vertical" size={2} style={{ width: "100%" }}>
                        <Space>
                          <Tag color={item.sender === "You" ? "blue" : "green"}>
                            {item.sender}
                          </Tag>
                          <Text type="secondary">{item.time}</Text>
                        </Space>
                        <Text>{item.text}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
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
                    <Space direction="vertical" style={{ width: "100%" }}>
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
                    <Space direction="vertical" style={{ width: "100%" }}>
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

