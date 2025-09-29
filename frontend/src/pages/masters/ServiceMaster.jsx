import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const ServiceMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [services, setServices] = useState([
    {
      key: 1,
      serviceCode: 'SRV001',
      serviceName: 'Equipment Installation',
      serviceCategory: 'installation',
      serviceDescription: 'Complete installation of industrial equipment including electrical connections, calibration, and commissioning',
      servicePrice: 25000
    },
    {
      key: 2,
      serviceCode: 'SRV002',
      serviceName: 'Preventive Maintenance',
      serviceCategory: 'maintenance',
      serviceDescription: 'Scheduled maintenance service including inspection, cleaning, lubrication, and minor repairs',
      servicePrice: 8000
    },
    {
      key: 3,
      serviceCode: 'SRV003',
      serviceName: 'Emergency Repair',
      serviceCategory: 'repair',
      serviceDescription: '24/7 emergency repair service for critical equipment breakdown with immediate response',
      servicePrice: 15000
    },
    {
      key: 4,
      serviceCode: 'SRV004',
      serviceName: 'Process Optimization',
      serviceCategory: 'consulting',
      serviceDescription: 'Analysis and optimization of manufacturing processes to improve efficiency and reduce costs',
      servicePrice: 50000
    },
    {
      key: 5,
      serviceCode: 'SRV005',
      serviceName: 'Operator Training',
      serviceCategory: 'training',
      serviceDescription: 'Comprehensive training program for equipment operators including safety protocols and best practices',
      servicePrice: 12000
    }
  ])

  const columns = [
    { title: 'Service Code', dataIndex: 'serviceCode', key: 'serviceCode' },
    { title: 'Service Name', dataIndex: 'serviceName', key: 'serviceName' },
    { title: 'Category', dataIndex: 'serviceCategory', key: 'serviceCategory' },
    { title: 'Description', dataIndex: 'serviceDescription', key: 'serviceDescription' },
    { title: 'Price', dataIndex: 'servicePrice', key: 'servicePrice' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = (values) => {
    if (editingRecord) {
      setServices(services.map(s => s.key === editingRecord.key ? { ...values, key: editingRecord.key } : s))
      message.success('Service updated successfully')
    } else {
      setServices([...services, { ...values, key: Date.now() }])
      message.success('Service added successfully')
    }
    setIsModalVisible(false)
    form.resetFields()
    setEditingRecord(null)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Delete Service',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this service? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setServices(services.filter(s => s.key !== key))
        message.success('Service deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Service Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Service</Button>}
      >
        <Table columns={columns} dataSource={services} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Service' : 'Add Service'}
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
              <Form.Item name="serviceCode" label="Service Code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="serviceName" label="Service Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="serviceCategory" label="Service Category">
                <Select placeholder="Select Category">
                  <Select.Option value="installation">Installation</Select.Option>
                  <Select.Option value="maintenance">Maintenance</Select.Option>
                  <Select.Option value="repair">Repair</Select.Option>
                  <Select.Option value="consulting">Consulting</Select.Option>
                  <Select.Option value="training">Training</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="servicePrice" label="Service Price">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="serviceDescription" label="Service Description">
            <Input.TextArea rows={4} />
          </Form.Item>
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

export default ServiceMaster