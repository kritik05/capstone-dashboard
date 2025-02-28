import React, { useState,useContext } from 'react';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, FileSearchOutlined } from '@ant-design/icons';
import armorcodeLogo from '../assets/armorcode_logo_mini1.png';
import { useNavigate,useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';

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
      width={200}
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
    
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKey()}
        style={{ border: 'none',backgroundColor:'#001a33'}}
        items={menuItems}
        onClick={menueItemClick}
      />

    {!collapsed && user && user.authenticated && (
        <div
          style={{
            paddingLeft: 30,
            paddingTop: 740,
            color: '#fff',
            fontWeight: '500',
          }}
        >
          Welcome, {user.name }
        </div>
      )}
    </Sider>
  );
}
