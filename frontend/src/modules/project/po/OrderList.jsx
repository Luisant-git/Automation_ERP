import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Space, Input, DatePicker, Typography, Modal, message } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import PurchaseOrderForm from './PurchaseOrderForm'

const { RangePicker } = DatePicker
const { Title } = Typography

const OrderList = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    setOrders(savedOrders)
    setFilteredOrders(savedOrders)
  }, [])

  const handleSearch = (value) => {
    const filtered = orders.filter(order => 
      order.poNumber?.toLowerCase().includes(value.toLowerCase()) ||
      order.supplierName?.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredOrders(filtered)
  }

  const handleCreateNew = () => {
    setEditingOrder(null)
    setShowForm(true)
  }

  const handleEdit = (record) => {
    setEditingOrder(record)
    setShowForm(true)
  }

  const handleView = (record) => {
    setEditingOrder(record)
    setShowForm(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Order',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete Purchase Order ${record.poNumber}? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk() {
        const updatedOrders = orders.filter(order => order.id !== record.id)
        setOrders(updatedOrders)
        setFilteredOrders(updatedOrders)
        localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders))
        message.success('Purchase Order deleted successfully')
      }
    })
  }

  const handleOrderSaved = () => {
    const savedOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    setOrders(savedOrders)
    setFilteredOrders(savedOrders)
    setShowForm(false)
    setEditingOrder(null)
  }

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text || 'N/A'}</strong>
    },
    {
      title: 'Supplier Name',
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Total Amount',
      dataIndex: ['totals', 'roundedOffTotal'],
      key: 'total',
      render: (val) => <strong>₹{val?.toFixed(2) || '0.00'}</strong>,
      sorter: (a, b) => (a.totals?.roundedOffTotal || 0) - (b.totals?.roundedOffTotal || 0)
    },
    {
      title: 'Items Count',
      dataIndex: 'items',
      key: 'itemsCount',
      render: (items) => (
        <Tag color="blue">{items?.length || 0} items</Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Active</Tag>
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            type="primary" 
            ghost
            onClick={() => handleView(record)}
          />
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      )
    }
  ]

  if (showForm) {
    return (
      <div>
        <Card style={{ marginBottom: '16px' }}>
          <Button 
            type="default" 
            onClick={() => setShowForm(false)} 
            style={{ marginBottom: '8px' }}
          >
            ← Back to Purchase Order List
          </Button>
        </Card>
        <PurchaseOrderForm 
          onOrderSaved={handleOrderSaved}
          editingOrder={editingOrder}
        />
      </div>
    )
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3}>Purchase Order List</Title>
        <Button type="primary" onClick={handleCreateNew}>
          Create New Purchase Order
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </Card>
  )
}

export default OrderList