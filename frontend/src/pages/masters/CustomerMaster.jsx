import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const CustomerMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [customers, setCustomers] = useState([
    {
      key: 1,
      name: 'Rajesh Kumar',
      companyName: 'Tata Steel Ltd',
      contactPerson: 'Amit Sharma',
      contactNo: '+91-9876543210',
      emailId: 'rajesh.kumar@tatasteel.com',
      phoneNo: '+91-22-66658000',
      gstNumber: '27AAACT2727Q1ZZ',
      shippingAddress: 'Tata Steel Complex, Jamshedpur, Jharkhand 831001',
      billingAddress: 'Bombay House, 24 Homi Mody Street, Mumbai 400001',
      state: 'Maharashtra',
      city: 'Mumbai',
      country: 'India'
    },
    {
      key: 2,
      name: 'Priya Patel',
      companyName: 'Reliance Industries',
      contactPerson: 'Suresh Patel',
      contactNo: '+91-9123456789',
      emailId: 'priya.patel@ril.com',
      phoneNo: '+91-22-30386000',
      gstNumber: '24AAACR5055K1Z5',
      shippingAddress: 'Reliance Corporate Park, Navi Mumbai 400701',
      billingAddress: '3rd Floor, Maker Chambers IV, Nariman Point, Mumbai 400021',
      state: 'Maharashtra',
      city: 'Mumbai',
      country: 'India'
    },
    {
      key: 3,
      name: 'Vikram Singh',
      companyName: 'Larsen & Toubro',
      contactPerson: 'Ravi Kumar',
      contactNo: '+91-9988776655',
      emailId: 'vikram.singh@larsentoubro.com',
      phoneNo: '+91-44-28267000',
      gstNumber: '33AAACL0072A1ZG',
      shippingAddress: 'L&T House, Ballard Estate, Mumbai 400001',
      billingAddress: 'L&T House, N.M. Marg, Ballard Estate, Mumbai 400001',
      state: 'Maharashtra',
      city: 'Mumbai',
      country: 'India'
    }
  ])

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Company', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: 'Phone', dataIndex: 'phoneNo', key: 'phoneNo' },
    { title: 'Email', dataIndex: 'emailId', key: 'emailId' },
    { title: 'GST Number', dataIndex: 'gstNumber', key: 'gstNumber' },
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
      setCustomers(customers.map(c => c.key === editingRecord.key ? { ...values, key: editingRecord.key } : c))
      message.success('Customer updated successfully')
    } else {
      setCustomers([...customers, { ...values, key: Date.now() }])
      message.success('Customer added successfully')
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
      title: 'Delete Customer',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this customer? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setCustomers(customers.filter(c => c.key !== key))
        message.success('Customer deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Customer Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Customer</Button>}
      >
        <Table columns={columns} dataSource={customers} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Customer' : 'Add Customer'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingRecord(null)
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactNo" label="Contact No">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emailId" label="Email ID">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNo" label="Phone No">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gstNumber" label="GST Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shippingAddress" label="Shipping Address">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="billingAddress" label="Billing Address">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="country" label="Country">
                <Input />
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

export default CustomerMaster