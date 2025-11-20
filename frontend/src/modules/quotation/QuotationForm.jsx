import React, { useState } from 'react'
import { Form, Input, DatePicker, Select, Button, Card, Table, InputNumber, Space, Divider, Row, Col, message, Typography, Upload } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined, ArrowLeftOutlined, UploadOutlined, FileExcelOutlined, CloseCircleOutlined } from '@ant-design/icons'
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
  const [baseNumber, setBaseNumber] = useState('')
  const [version, setVersion] = useState(1)
  const [excelFile, setExcelFile] = useState(null)
  const [customers, setCustomers] = useState([])
  const [materials, setMaterials] = useState([])

  const gstRate = 18

  // Generate base quotation number
  const generateBaseNumber = () => {
    const existing = JSON.parse(localStorage.getItem('quotations') || '[]')
    const baseNumbers = existing.map(q => parseInt(q.baseNumber?.replace('QUO', '') || '0'))
    const lastNumber = baseNumbers.length > 0 ? Math.max(...baseNumbers) : 0
    return `QUO${String(lastNumber + 1).padStart(3, '0')}`
  }

  // Initialize quotation number on component mount
  React.useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]')
    setCustomers(savedCustomers)
    const savedMaterials = JSON.parse(localStorage.getItem('materials') || '[]')
    setMaterials(savedMaterials)
    
    if (!editData?.quotationNumber) {
      const newBase = generateBaseNumber()
      const newVersion = 1
      setBaseNumber(newBase)
      setVersion(newVersion)
      setQuotationNumber(newBase)
      form.setFieldsValue({ quotationNumber: newBase })
    } else {
      const base = editData.baseNumber || editData.quotationNumber.split('-')[0]
      const ver = editData.version || 1
      setQuotationNumber(editData.quotationNumber)
      setBaseNumber(base)
      setVersion(ver)
      form.setFieldsValue({ quotationNumber: editData.quotationNumber })
      
      // Load existing line items and excel file
      if (editData.lineItems) {
        setLineItems(editData.lineItems)
        calculateTotals(editData.lineItems)
      }
      if (editData.excelFile) {
        setExcelFile(editData.excelFile)
      }
    }
  }, [editData, form])

  const addLineItem = () => {
    const newItem = {
      key: Date.now(),
      itemCode: '',
      itemName: '',
      category: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
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
        let updated = { ...item, [field]: value }
        
        // Auto-fill from material master when itemCode is selected
        if (field === 'itemCode') {
          const material = materials.find(m => m.itemCode === value)
          if (material) {
            updated = {
              ...updated,
              itemName: material.itemName || '',
              category: material.itemCategory || '',
              description: material.itemName || '',
              unitPrice: material.sellingRate || 0,
              tax: material.tax || 0
            }
          }
        }
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'itemCode') {
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
        const base64 = btoa(new Uint8Array(e.target.result).reduce((data, byte) => data + String.fromCharCode(byte), ''))
        setExcelFile({
          name: file.name,
          data: base64,
          type: file.type
        })
        message.success(`File "${file.name}" uploaded successfully`)
      } catch (error) {
        message.error('Failed to upload file')
      }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  const handleSubmit = async (values) => {
    try {
      const existing = JSON.parse(localStorage.getItem('quotations') || '[]')
      
      if (onSubmit) {
        const quotationData = {
          ...values,
          lineItems,
          subtotal,
          gstAmount,
          totalAmount,
          quotationNumber: quotationNumber,
          baseNumber: baseNumber,
          version: version,
          quotationId: editData?.quotationId || quotationNumber,
          createdDate: editData?.createdDate || dayjs().format('YYYY-MM-DD'),
          excelFile: excelFile
        }
        onSubmit(quotationData)
      } else if (editData?.id) {
        // Check if only status changed
        const lineItemsChanged = JSON.stringify(editData.lineItems) !== JSON.stringify(lineItems)
        const excelChanged = JSON.stringify(editData.excelFile) !== JSON.stringify(excelFile)
        const onlyStatusChanged = !lineItemsChanged && !excelChanged
        
        if (onlyStatusChanged) {
          // Update existing quotation in place
          const quotationData = {
            ...values,
            lineItems,
            subtotal,
            gstAmount,
            totalAmount,
            quotationNumber: quotationNumber,
            baseNumber: baseNumber,
            version: version,
            quotationId: editData.quotationId || quotationNumber,
            createdDate: editData.createdDate || dayjs().format('YYYY-MM-DD'),
            excelFile: excelFile
          }
          const updated = existing.map(q => 
            q.id === editData.id ? { ...q, ...quotationData, id: editData.id } : q
          )
          localStorage.setItem('quotations', JSON.stringify(updated))
          message.success('Quotation updated successfully!')
          navigate('/quotations')
        } else {
          // Create new version when line items or excel changed
          const sameBase = existing.filter(q => q.baseNumber === editData.baseNumber)
          const versions = sameBase.map(q => q.version || 0)
          const maxVer = versions.length > 0 ? Math.max(...versions) : 0
          const newVersion = maxVer + 1
          const newQuotationNumber = `${editData.baseNumber}-V${newVersion}`
          
          const quotationData = {
            ...values,
            lineItems,
            subtotal,
            gstAmount,
            totalAmount,
            quotationNumber: newQuotationNumber,
            baseNumber: editData.baseNumber,
            version: newVersion,
            quotationId: editData.quotationId || editData.baseNumber,
            createdDate: dayjs().format('YYYY-MM-DD'),
            excelFile: excelFile
          }
          
          const newQuotation = { id: Date.now(), ...quotationData }
          existing.push(newQuotation)
          localStorage.setItem('quotations', JSON.stringify(existing))
          message.success(`Version V${newVersion} created!`)
          navigate('/quotations')
        }
      } else {
        // Create new quotation
        const quotationData = {
          ...values,
          lineItems,
          subtotal,
          gstAmount,
          totalAmount,
          quotationNumber: baseNumber,
          baseNumber: baseNumber,
          version: 0,
          quotationId: baseNumber,
          createdDate: dayjs().format('YYYY-MM-DD'),
          excelFile: excelFile
        }
        const newQuotation = { id: Date.now(), ...quotationData }
        existing.push(newQuotation)
        localStorage.setItem('quotations', JSON.stringify(existing))
        message.success('Quotation created!')
        navigate('/quotations')
      }
    } catch (error) {
      message.error('Failed to save quotation')
    }
  }

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      width: 150,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateLineItem(record.key, 'itemCode', value)}
          placeholder="Select Item"
          showSearch
          filterOption={(input, option) => {
            const searchText = input.toLowerCase()
            const optionText = option.children.toLowerCase()
            return optionText.includes(searchText)
          }}
          style={{ width: '100%' }}
          allowClear
        >
          {materials.map(m => (
            <Option key={m.itemCode} value={m.itemCode}>
              {m.itemCode} - {m.itemName}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateLineItem(record.key, 'quantity', value)}
          min={1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateLineItem(record.key, 'unitPrice', value)}
          min={0}
          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/₹\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Tax %',
      dataIndex: 'tax',
      width: 80,
      render: (text) => `${text || 0}%`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 120,
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
            <Col span={12}>
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
              <Form.Item
                label="Quotation Type"
                name="quotationType"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select Type" disabled={!!editData?.id}>
                  <Option value="project">Project</Option>
                  <Option value="trade">Trade</Option>
                  <Option value="shifting">Shifting</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Quotation Date"
                name="quotationDate"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} disabled={!!editData?.id} />
              </Form.Item>
              <Form.Item
                label="Valid Until (Days)"
                name="validityDays"
                rules={[{ required: true, message: 'Please enter validity period' }]}
              >
                <InputNumber min={1} max={365} style={{ width: '100%' }} disabled={!!editData?.id} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Customer"
                name="customerId"
                rules={[{ required: true, message: 'Please select customer' }]}
              >
                <Select placeholder="Select customer" showSearch optionFilterProp="children" disabled={!!editData?.id}>
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name || customer.customerName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Project Name"
                name="projectName"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="Project name" disabled={!!editData?.id} />
              </Form.Item>
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
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} placeholder="Quotation description" disabled={!!editData?.id} />
              </Form.Item>
            </Col>
          </Row>

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
              {excelFile ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <FileExcelOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  <span style={{ flex: 0.5, color: '#52c41a' }}>{excelFile.name}</span>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      setExcelFile(null)
                      message.info('File removed')
                    }}
                  />
                </div>
              ) : (
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
              )}
            </Col>
          </Row>

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