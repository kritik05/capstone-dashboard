   
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Layout,
  Table,
  Switch,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Modal,
  message,
} from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import SideBar from '../components/SideBar';
import TenantSelector from '../components/TenantSelector';
import { UserContext } from '../UserContext';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

export default function RunbookPage() {
  const { selectedTenantId,logout } = useContext(UserContext);

  const [runbooks, setRunbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRunbookName, setNewRunbookName] = useState('');
  const [newRunbookDesc, setNewRunbookDesc] = useState('');

  // Which runbook is selected for detail view?
  const [selectedRunbook, setSelectedRunbook] = useState(null);

  useEffect(() => {
    const fetchRunbooks = async () => {
      if (!selectedTenantId) {
        return; // or handle no tenant selected
      }
      setLoading(true);
      try {
        const resp = await fetch(
          `http://localhost:8083/runbook?tenantId=${selectedTenantId}`,
          { credentials: 'include' }
        );
        if (!resp.ok) {
          throw new Error(`Failed to fetch runbooks (HTTP ${resp.status})`);
        }
        const data = await resp.json();
        // Map the backend fields to the shape we use in the table:
        const mapped = data.map((rb) => ({
          runbookId: rb.runbookId,
          name: rb.runbookName,
          description: rb.runbookDescription,
          enabled: rb.enabled,
        }));
        setRunbooks(mapped);
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRunbooks();
  }, [selectedTenantId]);

  /* ========== Table Columns ========== */
  const columns = [
    {
      title: 'Runbook Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        // <Button type="link" onClick={() => setSelectedRunbook(record)}>
        //   {text}
        // </Button>
        <Link to={`/runbook/${record.runbookId}`}>
            {text}
         </Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (val, record) => (
        <Switch
          checked={val}
          onChange={(checked) => handleToggleEnable(record, checked)}
        />
      ),
    },
  ];

  // Handlers for “Create Runbook” modal
  const handleOpenCreateModal = () => {
    setNewRunbookName('');
    setNewRunbookDesc('');
    setShowCreateModal(true);
  };

  const handleCreateRunbook = async () => {
    if (!newRunbookName.trim()) {
      return message.error('Please provide a runbook name');
    }
    try {
      const body = {
        tenantId: selectedTenantId,
        runbookName: newRunbookName,
        runbookDescription: newRunbookDesc,
      };
      const resp = await fetch('http://localhost:8083/runbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        throw new Error(`Failed to create runbook (HTTP ${resp.status})`);
      }
      const created = await resp.json();
      const mapped = {
        runbookId: created.runbookId,
        name: created.runbookName,
        description: created.runbookDescription,
        enabled: created.enabled,
      };
      setRunbooks((prev) => [...prev, mapped]);
      setShowCreateModal(false);
      message.success('Runbook created');
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleToggleEnable = async (record, checked) => {
    try {
      const resp = await fetch(
        `http://localhost:8083/runbook/${record.runbookId}/enable?value=${checked}`,
        {
          method: 'PUT',
          credentials: 'include',
        }
      );
      if (!resp.ok) {
        throw new Error(`Failed to toggle enable (HTTP ${resp.status})`);
      }
      const updated = await resp.json();
      const mapped = {
        runbookId: updated.runbookId,
        name: updated.runbookName,
        description: updated.runbookDescription,
        enabled: updated.enabled,
      };
      // Update local state
      setRunbooks((prev) =>
        prev.map((rb) => (rb.runbookId === mapped.runbookId ? mapped : rb))
      );
      message.success(
        `Runbook "${mapped.name}" is now ${
          mapped.enabled ? 'enabled' : 'disabled'
        }.`
      );
    } catch (err) {
      message.error(err.message);
    }
  };

  // Table view
  const renderTableView = () => (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={handleOpenCreateModal}>
          + Add Runbook
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={runbooks}
        rowKey="runbookId"
        loading={loading}
        pagination={false}
      />
      <Modal
        title="Create Runbook"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onOk={handleCreateRunbook}
      >
        <Form layout="vertical">
          <Form.Item label="Runbook Name" required>
            <Input
              placeholder="Enter runbook name"
              value={newRunbookName}
              onChange={(e) => setNewRunbookName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              placeholder="Enter runbook description"
              value={newRunbookDesc}
              onChange={(e) => setNewRunbookDesc(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

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
            <h2 style={{ margin: 0 }}>Runbook</h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> 
                 <TenantSelector /> {/* CHANGED: TenantSelector placed in header */}
                 <Button  type="default"
                    icon={<LogoutOutlined />}
                    onClick={logout}>Logout</Button> {/* CHANGED: Logout button added */}
             </div>
        </Header>

        <Content style={{ margin: '16px' }}>
          {!selectedRunbook && renderTableView()}
          {selectedRunbook && (
            <RunbookDetailFlow
              runbook={selectedRunbook}
              onBack={() => setSelectedRunbook(null)}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
