import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { brandAPI, useApiLoading } from '../../services/apiService'

const BrandMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [brands, setBrands] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const data = await executeWithLoading(() => brandAPI.getAll())
      setBrands(data.map(item => ({ ...item, key: item.id })))
    } catch (error) {
      console.error('Failed to fetch brands:', error)
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
        await executeWithLoading(() => brandAPI.update(editingRecord.id, values))
        message.success('Brand updated successfully')
      } else {
        await executeWithLoading(() => brandAPI.create(values))
        message.success('Brand added successfully')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingRecord(null)
      fetchBrands()
    } catch (error) {
      console.error('Failed to save brand:', error)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Brand',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this brand?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await executeWithLoading(() => brandAPI.delete(id))
          message.success('Brand deleted successfully')
          fetchBrands()
        } catch (error) {
          console.error('Failed to delete brand:', error)
        }
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Brand Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Brand</Button>}
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={brands} />
        </Spin>
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