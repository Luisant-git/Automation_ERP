import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Tag, Space, Input, DatePicker } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

const OrderList = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])

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
      dataIndex: ['totals', 'grandTotal'],
      key: 'total',
      render: (val) => <strong>₹{val?.toFixed(2) || '0.00'}</strong>,
      sorter: (a, b) => (a.totals?.grandTotal || 0) - (b.totals?.grandTotal || 0)
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
          <Button icon={<EyeOutlined />} size="small" type="primary" ghost>
            View
          </Button>
          <Button icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger>
            Delete
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Card>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input.Search
            placeholder="Search by PO Number or Supplier"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <RangePicker placeholder={['Start Date', 'End Date']} />
        </Space>
        <div>
          <strong>Total Orders: {filteredOrders.length}</strong>
        </div>
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