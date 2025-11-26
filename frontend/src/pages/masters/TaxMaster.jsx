import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, InputNumber, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { taxRateAPI, useApiLoading } from '../../services/apiService'

const TaxMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [taxes, setTaxes] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    fetchTaxes()
  }, [])

  const fetchTaxes = async () => {
    try {
      const data = await executeWithLoading(() => taxRateAPI.getAll())
      setTaxes(data.map(item => ({ ...item, key: item.id })))
    } catch (error) {
      console.error('Failed to fetch taxes:', error)
    }
  }

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Rate (%)', dataIndex: 'rate', key: 'rate', width: 100 },
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
        await executeWithLoading(() => taxRateAPI.update(editingRecord.id, values))
        message.success('Tax updated successfully')
      } else {
        await executeWithLoading(() => taxRateAPI.create(values))
        message.success('Tax added successfully')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingRecord(null)
      fetchTaxes()
    } catch (error) {
      console.error('Failed to save tax:', error)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Tax',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this tax?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await executeWithLoading(() => taxRateAPI.delete(id))
          message.success('Tax deleted successfully')
          fetchTaxes()
        } catch (error) {
          console.error('Failed to delete tax:', error)
        }
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Tax Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Tax</Button>}
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={taxes} />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? 'Edit Tax' : 'Add Tax'}
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
                <Input placeholder="e.g., GST18" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., GST 18%" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="rate" label="Rate (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Tax description" />
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

export default TaxMaster