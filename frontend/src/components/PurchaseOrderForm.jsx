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
  const [quotations, setQuotations] = useState([])
  const [materials, setMaterials] = useState([])

  // Generate PO Number
  const generatePONumber = () => {
    const existing = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    const lastNumber = existing.length > 0 
      ? Math.max(...existing.map(po => parseInt(po.poNumber?.replace('PO-', '') || 0))) 
      : 0
    return `PO-${String(lastNumber + 1).padStart(3, '0')}`
  }

  // Load quotations and materials from localStorage
  const loadQuotations = () => {
    const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]')
    setQuotations(savedQuotations)
    const savedMaterials = JSON.parse(localStorage.getItem('materials') || '[]')
    setMaterials(savedMaterials)
  }

  // Initialize form
  useEffect(() => {
    loadQuotations()
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
        poDate: dayjs(),
        poStatus: 1,
        currencyId: 1,
        exchangeRate: 1
      })
    }
  }, [editingOrder])

  // Handle quotation selection
  const handleQuotationSelect = (quotationIds) => {
    if (!quotationIds || quotationIds.length === 0) {
      setItems([])
      form.setFieldsValue({ poType: undefined })
      return
    }
    
    const selectedQuotations = quotations.filter(q => quotationIds.includes(q.id))
    const allItems = []
    let poType = ''
    const quotationNumbers = []
    
    selectedQuotations.forEach((quotation, qIndex) => {
      quotationNumbers.push(quotation.quotationNumber)
      const quotationItems = (quotation.lineItems || []).map((item, index) => {
        const material = materials.find(m => m.itemCode === item.itemCode)
        const taxRate = item.tax || material?.tax || 18
        const taxableAmount = (item.quantity || 1) * (item.unitPrice || 0)
        const cgstPercentage = taxRate / 2
        const sgstPercentage = taxRate / 2
        const cgstAmount = taxableAmount * cgstPercentage / 100
        const sgstAmount = taxableAmount * sgstPercentage / 100
        const totalAmount = taxableAmount + cgstAmount + sgstAmount
        
        return {
          key: Date.now() + qIndex * 1000 + index,
          itemCode: item.itemCode || '',
          itemName: item.itemName || item.description || '',
          category: item.category || material?.itemCategory || '',
          partNumber: '',
          description: item.description || item.itemName || '',
          quantity: item.quantity || 1,
          rate: item.unitPrice || 0,
          hsnCode: material?.hsnCode || '',
          unitId: 1,
          discountPercentage: 0,
          discountAmount: 0,
          cgstPercentage: cgstPercentage,
          sgstPercentage: sgstPercentage,
          igstPercentage: 0,
          taxableAmount: taxableAmount,
          cgstAmount: cgstAmount,
          sgstAmount: sgstAmount,
          igstAmount: 0,
          totalAmount: totalAmount
        }
      })
      allItems.push(...quotationItems)
      if (qIndex === 0) poType = quotation.quotationType || 'project'
    })
    
    setItems(allItems)
    form.setFieldsValue({
      poType: poType,
      quotationNumberDisplay: quotationNumbers.join(', ')
    })
  }

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
        let updatedItem = { ...item, [field]: value }
        
        // Auto-fill from material master when itemCode is selected
        if (field === 'itemCode') {
          const material = materials.find(m => m.itemCode === value)
          if (material) {
            updatedItem = {
              ...updatedItem,
              itemName: material.itemName || '',
              category: material.itemCategory || '',
              hsnCode: material.hsnCode || '',
              rate: material.purchaseRate || 0,
              cgstPercentage: (material.tax || 18) / 2,
              sgstPercentage: (material.tax || 18) / 2
            }
          }
        }
        
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
      title: 'Item Code',
      dataIndex: 'itemCode',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'itemName', e.target.value)}
          placeholder="Item Name"
        />
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'category', e.target.value)}
          placeholder="Category"
        />
      )
    },
    {
      title: 'Part Number (P/N)',
      dataIndex: 'partNumber',
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'partNumber', e.target.value)}
          placeholder="P/N"
        />
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
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
      const selectedQuotations = quotations.filter(q => (values.quotationNumber || []).includes(q.id))
      const quotationNumbers = selectedQuotations.map(q => q.quotationNumber).join(', ')
      
      const orderData = {
        ...values,
        quotationNumber: quotationNumbers,
        items,
        ...totals,
        poDate: values.poDate?.format('YYYY-MM-DD'),
        deliveryDate: values.deliveryDate?.format('YYYY-MM-DD'),
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
          <Card size="small" title="Order Details" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="poNumber" label="PO Number">
                  <Input disabled placeholder="Auto-generated" />
                </Form.Item>
                <Form.Item name="quotationNumber" label="Quotation Number">
                  <Select 
                    mode="multiple"
                    placeholder="Select Quotations" 
                    onChange={handleQuotationSelect}
                    showSearch
                    optionFilterProp="children"
                  >
                    {quotations.map(q => (
                      <Option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.projectName || 'N/A'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="workOrderNumber" label="Work Order Number">
                  <Input placeholder="Enter work order number" />
                </Form.Item>
                <Form.Item name="poType" label="PO Type" rules={[{ required: true }]}>
                  <Select placeholder="Select PO Type">
                    <Option value="project">Project</Option>
                    <Option value="trade">Trade</Option>
                    <Option value="shift">Shift</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
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
              </Col>
            </Row>
          </Card>

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
          {/* <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card size="small" title="Terms & Conditions">
                <Form.Item name="termsConditions" label="Terms & Conditions">
                  <TextArea rows={4} placeholder="Enter terms and conditions" />
                </Form.Item>
              </Card>
            </Col>
          </Row> */}
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