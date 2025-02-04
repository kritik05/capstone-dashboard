import React from 'react';
import { useState } from 'react';
import { Table, Tag, Tooltip,Drawer,Button,Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AdditionalFinding from './AdditionalFinding';

const severityColorMap = {
  CRITICAL: 'red',
  HIGH: 'volcano',
  MEDIUM: 'orange',
  LOW: 'green',
  INFO: 'blue',
};

const statusColorMap = {
  OPEN: 'green',
  CLOSED: 'geekblue',
  FALSE_POSITIVE: 'red',
  SUPPRESSED: 'orange',
  FIXED: 'purple',
  CONFIRM: 'magenta',
};

const toolTypeColorMap = {
  CODESCAN: 'blue',
  DEPENDABOT: 'geekblue',
  SECRETSCAN: 'purple'
};

const { Option } = Select;

// Possible states for Dependabot
const dependabotStates = ['open', 'dismissed'];
const codescanStates = ['open', 'dismissed'];
const secretscanStates = ['open', 'resolved'];

// Possible dismissed reasons
const DismissedReasonDependabot = [
  { value: 'fix_started', label: 'Fix Started' },
  { value: 'inaccurate', label: 'Inaccurate' },
  { value: 'no_bandwidth', label: 'No Bandwidth' },
  { value: 'not_used', label: 'Not Used' },
  { value: 'tolerable_risk', label: 'Tolerable Risk' },
];

const DismissedReasonCodeScan = [
  { value: 'false positive', label: 'False Positive' },
  { value: `won't fix`, label: 'Would Not Fix' },
  { value: 'used in tests', label: 'Used In Tests' },
  { value: 'null', label: 'Null' },
];
export default function FindingTable({
  findings,         
  loading,          
  currentPage,      
  total,            
  onTableChange,    
  updateAlertState
}) {

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [tempState, setTempState] = useState('');
  const [dismissReason, setDismissReason] = useState('');
  const handleOpenDrawer = (record) => {
    setSelectedFinding(record);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedFinding(null);
  };

  const handleSaveState = () => {
    if (!selectedFinding) return;
    const uuid = selectedFinding.id;

    const alertNumber =selectedFinding.additionalData?.number;
    console.log(alertNumber)
    // Call parent's function with both
    updateAlertState(
      uuid,
      alertNumber,
      tempState,
      tempState === 'dismissed' ? dismissReason : null
    );

    handleCloseDrawer();
  };
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
      ellipsis: {
        showTitle: false, 
      },
      render: (id) => (
        <Tooltip title={id}>
          <span style={{ cursor: 'default' }}>{id}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '15%',
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip title={title}>
          <span style={{ cursor: 'default' }}>{title}</span>
        </Tooltip>
      ),
    },
    {
      title: 'ToolType',
      dataIndex: 'toolType',
      key: 'toolType',
      width: '9%',
      ellipsis: { showTitle: false },
      render: (tool) => {
        const color = toolTypeColorMap[tool] || 'default';
        return <Tag color={color}>{tool}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      align: 'center',
      render: (status) => {
        const color = statusColorMap[status] || 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: '10%',
      align: 'center',
      render: (severity) => {
        const color = severityColorMap[severity] || 'default';
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '23%',
      ellipsis: {
        showTitle: false,
      },
      render: (desc) => (
        <Tooltip title={desc}>
          <span style={{ cursor: 'default' }}>{desc}</span>
        </Tooltip>
      ),
    },
    {
      title: '',
      key: 'action',
      width: '5%',
      align: 'center',
      render: (text, record) => (
        <Button
          icon={<PlusOutlined />}
          shape="circle"
          onClick={() => handleOpenDrawer(record)}
        />
      ),
    },
  ];

  return (
    <>
    <div style={{ margin: '0 auto', width: '95%' }}>
    <Table
      columns={columns}
      dataSource={findings}
      loading={loading}
      rowKey="id"
      pagination={{
        current: currentPage,  
        pageSize: 11,         
        total: total,        
        showSizeChanger: false,
      }}
      onChange={onTableChange}
    />
    </div>
     <Drawer
        title={`Finding Details - ${selectedFinding?.id || ''}`}
        placement="right"
        width={600}
        onClose={handleCloseDrawer}
        open={drawerVisible}
      >
        {selectedFinding ? (
          <>
            <h3>Dependabot State</h3>
            <Select
              style={{ width: 200 }}
              value={tempState}
              onChange={(val) => {
                setTempState(val);
                if (val === 'open') setDismissReason('');
              }}
            >
              {dependabotStates.map((st) => (
                <Option key={st} value={st}>
                  {st}
                </Option>
              ))}
            </Select>

            {tempState === 'dismissed' && (
              <>
                <h4>Dismissed Reason</h4>
                <Select
                  style={{ width: 200 }}
                  placeholder="Select reason"
                  value={dismissReason}
                  onChange={setDismissReason}
                >
                  {DismissedReasonDependabot.map((dr) => (
                    <Option key={dr.value} value={dr.value}>
                      {dr.label}
                    </Option>
                  ))}
                </Select>
              </>
            )}

            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={handleSaveState} disabled={tempState === 'dismissed' && !dismissReason}>
                Save
              </Button>
            </div>
          </>
        ) : (
          <p>No data</p>
        )}
        <AdditionalFinding finding={selectedFinding} />
      </Drawer>
    </>
  );
}
