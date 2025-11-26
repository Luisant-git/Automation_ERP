import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, InputNumber, DatePicker, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { openingStockAPI, useApiLoading } from '../../services/apiService'

const OpeningStockMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [stockEntries, setStockEntries] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    fetchStockEntries()
  }, [])

  const fetchStockEntries = async () => {
    try {
      const data = await executeWithLoading(() => openingStockAPI.getAll())
      setStockEntries(data.map(item => ({ ...item, key: item.id })))
    } catch (error) {
      console.error('Failed to fetch stock entries:', error)
    }
  }

  const columns = [
    { 
      title: 'Item Code', 
      key: 'itemCode', 
      width: 120,
      render: (_, record) => record.material?.itemCode || 'N/A'
    },
    { 
      title: 'Item Name', 
      key: 'itemName', 
      width: 200,
      render: (_, record) => record.material?.itemName || 'N/A'
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100 },
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
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null
      }
      
      if (editingRecord) {
        await executeWithLoading(() => openingStockAPI.update(editingRecord.id, formattedValues))
        message.success('Opening stock updated successfully')
      } else {
        await executeWithLoading(() => openingStockAPI.create(formattedValues))
        message.success('Opening stock added successfully')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingRecord(null)
      fetchStockEntries()
    } catch (error) {
      console.error('Failed to save stock entry:', error)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      itemCode: record.material?.itemCode,
      itemName: record.material?.itemName,
      qty: record.quantity,
      serialNumber: record.serialNumber,
      date: record.date ? dayjs(record.date) : null
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Opening Stock Entry',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this opening stock entry?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await executeWithLoading(() => openingStockAPI.delete(id))
          message.success('Opening stock entry deleted successfully')
          fetchStockEntries()
        } catch (error) {
          console.error('Failed to delete stock entry:', error)
        }
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Opening Stock Entry" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Stock Entry</Button>}
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={stockEntries} scroll={{ x: 800 }} />
        </Spin>
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