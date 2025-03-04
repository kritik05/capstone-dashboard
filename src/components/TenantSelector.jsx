import React, { useContext } from 'react';
import { Select, Typography, Space} from 'antd';
import { UserContext } from '../UserContext'; 

const { Option } = Select;
const { Text } = Typography;

export default function TenantDropdown() {
  const {
    user,
    selectedTenantId,
    setSelectedTenantId
  } = useContext(UserContext);

  if (!user || !user.authenticated) {
    return null;
  }

  const { userTenantList } = user;  

const handleChange = (value) => {
    const newTenantId = parseInt(value, 10);
    setSelectedTenantId(newTenantId);
  };

  return (
    <Space align="center">
      <Text strong>Tenant:</Text>
      <Select
        style={{ width: 180 }}
        value={selectedTenantId?.toString() ?? ''}
        onChange={handleChange}
      >
        {userTenantList.map((ut) => (
          <Option key={ut.tenantId} value={ut.tenantId.toString()}>
            {ut.tenantName ?? `Tenant #${ut.tenantId}`}
          </Option>
        ))}
      </Select>
   
    </Space>
  );
}
