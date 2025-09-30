import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const TaxMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [taxes, setTaxes] = useState([
    { key: 1, code: 'GST18', name: 'GST 18%', rate: 18, description: 'Standard GST rate' },
    { key: 2, code: 'GST12', name: 'GST 12%', rate: 12, description: 'Reduced GST rate' },
    { key: 3, code: 'GST5', name: 'GST 5%', rate: 5, description: 'Lower GST rate' },
    { key: 4, code: 'GST0', name: 'GST 0%', rate: 0, description: 'Zero rated GST' },
    { key: 5, code: 'EXEMPT', name: 'Exempt', rate: 0, description: 'Tax exempt items' }
  ])

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
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = (values) => {
    if (editingRecord) {
      setTaxes(taxes.map(t => t.key === editingRecord.key ? { ...values, key: editingRecord.key } : t))
      message.success('Tax updated successfully')
    } else {
      setTaxes([...taxes, { ...values, key: Date.now() }])
      message.success('Tax added successfully')
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
      title: 'Delete Tax',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this tax?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      onOk() {
        setTaxes(taxes.filter(t => t.key !== key))
        message.success('Tax deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Tax Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Tax</Button>}
      >
        <Table columns={columns} dataSource={taxes} />
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