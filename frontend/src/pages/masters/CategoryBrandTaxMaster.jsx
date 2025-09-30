import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, InputNumber, Tabs } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const CategoryBrandTaxMaster = () => {
  const [categoryForm] = Form.useForm()
  const [brandForm] = Form.useForm()
  const [taxForm] = Form.useForm()
  
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false)
  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false)
  const [isTaxModalVisible, setIsTaxModalVisible] = useState(false)
  
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  const [editingTax, setEditingTax] = useState(null)

  const [categories, setCategories] = useState([
    { key: 1, code: 'RM', name: 'Raw Material', description: 'Basic materials for production' },
    { key: 2, code: 'FG', name: 'Finished Goods', description: 'Completed products ready for sale' },
    { key: 3, code: 'SP', name: 'Spare Parts', description: 'Replacement parts and components' },
    { key: 4, code: 'CON', name: 'Consumables', description: 'Items consumed during operations' },
    { key: 5, code: 'TOOL', name: 'Tools', description: 'Equipment and tools' }
  ])

  const [brands, setBrands] = useState([
    { key: 1, code: 'SIE', name: 'Siemens', description: 'German industrial automation' },
    { key: 2, code: 'ABB', name: 'ABB', description: 'Swiss-Swedish automation technology' },
    { key: 3, code: 'SCH', name: 'Schneider Electric', description: 'French electrical equipment' },
    { key: 4, code: 'SKF', name: 'SKF', description: 'Swedish bearing manufacturer' },
    { key: 5, code: 'POL', name: 'Polycab', description: 'Indian cable manufacturer' }
  ])

  const [taxes, setTaxes] = useState([
    { key: 1, code: 'GST18', name: 'GST 18%', rate: 18, description: 'Standard GST rate' },
    { key: 2, code: 'GST12', name: 'GST 12%', rate: 12, description: 'Reduced GST rate' },
    { key: 3, code: 'GST5', name: 'GST 5%', rate: 5, description: 'Lower GST rate' },
    { key: 4, code: 'GST0', name: 'GST 0%', rate: 0, description: 'Zero rated GST' },
    { key: 5, code: 'EXEMPT', name: 'Exempt', rate: 0, description: 'Tax exempt items' }
  ])

  const categoryColumns = [
    { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteCategory(record.key)} />
        </Space>
      ),
    },
  ]

  const brandColumns = [
    { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditBrand(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteBrand(record.key)} />
        </Space>
      ),
    },
  ]

  const taxColumns = [
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
          <Button icon={<EditOutlined />} onClick={() => handleEditTax(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteTax(record.key)} />
        </Space>
      ),
    },
  ]

  // Category handlers
  const handleSubmitCategory = (values) => {
    if (editingCategory) {
      setCategories(categories.map(c => c.key === editingCategory.key ? { ...values, key: editingCategory.key } : c))
      message.success('Category updated successfully')
    } else {
      setCategories([...categories, { ...values, key: Date.now() }])
      message.success('Category added successfully')
    }
    setIsCategoryModalVisible(false)
    categoryForm.resetFields()
    setEditingCategory(null)
  }

  const handleEditCategory = (record) => {
    setEditingCategory(record)
    categoryForm.setFieldsValue(record)
    setIsCategoryModalVisible(true)
  }

  const handleDeleteCategory = (key) => {
    Modal.confirm({
      title: 'Delete Category',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this category?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      onOk() {
        setCategories(categories.filter(c => c.key !== key))
        message.success('Category deleted successfully')
      }
    })
  }

  // Brand handlers
  const handleSubmitBrand = (values) => {
    if (editingBrand) {
      setBrands(brands.map(b => b.key === editingBrand.key ? { ...values, key: editingBrand.key } : b))
      message.success('Brand updated successfully')
    } else {
      setBrands([...brands, { ...values, key: Date.now() }])
      message.success('Brand added successfully')
    }
    setIsBrandModalVisible(false)
    brandForm.resetFields()
    setEditingBrand(null)
  }

  const handleEditBrand = (record) => {
    setEditingBrand(record)
    brandForm.setFieldsValue(record)
    setIsBrandModalVisible(true)
  }

  const handleDeleteBrand = (key) => {
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

  // Tax handlers
  const handleSubmitTax = (values) => {
    if (editingTax) {
      setTaxes(taxes.map(t => t.key === editingTax.key ? { ...values, key: editingTax.key } : t))
      message.success('Tax updated successfully')
    } else {
      setTaxes([...taxes, { ...values, key: Date.now() }])
      message.success('Tax added successfully')
    }
    setIsTaxModalVisible(false)
    taxForm.resetFields()
    setEditingTax(null)
  }

  const handleEditTax = (record) => {
    setEditingTax(record)
    taxForm.setFieldsValue(record)
    setIsTaxModalVisible(true)
  }

  const handleDeleteTax = (key) => {
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

  const tabItems = [
    {
      key: '1',
      label: 'Categories',
      children: (
        <Card 
          title="Category Master" 
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCategoryModalVisible(true)}>Add Category</Button>}
        >
          <Table columns={categoryColumns} dataSource={categories} />
        </Card>
      )
    },
    {
      key: '2',
      label: 'Brands',
      children: (
        <Card 
          title="Brand Master" 
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsBrandModalVisible(true)}>Add Brand</Button>}
        >
          <Table columns={brandColumns} dataSource={brands} />
        </Card>
      )
    },
    {
      key: '3',
      label: 'Tax Rates',
      children: (
        <Card 
          title="Tax Master" 
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTaxModalVisible(true)}>Add Tax</Button>}
        >
          <Table columns={taxColumns} dataSource={taxes} />
        </Card>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Tabs items={tabItems} />

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={isCategoryModalVisible}
        onCancel={() => {
          setIsCategoryModalVisible(false)
          categoryForm.resetFields()
          setEditingCategory(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleSubmitCategory}>
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
                {editingCategory ? 'Update' : 'Save'}
              </Button>
              <Button onClick={() => {
                setIsCategoryModalVisible(false)
                categoryForm.resetFields()
                setEditingCategory(null)
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Brand Modal */}
      <Modal
        title={editingBrand ? 'Edit Brand' : 'Add Brand'}
        open={isBrandModalVisible}
        onCancel={() => {
          setIsBrandModalVisible(false)
          brandForm.resetFields()
          setEditingBrand(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={brandForm} layout="vertical" onFinish={handleSubmitBrand}>
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
                {editingBrand ? 'Update' : 'Save'}
              </Button>
              <Button onClick={() => {
                setIsBrandModalVisible(false)
                brandForm.resetFields()
                setEditingBrand(null)
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Tax Modal */}
      <Modal
        title={editingTax ? 'Edit Tax' : 'Add Tax'}
        open={isTaxModalVisible}
        onCancel={() => {
          setIsTaxModalVisible(false)
          taxForm.resetFields()
          setEditingTax(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={taxForm} layout="vertical" onFinish={handleSubmitTax}>
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
                {editingTax ? 'Update' : 'Save'}
              </Button>
              <Button onClick={() => {
                setIsTaxModalVisible(false)
                taxForm.resetFields()
                setEditingTax(null)
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

export default CategoryBrandTaxMaster