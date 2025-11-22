import React, { useState } from 'react'
import { Form, Input, DatePicker, Select, Button, Card, Table, InputNumber, Space, Divider, Row, Col, message, Typography, Upload } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined, ArrowLeftOutlined, UploadOutlined, FileExcelOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { calculateGST, INDIAN_STATES } from '../../services/gstCalculator'

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
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [gstDetails, setGstDetails] = useState({ cgst: 0, sgst: 0, igst: 0, totalGst: 0, isIntraState: true })
  const [totalAmount, setTotalAmount] = useState(0)
  const [companyState, setCompanyState] = useState('Maharashtra')
  const [companyStateCode, setCompanyStateCode] = useState('27')
  const [customerState, setCustomerState] = useState('')
  const [customerStateCode, setCustomerStateCode] = useState('')
  const [quotationNumber, setQuotationNumber] = useState('')
  const [baseNumber, setBaseNumber] = useState('')
  const [version, setVersion] = useState(1)
  const [excelFile, setExcelFile] = useState(null)
  const [customers, setCustomers] = useState([])
  const [materials, setMaterials] = useState([])
  const [showWorkOrder, setShowWorkOrder] = useState(false)

  const gstRate = 18

  // Generate base quotation number
  const generateBaseNumber = (type = 'project') => {
    const prefix = type === 'project' ? 'PRJ' : type === 'trade' ? 'TRD' : 'SHF'
    const existing = JSON.parse(localStorage.getItem('quotations') || '[]')
    const sameType = existing.filter(q => q.baseNumber?.startsWith(prefix))
    const numbers = sameType.map(q => parseInt(q.baseNumber?.replace(prefix, '') || '0'))
    const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`
  }

  // Handle quotation type change
  const handleQuotationTypeChange = (type) => {
    if (!editData?.id) {
      const newBase = generateBaseNumber(type)
      setBaseNumber(newBase)
      setQuotationNumber(newBase)
      form.setFieldsValue({ quotationNumber: newBase })
    }
  }

  // Initialize quotation number on component mount
  React.useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]')
    setCustomers(savedCustomers)
    const savedMaterials = JSON.parse(localStorage.getItem('materials') || '[]')
    setMaterials(savedMaterials)
    
    // Load company state from settings or default
    const companySettings = JSON.parse(localStorage.getItem('companySettings') || '{}')
    const defaultCompanyState = 'Karnataka'
    const defaultCompanyStateCode = '29'
    setCompanyState(companySettings.state || defaultCompanyState)
    setCompanyStateCode(companySettings.stateCode || defaultCompanyStateCode)
    
    // Save default company settings if not exists
    if (!companySettings.state) {
      localStorage.setItem('companySettings', JSON.stringify({
        state: defaultCompanyState,
        stateCode: defaultCompanyStateCode
      }))
    }
    
    if (!editData?.quotationNumber) {
      const newBase = generateBaseNumber('project')
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
      
      // Show work order field if already approved or has work order number
      if (editData.status === 'Approved' || editData.workOrderNumber) {
        setShowWorkOrder(true)
      }
      
      // Load existing line items and excel file
      if (editData.lineItems) {
        setLineItems(editData.lineItems)
        // Get customer state for calculation
        const customer = savedCustomers.find(c => c.id === editData.customerId)
        const custState = customer?.billingAddress?.state || ''
        const custStateCode = customer?.billingAddress?.stateCode || ''
        setCustomerState(custState)
        setCustomerStateCode(custStateCode)
        calculateTotals(editData.lineItems, custStateCode)
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

      description1: '',
      description2: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
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
              tax: material.tax || 0
            }
          }
        }
        
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'itemCode') {
          const baseAmount = updated.quantity * updated.unitPrice
          const discountAmount = (baseAmount * (updated.discount || 0)) / 100
          updated.amount = baseAmount - discountAmount
        }
        return updated
      }
      return item
    })
    setLineItems(updatedItems)
    calculateTotals(updatedItems)
  }

  const calculateTotals = (items, custStateCode = customerStateCode) => {
    const sub = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const discount = items.reduce((sum, item) => {
      const baseAmount = (item.quantity || 0) * (item.unitPrice || 0)
      const discountAmount = (baseAmount * (item.discount || 0)) / 100
      return sum + discountAmount
    }, 0)
    
    console.log('Company State Code:', companyStateCode, 'Customer State Code:', custStateCode, 'Subtotal:', sub)
    console.log('Is Same State?', companyStateCode === custStateCode)
    const gstCalc = calculateGST(companyStateCode, custStateCode, gstRate, sub)
    console.log('GST Calculation:', gstCalc)
    
    setSubtotal(sub)
    setTotalDiscount(discount)
    setGstDetails(gstCalc)
    setTotalAmount(gstCalc.totalAmount)
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
      // Validate Work Order Number if status is Approved
      if (values.status === 'Approved' && !values.workOrderNumber) {
        message.error('Work Order Number is required before approving quotation')
        return
      }
      
      const existing = JSON.parse(localStorage.getItem('quotations') || '[]')
      
      if (onSubmit) {
        const quotationData = {
          ...values,
          lineItems,
          subtotal,
          gstDetails,
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
            gstDetails,
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
            gstDetails,
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
          gstDetails,
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
          placeholder="Select or type"
          showSearch
          mode="combobox"
          filterOption={false}
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
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateLineItem(record.key, 'itemName', e.target.value)}
          placeholder="Enter item name"
          style={{ width: '100%' }}
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
          onChange={(e) => updateLineItem(record.key, 'category', e.target.value)}
          placeholder="Enter category"
          style={{ width: '100%' }}
        />
      )
    },

    {
      title: 'Description 1',
      dataIndex: 'description1',
      width: 150,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={(e) => updateLineItem(record.key, 'description1', e.target.value)}
          placeholder="Description 1"
          rows={2}
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ width: '100%', resize: 'vertical' }}
        />
      )
    },
    {
      title: 'Description 2',
      dataIndex: 'description2',
      width: 150,
      render: (text, record) => (
        <Input.TextArea
          value={text}
          onChange={(e) => updateLineItem(record.key, 'description2', e.target.value)}
          placeholder="Description 2"
          rows={2}
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ width: '100%', resize: 'vertical' }}
        />
      )
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
      title: 'Discount %',
      dataIndex: 'discount',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateLineItem(record.key, 'discount', value)}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Tax %',
      dataIndex: 'tax',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateLineItem(record.key, 'tax', value)}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 120,
      render: (text) => `₹ ${text?.toLocaleString() || 0}`
    },
    {
      title: 'Action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={addLineItem}
            style={{ color: '#000000' }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeLineItem(record.key)}
          />
        </Space>
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
                <Select placeholder="Select Type" disabled={!!editData?.id} onChange={handleQuotationTypeChange}>
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
                <Select 
                  placeholder="Select customer" 
                  showSearch 
                  optionFilterProp="children" 
                  disabled={!!editData?.id}
                  onChange={(value) => {
                    const customer = customers.find(c => c.id === value)
                    const custState = customer?.billingAddress?.state || ''
                    const custStateCode = customer?.billingAddress?.stateCode || ''
                    setCustomerState(custState)
                    setCustomerStateCode(custStateCode)
                    calculateTotals(lineItems, custStateCode)
                  }}
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name || customer.customerName} - {customer.billingAddress?.state || 'No State'}
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
                <Select onChange={(value) => setShowWorkOrder(value === 'Approved')}>
                  <Option value="Draft">Draft</Option>
                  <Option value="Sent">Sent</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Expired">Expired</Option>
                </Select>
              </Form.Item>
              {showWorkOrder && (
                <Form.Item
                  label="Work Order Number"
                  name="workOrderNumber"
                  rules={[{ required: true, message: 'Work Order Number is required' }]}
                >
                  <Input placeholder="Enter work order number" disabled={editData?.workOrderNumber ? true : false} />
                </Form.Item>
              )}
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} placeholder="Quotation description" disabled={!!editData?.id} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Quotation Items</Divider>
          
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Button
                type="dashed"
                onClick={addLineItem}
                icon={<PlusOutlined />}
                style={{ width: '100%' }}
              >
                Add Item
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
            scroll={{ x: 1400, y: 400 }}
            style={{ marginBottom: '24px' }}
          />

          <Row justify="end">
            <Col span={8}>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal:</span>
                  <span>₹ {subtotal.toLocaleString()}</span>
                </div>
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#52c41a' }}>
                    <span>Total Discount:</span>
                    <span>- ₹ {totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                {gstDetails.isIntraState ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>CGST ({gstRate/2}%):</span>
                      <span>₹ {gstDetails.cgst.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>SGST ({gstRate/2}%):</span>
                      <span>₹ {gstDetails.sgst.toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>IGST ({gstRate}%):</span>
                    <span>₹ {gstDetails.igst.toLocaleString()}</span>
                  </div>
                )}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                  <span>Total Amount:</span>
                  <span>₹ {totalAmount.toLocaleString()}</span>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider>Terms & Conditions</Divider>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Terms & Conditions"
                name="termsAndConditions"
              >
                <ReactQuill
                  theme="snow"
                  placeholder="Enter terms and conditions"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      [{ 'size': ['small', false, 'large', 'huge'] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['clean']
                    ]
                  }}
                  style={{ height: '200px', marginBottom: '50px' }}
                />
              </Form.Item>
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