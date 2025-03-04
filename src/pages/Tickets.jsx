import React, { useState, useEffect, useContext } from 'react';
import { Table, message,Layout,Tag,Button } from 'antd';
const { Header, Content } = Layout;
import { useSearchParams } from 'react-router-dom';
import { UserContext } from '../UserContext';
import SideBar from '../components/SideBar';
import TenantSelector from '../components/TenantSelector';
import { LogoutOutlined, EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';

const statusColorMap = {
    'To Do': 'blue',
    'In Progress': 'orange',
    'Done': 'green',
  };

export default function Tickets() {
  const { selectedTenantId,logout } = useContext(UserContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const ticketIdParam = searchParams.get('ticketId'); 

  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchTickets(currentPage);
  }, [ticketIdParam, selectedTenantId, currentPage]);

  // useEffect(() => {
    const fetchTickets = async (page) => {
      setLoading(true);
      try {
        if (ticketIdParam) {
          const response = await fetch(
            `http://localhost:8083/tickets/${ticketIdParam}?tenantId=${selectedTenantId}`,
            { credentials: 'include' }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch single ticket');
          }
          const singleTicket = await response.json();
          setTickets([singleTicket]);
          setTotalElements(1); 
        } else {
          const response = await fetch(
            `http://localhost:8083/tickets?tenantId=${selectedTenantId}&page=${page}&size=${pageSize}`,
            { credentials: 'include' }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch tickets for tenant');
          }
          const data = await response.json();
          setTickets(data.content);
          setTotalElements(data.totalElements);
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    // fetchTickets();
  // }, [ticketIdParam, selectedTenantId]);

  const handleTableChange = (pagination) => {
    // This is triggered when user clicks a new page
    setCurrentPage(pagination.current);
  };
  const handleCloseTicket = async (ticketId) => {
    try {
      const response = await fetch(
        `http://localhost:8083/tickets/${ticketId}/done?tenantId=${selectedTenantId}`,
        { method: 'PUT', credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error(`Failed to close ticket: ${ticketId} (HTTP ${response.status})`);
      }
      message.success(`Ticket ${ticketId} moved to Done!`);
        const allResp = await fetch(
          `http://localhost:8083/tickets?tenantId=${selectedTenantId}`,
          { credentials: 'include' }
        );
        if (allResp.ok) {
          const updatedList = await allResp.json();
          setTickets(updatedList);
        }
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleViewFinding = async (ticketId) => {
    try {
      const response = await fetch(
        `http://localhost:8083/tickets/finding/${ticketId}?tenantId=${selectedTenantId}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error(`Failed to get finding id for ticket: ${ticketId} (HTTP ${response.status})`);
      }
      const res = await response.text();
      console.log(res);
      window.location.href = `/finding?findingId=${res}`; 

    } catch (error) {
      message.error(error.message);
    }
  };


  const columns = [
    {
        title: 'Ticket ID',
        dataIndex: 'ticketId',
        key: 'ticketId',
        width: '10%',
      },
      {
        title: 'Issue Type',
        dataIndex: 'issueTypeName',
        key: 'issueTypeName',
        width: '12%',
        align: 'center',
      },
      {
        title: 'Description',
        dataIndex: 'issueTypeDescription',
        key: 'issueTypeDescription',
        width: '20%',
        ellipsis: true,
      },
      {
        title: 'Summary',
        dataIndex: 'issueSummary',
        key: 'issueSummary',
        width: '20%',
        ellipsis: true,
      },
      {
        title: 'Status',
        dataIndex: 'statusName',
        key: 'statusName',
        width: '15%',
        align: 'center',
        render: (status) => {
          const color = statusColorMap[status] || 'default';
          return <Tag color={color}>{status}</Tag>;
        },
      },
      {
        title: 'Action',
        key: 'action',
        width: '15%',
        align: 'center',
        render: (_, record) => {
          if (record.statusName === 'Done') {
            return <Tag color="green">Closed</Tag>;
          }
          return (
            <div style={{ textAlign: 'center' }}> {/* NEW */}
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"                    // CHANGED: Set button size to small
              onClick={() => handleCloseTicket(record.ticketId)}
              style={{ whiteSpace: 'nowrap' }}  // CHANGED: Prevent text wrapping
            >
              Close Ticket
            </Button>
          </div>
          );
        },
      },
      {
        title: 'Finding',
        key: 'findingAction',
        width: '15%',
        align: 'center',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'center' }}> {/* NEW */}
            <Button
              type="default"
              icon={<EyeOutlined />}
              size="small"  // CHANGED: Set button size to small
              style={{
                borderColor: '#722ed1',  // CHANGED: Purple border color
                 color: '#722ed1',          // CHANGED: Blue text
                whiteSpace: 'nowrap',      // CHANGED: Prevent text wrapping
              }}
              onClick={() => handleViewFinding(record.ticketId)}
            >
              View Finding
            </Button>
          </div>
          );
        },
      }
      
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
    <SideBar />
    <Layout>
      <Header
        style={{
          background: '#fff',
          padding: '30 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2 style={{ margin: 0 }}>Tickets</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> {/* CHANGED: Container for Tenant and Logout */}
    <TenantSelector /> {/* CHANGED: TenantSelector placed in header */}
    <Button  type="default"
            icon={<LogoutOutlined />}
            onClick={logout}>Logout</Button> {/* CHANGED: Logout button added */}
  </div>
        
      </Header>

      <Content style={{ margin: '16px' }}>
      <Table
          dataSource={tickets}
          columns={columns}
          loading={loading}
          rowKey="ticketId"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalElements
            
          }}
          onChange={handleTableChange}
          bordered
          style={{ background: '#fff' }}
          onRow={() => ({
             style: { height: '55px' } 
             })}
        />

      </Content>
    </Layout>
  </Layout>
  );
}
