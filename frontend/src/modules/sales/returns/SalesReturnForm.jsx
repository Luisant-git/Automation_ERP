import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Table,
  InputNumber,
  Select,
  DatePicker,
  Space,
  message,
  Typography
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

export default function SalesReturnForm({ editingReturn, onReturnSaved }) {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])

  const generateReturnId = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `SR${year}${month}${random}`
  }

  useEffect(() => {
    if (editingReturn) {
      form.setFieldsValue({
        ...editingReturn,
        returnDate: editingReturn.returnDate ? dayjs(editingReturn.returnDate) : dayjs()
      })
      setItems(editingReturn.items || [])
    } else {
      form.setFieldsValue({
        returnId: generateReturnId(),
        returnDate: dayjs(),
        status: 'Pending'
      })
    }
  }, [editingReturn])

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      reason: ''
    }
    setItems([...items, newItem])
  }

  const updateItem = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalAmount = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0)
        }
        return updatedItem
      }
      return item
    })
    setItems(updatedItems)
  }

  const removeItem = (key) => {
    setItems(items.filter(item => item.key !== key))
  }

  const totals = {
    totalAmount: items.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }

  const columns = [
    {
      title: 'Sl. No.',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 200,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'itemName', e.target.value)}
          placeholder="Item Name"
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      width: 120,
      render: (text) => `₹${(text || 0).toFixed(2)}`
    },
    {
      title: 'Return Reason',
      dataIndex: 'reason',
      width: 150,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'reason', value)}
          style={{ width: '100%' }}
          placeholder="Select reason"
        >
          <Option value="Defective">Defective</Option>
          <Option value="Wrong Item">Wrong Item</Option>
          <Option value="Damaged">Damaged</Option>
          <Option value="Not Required">Not Required</Option>
        </Select>
      )
    },
    {
      title: 'Action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      )
    }
  ]

  const handleSubmit = async (values) => {
    try {
      const returnData = {
        ...values,
        items,
        ...totals,
        returnDate: values.returnDate?.format('YYYY-MM-DD'),
        createdDate: new Date().toISOString()
      }

      console.log('Sales Return Data:', returnData)
      message.success('Sales return saved successfully!')
      onReturnSaved && onReturnSaved()
    } catch (error) {
      message.error('Failed to save sales return')
    }
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => onReturnSaved && onReturnSaved()}
              style={{ marginRight: '8px' }}
            />
            <Typography.Title level={3} style={{ margin: '0', color: '#333' }}>
              Create Sales Return
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Return Details">
                <Form.Item name="returnId" label="Return ID">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="returnDate" label="Return Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="originalInvoice" label="Original Invoice" rules={[{ required: true }]}>
                  <Input placeholder="Enter original invoice number" />
                </Form.Item>
                <Form.Item name="status" label="Status">
                  <Select>
                    <Option value="Pending">Pending</Option>
                    <Option value="Approved">Approved</Option>
                    <Option value="Rejected">Rejected</Option>
                    <Option value="Processed">Processed</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Customer Information">
                <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
                  <Select placeholder="Select customer">
                    <Option value="ABC Corp">ABC Corp</Option>
                    <Option value="XYZ Ltd">XYZ Ltd</Option>
                    <Option value="Tech Solutions">Tech Solutions</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="returnReason" label="Return Reason" rules={[{ required: true }]}>
                  <Select placeholder="Select return reason">
                    <Option value="Defective Product">Defective Product</Option>
                    <Option value="Wrong Item">Wrong Item</Option>
                    <Option value="Damaged in Transit">Damaged in Transit</Option>
                    <Option value="Customer Request">Customer Request</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="notes" label="Notes">
                  <TextArea rows={3} placeholder="Additional notes" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: '24px' }}>
            <Card size="small" title="Return Items">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography.Text strong>Items to Return</Typography.Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1000 }}
              />
            </Card>
          </div>

          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card size="small" title="Summary">
                <Row justify="space-between" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                  <Col>Total Return Amount</Col>
                  <Col>₹{totals.totalAmount.toFixed(2)}</Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>

      <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '80px' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            size="large"
            style={{ minWidth: '150px' }}
          >
            {editingReturn ? 'Update' : 'Save'} Return
          </Button>
        </Space>
      </div>
    </div>
  )
}