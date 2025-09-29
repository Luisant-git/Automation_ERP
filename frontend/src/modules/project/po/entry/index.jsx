import React, { useState } from 'react'
import { Card, Button, Space, Typography, Divider } from 'antd'
import { FileTextOutlined, UnorderedListOutlined, PlusOutlined } from '@ant-design/icons'
import PurchaseOrderForm from '../PurchaseOrderForm'
import OrderList from '../OrderList'

const { Title } = Typography

export default function PurchaseOrderEntry() {
  const [view, setView] = useState('form')
  const [refreshList, setRefreshList] = useState(0)

  const handleOrderSaved = () => {
    setRefreshList(prev => prev + 1)
    setView('list')
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0,}}>Purchase Order Management</Title>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>Create and manage purchase orders for suppliers</p>
          </div>
          <Space>
            <Button 
              type={view === 'form' ? 'primary' : 'default'} 
              icon={<PlusOutlined />}
              onClick={() => setView('form')}
            >
              Create Order
            </Button>
            <Button 
              type={view === 'list' ? 'primary' : 'default'} 
              icon={<UnorderedListOutlined />}
              onClick={() => setView('list')}
            >
              View Orders
            </Button>
          </Space>
        </div>
        <Divider style={{ margin: '0 0 24px 0' }} />
      </Card>
      
      {view === 'form' ? <PurchaseOrderForm onOrderSaved={handleOrderSaved} /> : <OrderList key={refreshList} />}
    </div>
  )
}
