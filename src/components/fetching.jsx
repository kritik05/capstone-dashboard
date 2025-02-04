import React, { useState } from 'react';
import { Select, Button } from 'antd';
import { FileSearchOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
function Fetching({ onScan, onDeleteAll, loading }) {
  const [selectedTool, setSelectedTool] = useState('ALL');

  const handleToolChange = (value) => {
    setSelectedTool(value);
  };

  const handleFindAllClick = () => {
    onScan(selectedTool);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Select
        value={selectedTool}
        onChange={handleToolChange}
        style={{ width: 160 }}
      >
        <Option value="ALL">ALL</Option>
        <Option value="CODE_SCAN">CODESCAN</Option>
        <Option value="DEPENDABOT">DEPENDABOT</Option>
        <Option value="SECRET_SCAN">SECRETSCAN</Option>
      </Select>

      <Button
               type="default"
               icon={<FileSearchOutlined />}
               style={{ marginRight: '8px' }}
               onClick={handleFindAllClick}
               loading={loading}
                >
                  Find All
      </Button>
      <Button
        type="primary"
        danger
        icon={<DeleteOutlined />}
        onClick={onDeleteAll}
        disabled={loading}
      >
        Delete All
      </Button>
    </div>
  );
}

export default Fetching;
