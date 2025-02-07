import React from 'react';
import { useState } from 'react';
import { Table, Tag, Tooltip,Drawer,Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AdditionalFinding from './AdditionalFinding';
import StatusPopover from './StatusPopover';

const severityColorMap = {
  CRITICAL: 'red',
  HIGH: 'volcano',
  MEDIUM: 'orange',
  LOW: 'green',
  INFO: 'blue',
};


const toolTypeColorMap = {
  CODESCAN: 'blue',
  DEPENDABOT: 'geekblue',
  SECRETSCAN: 'purple'
};

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

  const handleOpenDrawer = (record) => {
    setSelectedFinding(record);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedFinding(null);
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
      render: (status, record) => (
        <StatusPopover record={record} updateAlertState={updateAlertState} />
      ),
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
      title: 'UpdatedAt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '15%',
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'ascend',
      render: (updatedAtValue) => (
        <Tooltip title={updatedAtValue}>
          <span style={{ cursor: 'default' }}>{updatedAtValue}</span>
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
        showTotal: (totalItems, range) => {
          return `Showing ${range[0]} to ${range[1]} of ${totalItems}`;
        },
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
        <AdditionalFinding finding={selectedFinding} />
      </Drawer>
    </>
  );
}
