import { Alert } from "antd";
import { useBackendHealth } from "../hooks/useBackendHealth";

export function HealthStatus() {
  const { isLoading, status, error } = useBackendHealth();

  if (isLoading) {
    return (
      <Alert
        type="info"
        showIcon
        title="Checking Render backend connection..."
      />
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        title="Backend check failed"
        description={error}
      />
    );
  }

  return (
    <Alert type="success" showIcon message={`Backend status: ${status}`} />
  );
}