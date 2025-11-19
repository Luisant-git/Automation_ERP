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
  Typography,
  Space,
  message,
  Modal
} from 'antd'
import { PlusOutlined, DeleteOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Title } = Typography
const { Option } = Select

const PurchaseOrderForm = ({ onOrderSaved, editingOrder }) => {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [isItemModalVisible, setIsItemModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm] = Form.useForm()
  const [totals, setTotals] = useState({
    totalQuantity: 0,
    totalAmount: 0,
    totalTaxAmount: 0,
    totalDiscountAmount: 0,
    grossAmount: 0
  })
  
  // Auto-generate PO Number
  const generatePONumber = () => {
    const existing = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    const lastNumber = existing.length > 0 
      ? Math.max(...existing.map(po => parseInt(po.poNumber?.replace('PO-', '') || 0))) 
      : 0
    return `PO-${String(lastNumber + 1).padStart(3, '0')}`
  }

  // Auto-generate Quotation Number
  const generateQuotationNumber = () => {
    const existing = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    const lastNumber = existing.length > 0 
      ? Math.max(...existing.map(po => parseInt(po.quotationNumber?.split('-')[1] || 0))) 
      : 0
    return `QUO-${String(lastNumber + 1).padStart(3, '0')}`
  }
  
  // Initialize form with data
  useEffect(() => {
    if (editingOrder) {
      form.setFieldsValue({
        ...editingOrder,
        poDate: editingOrder.poDate ? dayjs(editingOrder.poDate) : dayjs(),
        deliveryDate: editingOrder.deliveryDate ? dayjs(editingOrder.deliveryDate) : null
      })
      setItems(editingOrder.items || [])
    } else {
      form.setFieldsValue({
        poNumber: generatePONumber(),
        quotationNumber: generateQuotationNumber(),
        poDate: dayjs(),
        poStatus: 1, // Draft
        currencyId: 1, // INR
        exchangeRate: 1
      })
    }
  }, [editingOrder])

  // Add/Edit item functions
  const handleAddItem = () => {
    setEditingItem(null)
    itemForm.resetFields()
    setIsItemModalVisible(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    itemForm.setFieldsValue(item)
    setIsItemModalVisible(true)
  }

  const handleItemSubmit = (values) => {
    const taxableAmount = (values.quantity * values.rate) - (values.discountAmount || 0)
    const cgstAmount = taxableAmount * (values.cgstPercentage || 0) / 100
    const sgstAmount = taxableAmount * (values.sgstPercentage || 0) / 100
    const igstAmount = taxableAmount * (values.igstPercentage || 0) / 100
    const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount

    const newItem = {
      ...values,
      key: editingItem ? editingItem.key : Date.now(),
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount
    }

    if (editingItem) {
      setItems(items.map(item => item.key === editingItem.key ? newItem : item))
    } else {
      setItems([...items, newItem])
    }

    setIsItemModalVisible(false)
    itemForm.resetFields()
    setEditingItem(null)
  }

  // Remove item
  const removeItem = (key) => {
    setItems(items.filter(item => item.key !== key))
  }

  // Calculate totals
  useEffect(() => {
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const totalAmount = items.reduce((sum, item) => sum + (item.taxableAmount || 0), 0)
    const totalTaxAmount = items.reduce((sum, item) => sum + (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0), 0)
    const totalDiscountAmount = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
    const grossAmount = totalAmount + totalTaxAmount

    setTotals({
      totalQuantity,
      totalAmount,
      totalTaxAmount,
      totalDiscountAmount,
      grossAmount
    })
  }, [items])

  // Status options
  const statusOptions = [
    { value: 1, label: 'Draft' },
    { value: 2, label: 'Submitted' },
    { value: 3, label: 'Approved' },
    { value: 4, label: 'Rejected' },
    { value: 5, label: 'Cancelled' }
  ]

  const paymentTermsOptions = [
    { value: 1, label: 'Net 30' },
    { value: 2, label: 'Net 15' },
    { value: 3, label: 'Immediate' },
    { value: 4, label: 'COD' }
  ]

  const deliveryTermsOptions = [
    { value: 1, label: 'FOB' },
    { value: 2, label: 'CIF' },
    { value: 3, label: 'Ex-Works' },
    { value: 4, label: 'DDP' }
  ]

  // Table columns for Purchase Order Details
  const columns = [
    {
      title: 'S.No',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsnCode',
      width: 100
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 80,
      render: (text) => text?.toFixed(3)
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: 80
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      width: 100,
      render: (text) => `₹${text?.toFixed(2)}`
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      width: 100,
      render: (text) => `₹${text?.toFixed(2)}`
    },
    {
      title: 'Taxable Amount',
      dataIndex: 'taxableAmount',
      width: 120,
      render: (text) => `₹${text?.toFixed(2)}`
    },
    {
      title: 'GST',
      width: 120,
      render: (_, record) => {
        const gst = (record.cgstAmount || 0) + (record.sgstAmount || 0) + (record.igstAmount || 0)
        return `₹${gst.toFixed(2)}`
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      width: 120,
      render: (text) => `₹${text?.toFixed(2)}`
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeItem(record.key)}
            size="small"
          />
        </Space>
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
        createdDate: new Date().toISOString(),
        createdBy: 1, // Current user ID
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
        <Title level={4} style={{ fontWeight: 'bold', margin: '1px 0', color: '#333' }}>
          {editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </Title>
        
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Purchase Order Header */}
          <Card title="Purchase Order Details" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="poNumber" label="PO Number" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="quotationNumber" label="Quotation Number" rules={[{ required: true }]}>
                  <Input disabled placeholder="Auto-generated" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="poDate" label="PO Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="supplierId" label="Supplier" rules={[{ required: true }]}>
                  <Select placeholder="Select Supplier">
                    <Option value={1}>Supplier 1</Option>
                    <Option value={2}>Supplier 2</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="paymentTermsId" label="Payment Terms">
                  <Select placeholder="Select Payment Terms">
                    {paymentTermsOptions.map(term => (
                      <Option key={term.value} value={term.value}>{term.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="deliveryTermsId" label="Delivery Terms">
                  <Select placeholder="Select Delivery Terms">
                    {deliveryTermsOptions.map(term => (
                      <Option key={term.value} value={term.value}>{term.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="deliveryDate" label="Delivery Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="deliveryAddress" label="Delivery Address">
                  <TextArea rows={2} placeholder="Delivery Address" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="billingAddress" label="Billing Address">
                  <TextArea rows={2} placeholder="Billing Address" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="shippingAddress" label="Shipping Address">
                  <TextArea rows={2} placeholder="Shipping Address" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="termsConditions" label="Terms & Conditions">
                  <TextArea rows={3} placeholder="Terms & Conditions" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="exchangeRate" label="Exchange Rate" initialValue={1}>
                  <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="poStatus" label="Status" initialValue={1}>
                  <Select>
                    {statusOptions.map(status => (
                      <Option key={status.value} value={status.value}>{status.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Purchase Order Items */}
          <Card title="Purchase Order Items" size="small" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
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

          {/* Amount Summary */}
          <Card title="Amount Summary" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <div><strong>Total Quantity:</strong> {totals.totalQuantity.toFixed(3)}</div>
              </Col>
              <Col span={6}>
                <div><strong>Total Amount:</strong> ₹{totals.totalAmount.toFixed(2)}</div>
              </Col>
              <Col span={6}>
                <div><strong>Total Tax:</strong> ₹{totals.totalTaxAmount.toFixed(2)}</div>
              </Col>
              <Col span={6}>
                <div><strong>Gross Amount:</strong> ₹{totals.grossAmount.toFixed(2)}</div>
              </Col>
            </Row>
          </Card>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => onOrderSaved && onOrderSaved()}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingOrder ? 'Update' : 'Save'} Purchase Order
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                Print
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* Item Modal */}
      <Modal
        title={editingItem ? 'Edit Item' : 'Add Item'}
        open={isItemModalVisible}
        onCancel={() => {
          setIsItemModalVisible(false)
          setEditingItem(null)
          itemForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form form={itemForm} layout="vertical" onFinish={handleItemSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="itemId" label="Item" rules={[{ required: true }]}>
                <Select placeholder="Select Item">
                  <Option value={1}>Item 1</Option>
                  <Option value={2}>Item 2</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hsnCode" label="HSN Code">
                <Input placeholder="HSN Code" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={2} placeholder="Item Description" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unitId" label="Unit" rules={[{ required: true }]}>
                <Select placeholder="Select Unit">
                  <Option value={1}>Nos</Option>
                  <Option value={2}>Kg</Option>
                  <Option value={3}>Mtr</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rate" label="Rate" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="discountPercentage" label="Discount %">
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discountAmount" label="Discount Amount">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expectedDeliveryDate" label="Expected Delivery">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="cgstPercentage" label="CGST %">
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sgstPercentage" label="SGST %">
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="igstPercentage" label="IGST %">
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsItemModalVisible(false)
                setEditingItem(null)
                itemForm.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default PurchaseOrderForm