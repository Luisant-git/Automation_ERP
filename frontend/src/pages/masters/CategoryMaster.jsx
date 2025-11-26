import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { categoryAPI, useApiLoading } from '../../services/apiService'

const CategoryMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [categories, setCategories] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await executeWithLoading(() => categoryAPI.getAll())
      setCategories(data.map(item => ({ ...item, key: item.id })))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

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
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await executeWithLoading(() => categoryAPI.update(editingRecord.id, values))
        message.success('Category updated successfully')
      } else {
        await executeWithLoading(() => categoryAPI.create(values))
        message.success('Category added successfully')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingRecord(null)
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this category?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await executeWithLoading(() => categoryAPI.delete(id))
          message.success('Category deleted successfully')
          fetchCategories()
        } catch (error) {
          console.error('Failed to delete category:', error)
        }
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Category Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Category</Button>}
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={categories} />
        </Spin>
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