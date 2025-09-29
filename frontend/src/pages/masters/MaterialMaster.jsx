import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const MaterialMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [materials, setMaterials] = useState([
    {
      key: 1,
      itemCode: 'MTR001',
      itemName: 'Steel Rod 12mm',
      hsnCode: '72142000',
      itemCategory: 'raw-material',
      unit: 'kg',
      tax: 18,
      purchaseRate: 65,
      sellingRate: 85,
      quantity: 5000
    },
    {
      key: 2,
      itemCode: 'MTR002',
      itemName: 'Copper Wire 2.5mm',
      hsnCode: '85444900',
      itemCategory: 'raw-material',
      unit: 'mtr',
      tax: 18,
      purchaseRate: 12,
      sellingRate: 18,
      quantity: 10000
    },
    {
      key: 3,
      itemCode: 'FG001',
      itemName: 'Control Panel 415V',
      hsnCode: '85371000',
      itemCategory: 'finished-goods',
      unit: 'pcs',
      tax: 18,
      purchaseRate: 15000,
      sellingRate: 22000,
      quantity: 25
    },
    {
      key: 4,
      itemCode: 'SP001',
      itemName: 'Motor Bearing 6205',
      hsnCode: '84821000',
      itemCategory: 'spare-parts',
      unit: 'pcs',
      tax: 18,
      purchaseRate: 450,
      sellingRate: 650,
      quantity: 200
    },
    {
      key: 5,
      itemCode: 'CON001',
      itemName: 'Hydraulic Oil SAE 68',
      hsnCode: '27101981',
      itemCategory: 'consumables',
      unit: 'ltr',
      tax: 18,
      purchaseRate: 180,
      sellingRate: 250,
      quantity: 500
    }
  ])

  const columns = [
    { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName' },
    { title: 'HSN Code', dataIndex: 'hsnCode', key: 'hsnCode' },
    { title: 'Category', dataIndex: 'itemCategory', key: 'itemCategory' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Tax %', dataIndex: 'tax', key: 'tax' },
    { title: 'Purchase Rate', dataIndex: 'purchaseRate', key: 'purchaseRate' },
    { title: 'Selling Rate', dataIndex: 'sellingRate', key: 'sellingRate' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
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
      setMaterials(materials.map(m => m.key === editingRecord.key ? { ...values, key: editingRecord.key } : m))
      message.success('Material updated successfully')
    } else {
      setMaterials([...materials, { ...values, key: Date.now() }])
      message.success('Material added successfully')
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
      title: 'Delete Material',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this material? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setMaterials(materials.filter(m => m.key !== key))
        message.success('Material deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Material Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Material</Button>}
      >
        <Table columns={columns} dataSource={materials} scroll={{ x: 1200 }} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Material' : 'Add Material'}
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
              <Form.Item name="itemCode" label="Item Code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="itemName" label="Item Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hsnCode" label="HSN Code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="itemCategory" label="Item Category">
                <Select placeholder="Select Category">
                  <Select.Option value="raw-material">Raw Material</Select.Option>
                  <Select.Option value="finished-goods">Finished Goods</Select.Option>
                  <Select.Option value="consumables">Consumables</Select.Option>
                  <Select.Option value="spare-parts">Spare Parts</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="unit" label="Unit">
                <Select placeholder="Select Unit">
                  <Select.Option value="kg">Kg</Select.Option>
                  <Select.Option value="pcs">Pcs</Select.Option>
                  <Select.Option value="ltr">Ltr</Select.Option>
                  <Select.Option value="mtr">Mtr</Select.Option>
                  <Select.Option value="box">Box</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tax" label="Tax %">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="purchaseRate" label="Purchase Rate">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sellingRate" label="Selling Rate">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="Quantity">
                <InputNumber min={0} style={{ width: '100%' }} />
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

export default MaterialMaster