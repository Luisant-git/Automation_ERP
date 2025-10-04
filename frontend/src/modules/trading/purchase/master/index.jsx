import React, { useState } from 'react'
import { Button, Form, Input, Card, DatePicker, Select, InputNumber, Row, Col, Space, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import DataTable from '../../../components/DataTable'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

export default function PurchaseMaster() {
  const [purchases, setPurchases] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()

  const columns = [
    { title: 'Purchase Number', dataIndex: 'purchaseNumber', key: 'purchaseNumber' },
    { title: 'Purchase Date', dataIndex: 'purchaseDate', key: 'purchaseDate' },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Net Amount', dataIndex: 'netAmount', key: 'netAmount', render: (amount) => `₹${amount?.toFixed(2) || '0.00'}` },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ]

  const handleView = (record) => {
    Modal.info({
      title: `Purchase Details - ${record.purchaseNumber}`,
      content: (
        <div>
          <p><strong>Supplier:</strong> {record.supplier}</p>
          <p><strong>Date:</strong> {record.purchaseDate}</p>
          <p><strong>Net Amount:</strong> ₹{record.netAmount?.toFixed(2)}</p>
          <p><strong>Status:</strong> {record.status}</p>
        </div>
      ),
      width: 600
    })
  }

  const handleEdit = (record) => {
    setEditingPurchase(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Purchase',
      content: 'Are you sure you want to delete this purchase?',
      onOk: () => {
        setPurchases(purchases.filter(p => p.id !== id))
        message.success('Purchase deleted successfully')
      }
    })
  }

  const handleSubmit = (values) => {
    const purchaseData = {
      ...values,
      id: editingPurchase?.id || Date.now(),
      purchaseNumber: editingPurchase?.purchaseNumber || `PUR-${Date.now()}`,
      netAmount: calculateNetAmount(values)
    }

    if (editingPurchase) {
      setPurchases(purchases.map(p => p.id === editingPurchase.id ? purchaseData : p))
      message.success('Purchase updated successfully')
    } else {
      setPurchases([purchaseData, ...purchases])
      message.success('Purchase created successfully')
    }

    setIsModalVisible(false)
    setEditingPurchase(null)
    form.resetFields()
  }

  const calculateNetAmount = (values) => {
    const totalQty = values.totalQty || 0
    const discount = values.discount || 0
    const tax = values.tax || 0
    return totalQty - discount + tax
  }

  const handleSearch = (values) => {
    console.log('Search values:', values)
  }

  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C']
  const poReferences = ['PO-001', 'PO-002', 'PO-003']
  const currencies = ['INR', 'USD', 'EUR']
  const statuses = ['Draft', 'Approved', 'Cancelled']

  return (
    <div>
      <div className="page-header">
        <h2>Purchase Master</h2>
      </div>

      <Card title="Search & Filter" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="supplier">
            <Select placeholder="Select Supplier" style={{ width: 150 }} allowClear>
              {suppliers.map(supplier => (
                <Option key={supplier} value={supplier}>{supplier}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="purchaseNumber">
            <Input placeholder="Purchase Number" />
          </Form.Item>
          <Form.Item name="dateRange">
            <RangePicker />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="Status" style={{ width: 120 }} allowClear>
              {statuses.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">Search</Button>
          </Form.Item>
        </Form>
      </Card>

      <DataTable 
        title="Purchase List" 
        columns={columns} 
        data={purchases}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Add New Purchase
          </Button>
        }
      />

      <Modal
        title={editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingPurchase(null)
          form.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card title="Header Information" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="purchaseNumber" label="Purchase Number">
                  <Input placeholder="Auto-generated" disabled={!editingPurchase} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="purchaseDate" label="Purchase Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="supplier" label="Supplier" rules={[{ required: true }]}>
                  <Select placeholder="Select Supplier">
                    {suppliers.map(supplier => (
                      <Option key={supplier} value={supplier}>{supplier}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="supplierInvoiceNumber" label="Supplier Invoice Number">
                  <Input placeholder="Invoice Number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="supplierInvoiceDate" label="Supplier Invoice Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="poReference" label="PO Reference">
                  <Select placeholder="Select PO Reference">
                    {poReferences.map(po => (
                      <Option key={po} value={po}>{po}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Amount Information" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="currency" label="Currency" initialValue="INR">
                  <Select>
                    {currencies.map(currency => (
                      <Option key={currency} value={currency}>{currency}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="exchangeRate" label="Exchange Rate" initialValue={1}>
                  <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="totalQty" label="Total Qty">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="discount" label="Discount">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="tax" label="Tax">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="netAmount" label="Net Amount">
                  <InputNumber style={{ width: '100%' }} min={0} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Address Information" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="billingAddress" label="Billing Address">
                  <TextArea rows={3} placeholder="Billing Address" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="shippingAddress" label="Shipping Address">
                  <TextArea rows={3} placeholder="Shipping Address" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Status" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="status" label="Status" initialValue="Draft">
              <Select>
                {statuses.map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false)
                setEditingPurchase(null)
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPurchase ? 'Update' : 'Save'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}