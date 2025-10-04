import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Table,
  InputNumber,
  Select,
  DatePicker,
  Space,
  message,
  Typography,
  Divider
} from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

export default function PurchaseOrderForm({ editingOrder, onOrderSaved }) {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])

  // Generate PO Number
  const generatePONumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PO${year}${month}${random}`
  }

  // Initialize form
  useEffect(() => {
    if (editingOrder) {
      form.setFieldsValue({
        ...editingOrder,
        poDate: editingOrder.poDate ? dayjs(editingOrder.poDate) : dayjs(),
        deliveryDate: editingOrder.deliveryDate ? dayjs(editingOrder.deliveryDate) : null,
        referenceDate: editingOrder.referenceDate ? dayjs(editingOrder.referenceDate) : null
      })
      setItems(editingOrder.items || [])
    } else {
      form.setFieldsValue({
        poNumber: generatePONumber(),
        poDate: dayjs(),
        poStatus: 1,
        currencyId: 1,
        exchangeRate: 1
      })
    }
  }, [editingOrder])

  // Item management
  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      itemId: null,
      description: '',
      hsnCode: '',
      quantity: 1,
      unitId: null,
      rate: 0,
      discountPercentage: 0,
      discountAmount: 0,
      cgstPercentage: 9,
      sgstPercentage: 9,
      igstPercentage: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: 0
    }
    setItems([...items, newItem])
  }

  const updateItem = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate amounts
        const taxableAmount = (updatedItem.quantity * updatedItem.rate) - (updatedItem.discountAmount || 0)
        const cgstAmount = taxableAmount * (updatedItem.cgstPercentage || 0) / 100
        const sgstAmount = taxableAmount * (updatedItem.sgstPercentage || 0) / 100
        const igstAmount = taxableAmount * (updatedItem.igstPercentage || 0) / 100
        const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount
        
        return {
          ...updatedItem,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          totalAmount
        }
      }
      return item
    })
    setItems(updatedItems)
  }

  const removeItem = (key) => {
    setItems(items.filter(item => item.key !== key))
  }

  // Calculate totals
  const totals = {
    totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    totalAmount: items.reduce((sum, item) => sum + (item.taxableAmount || 0), 0),
    totalTaxAmount: items.reduce((sum, item) => sum + (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0), 0),
    totalDiscountAmount: items.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
    grossAmount: items.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }

  // Table columns with inline editing
  const columns = [
    {
      title: 'Sl. No.',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Description of Goods/Services',
      dataIndex: 'description',
      width: 250,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'description', e.target.value)}
          placeholder="Description"
        />
      )
    },
    {
      title: 'HSN/SAC',
      dataIndex: 'hsnCode',
      width: 100,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'hsnCode', e.target.value)}
          placeholder="HSN/SAC"
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit (per)',
      dataIndex: 'unitId',
      width: 80,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'unitId', value)}
          style={{ width: '100%' }}
        >
          <Option value={1}>Nos</Option>
          <Option value={2}>Kg</Option>
          <Option value={3}>Mtr</Option>
          <Option value={4}>Ltr</Option>
          <Option value={5}>Set</Option>
        </Select>
      )
    },
    {
      title: 'Rate (per unit)',
      dataIndex: 'rate',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'rate', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      width: 120,
      render: (text) => `₹${(text || 0).toFixed(2)}`
    },
    {
      title: 'Action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      )
    }
  ]

  const handleSubmit = async (values) => {
    try {
      const orderData = {
        ...values,
        items,
        ...totals,
        poDate: values.poDate?.format('YYYY-MM-DD'),
        deliveryDate: values.deliveryDate?.format('YYYY-MM-DD'),
        referenceDate: values.referenceDate?.format('YYYY-MM-DD'),
        createdDate: new Date().toISOString(),
        createdBy: 1,
        companyId: 1,
        financialYearId: 1,
        isActive: true
      }

      const existingOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')

      if (editingOrder) {
        const updatedOrders = existingOrders.map(order =>
          order.id === editingOrder.id ? { ...orderData, id: editingOrder.id } : order
        )
        localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders))
        message.success('Purchase Order updated successfully!')
      } else {
        const newOrder = { id: Date.now(), ...orderData }
        existingOrders.push(newOrder)
        localStorage.setItem('purchaseOrders', JSON.stringify(existingOrders))
        message.success('Purchase Order saved successfully!')
      }

      onOrderSaved && onOrderSaved()
    } catch (error) {
      message.error('Failed to save Purchase Order')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => onOrderSaved && onOrderSaved()}
              style={{ marginRight: '8px' }}
            />
            <Typography.Title level={3} style={{ margin: '0', color: '#333' }}>
              Create Purchase Order
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Header Section */}
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Order Details">
                <Form.Item name="poNumber" label="PO Number (auto-generated)">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="poDate" label="PO Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="deliveryDate" label="Delivery Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="poStatus" label="Status" initialValue={1}>
                  <Select>
                    <Option value={1}>Draft</Option>
                    <Option value={2}>Submitted</Option>
                    <Option value={3}>Approved</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Reference Details">
                <Form.Item name="paymentTermsId" label="Payment Terms">
                  <Select placeholder="Select Payment Terms">
                    <Option value={1}>Net 30</Option>
                    <Option value={2}>Net 15</Option>
                    <Option value={3}>Immediate</Option>
                    <Option value={4}>COD</Option>
                  </Select>
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="referenceNumber" label="Reference No.">
                      <Input placeholder="Reference Number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="referenceDate" label="Date">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="deliveryTermsId" label="Delivery Terms">
                  <Select placeholder="Select Delivery Terms">
                    <Option value={1}>FOB</Option>
                    <Option value={2}>CIF</Option>
                    <Option value={3}>Ex-Works</Option>
                    <Option value={4}>DDP</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="exchangeRate" label="Exchange Rate" initialValue={1}>
                  <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Supplier Information */}
          <Row gutter={24} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card size="small" title="Supplier Details">
                <Form.Item name="supplierId" label="Supplier Name" rules={[{ required: true }]}>
                  <Select placeholder="Select Supplier">
                    <Option value={1}>Supplier 1</Option>
                    <Option value={2}>Supplier 2</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="deliveryAddress" label="Delivery Address">
                  <TextArea rows={3} placeholder="Delivery Address" />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Billing & Shipping">
                <Form.Item name="billingAddress" label="Billing Address">
                  <TextArea rows={3} placeholder="Billing Address" />
                </Form.Item>
                <Form.Item name="shippingAddress" label="Shipping Address">
                  <TextArea rows={3} placeholder="Shipping Address" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Items Table */}
          <div style={{ marginTop: '24px' }}>
            <Card size="small" title="Purchase Order Items">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography.Text strong>Items/Services</Typography.Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1200 }}
              />
            </Card>
          </div>

          {/* Tax Section & Summary */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Card size="small" title="Tax Section">
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Subtotal (Taxable Value)</Col>
                  <Col>₹{totals.totalAmount.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Tax Amount</Col>
                  <Col>₹{totals.totalTaxAmount.toFixed(2)}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                  <Col>Total Discount</Col>
                  <Col>₹{totals.totalDiscountAmount.toFixed(2)}</Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Summary">
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Quantity</Col>
                  <Col>{totals.totalQuantity}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Amount (before tax)</Col>
                  <Col>₹{totals.totalAmount.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Tax Amount</Col>
                  <Col>₹{totals.totalTaxAmount.toFixed(2)}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                  <Col>Gross Total</Col>
                  <Col>₹{totals.grossAmount.toFixed(2)}</Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Terms & Conditions */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card size="small" title="Terms & Conditions">
                <Form.Item name="termsConditions" label="Terms & Conditions">
                  <TextArea rows={4} placeholder="Enter terms and conditions" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '80px' }} className="no-print">
        <Space size="large">
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()} 
            size="large"
            style={{ minWidth: '150px' }}
          >
            {editingOrder ? 'Update' : 'Save'} Purchase Order
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrint} 
            size="large"
            style={{ minWidth: '120px' }}
          >
            Print
          </Button>
        </Space>
      </div>
    </div>
  )
}