import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const BrandMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [brands, setBrands] = useState([
    { key: 1, code: 'SIE', name: 'Siemens', description: 'German industrial automation' },
    { key: 2, code: 'ABB', name: 'ABB', description: 'Swiss-Swedish automation technology' },
    { key: 3, code: 'SCH', name: 'Schneider Electric', description: 'French electrical equipment' },
    { key: 4, code: 'SKF', name: 'SKF', description: 'Swedish bearing manufacturer' },
    { key: 5, code: 'POL', name: 'Polycab', description: 'Indian cable manufacturer' }
  ])

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
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
    if (editingRecord) {
      setBrands(brands.map(b => b.key === editingRecord.key ? { ...values, key: editingRecord.key } : b))
      message.success('Brand updated successfully')
    } else {
      setBrands([...brands, { ...values, key: Date.now() }])
      message.success('Brand added successfully')
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
      title: 'Delete Brand',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this brand?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      onOk() {
        setBrands(brands.filter(b => b.key !== key))
        message.success('Brand deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Brand Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Brand</Button>}
      >
        <Table columns={columns} dataSource={brands} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Brand' : 'Add Brand'}
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
            <Col span={8}>
              <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                <Input placeholder="e.g., SIE" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Siemens" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brand description" />
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

export default BrandMaster