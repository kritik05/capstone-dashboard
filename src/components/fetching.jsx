import React, { useState,useContext } from 'react';
import { Select, Button } from 'antd';
import { FileSearchOutlined, DeleteOutlined,LogoutOutlined} from '@ant-design/icons';
import { UserContext } from '../UserContext';
const { Option } = Select;
function Fetching({ onScan, onDeleteAll, loading,canScan,canDeleteAll}) {
  const [selectedTool, setSelectedTool] = useState('ALL');
    const { logout } = useContext(UserContext);
  const handleToolChange = (value) => {
    setSelectedTool(value);
  };

  const handleFindAllClick = () => {
    onScan(selectedTool);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {canScan && (
        <>
          <Select
            value={selectedTool}
            onChange={handleToolChange}
            style={{ width: 160 }}
          >
            <Option value="ALL">ALL</Option>
            <Option value="CODESCAN">CODESCAN</Option>
            <Option value="DEPENDABOT">DEPENDABOT</Option>
            <Option value="SECRETSCAN">SECRETSCAN</Option>
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
        </>
      )}
      
      {canDeleteAll && (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={onDeleteAll}
          disabled={loading}
        >
          Delete All
        </Button>
      )}
     
    </div>
  );
}

export default Fetching;
