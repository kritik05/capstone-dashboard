import React from 'react';
import { Row, Col, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const toolTypeOptions = [
  { label: 'CODESCAN', value: 'CODESCAN' },
  { label: 'DEPENDABOT', value: 'DEPENDABOT' },
  { label: 'SECRETSCAN', value: 'SECRETSCAN' },
];

const severityOptions = [
  { label: 'INFO', value: 'INFO' },
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
  { label: 'CRITICAL', value: 'CRITICAL' },
];

const statusOptions = [
  { label: 'OPEN', value: 'OPEN' },
  { label: 'FALSE_POSITIVE', value: 'FALSE_POSITIVE' },
  { label: 'SUPPRESSED', value: 'SUPPRESSED' },
  { label: 'FIXED', value: 'FIXED' },
  { label: 'CONFIRM', value: 'CONFIRM' },
];
export default function FilterBar({
  toolType,
  setToolType,
  status,
  setStatus,
  severity,
  setSeverity,
  onSearch
}) {
  return (
    <div style={{ background: '#fff', padding: '16px', marginBottom: '16px' }}>
      <Row gutter={16}>
        <Col span={6}>
          <label>Tool</label>
           <Select
            mode="multiple"
            placeholder="Select Tool"
            style={{ width: '100%' }}
            options={toolTypeOptions}
            value={toolType}
            onChange={setToolType}
            allowClear
        />
        </Col>

        <Col span={6}>
          <label>Status</label>
           <Select
            mode="multiple"
            placeholder="Select Status"
            style={{ width: '100%' }}
            options={statusOptions}
            value={status}
            onChange={setStatus}
            allowClear
        />
        </Col>

        <Col span={6}>
          <label>Severity</label>
           <Select
            mode="multiple"
            placeholder="Select Severity"
            style={{ width: '100%' }}
            options={severityOptions}
            value={severity}
            onChange={setSeverity}
            allowClear
        />
        </Col>

        <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={onSearch}
          >
            Search
          </Button>
        </Col>
      </Row>
    </div>
  );
}