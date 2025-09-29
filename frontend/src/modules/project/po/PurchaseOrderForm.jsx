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
  Divider,
  message
} from 'antd'
import { PlusOutlined, DeleteOutlined, PrinterOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import styles from './PurchaseOrder.module.css'

const { TextArea } = Input
const { Title, Text } = Typography
const { Option } = Select

const PurchaseOrderForm = ({ onOrderSaved }) => {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [totals, setTotals] = useState({
    subtotal: 0,
    packingCharges: 0,
    freightCharges: 0,
    taxableAmount: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
    grandTotal: 0,
    roundedOffTotal: 0
  })
  
  // Auto-generate PO Number
  const generatePONumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PO${year}${month}${random}`
  }
  
  // Initialize form with auto-filled data
  useEffect(() => {
    form.setFieldsValue({
      poNumber: generatePONumber(),
      date: dayjs(),
      companyName: 'SMARTEDGE AUTOMATION',
      companyAddress: '#389, 3rd Main Road, 2nd Stage, K.H.B Colony, Basaveshwaranagar, Bangalore - 560079',
      gstin: '29ABHFS7657M1Z7',
      pan: 'ABHFS7657M',
      contactPerson: 'GAIKWAD',
      contactNumber: '080 23285927'
    })
  }, [])

  // Add new item row
  const addItem = () => {
    const newItem = {
      key: Date.now(),
      no: items.length + 1,
      description: '',
      type: 'Material',
      hsnSac: '',
      make: '',
      qty: 1,
      unit: 'Nos',
      ratePerUnit: 0,
      amount: 0,
      discount: 0,
      total: 0
    }
    setItems([...items, newItem])
  }

  // Remove item
  const removeItem = (key) => {
    const newItems = items.filter(item => item.key !== key)
    setItems(newItems)
  }

  // Update item
  const updateItem = (key, field, value) => {
    const newItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value }
        
        // Calculate amount and total
        if (field === 'qty' || field === 'ratePerUnit') {
          updatedItem.amount = updatedItem.qty * updatedItem.ratePerUnit
          updatedItem.total = updatedItem.amount - (updatedItem.amount * updatedItem.discount / 100)
        }
        
        if (field === 'discount') {
          updatedItem.total = updatedItem.amount - (updatedItem.amount * value / 100)
        }
        
        return updatedItem
      }
      return item
    })
    setItems(newItems)
  }

  // Calculate totals with auto tax application
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const packingCharges = form.getFieldValue('packingCharges') || 0
    const freightCharges = form.getFieldValue('freightCharges') || 0
    const taxableAmount = subtotal + packingCharges + freightCharges
    
    // Auto-apply GST based on supplier location (simplified logic)
    const supplierGSTIN = form.getFieldValue('supplierGSTIN')
    const isInterState = supplierGSTIN && !supplierGSTIN.startsWith('29') // Karnataka GSTIN starts with 29
    
    const sgst = isInterState ? 0 : taxableAmount * 0.09
    const cgst = isInterState ? 0 : taxableAmount * 0.09
    const igst = isInterState ? taxableAmount * 0.18 : 0
    
    const grandTotal = taxableAmount + sgst + cgst + igst
    const roundedOffTotal = Math.round(grandTotal)

    setTotals({
      subtotal,
      packingCharges,
      freightCharges,
      taxableAmount,
      sgst,
      cgst,
      igst,
      grandTotal,
      roundedOffTotal
    })
  }, [items, form])

  // Convert number to words
  const numberToWords = (num) => {
    if (num === 0) return 'Zero Rupees Only'
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    const convertHundreds = (n) => {
      let result = ''
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred '
        n %= 100
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' '
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + ' '
        return result
      }
      if (n > 0) {
        result += ones[n] + ' '
      }
      return result
    }
    
    const crores = Math.floor(num / 10000000)
    const lakhs = Math.floor((num % 10000000) / 100000)
    const thousands = Math.floor((num % 100000) / 1000)
    const hundreds = num % 1000
    
    let result = ''
    if (crores > 0) result += convertHundreds(crores) + 'Crore '
    if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh '
    if (thousands > 0) result += convertHundreds(thousands) + 'Thousand '
    if (hundreds > 0) result += convertHundreds(hundreds)
    
    return result.trim() + ' Rupees Only'
  }

  // Table columns
  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      width: 200,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'description', e.target.value)}
          placeholder="Item description"
        />
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 100,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'type', value)}
          style={{ width: '100%' }}
        >
          <Option value="Material">Material</Option>
          <Option value="Service">Service</Option>
        </Select>
      )
    },
    {
      title: 'HSN/SAC Code',
      dataIndex: 'hsnSac',
      width: 100,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'hsnSac', e.target.value)}
          placeholder="HSN/SAC"
        />
      )
    },
    {
      title: 'Make/Brand',
      dataIndex: 'make',
      width: 100,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'make', e.target.value)}
          placeholder="Make/Brand"
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'qty', value || 0)}
          min={0}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      width: 80,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'unit', value)}
          placeholder="Unit"
          style={{ width: '100%' }}
        >
          <Option value="Nos">Nos</Option>
          <Option value="Kg">Kg</Option>
          <Option value="Mtr">Mtr</Option>
          <Option value="Ltr">Ltr</Option>
          <Option value="Set">Set</Option>
        </Select>
      )
    },
    {
      title: 'Rate per Unit (INR)',
      dataIndex: 'ratePerUnit',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'ratePerUnit', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Amount (INR)',
      dataIndex: 'amount',
      width: 120,
      render: (text) => `₹${(text || 0).toFixed(2)}`
    },
    {
      title: 'Discount %',
      dataIndex: 'discount',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'discount', value || 0)}
          min={0}
          max={100}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Total (Rs.)',
      dataIndex: 'total',
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
        totals,
        createdAt: new Date().toISOString()
      }
      
      const existingOrders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
      const newOrder = { id: Date.now(), ...orderData }
      existingOrders.push(newOrder)
      localStorage.setItem('purchaseOrders', JSON.stringify(existingOrders))
      
      message.success('Purchase Order saved successfully!')
      onOrderSaved && onOrderSaved()
    } catch (error) {
      message.error('Failed to save Purchase Order')
    }
  }

  const handlePrint = () => {
    const printContent = document.querySelector('.print-only-content')
    const originalContent = document.body.innerHTML
    
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  return (
    <div>
      <Card className="print-only-content">
        {/* Header */}
        <div className={`${styles.companyHeader} print-header`}>
          {/* <Title level={2} className={styles.companyTitle}>SMARTEDGE AUTOMATION</Title>
          <Text className={styles.companySubtitle}>Industrial Automation and CNC Services</Text>
          <br /> */}
          <Title level={4} style={{ fontWeight: 'bold', margin: '1px 0', color: '#333' }}>PURCHASE ORDER</Title>
        </div>
      <br></br>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* 1. Header Information */}
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Company Name & Logo (Auto-filled from ERP)">
                <Form.Item name="companyName" label="Company Name">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="companyAddress" label="Address">
                  <TextArea rows={3} disabled />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="gstin" label="GSTIN">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="pan" label="PAN">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="contactPerson" label="Contact Person">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="contactNumber" label="Contact Number">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Purchase Order Details">
                <Form.Item name="poNumber" label="PO Number (Auto-generated)" rules={[{ required: true }]}>
                  <Input disabled />
                </Form.Item>
                <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="referenceNo" label="Reference No. / Work Order No. (optional)">
                  <Input placeholder="Reference/Work Order Number" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* 2. Supplier Details */}
          <Row gutter={24} style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Card size="small" title="Supplier Details">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true }]}>
                      <Input placeholder="Supplier name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="supplierGSTIN" label="GSTIN (if applicable)">
                      <Input placeholder="Supplier GSTIN" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="supplierAddress" label="Address" rules={[{ required: true }]}>
                  <TextArea rows={3} placeholder="Complete supplier address" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="supplierContactPerson" label="Contact Person">
                      <Input placeholder="Contact person name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="supplierContactDetails" label="Contact Details">
                      <Input placeholder="Phone/Email" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* 3. Item / Order Details */}
          <div style={{ marginTop: '24px' }}>
            <Card size="small" title="Item / Order Details">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Text strong>Order Items</Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
                  Add Item
                </Button>
              </div>
              
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1400 }}
                className="print-table"
              />
            </Card>
          </div>

          {/* 4. Tax & Charges Summary */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Card size="small" title="Tax & Charges Summary">
                <div className={`${styles.totalsSection} print-totals`}>
                  <Row justify="space-between" className={styles.totalRow}>
                    <Col><strong>Subtotal / Taxable Amount</strong></Col>
                    <Col><strong>₹{totals.subtotal.toFixed(2)}</strong></Col>
                  </Row>
                  <Form.Item name="packingCharges" label="Packing Charges (if any)">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="0.00" 
                      onChange={() => form.submit()} 
                    />
                  </Form.Item>
                  <Form.Item name="freightCharges" label="Freight Charges (if any)">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="0.00" 
                      onChange={() => form.submit()} 
                    />
                  </Form.Item>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify="space-between" className={styles.totalRow}>
                    <Col>SGST (9%)</Col>
                    <Col>₹{totals.sgst.toFixed(2)}</Col>
                  </Row>
                  <Row justify="space-between" className={styles.totalRow}>
                    <Col>CGST (9%)</Col>
                    <Col>₹{totals.cgst.toFixed(2)}</Col>
                  </Row>
                  <Row justify="space-between" className={styles.totalRow}>
                    <Col>IGST (18%)</Col>
                    <Col>₹{totals.igst.toFixed(2)}</Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify="space-between" className={styles.grandTotalRow}>
                    <Col>Grand Total</Col>
                    <Col>₹{totals.grandTotal.toFixed(2)}</Col>
                  </Row>
                  <Row justify="space-between" className={styles.totalRow}>
                    <Col>Rounded Off Total</Col>
                    <Col>₹{totals.roundedOffTotal.toFixed(2)}</Col>
                  </Row>
                  <div className={styles.rupeesInWords} style={{ marginTop: '12px' }}>
                    <strong>Amount in Words:</strong><br />
                    {numberToWords(totals.roundedOffTotal)}
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Terms & Payment Section">
                <Form.Item name="termsConditions" label="Terms & Conditions">
                  <TextArea rows={2} placeholder="Terms and conditions" />
                </Form.Item>
                <Form.Item name="paymentTerms" label="Payment Terms">
                  <TextArea rows={2} placeholder="Payment terms" />
                </Form.Item>
                <Form.Item name="advance" label="Advance (if any)">
                  <InputNumber style={{ width: '100%' }} placeholder="0.00" />
                </Form.Item>
                <Form.Item name="chequeTransactionRef" label="Cheque/Transaction Ref. (optional)">
                  <Input placeholder="Reference number" />
                </Form.Item>
                <Form.Item name="deliveryDetails" label="Delivery Details">
                  <TextArea rows={2} placeholder="Delivery details" />
                </Form.Item>
                <Form.Item name="taxesApplicability" label="Taxes applicability" initialValue="System auto-applies based on GST rules">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="remarks" label="Remarks">
                  <TextArea rows={2} placeholder="Additional remarks" />
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
            Save Purchase Order
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

export default PurchaseOrderForm