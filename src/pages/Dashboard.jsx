import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  Layout,
  Select,
  Row,
  Col,
  Card,
  Statistic,
  Space,
  Divider,
  Button,
  message
} from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

import Sidebar from '../components/SideBar';

const { Header, Content } = Layout;
const { Option } = Select;


const ALL_TOOLS = ['ALL', 'DEPENDABOT', 'SECRETSCAN', 'CODESCAN'];

Highcharts.setOptions({
    colors: [
      '#4E79A7', // Blue
      '#F28E2B', // Orange
      '#76B7B2', // Teal
      '#EDC948', // Yellow-gold
      '#FF9DA7', // Pinkish
      '#9C755F', // Brown
      '#BAB0AC', // Gray
    ],
  });

export default function Dashboard() {
  const [toolWise, setToolWise] = useState([]);      
  const [statusWise, setStatusWise] = useState({});    
  const [severityWise, setSeverityWise] = useState({});
  const [cvssRanges, setCvssRanges] = useState([]);   

  const [totalFindings, setTotalFindings] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [avgCvss, setAvgCvss] = useState(0);

  const [selectedTool, setSelectedTool] = useState([]);

  const fetchDashboardData = async (tools=[]) => {
    try {
        let url = 'http://localhost:8083/api/dashboard';
        if (tools.length > 0) {
            const queryParams = new URLSearchParams();
            tools.forEach(t => queryParams.append('tools', t));
            url += `?${queryParams.toString()}`;
          }
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await resp.json();
     
      const toolMap = data.toolWise || {};
      const toolArr = [];
      let total = 0;
      for (const [toolName, count] of Object.entries(toolMap)) {
        toolArr.push({ name: toolName, y: count });
        total += count;
      }

      setToolWise(toolArr);
      setStatusWise(data.statusWise || {});
      setSeverityWise(data.severityWise || {});
      setCvssRanges(data.cvssRanges || []);

      // Some top-level stats
      setTotalFindings(total);
      setCriticalCount(data.severityWise?.CRITICAL || 0);
      setOpenCount(data.statusWise?.OPEN || 0);

      // If we want an approximate average CVSS from cvssRanges:
      const sumCvss = (data.cvssRanges || []).reduce(
        (acc, cur) => acc + cur.key * cur.count,
        0
      );
      const countCvss = (data.cvssRanges || []).reduce(
        (acc, cur) => acc + cur.count,
        0
      );
      const computedAvg = countCvss ? sumCvss / countCvss : 0;
      setAvgCvss(computedAvg);
    } catch (err) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData([]);
  }, []);


  const toolWiseOptions = {
    chart: { type: 'pie' },
    title: { text: 'Tool-wise Vulnerabilities' },
    series: [
      {
        name: 'Findings',
        data: toolWise,
      },
    ],
    plotOptions: {
      pie: {
        dataLabels: {
          format: '<b>{point.name}</b>: {point.y}',
        },
        showInLegend: true,
        point: {
            events: {
              click: function (event) {
                const clickedTool = this.name;
                window.location.href = '/finding?toolType=' + encodeURIComponent(clickedTool);
              },
            },
          },
      },
    },
  };

  const statusCategories = Object.keys(statusWise);
  const statusData = Object.values(statusWise);

  const statusWiseOptions = {
    chart: { type: 'bar' },
    title: {
      text: `Status-wise Vulnerabilities`,
    },
    xAxis: {
      categories: statusCategories,
      title: { text: null },
    },
    yAxis: {
      min: 0,
      title: { text: 'Count' },
    },
    plotOptions: {
        series: {
          colorByPoint: true,
          point: {
            events: {
              click: function (event) {
                const clickedSeverity = this.category;
                const queryParams = new URLSearchParams();
                selectedTool.forEach((t) => {
                  queryParams.append('toolType', t);
                });
                queryParams.append('status', clickedSeverity);
                window.location.href = '/finding?' + queryParams.toString();
              },
            },
          },  
        },
      },
    series: [
      {
        name: 'Count',
        data: statusData,
      },
    ],
  };

  // 3) Severity-wise (Column)
  const severityCategories = Object.keys(severityWise);
  const severityData = Object.values(severityWise);

  const severityWiseOptions = {
    chart: { type: 'column' },
    title: {
      text: `Severity-wise Vulnerabilities`,
    },
    xAxis: {
      categories: severityCategories,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: { text: 'Count' },
    },
    plotOptions: {
        series: {
          colorByPoint: true, // each category gets a unique color
          point: {
            events: {
              click: function (event) {
                const clickedSeverity = this.category;
                const queryParams = new URLSearchParams();
                selectedTool.forEach((t) => {
                  queryParams.append('toolType', t);
                });
                queryParams.append('severity', clickedSeverity);
                window.location.href = '/finding?' + queryParams.toString();
              },
            },
          },  
        },
      }, 
    series: [
      {
        name: 'Count',
        data: severityData,
      },
    ],
  };

  
  const cvssRangeCategories = cvssRanges.map((r) => `CVSS=${r.key}`);
  const cvssRangeCounts = cvssRanges.map((r) => r.count);

  const cvssRangeOptions = {
    chart: { type: 'area' },
    title: { text: 'CVSS Score Distribution' },
    xAxis: {
      categories: cvssRangeCategories,
      tickmarkPlacement: 'on',
      title: { text: 'CVSS Scores' },
    },
    yAxis: {
      title: { text: 'Count of Findings' },
    },
    tooltip: {
      split: true,
      valueSuffix: ' findings',
    },
    series: [
      {
        name: 'CVSS Range Count',
        data: cvssRangeCounts,
      },
    ],
  };

  const handleToolChange = (toolValue) => {
    setSelectedTool(toolValue);
    fetchDashboardData(toolValue);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>Security Dashboard</h2>
        </Header>

        <Content style={{ margin: '16px', background: '#f0f2f5' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Total Findings"
                  value={totalFindings}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Critical Issues"
                  value={criticalCount}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Open Count"
                  value={openCount}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Average CVSS"
                  value={avgCvss}
                  precision={1}
                  valueStyle={{ color: '#2f54eb' }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card style={{ marginBottom: 24 }}>
            <Space style={{ marginRight: 24 }}>
              <span style={{ fontWeight: '500' }}>Filter by Tool:</span>
              <Select
                mode='multiple'
                value={selectedTool}
                style={{ width: 180 }}
                onChange={handleToolChange}
              >
                {ALL_TOOLS.map((tool) => (
                  <Option key={tool} value={tool}>
                    {tool}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                title="Tool-wise Vulnerabilities"
                extra={<Button type="text" icon={<EllipsisOutlined />} />}
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={toolWiseOptions}
                />
              </Card>
            </Col>

            <Col xs={24} md={12}>
            <Card
                title="Status-wise Vulnerabilities"
                extra={<Button type="text" icon={<EllipsisOutlined />} />}
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={statusWiseOptions}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Severity-wise Vulnerabilities"
                extra={<Button type="text" icon={<EllipsisOutlined />} />}
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={severityWiseOptions}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="CVSS Score Distribution"
                extra={<Button type="text" icon={<EllipsisOutlined />} />}
              >
                <HighchartsReact
                  highcharts={Highcharts}
                  options={cvssRangeOptions}
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
