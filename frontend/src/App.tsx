import { Card, Col, Divider, Layout, Row, Space, Typography } from "antd";
import { HealthStatus } from "./components/HealthStatus";
import { TelegramSender } from "./components/TelegramSender";
import { WatchlistTable } from "./components/WatchlistTable";
import { PriceChart } from "./components/PriceChart";
import { apiBaseUrl } from "./utils/api";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function App() {
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
            <HealthStatus />
          </Card>

          <TelegramSender />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Watchlist (Ant Design Table)">
                <WatchlistTable />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Chart Module">
                <PriceChart />
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