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

const { TextArea } = Input
const { Title, Text } = Typography
const { Option } = Select

const SalesInvoiceForm = ({ onInvoiceSaved }) => {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [invoices, setInvoices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalQuantity: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
    totalTax: 0,
    grandTotal: 0
  })

  // Auto-generate Invoice Number
  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV${year}${month}${random}`
  }

  // Initialize form and load invoices
  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('salesInvoices') || '[]')
    setInvoices(savedInvoices)
    
    form.setFieldsValue({
      invoiceNo: generateInvoiceNumber(),
      date: dayjs(),
      supplierName: 'SMARTEDGE AUTOMATION',
      supplierAddress: '#389, 3rd Main Road, 2nd Stage, K.H.B Colony, Basaveshwaranagar, Bangalore - 560079',
      supplierGSTIN: '29ABHFS7657M1Z7',
      supplierState: 'Karnataka',
      supplierCode: '29',
      supplierContact: 'smartedgeautomation@gmail.com, 080 23285927',
      declaration: 'Invoice shows actual price and particulars are true',
      authorizedSignatory: 'GAIKWAD',
      accountHolderName: 'SMARTEDGE AUTOMATION'
    })
  }, [])

  // Add item
  const addItem = () => {
    setItems([...items, {
      key: Date.now(),
      description: '',
      hsnSac: '',
      qty: 1,
      unit: 'Nos',
      rate: 0,
      amount: 0
    }])
  }

  // Remove item
  const removeItem = (key) => {
    setItems(items.filter(item => item.key !== key))
  }

  // Update item
  const updateItem = (key, field, value) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value }
        if (field === 'qty' || field === 'rate') {
          updated.amount = updated.qty * updated.rate
        }
        return updated
      }
      return item
    }))
  }

  // Calculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const totalQuantity = items.reduce((sum, item) => sum + (item.qty || 0), 0)
    
    const buyerGSTIN = form.getFieldValue('buyerGSTIN')
    const isInterState = buyerGSTIN && !buyerGSTIN.startsWith('29')
    
    const sgst = isInterState ? 0 : subtotal * 0.09
    const cgst = isInterState ? 0 : subtotal * 0.09
    const igst = isInterState ? subtotal * 0.18 : 0
    const totalTax = sgst + cgst + igst
    const grandTotal = subtotal + totalTax

    setTotals({ subtotal, totalQuantity, sgst, cgst, igst, totalTax, grandTotal })
  }, [items, form])

  // Number to words
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
      if (n > 0) result += ones[n] + ' '
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
      title: 'Unit (per)',
      dataIndex: 'unit',
      width: 80,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'unit', value)}
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
      dataIndex: 'amount',
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
      const invoiceData = { ...values, items, totals, createdAt: new Date().toISOString() }
      const existing = JSON.parse(localStorage.getItem('salesInvoices') || '[]')
      const newInvoice = { id: Date.now(), ...invoiceData }
      existing.push(newInvoice)
      localStorage.setItem('salesInvoices', JSON.stringify(existing))
      setInvoices(existing)
      setShowForm(false)
      form.resetFields()
      setItems([])
      message.success('Sales Invoice saved successfully!')
      onInvoiceSaved && onInvoiceSaved()
    } catch (error) {
      message.error('Failed to save Sales Invoice')
    }
  }

  const invoiceColumns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNo',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text || 'N/A'}</strong>
    },
    {
      title: 'Buyer Name',
      dataIndex: 'buyerName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Grand Total',
      dataIndex: ['totals', 'grandTotal'],
      render: (val) => <strong>₹{val?.toFixed(2) || '0.00'}</strong>
    },
    {
      title: 'Items',
      dataIndex: 'items',
      render: (items) => `${items?.length || 0} items`
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
    }
  ]

  if (!showForm) {
    return (
      <div>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={3}>Sales Invoice Management</Title>
            <Button type="primary" onClick={() => setShowForm(true)}>
              Create New Invoice
            </Button>
          </div>
          <Table
            columns={invoiceColumns}
            dataSource={invoices}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Card style={{ marginBottom: '16px' }}>
        <Button type="default" onClick={() => setShowForm(false)} style={{ marginBottom: '8px' }}>
          ← Back to Invoice List
        </Button>
      </Card>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: '0', color: '#333' }}>TAX INVOICE</Title>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Header Section */}
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Invoice Details">
                <Form.Item name="invoiceNo" label="Invoice No. (auto-generated)">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="eWayBillNo" label="e-Way Bill No. (optional)">
                  <Input placeholder="e-Way Bill Number" />
                </Form.Item>
                <Form.Item name="deliveryNote" label="Delivery Note">
                  <Input placeholder="Delivery Note" />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Reference Details">
                <Form.Item name="modeTermsPayment" label="Mode/Terms of Payment">
                  <Input placeholder="Payment terms" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="referenceNo" label="Reference No.">
                      <Input placeholder="Reference No." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="referenceDate" label="Date">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="otherReferences" label="Other References">
                  <Input placeholder="Other references" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="buyerOrderNo" label="Buyer's Order No.">
                      <Input placeholder="Order No." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="buyerOrderDate" label="Date">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="dispatchDocNo" label="Dispatch Document No.">
                      <Input placeholder="Document No." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="dispatchDocDate" label="Date">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="dispatchedThrough" label="Dispatched Through">
                  <Input placeholder="Dispatch method" />
                </Form.Item>
                <Form.Item name="destination" label="Destination">
                  <Input placeholder="Destination" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Parties Information */}
          <Row gutter={24} style={{ marginTop: '16px' }}>
            <Col span={8}>
              <Card size="small" title="Supplier (From)">
                <Form.Item name="supplierName" label="Company Name">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="supplierAddress" label="Address">
                  <TextArea rows={3} disabled />
                </Form.Item>
                <Form.Item name="supplierGSTIN" label="GSTIN/UIN">
                  <Input disabled />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="supplierState" label="State">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="supplierCode" label="Code">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="supplierContact" label="Contact Email/Phone">
                  <Input disabled />
                </Form.Item>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Consignee (Ship To)">
                <Form.Item name="consigneeName" label="Company Name" rules={[{ required: true }]}>
                  <Input placeholder="Consignee name" />
                </Form.Item>
                <Form.Item name="consigneeAddress" label="Address" rules={[{ required: true }]}>
                  <TextArea rows={3} placeholder="Consignee address" />
                </Form.Item>
                <Form.Item name="consigneeGSTIN" label="GSTIN/UIN">
                  <Input placeholder="Consignee GSTIN" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="consigneeState" label="State">
                      <Input placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="consigneeCode" label="Code">
                      <Input placeholder="Code" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Buyer (Bill To)">
                <Form.Item name="buyerName" label="Company Name" rules={[{ required: true }]}>
                  <Input placeholder="Buyer name" />
                </Form.Item>
                <Form.Item name="buyerAddress" label="Address" rules={[{ required: true }]}>
                  <TextArea rows={3} placeholder="Buyer address" />
                </Form.Item>
                <Form.Item name="buyerGSTIN" label="GSTIN/UIN">
                  <Input placeholder="Buyer GSTIN" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="buyerState" label="State">
                      <Input placeholder="State" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="buyerCode" label="Code">
                      <Input placeholder="Code" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Invoice Table */}
          <div style={{ marginTop: '24px' }}>
            <Card size="small" title="Invoice Table (Item/Service Details)">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Text strong>Items/Services</Text>
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
                  <Col>₹{totals.subtotal.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>SGST (9%)</Col>
                  <Col>₹{totals.sgst.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>CGST (9%)</Col>
                  <Col>₹{totals.cgst.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>IGST (18%)</Col>
                  <Col>₹{totals.igst.toFixed(2)}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                  <Col>Total Tax Amount</Col>
                  <Col>₹{totals.totalTax.toFixed(2)}</Col>
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
                  <Col>₹{totals.subtotal.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Tax Amount</Col>
                  <Col>₹{totals.totalTax.toFixed(2)}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                  <Col>Grand Total (with tax)</Col>
                  <Col>₹{totals.grandTotal.toFixed(2)}</Col>
                </Row>
                <div style={{ marginTop: '12px' }}>
                  <strong>Amount in Words:</strong><br />
                  {numberToWords(Math.round(totals.grandTotal))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Footer Section & Bank Details */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Card size="small" title="Footer Section">
                <Form.Item name="termsOfDelivery" label="Terms of Delivery">
                  <TextArea rows={2} placeholder="Delivery terms" />
                </Form.Item>
                <Form.Item name="declaration" label="Declaration">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="customerSealSignature" label="Customer's Seal & Signature">
                  <TextArea rows={2} placeholder="Customer signature space" />
                </Form.Item>
                <Form.Item name="authorizedSignatory" label="Authorized Signatory">
                  <Input />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Bank Details (Optional)">
                <Form.Item name="accountHolderName" label="Account Holder's Name">
                  <Input />
                </Form.Item>
                <Form.Item name="bankName" label="Bank Name">
                  <Input placeholder="Bank name" />
                </Form.Item>
                <Form.Item name="accountNo" label="Account No.">
                  <Input placeholder="Account number" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="branch" label="Branch">
                      <Input placeholder="Branch" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="ifscCode" label="IFSC Code">
                      <Input placeholder="IFSC Code" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="swiftCode" label="SWIFT Code (if required)">
                  <Input placeholder="SWIFT Code" />
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
            Save Invoice
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={() => window.print()} 
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

export default SalesInvoiceForm