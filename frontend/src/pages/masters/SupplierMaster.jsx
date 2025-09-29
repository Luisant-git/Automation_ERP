import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const SupplierMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [suppliers, setSuppliers] = useState([
    {
      key: 1,
      name: 'Anil Gupta',
      companyName: 'Bharat Heavy Electricals Ltd',
      contactPerson: 'Deepak Verma',
      contactNo: '+91-9876543211',
      emailId: 'anil.gupta@bhel.in',
      phoneNo: '+91-11-26156000',
      gstNumber: '07AAACB2355A1ZH',
      shippingAddress: 'BHEL House, Siri Fort, New Delhi 110049',
      billingAddress: 'BHEL House, Siri Fort, New Delhi 110049',
      state: 'Delhi',
      city: 'New Delhi',
      country: 'India'
    },
    {
      key: 2,
      name: 'Sunita Rao',
      companyName: 'Siemens India Ltd',
      contactPerson: 'Manoj Kumar',
      contactNo: '+91-9123456788',
      emailId: 'sunita.rao@siemens.com',
      phoneNo: '+91-22-39677000',
      gstNumber: '27AAACS3988E1ZA',
      shippingAddress: '130 Pandurang Budhkar Marg, Worli, Mumbai 400018',
      billingAddress: '130 Pandurang Budhkar Marg, Worli, Mumbai 400018',
      state: 'Maharashtra',
      city: 'Mumbai',
      country: 'India'
    },
    {
      key: 3,
      name: 'Ramesh Chandra',
      companyName: 'ABB India Ltd',
      contactPerson: 'Sanjay Sharma',
      contactNo: '+91-9988776654',
      emailId: 'ramesh.chandra@in.abb.com',
      phoneNo: '+91-80-22949000',
      gstNumber: '29AAACA0318E1ZY',
      shippingAddress: 'Disha - 3rd Floor, Plot No. 5 & 6, 2nd Stage, Peenya Industrial Area, Bangalore 560058',
      billingAddress: 'Disha - 3rd Floor, Plot No. 5 & 6, 2nd Stage, Peenya Industrial Area, Bangalore 560058',
      state: 'Karnataka',
      city: 'Bangalore',
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
      setSuppliers(suppliers.map(s => s.key === editingRecord.key ? { ...values, key: editingRecord.key } : s))
      message.success('Supplier updated successfully')
    } else {
      setSuppliers([...suppliers, { ...values, key: Date.now() }])
      message.success('Supplier added successfully')
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
      title: 'Delete Supplier',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this supplier? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setSuppliers(suppliers.filter(s => s.key !== key))
        message.success('Supplier deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Supplier Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Supplier</Button>}
      >
        <Table columns={columns} dataSource={suppliers} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Supplier' : 'Add Supplier'}
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

export default SupplierMaster