import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, InputNumber, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const OpeningStockMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [stockEntries, setStockEntries] = useState([
    { 
      key: 1, 
      itemCode: 'MTR001', 
      itemName: 'Steel Rod 12mm', 
      qty: 500, 
      serialNumber: 'SR001-500', 
      date: '2024-01-01' 
    },
    { 
      key: 2, 
      itemCode: 'FG001', 
      itemName: 'Control Panel 415V', 
      qty: 25, 
      serialNumber: 'CP415-025', 
      date: '2024-01-01' 
    },
    { 
      key: 3, 
      itemCode: 'SP001', 
      itemName: 'Motor Bearing 6205', 
      qty: 200, 
      serialNumber: 'MB6205-200', 
      date: '2024-01-01' 
    },
    { 
      key: 4, 
      itemCode: 'CON001', 
      itemName: 'Hydraulic Oil SAE 68', 
      qty: 500, 
      serialNumber: 'HO68-500L', 
      date: '2024-01-01' 
    },
    { 
      key: 5, 
      itemCode: 'MTR002', 
      itemName: 'Copper Wire 2.5mm', 
      qty: 1000, 
      serialNumber: 'CW25-1000M', 
      date: '2024-01-01' 
    }
  ])

  const columns = [
    { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode', width: 120 },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName', width: 200 },
    { title: 'Quantity', dataIndex: 'qty', key: 'qty', width: 100 },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', width: 150 },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date', 
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      date: values.date ? values.date.format('YYYY-MM-DD') : null
    }
    
    if (editingRecord) {
      setStockEntries(stockEntries.map(s => s.key === editingRecord.key ? { ...formattedValues, key: editingRecord.key } : s))
      message.success('Opening stock updated successfully')
    } else {
      setStockEntries([...stockEntries, { ...formattedValues, key: Date.now() }])
      message.success('Opening stock added successfully')
    }
    setIsModalVisible(false)
    form.resetFields()
    setEditingRecord(null)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null
    })
    setIsModalVisible(true)
  }

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Delete Opening Stock Entry',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this opening stock entry?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      onOk() {
        setStockEntries(stockEntries.filter(s => s.key !== key))
        message.success('Opening stock entry deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Opening Stock Entry" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Stock Entry</Button>}
      >
        <Table columns={columns} dataSource={stockEntries} scroll={{ x: 800 }} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Opening Stock' : 'Add Opening Stock'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingRecord(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="itemCode" label="Item Code" rules={[{ required: true }]}>
                <Input placeholder="e.g., MTR001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="itemName" label="Item Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Steel Rod 12mm" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="serialNumber" label="Serial Number">
                <Input placeholder="e.g., SR001-500" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? 'Update' : 'Save'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false)
                form.resetFields()
                setEditingRecord(null)
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OpeningStockMaster