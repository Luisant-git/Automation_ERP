import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, InputNumber, Switch, Tag, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { materialAPI, brandAPI, categoryAPI, taxRateAPI, useApiLoading } from '../../services/apiService'

const MaterialMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [materials, setMaterials] = useState([])
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [taxRates, setTaxRates] = useState([])
  const { loading, executeWithLoading } = useApiLoading()
  useEffect(() => {
    fetchMaterials()
    fetchBrands()
    fetchCategories()
    fetchTaxRates()
  }, [])

  const fetchMaterials = async () => {
    try {
      const data = await executeWithLoading(() => materialAPI.getAll())
      setMaterials(data.map(item => ({ ...item, key: item.id })))
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const data = await brandAPI.getDropdownList()
      setBrands(data.data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getDropdownList()
      setCategories(data.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTaxRates = async () => {
    try {
      const data = await taxRateAPI.getDropdownList()
      setTaxRates(data.data)
    } catch (error) {
      console.error('Failed to fetch tax rates:', error)
    }
  }

  const generateSerialNumber = () => {
    const lastNumber = materials.length > 0 
      ? Math.max(...materials.map(m => parseInt(m.serialNumber?.replace('SN-', '') || 0))) 
      : 0
    return `SN-${String(lastNumber + 1).padStart(4, '0')}`
  }



  const columns = [
    { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode', width: 100 },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName', width: 150 },
    // { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', width: 120 },
    { title: 'HSN Code', dataIndex: 'hsnCode', key: 'hsnCode', width: 100 },
    { 
      title: 'Category', 
      key: 'category', 
      width: 120,
      render: (_, record) => record.category?.name || '-'
    },
    { 
      title: 'Brand', 
      key: 'brand', 
      width: 120,
      render: (_, record) => record.brandRelation?.name || '-'
    },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: 'Tax %', dataIndex: 'tax', key: 'tax', width: 80 },
    { title: 'Purchase Rate', dataIndex: 'purchaseRate', key: 'purchaseRate', width: 120 },
    { title: 'Selling Rate', dataIndex: 'sellingRate', key: 'sellingRate', width: 120 },
    // { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive', 
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
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
        await executeWithLoading(() => materialAPI.update(editingRecord.id, values))
        message.success('Material updated successfully')
      } else {
        await executeWithLoading(() => materialAPI.create(values))
        message.success('Material added successfully')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingRecord(null)
      fetchMaterials()
    } catch (error) {
      console.error('Failed to save material:', error)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleAdd = () => {
    form.setFieldsValue({
      serialNumber: generateSerialNumber()
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Material',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this material? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      async onOk() {
        try {
          await executeWithLoading(() => materialAPI.delete(id))
          message.success('Material deleted successfully')
          fetchMaterials()
        } catch (error) {
          console.error('Failed to delete material:', error)
        }
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Material Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Material</Button>}
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={materials} size="medium" />
        </Spin>
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
            <Col span={8}>
              <Form.Item name="hsnCode" label="HSN Code">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="categoryId" label="Item Category">
                <Select placeholder="Select Category">
                  {categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>{category.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brandId" label="Brand">
                <Select 
                  placeholder="Select Brand" 
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => 
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {brands.map(brand => (
                    <Select.Option key={brand.id} value={brand.id}>{brand.name}</Select.Option>
                  ))}
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
                <Select placeholder="Select Tax Rate">
                  {taxRates.map(tax => (
                    <Select.Option key={tax.id} value={tax.rate}>{tax.name} ({tax.rate}%)</Select.Option>
                  ))}
                </Select>
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
              <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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