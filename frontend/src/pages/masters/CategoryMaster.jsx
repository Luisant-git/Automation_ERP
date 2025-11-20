import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const CategoryMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [categories, setCategories] = useState([])

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('categories') || '[]')
    if (saved.length === 0) {
      const initial = [
        { key: 1, id: 1, code: 'RM', name: 'Raw Material', description: 'Basic materials for production' },
        { key: 2, id: 2, code: 'FG', name: 'Finished Goods', description: 'Completed products ready for sale' },
        { key: 3, id: 3, code: 'SP', name: 'Spare Parts', description: 'Replacement parts and components' },
        { key: 4, id: 4, code: 'CON', name: 'Consumables', description: 'Items consumed during operations' },
        { key: 5, id: 5, code: 'TOOL', name: 'Tools', description: 'Equipment and tools' }
      ]
      localStorage.setItem('categories', JSON.stringify(initial))
      setCategories(initial)
    } else {
      setCategories(saved)
    }
  }, [])

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
    let updated
    if (editingRecord) {
      updated = categories.map(c => c.key === editingRecord.key ? { ...values, key: editingRecord.key, id: editingRecord.id } : c)
      message.success('Category updated successfully')
    } else {
      const newId = Date.now()
      updated = [...categories, { ...values, key: newId, id: newId }]
      message.success('Category added successfully')
    }
    setCategories(updated)
    localStorage.setItem('categories', JSON.stringify(updated))
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
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this category?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      onOk() {
        const updated = categories.filter(c => c.key !== key)
        setCategories(updated)
        localStorage.setItem('categories', JSON.stringify(updated))
        message.success('Category deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Category Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Category</Button>}
      >
        <Table columns={columns} dataSource={categories} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Category' : 'Add Category'}
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
                <Input placeholder="e.g., RM" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Raw Material" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Category description" />
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

export default CategoryMaster