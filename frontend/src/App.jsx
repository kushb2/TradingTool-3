import * as LightweightChartsReact from "lightweight-charts-react";
import {
  Alert,
  Card,
  Col,
  Divider,
  Layout,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

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
      <Footer style={{ textAlign: "center" }}>
        TradingTool-3 Frontend
      </Footer>
    </Layout>
  );
}
