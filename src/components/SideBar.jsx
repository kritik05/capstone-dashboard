import React, { useState,useContext } from 'react';
import armorcodeLogo from '../assets/armorcode_logo_mini1.png';
import { useNavigate,useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { icons } from 'antd/es/image/PreviewGroup';
import { DashboardOutlined, FileSearchOutlined, MenuUnfoldOutlined, CodeOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';
import { Layout, Menu, Tag, Avatar } from 'antd';

const { Sider } = Layout;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const getSelectedKey = () => {
    if (location.pathname.startsWith('/dashboard')) {
      return ['1'];
    }
    if (location.pathname.startsWith('/finding')) {
      return ['2'];
    }
    return []; 
  };

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const menueItemClick = (e) => {
    if (e.key === '1') {
      navigate('/dashboard');
    } else if (e.key === '2') {
      navigate('/finding');
    }
    else if(e.key==='3'){
      navigate('/tickets')
    }
    else if(e.key==='4'){
      navigate('/runbook');
    }
  };

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <FileSearchOutlined />,
      label: 'Findings',
    },
    {
      key: '3',
      icon :<MenuUnfoldOutlined />,
      label: 'Tickets'
    },
    {
      key:'4',
      icon:<CodeOutlined />,
      label:'Runbook'
    }
    
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        backgroundColor: '#001a33',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
      collapsedWidth={80}
      width={180}
    >
      <div
        onClick={toggleSidebar}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          cursor: 'pointer',
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: collapsed ? 0 : 16,
          paddingRight: collapsed ? 0 : 16,
          transition: 'all 0.3s',
        }}
      >
        <img
          src={armorcodeLogo}
          alt="Armorcode"
          style={{
            height: 50,
            objectFit: 'contain',
          }}
        />
        {!collapsed && (
          <span
            style={{
              color: '#fff',
              fontWeight: '600',
              marginLeft: 8,
              fontSize: 18,
            }}
          >
            Armorcode
          </span>
        )}
      </div>
    
<div style={{ position: 'relative', height: 'calc(100% - 90px)' }}>
  <Menu
    theme="dark"
    mode="inline"
    selectedKeys={getSelectedKey()}
    style={{ border: 'none', backgroundColor: '#001a33' }}
    items={menuItems}
    onClick={menueItemClick}
  />
  
  {!collapsed && user && user.authenticated && (
  <div
    style={{
      position: 'absolute',
      bottom: 16,
      left: 0,
      width: '100%',
      padding: '8px 8px',
      borderTop: '1px solid rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#001a33',
    }}
  >
    <Avatar size="large" icon={<UserOutlined />} style={{ marginRight: 8 }} />
    <div style={{ color: '#fff', flex: 1 }}>
      <div style={{ fontWeight: 500, fontSize: 14 }}>{user.name}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 12, 
          opacity: 0.8,
          marginTop: 2, 
        }}
      >
        <IdcardOutlined style={{ marginRight: 4, fontSize: 10, color: '#aaa' }} />
        <span>{user.roleForTenant}</span>
      </div>
    </div>
  </div>
)}
</div>
    </Sider>
  );
}
