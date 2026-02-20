import { useState } from "react";
import { Button, Card, Input, Space, Upload } from "antd";
import type { UploadFile } from "antd";
import { sendRequest } from "../utils/api";

interface FileSendCardProps {
  title: string;
  accept: string;
  endpoint: string;
  fileLabel: string;
  onMessage: (sender: string, text: string) => void;
}

export function FileSendCard({
  title,
  accept,
  endpoint,
  fileLabel,
  onMessage,
}: FileSendCardProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [caption, setCaption] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const selectedFile = fileList[0]?.originFileObj ?? null;
    if (!selectedFile || isSending) return;

    setIsSending(true);
    onMessage("You", `${fileLabel}${selectedFile.name}`);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);
      if (caption.trim().length > 0) {
        formData.append("caption", caption.trim());
      }

      const payload = await sendRequest(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      setFileList([]);
      setCaption("");
      onMessage(
        "Telegram",
        (payload.message as string | undefined) ?? "Sent successfully.",
      );
    } catch (error) {
      onMessage(
        "Error",
        error instanceof Error
          ? error.message
          : `Failed to send ${title.toLowerCase()}.`,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card size="small" title={title}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Upload
          maxCount={1}
          accept={accept}
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: updated }) => setFileList(updated.slice(-1))}
        >
          <Button>Select {title.replace("Send ", "")}</Button>
        </Upload>
        <Input
          placeholder="Optional caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <Button
          type="primary"
          loading={isSending}
          disabled={fileList.length === 0}
          onClick={() => void handleSend()}
        >
          {title}
        </Button>
      </Space>
    </Card>
  );
}