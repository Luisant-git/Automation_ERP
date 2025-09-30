import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Badge, Breadcrumb, theme, Button, Input } from 'antd'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo (1).jpg'
import {
  DashboardOutlined, AppstoreOutlined, TeamOutlined, ShoppingCartOutlined, BuildOutlined,
  DatabaseOutlined, SwapOutlined, BellOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SearchOutlined, QuestionCircleOutlined, SettingOutlined, PlusOutlined, FilterOutlined,
  ContactsOutlined, ProjectOutlined, ToolOutlined, InboxOutlined, BarChartOutlined
} from '@ant-design/icons'
import styles from './AppLayout.module.scss'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key:'/', icon:<DashboardOutlined/>, label:<NavLink to="/">Dashboard</NavLink> },
  {
    key: '/masters',
    icon: <DatabaseOutlined/>,
    label: 'Master Data',
    children: [
      { key:'/masters/customers', label:<NavLink to="/masters/customers">Customers</NavLink> },
      { key:'/masters/suppliers', label:<NavLink to="/masters/suppliers">Suppliers</NavLink> },
      { key:'/masters/materials', label:<NavLink to="/masters/materials">Materials</NavLink> },
      { key:'/masters/services', label:<NavLink to="/masters/services">Services</NavLink> },
      { key:'/masters/employees', label:<NavLink to="/masters/employees">Employees</NavLink> },
      { key:'/masters/categories', label:<NavLink to="/masters/categories">Categories</NavLink> },
      { key:'/masters/brands', label:<NavLink to="/masters/brands">Brands</NavLink> },
      { key:'/masters/taxes', label:<NavLink to="/masters/taxes">Tax Rates</NavLink> },
      { key:'/masters/opening-stock', label:<NavLink to="/masters/opening-stock">Opening Stock Entry</NavLink> },
      { key:'/masters/ledgers', label:<NavLink to="/masters/ledgers">Ledgers</NavLink> },
    ]
  },
  {
    key: '/projects',
    icon: <AppstoreOutlined/>,
    label: 'Project Management',
    children: [
      { key:'/projects/create', label:<NavLink to="/projects/create">Create Project</NavLink> },
      { key:'/projects/list', label:<NavLink to="/projects/list">Project List</NavLink> },
      { key:'/projects/planning', label:<NavLink to="/projects/planning">Project Planning</NavLink> },
      { key:'/projects/tracking', label:<NavLink to="/projects/tracking">Progress Tracking</NavLink> },
    ]
  },
  {
    key: '/operations',
    icon: <ToolOutlined/>,
    label: 'Operations',
    children: [
      { type:'group', label:'Work Orders' },
      { key:'/operations/work-orders', label:<NavLink to="/operations/work-orders">Work Orders</NavLink> },
      { key:'/operations/scheduling', label:<NavLink to="/operations/scheduling">Scheduling</NavLink> },
      { type:'group', label:'Service Management' },
      { key:'/operations/service-assign', label:<NavLink to="/operations/service-assign">Service Assignment</NavLink> },
      { key:'/operations/service-status', label:<NavLink to="/operations/service-status">Service Status</NavLink> },
    ]
  },
  {
    key: '/procurement',
    icon: <ShoppingCartOutlined/>,
    label: 'Procurement',
    children: [
      { key:'/procurement/purchase-orders', label:<NavLink to="/procurement/purchase-orders">Purchase Orders</NavLink> },
      // { key:'/procurement/vendor-management', label:<NavLink to="/procurement/vendor-management">Vendor Management</NavLink> },
      // { key:'/procurement/approvals', label:<NavLink to="/procurement/approvals">Approvals</NavLink> },
    ]
  },
  {
    key:'/inventory',
    icon:<InboxOutlined/>,
    label:'Inventory',
    children:[
      { key:'/inventory/stock', label:<NavLink to="/inventory/stock">Stock Management</NavLink> },
      { key:'/inventory/movements', label:<NavLink to="/inventory/movements">Stock Movements</NavLink> },
      { key:'/inventory/relocation', label:<NavLink to="/inventory/relocation">Relocation</NavLink> },
    ]
  },
  {
    key:'/sales',
    icon:<SwapOutlined/>,
    label:'Sales & Trading',
    children:[
      { key:'/sales/orders', label:<NavLink to="/sales/orders">Sales Orders</NavLink> },
      // { key:'/sales/invoicing', label:<NavLink to="/sales/invoicing">Invoicing</NavLink> },
      { key:'/sales/returns', label:<NavLink to="/sales/returns">Returns</NavLink> },
    ]
  },
  {
    key:'/reports',
    icon:<BarChartOutlined/>,
    label:'Reports & Analytics',
    children:[
      { key:'/reports/financial', label:<NavLink to="/reports/financial">Financial Reports</NavLink> },
      { key:'/reports/operational', label:<NavLink to="/reports/operational">Operational Reports</NavLink> },
      { key:'/reports/inventory', label:<NavLink to="/reports/inventory">Inventory Reports</NavLink> },
    ]
  },
  {
    key:'/settings',
    icon:<SettingOutlined/>,
    label:'System Settings',
    children:[
      { key:'/settings/users', label:<NavLink to="/settings/users">User Management</NavLink> },
      { key:'/settings/permissions', label:<NavLink to="/settings/permissions">Permissions</NavLink> },
      { key:'/settings/configuration', label:<NavLink to="/settings/configuration">Configuration</NavLink> },
    ]
  }
]

function buildOpenKeys(pathname){
  // open root groups for current path
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return ['/']
  return ['/' + parts[0]]
}

export default function AppLayout({ onLogout }){
  const [collapsed, setCollapsed] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const { token } = theme.useToken()
  const location = useLocation()
  const openKeys = buildOpenKeys(location.pathname)

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      onLogout && onLogout()
    }
  }

  const profileMenu = {
    items:[
      { key:'profile', label:'My Profile' },
      { key:'settings', label:'Settings' },
      { type:'divider' },
      { key:'logout', danger:true, label:'Sign out' }
    ],
    onClick: handleMenuClick
  }

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <img src={logo} alt="Logo" style={{ width: '50px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
            <span>Smart Edge Automation</span>
          </div>
          <div className={styles.separator}></div>
          
          {/* <div className={styles.appTitle}>Intelligent Order Management</div> */}
        </div>
        {searchVisible && (
          <div className={styles.headerCenter}>
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              className={styles.searchInput}
              autoFocus
            />
          </div>
        )}
        <div className={styles.headerRight}>
          <SearchOutlined 
            className={styles.headerIcon} 
            onClick={() => setSearchVisible(!searchVisible)}
          />
          <BellOutlined className={styles.headerIcon} />
          {/* <QuestionCircleOutlined className={styles.headerIcon} />
          <PlusOutlined className={styles.headerIcon} />
          <FilterOutlined className={styles.headerIcon} /> */}
          <SettingOutlined className={styles.headerIcon} />
          <QuestionCircleOutlined className={styles.headerIcon} />
          <Dropdown menu={profileMenu} placement="bottomRight">
            <Avatar size="small" style={{ background:'#0078d4', cursor: 'pointer' }}>JC</Avatar>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} theme="light" className={styles.sider} collapsed={collapsed}>
          <div className={styles.siderHeader}>
            <Button 
              type="text" 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              className={styles.siderMenuButton} 
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <Menu
            mode="inline"
            items={menuItems}
            defaultOpenKeys={openKeys}
            selectedKeys={[location.pathname]}
            className={styles.menu}
          />
        </Sider>
        <Content className={styles.content}>
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
  )
}
