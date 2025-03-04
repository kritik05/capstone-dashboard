import React,{useEffect} from 'react';
import { useState, useContext } from 'react';
import { Table, Tag, Tooltip,Drawer,Button,message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AdditionalFinding from './AdditionalFinding';
import StatusPopover from './StatusPopover';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';

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
  updateAlertState,
  canUpdateState,
  findingId,           
  setFindingId
}) {

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);

  const { selectedTenantId } = useContext(UserContext);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (!findingId) {

      setDrawerVisible(false);
      setSelectedFinding(null);
      return;
    }

    const found = findings.find((f) => f.id === findingId);
    if (found) {
      setSelectedFinding(found);
      setDrawerVisible(true);
    } else {
      // If the ID is not in the current page of data,
      // you might want to fetch more pages or show a message
      // For simplicity, do nothing or close
    }
  }, [findingId, findings]);

  const handleOpenDrawer = (record) => {
    setSelectedFinding(record);
    setDrawerVisible(true);
    setFindingId(record.id); // parent updates URL param
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedFinding(null);
    setFindingId(null); // remove param from URL
  };


  const createTicket = async (finding, summary, description) => {
    try {
      const uuid = finding.id; // the param to /tickets/{uuid}
      const url = `http://localhost:8083/tickets/${uuid}?tenantId=${selectedTenantId}`;
      // Build the request body
      const body = {
        summary,      // or prompt user for custom text
        description
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ticket. Server responded with ${response.status}`);
      }

      const textResponse = await response.text(); 
      // textResponse might be "Created Jira ticket: CAP-123"
      // For a real app, your server might return just "CAP-123" or JSON. Adjust accordingly.

      // Let's parse out the ticket ID if possible:
      // Example server response: "Created Jira ticket: CAP-123"
      let ticketId = '';
      if (textResponse.startsWith('Created Jira ticket:')) {
        ticketId = textResponse.replace('Created Jira ticket: ', '').trim();
      } else if (textResponse.startsWith('Ticket already exists:')) {
        // If the server says "Ticket already exists: XYZ"
        ticketId = textResponse.replace('Ticket already exists: ', '').trim();
      } else {
        // fallback
        ticketId = textResponse;
      }

      // Update the local finding to reflect the new ticketId
      const updatedFinding = { ...finding, ticketId: ticketId };
      setSelectedFinding(updatedFinding);

      // Also update the main list if needed:
      // Example: if your "findings" is managed in a parent, you might call a prop to refresh
      // or if it's local state, do something like:
      // setFindings(prev => prev.map(f => f.id === finding.id ? updatedFinding : f));

      message.success(`Ticket created or found: ${ticketId}`);
    } catch (error) {
      console.error(error);
      message.error(error.message);
    }
  };

  const viewTicket = (finding) => {
    if (!finding.ticketId) {
      message.error('No ticket ID found!');
      return;
    }
    // If using React Router v6:
    // navigate(`/ticket?tenantId=${selectedTenantId}&ticketId=${finding.ticketId}`);
    // For demonstration, let’s do a window.location (not recommended in a SPA, but simple):
    navigate(`/ticket?tenantId=${selectedTenantId}&ticketId=${finding.ticketId}`);
    window.location.href = `/tickets?tenantId=${selectedTenantId}&ticketId=${finding.ticketId}`;
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
      <StatusPopover record={record} updateAlertState={updateAlertState} canUpdateState={canUpdateState} />
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
    <div style={{ margin: '0 auto', width: '98%' }}>
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
        <AdditionalFinding 
        finding={selectedFinding} 
        onCreateTicket={createTicket}
        onViewTicket={viewTicket}/>
      </Drawer>
    </>
  );
}
