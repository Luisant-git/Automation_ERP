import React, { useState } from 'react'
import { Card, Tabs } from 'antd'
import PurchaseOrderList from './purchase-orders'

export default function Procurement() {
  const [activeTab, setActiveTab] = useState('purchase-orders')

  const items = [
    {
      key: 'purchase-orders',
      label: 'Purchase Orders',
      children: <PurchaseOrderList />
    }
  ]

  return (
    <Card title="Procurement Management">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Card>
  )
}