import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Switch,
  Button,
  Drawer,
  Form,
  Select,
  message,
} from 'antd';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
} from 'react-flow-renderer';
import SideBar from '../components/SideBar';
import { LogoutOutlined, NodeIndexOutlined, FilterOutlined, SettingOutlined } from '@ant-design/icons';
import { UserContext } from '../UserContext';

const { Header, Content } = Layout;

/* ====== Example node styles ====== */
const baseNodeStyle = {
  borderRadius: 8,
  boxShadow: '2px 2px 8px rgba(0,0,0,0.15)',
  padding: 10,
};

const triggerNodeStyle = {
  ...baseNodeStyle,
  background: '#E3F2FD',
  border: '1px solid #90CAF9',
  color: '#0D47A1',
};
const filterNodeStyle = {
  ...baseNodeStyle,
  background: '#E8F5E9',
  border: '1px solid #A5D6A7',
  color: '#1B5E20',
};
const actionNodeStyle = {
  ...baseNodeStyle,
  background: '#FFF3E0',
  border: '1px solid #FFCC80',
  color: '#E65100',
};

/* ====== Constants ====== */
const TRIGGER_OPTIONS = ['SCAN_EVENT'];
const FILTER_STATUS_OPTIONS = ['OPEN', 'SUPPRESSED', 'FALSE_POSITIVE'];
const FILTER_SEVERITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM'];
const ACTION_OPTIONS = ['Update Finding Status', 'Create Ticket'];

const ACTION_MAP = {
  'Update Finding Status': 'UPDATE_STATUS',
  'Create Ticket': 'CREATE_TICKET',
};

/* ====== Initial placeholders ====== */
const initialNodes = [
  {
    id: 'triggerNode',
    type: 'default',
    position: { x: 200, y: 60 },
    data: {
      label: 'Configure Trigger',
      nodeType: 'triggerPlaceholder',
    },
    style: { ...triggerNodeStyle, opacity: 0.7 },
  },
  {
    id: 'filterNode',
    type: 'default',
    position: { x: 200, y: 240 },
    data: {
      label: 'Configure Filter',
      nodeType: 'filterPlaceholder',
    },
    style: { ...filterNodeStyle, opacity: 0.7 },
  },
  {
    id: 'actionNode',
    type: 'default',
    position: { x: 200, y: 420 },
    data: {
      label: 'Add Action(s)',
      nodeType: 'actionPlaceholder',
      actions: [],
    },
    style: { ...actionNodeStyle, opacity: 0.7 },
  },
];

const initialEdges = [
  {
    id: 'edge-trigger-filter',
    source: 'triggerNode',
    target: 'filterNode',
    animated: true,
    style: { stroke: '#607D8B', strokeWidth: 2 },
  },
  {
    id: 'edge-filter-action',
    source: 'filterNode',
    target: 'actionNode',
    animated: true,
    style: { stroke: '#607D8B', strokeWidth: 2 },
  },
];

