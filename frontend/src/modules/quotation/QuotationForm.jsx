import React, { useState } from 'react'
import { Form, Input, DatePicker, Select, Button, Card, Table, InputNumber, Space, Divider, Row, Col, message, Typography, Upload } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined, ArrowLeftOutlined, UploadOutlined, FileExcelOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

export default function QuotationForm({ initialValues, onSubmit, onCancel }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  
  const editData = location.state?.quotation || initialValues
  const [lineItems, setLineItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [gstAmount, setGstAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [quotationNumber, setQuotationNumber] = useState('')

  const gstRate = 18

  // Generate quotation number
  const generateQuotationNumber = () => {
    const existing = JSON.parse(localStorage.getItem('quotations') || '[]')
    const lastNumber = existing.length > 0 
      ? Math.max(...existing.map(q => parseInt(q.quotationNumber?.split('-')[1] || 0))) 
      : 0
    return `QUO-${String(lastNumber + 1).padStart(3, '0')}`
  }

  // Initialize quotation number on component mount
  React.useEffect(() => {
    if (!editData?.quotationNumber) {
      const newQuotationNumber = generateQuotationNumber()
      setQuotationNumber(newQuotationNumber)
      form.setFieldsValue({ quotationNumber: newQuotationNumber })
    } else {
      setQuotationNumber(editData.quotationNumber)
    }
  }, [editData, form])

  const addLineItem = () => {
    const newItem = {
      key: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (key) => {
    const updatedItems = lineItems.filter(item => item.key !== key)
    setLineItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const updateLineItem = (key, field, value) => {
    const updatedItems = lineItems.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    })
    setLineItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items) => {
    const sub = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const gst = (sub * gstRate) / 100
    const total = sub + gst
    
    setSubtotal(sub)
    setGstAmount(gst)
    setTotalAmount(total)
  }

  const handleExcelUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Skip header row and process data
        const items = jsonData.slice(1).filter(row => row.length > 0).map((row, index) => ({
          key: Date.now() + index,
          description: row[0] || '',
          quantity: parseFloat(row[1]) || 1,
          unitPrice: parseFloat(row[2]) || 0,
          amount: (parseFloat(row[1]) || 1) * (parseFloat(row[2]) || 0)
        }))
        
        setLineItems(items)
        calculateTotals(items)
        message.success(`${items.length} items imported from Excel`)
      } catch (error) {
        message.error('Failed to parse Excel file. Please check the format.')
      }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  const handleSubmit = async (values) => {
    try {
      const quotationData = {
        ...values,
        lineItems,
        subtotal,
        gstAmount,
        totalAmount,
        quotationNumber: quotationNumber,
        quotationId: editData?.quotationId || quotationNumber,
        createdDate: dayjs().format('YYYY-MM-DD')
      }
      
      if (onSubmit) {
        onSubmit(quotationData)
      } else {
        // Save to localStorage for demo
        const existing = JSON.parse(localStorage.getItem('quotations') || '[]')
        
        if (editData?.id) {
          // Update existing quotation
          const updated = existing.map(q => 
            q.id === editData.id ? { ...quotationData, id: editData.id } : q
          )
          localStorage.setItem('quotations', JSON.stringify(updated))
          message.success('Quotation updated successfully!')
        } else {
          // Create new quotation
          const newQuotation = { id: Date.now(), ...quotationData }
          existing.push(newQuotation)
          localStorage.setItem('quotations', JSON.stringify(existing))
          message.success('Quotation created successfully!')
        }
        
        navigate('/quotations')
      }
    } catch (error) {
      message.error('Failed to save quotation')
    }
  }

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateLineItem(record.key, 'description', e.target.value)}
          placeholder="Item description"
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateLineItem(record.key, 'quantity', value)}
          min={1}
        />
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      width: 150,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateLineItem(record.key, 'unitPrice', value)}
          min={0}
          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/₹\s?|(,*)/g, '')}
        />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 150,
      render: (text) => `₹ ${text?.toLocaleString() || 0}`
    },
    {
      title: 'Action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeLineItem(record.key)}
        />
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/quotations')}
              style={{ marginRight: '8px' }}
            />
            <Title level={3} style={{ margin: '0', color: '#333' }}>
              {editData ? 'Edit Quotation' : 'Create Quotation'}
            </Title>
          </div>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            validityDays: 30,
            gstRate: 18,
            quotationNumber: quotationNumber,
            ...editData,
            quotationDate: editData?.date ? dayjs(editData.date) : dayjs()
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Quotation Number"
                name="quotationNumber"
                rules={[{ required: true, message: 'Quotation number is required' }]}
              >
                <Input 
                  placeholder="Auto-generated" 
                  disabled
                  value={quotationNumber}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Quotation Date"
                name="quotationDate"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Valid Until (Days)"
                name="validityDays"
                rules={[{ required: true, message: 'Please enter validity period' }]}
              >
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Customer"
                name="customerId"
                rules={[{ required: true, message: 'Please select customer' }]}
              >
                <Select placeholder="Select customer">
                  <Option value="1">ABC Industries</Option>
                  <Option value="2">XYZ Corporation</Option>
                  <Option value="3">Tech Solutions Ltd</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Project Name"
                name="projectName"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="Project name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Status"
                name="status"
                initialValue="Draft"
              >
                <Select>
                  <Option value="Draft">Draft</Option>
                  <Option value="Sent">Sent</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Expired">Expired</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Quotation description" />
          </Form.Item>

          <Divider>Line Items</Divider>
          
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Button
                type="dashed"
                onClick={addLineItem}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Add Line Item
              </Button>
            </Col>
            <Col span={12}>
              <Upload
                beforeUpload={handleExcelUpload}
                accept=".xlsx,.xls"
                showUploadList={false}
              >
                <Button
                  type="dashed"
                  icon={<FileExcelOutlined />}
                  style={{ width: '100%' }}
                >
                  Upload Costing Sheet (Excel)
                </Button>
              </Upload>
            </Col>
          </Row>
          
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
            Excel format: Column A - Description, Column B - Quantity, Column C - Unit Price
          </div>

          <Table
            columns={columns}
            dataSource={lineItems}
            pagination={false}
            size="small"
            style={{ marginBottom: '24px' }}
          />

          <Row justify="end">
            <Col span={8}>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal:</span>
                  <span>₹ {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>GST ({gstRate}%):</span>
                  <span>₹ {gstAmount.toLocaleString()}</span>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                  <span>Total Amount:</span>
                  <span>₹ {totalAmount.toLocaleString()}</span>
                </div>
              </Card>
            </Col>
          </Row>

          <Form.Item
            label="Terms & Conditions"
            name="termsConditions"
            style={{ marginTop: '24px' }}
          >
            <TextArea
              rows={4}
              placeholder="Enter terms and conditions"
              defaultValue="1. Prices are valid for 30 days from quotation date.
2. Payment terms: 50% advance, 50% on delivery.
3. Delivery time: 15-20 working days from order confirmation.
4. GST extra as applicable."
            />
          </Form.Item>

        </Form>
      </Card>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '80px' }}>
        <Space size="large">
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()} 
            size="large"
            style={{ minWidth: '150px' }}
          >
            Save Quotation
          </Button>
          {onCancel && (
            <Button 
              onClick={onCancel}
              size="large"
              style={{ minWidth: '120px' }}
            >
              Cancel
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}