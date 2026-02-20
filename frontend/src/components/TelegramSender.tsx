import { useState } from "react";
import { Button, Card, Col, Input, Row, Space, Tag, Typography } from "antd";
import { FileSendCard } from "./FileSendCard";
import { sendRequest } from "../utils/api";

const { Text } = Typography;

interface ChatMessage {
  key: string;
  sender: string;
  text: string;
  time: string;
}

function senderColor(sender: string): string {
  if (sender === "You") return "blue";
  if (sender === "Error") return "red";
  return "green";
}

export function TelegramSender() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [textMessage, setTextMessage] = useState("");
  const [isSendingText, setIsSendingText] = useState(false);

  const appendMessage = (sender: string, text: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sender,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleSendText = async () => {
    const trimmed = textMessage.trim();
    if (trimmed.length === 0 || isSendingText) return;

    setIsSendingText(true);
    appendMessage("You", trimmed);

    try {
      const payload = await sendRequest("/api/telegram/send/text", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });
      setTextMessage("");
      appendMessage(
        "Telegram",
        (payload.message as string | undefined) ?? "Text sent successfully.",
      );
    } catch (error) {
      appendMessage(
        "Error",
        error instanceof Error ? error.message : "Failed to send text.",
      );
    } finally {
      setIsSendingText(false);
    }
  };

  return (
    <Card title="Telegram Sender">
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {chatHistory.length === 0 ? (
            <Text type="secondary">No messages yet.</Text>
          ) : (
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              {chatHistory.map((item) => (
                <div
                  key={item.key}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <Space direction="vertical" size={2} style={{ width: "100%" }}>
                    <Space>
                      <Tag color={senderColor(item.sender)}>{item.sender}</Tag>
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
            onChange={(e) => setTextMessage(e.target.value)}
            onPressEnter={() => void handleSendText()}
          />
          <Button
            type="primary"
            loading={isSendingText}
            onClick={() => void handleSendText()}
          >
            Send Text
          </Button>
        </Space.Compact>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <FileSendCard
              title="Send Image"
              accept="image/*"
              endpoint="/api/telegram/send/image"
              fileLabel="Image selected: "
              onMessage={appendMessage}
            />
          </Col>
          <Col xs={24} lg={12}>
            <FileSendCard
              title="Send Excel"
              accept=".xlsx,.xls"
              endpoint="/api/telegram/send/excel"
              fileLabel="Excel selected: "
              onMessage={appendMessage}
            />
          </Col>
        </Row>
      </Space>
    </Card>
  );
}