export default function RunbookDetailPage() {
  const { logout } = useContext(UserContext);
  const { runbookId } = useParams();
  const navigate = useNavigate();

  const [runbook, setRunbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ruleId, setRuleId] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState({ status: null, severity: null });
  const [actionList, setActionList] = useState([]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState(null); // 'TRIGGER' | 'FILTER' | 'ACTION'

  useEffect(() => {
    if (!runbookId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const rbResp = await fetch(`http://localhost:8083/runbook/${runbookId}`, { credentials: 'include' });
        if (!rbResp.ok) throw new Error('Failed to load runbook');
        const rbJson = await rbResp.json();
        setRunbook(rbJson);

        const rulesResp = await fetch(`http://localhost:8083/runbook/${runbookId}/rules`, { credentials: 'include' });
        if (!rulesResp.ok) throw new Error('Failed to load runbook rules');
        const rules = await rulesResp.json();

        buildFlowFromRules(rules);
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [runbookId]);

  const buildFlowFromRules = (rules) => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setRuleId(null);
    setSelectedTrigger(null);
    setSelectedFilter({ status: null, severity: null });
    setActionList([]);

    if (!rules || rules.length === 0) {
      return;
    }

    const rule = rules[0];
    setRuleId(rule.ruleId);

    if (rule.triggerType) {
      setSelectedTrigger(rule.triggerType);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'triggerNode'
            ? {
                ...n,
                data: {
                  label: (
                    <>
                      <NodeIndexOutlined style={{ marginRight: 4 }} />
                      Trigger: {rule.triggerType}
                    </>
                  ),
                  nodeType: 'triggerNode',
                },
                style: { ...triggerNodeStyle },
              }
            : n
        )
      );
    }

    if (rule.filterType && rule.filterParams) {
      try {
        const parsed = JSON.parse(rule.filterParams);
        const st = parsed.status;
        const sev = parsed.severity;
        if (st && sev) {
          setSelectedFilter({ status: st, severity: sev });
          setNodes((prev) =>
            prev.map((n) =>
              n.id === 'filterNode'
                ? {
                    ...n,
                    data: {
                      label: (
                        <>
                          <FilterOutlined style={{ marginRight: 4 }} />
                          Filter: {st} / {sev}
                        </>
                      ),
                      nodeType: 'filterNode',
                    },
                    style: { ...filterNodeStyle },
                  }
                : n
            )
          );
        }
      } catch {}
    }

    if (rule.actionType) {
      try {
        const actionKeys = JSON.parse(rule.actionType);
        const userActions = [];
        actionKeys.forEach((k) => {
          const label = Object.keys(ACTION_MAP).find((lab) => ACTION_MAP[lab] === k);
          if (label) userActions.push(label);
        });
        if (userActions.length > 0) {
          setActionList(userActions);
          setNodes((prev) =>
            prev.map((n) =>
              n.id === 'actionNode'
                ? {
                    ...n,
                    data: {
                      label: (
                        <>
                          <SettingOutlined style={{ marginRight: 4 }} />
                          Action Node ({userActions.length} actions)
                        </>
                      ),
                      nodeType: 'actionNode',
                      actions: userActions,
                    },
                    style: { ...actionNodeStyle },
                  }
                : n
            )
          );
        }
      } catch {}
    }
  };

  const handleToggleRunbookEnable = async (checked) => {
    try {
      const resp = await fetch(`http://localhost:8083/runbook/${runbookId}/enable?value=${checked}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!resp.ok) throw new Error(`Failed to toggle runbook (HTTP ${resp.status})`);
      const updated = await resp.json();
      setRunbook(updated);
      message.success(`Runbook "${updated.runbookName}" is now ${updated.enabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      message.error(err.message);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_, node) => {
    const { nodeType } = node.data;
    if (nodeType === 'triggerPlaceholder' || nodeType === 'triggerNode') {
      setDrawerMode('TRIGGER');
      setDrawerVisible(true);
    } else if (nodeType === 'filterPlaceholder' || nodeType === 'filterNode') {
      setDrawerMode('FILTER');
      setDrawerVisible(true);
    } else if (nodeType === 'actionPlaceholder' || nodeType === 'actionNode') {
      setDrawerMode('ACTION');
      setDrawerVisible(true);
    }
  };
  const handleDeleteAction = async () => {
    if (!ruleId) {
      message.error('No rule available to delete action from!');
      return;
    }
    try {
      const updateBody = {
        actionType: '[]',
        actionParams: '{}',
      };
      const resp = await fetch(`http://localhost:8083/runbook/rules/${ruleId}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateBody),
      });
      if (!resp.ok) {
        throw new Error(`Failed to delete action from ruleId=${ruleId}`);
      }
      setActionList([]);
      // Reset action node to placeholder style
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'actionNode'
            ? {
                ...n,
                data: {
                  label: 'Add Action(s)',
                  nodeType: 'actionPlaceholder',
                  actions: [],
                },
                style: { ...actionNodeStyle, opacity: 0.7 },
              }
            : n
        )
      );
      message.success('Actions deleted!');
    } catch (err) {
      message.error(err.message);
    }
  };
  // Updating TRIGGER, FILTER, ACTION without duplicating nodes
  const handleTriggerSelected = async (triggerValue) => {
    try {
      setSelectedTrigger(triggerValue);
      if (!ruleId) {
        const createBody = { triggerType: triggerValue };
        const resp = await fetch(`http://localhost:8083/runbook/${runbookId}/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(createBody),
        });
        if (!resp.ok) throw new Error(`Failed to create rule with trigger = ${triggerValue}`);
        const newRule = await resp.json();
        setRuleId(newRule.ruleId);
      } else {
        const updateBody = { triggerType: triggerValue };
        const resp = await fetch(`http://localhost:8083/runbook/rules/${ruleId}/trigger`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateBody),
        });
        if (!resp.ok) throw new Error(`Failed to update trigger = ${triggerValue}`);
      }
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'triggerNode'
            ? {
                ...n,
                data: {
                  label: (
                    <>
                      <NodeIndexOutlined style={{ marginRight: 4 }} />
                      Trigger: {triggerValue}
                    </>
                  ),
                  nodeType: 'triggerNode',
                },
                style: { ...triggerNodeStyle },
              }
            : n
        )
      );
      message.success(`Trigger "${triggerValue}" saved!`);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleFilterSelected = async (status, severity) => {
    try {
      setSelectedFilter({ status, severity });
      if (!ruleId) {
        const body = {
          filterType: JSON.stringify(['STATUS', 'SEVERITY']),
          filterParams: JSON.stringify({ status, severity }),
        };
        const resp = await fetch(`http://localhost:8083/runbook/${runbookId}/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`Failed to create rule with filter`);
        const newRule = await resp.json();
        setRuleId(newRule.ruleId);
      } else {
        const updateBody = {
          filterType: JSON.stringify(['STATUS', 'SEVERITY']),
          filterParams: JSON.stringify({ status, severity }),
        };
        const resp = await fetch(`http://localhost:8083/runbook/rules/${ruleId}/filter`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateBody),
        });
        if (!resp.ok) throw new Error(`Failed to update filter => ${status}, ${severity}`);
      }
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'filterNode'
            ? {
                ...n,
                data: {
                  label: (
                    <>
                      <FilterOutlined style={{ marginRight: 4 }} />
                      Filter: {status} / {severity}
                    </>
                  ),
                  nodeType: 'filterNode',
                },
                style: { ...filterNodeStyle },
              }
            : n
        )
      );
      message.success(`Filter (status=${status}, severity=${severity}) saved!`);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleActionSelected = async (actionLabel, additionalParams = {}) => {
    try {
      if (!ruleId) {
        message.error('Configure trigger & filter first!');
        return;
      }
      const actionKey = ACTION_MAP[actionLabel];
      if (!actionKey) return;

      let newActionList = [...actionList];
      if (!newActionList.includes(actionLabel)) {
        newActionList.push(actionLabel);
      }

      const actionTypeArr = newActionList.map((lab) => ACTION_MAP[lab]);
      const actionParamsObj = {};
      actionTypeArr.forEach((k) => {
        actionParamsObj[k.toLowerCase()] = {};
      });
      if (actionKey === 'UPDATE_STATUS') {
        actionParamsObj['update_status'] = {
          from: additionalParams.updateFrom,
          to: additionalParams.updateTo,
        //   tooltype: additionalParams.tooltype,
        };
      }

      const updateBody = {
        actionType: JSON.stringify(actionTypeArr),
        actionParams: JSON.stringify(actionParamsObj),
      };
      const resp = await fetch(`http://localhost:8083/runbook/rules/${ruleId}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateBody),
      });
      if (!resp.ok) throw new Error(`Failed to update action = ${actionKey}`);

      setActionList(newActionList);

      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'actionNode'
            ? {
                ...n,
                data: {
                  label: (
                    <>
                      <SettingOutlined style={{ marginRight: 4 }} />
                      Action Node ({newActionList.length} actions)
                    </>
                  ),
                  nodeType: 'actionNode',
                  actions: newActionList,
                },
                style: { ...actionNodeStyle },
              }
            : n
        )
      );

      message.success(`Action "${actionLabel}" saved!`);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDrawerSubmit = (values) => {
    if (drawerMode === 'TRIGGER') {
      handleTriggerSelected(values.triggerType);
    } else if (drawerMode === 'FILTER') {
      handleFilterSelected(values.statusFilter, values.severityFilter);
    } else if (drawerMode === 'ACTION') {
      handleActionSelected(values.actionSelected, {
        updateFrom: values.updateFrom,
        updateTo: values.updateTo,
        // tooltype: values.tooltype,
      });
    }
    closeDrawer();
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setDrawerMode(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!runbook) return <div>Runbook not found</div>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideBar />
      <Layout>
        <Header
          style={{
            background: '#fafafa',
            padding: '20px 60px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>Runbook Detail - {runbook.runbookName}</h2>
          <Button type="default" icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button onClick={() => navigate(-1)}>Back</Button>
            <Switch checked={runbook.enabled} onChange={handleToggleRunbookEnable} />
            <span>{runbook.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>

          {/* React Flow container with white background, rounded corners, and shadow */}
          <div style={{ width: '100%', height: 500, border: '1px solid #ddd', borderRadius: 6, boxShadow: '0px 2px 12px rgba(0,0,0,0.1)' }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
                style={{ background: '#fff' }}
              >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#ccc" />
                <Controls />
              </ReactFlow>
            </ReactFlowProvider>
          </div>

          <ConfigDrawer
            visible={drawerVisible}
            mode={drawerMode}
            onClose={closeDrawer}
            onSave={handleDrawerSubmit}
            disabledActions={actionList}
            onDeleteAction={handleDeleteAction} 
          />
        </Content>
      </Layout>
    </Layout>
  );
}

function ConfigDrawer({ visible, mode, onClose, onSave, disabledActions = [], onDeleteAction }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleFinish = (values) => {
    onSave(values);
  };

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width={400}
      title={<span style={{ fontWeight: 600, color: '#333' }}>Configure {mode}</span>}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {mode === 'TRIGGER' && (
          <Form.Item name="triggerType" label="Select Trigger" rules={[{ required: true }]}>
            <Select placeholder="Choose a trigger">
              {TRIGGER_OPTIONS.map((t) => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {mode === 'FILTER' && (
          <>
            <Form.Item name="statusFilter" label="Status Filter" rules={[{ required: true }]}>
              <Select placeholder="Choose status">
                {FILTER_STATUS_OPTIONS.map((s) => (
                  <Select.Option key={s} value={s}>
                    {s}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="severityFilter" label="Severity Filter" rules={[{ required: true }]}>
              <Select placeholder="Choose severity">
                {FILTER_SEVERITY_OPTIONS.map((sev) => (
                  <Select.Option key={sev} value={sev}>
                    {sev}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        {mode === 'ACTION' && (
          <>
            <Form.Item name="actionSelected" label="Select Action" rules={[{ required: true }]}>
              <Select placeholder="Choose an action">
                {ACTION_OPTIONS.map((a) => (
                  <Select.Option key={a} value={a} disabled={disabledActions.includes(a)}>
                    {a}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue('actionSelected') === 'Update Finding Status' ? (
                  <>
                    <Form.Item name="updateFrom" label="From Status" rules={[{ required: true }]}>
                      <Select placeholder="Select from status">
                        {['OPEN', 'SUPPRESSED', 'CLOSED'].map((status) => (
                          <Select.Option key={status} value={status}>
                            {status}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item name="updateTo" label="To Status" rules={[{ required: true }]}>
                      <Select placeholder="Select to status">
                        {['OPEN', 'SUPPRESSED', 'CLOSED'].map((status) => (
                          <Select.Option key={status} value={status}>
                            {status}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button danger onClick={onDeleteAction}>
                Delete Action
              </Button>
            </div>
          </>
        )}
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
