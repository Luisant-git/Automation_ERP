import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Select, Upload, message, DatePicker } from 'antd'
import { UploadOutlined, SaveOutlined, ArrowLeftOutlined, FileExcelOutlined, FilePdfOutlined, FileWordOutlined, FileImageOutlined, CloseOutlined, CloudUploadOutlined, InboxOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select

export default function InvoiceForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()
  const [quotations, setQuotations] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [invoiceFile, setInvoiceFile] = useState(null)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]')
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]')
    
    const approvedQuotations = savedQuotations.filter(q => 
      q.status === 'Approved'
    )
    
    setQuotations(approvedQuotations)
    setCustomers(savedCustomers)

    // Check if editing
    if (location.state?.invoice) {
      setIsEdit(true)
      const invoice = location.state.invoice
      form.setFieldsValue({
        ...invoice,
        invoiceDate: dayjs(invoice.invoiceDate)
      })
      setInvoiceFile(invoice.invoiceFile)
    }
  }, [])

  const generateInvoiceNumber = () => {
    const existing = JSON.parse(localStorage.getItem('invoices') || '[]')
    const lastNumber = existing.length > 0 
      ? Math.max(...existing.map(inv => parseInt(inv.invoiceNumber?.replace('INV-', '') || 0))) 
      : 0
    return `INV-${String(lastNumber + 1).padStart(4, '0')}`
  }

  const handleWorkOrderChange = (workOrderNumber) => {
    const quotation = quotations.find(q => q.workOrderNumber === workOrderNumber)
    if (quotation) {
      setSelectedQuotation(quotation)
      
      const customer = customers.find(c => c.id === quotation.customerId)
      
      form.setFieldsValue({
        quotationNumber: quotation.quotationNumber,
        customerName: customer?.name || customer?.customerName || 'Unknown Customer',
        invoiceDate: dayjs(),
        projectName: quotation.projectName,
        totalAmount: quotation.totalAmount || quotation.gstDetails?.totalAmount || 0
      })
    }
  }

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return <FileExcelOutlined style={{ fontSize: '48px', color: '#217346', marginBottom: '16px' }} />
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: '48px', color: '#d32f2f', marginBottom: '16px' }} />
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: '48px', color: '#2b579a', marginBottom: '16px' }} />
      default:
        return <InboxOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
    }
  }

  const handleFileUpload = (file) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      message.error(`File format not supported. Please upload ${allowedTypes.join(', ')} files only.`)
      return false
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const base64 = btoa(new Uint8Array(e.target.result).reduce((data, byte) => data + String.fromCharCode(byte), ''))
        setInvoiceFile({
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

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setInvoiceFile(null)
    message.success('File removed successfully')
  }

  const handleSubmit = (values) => {
    try {
      const existing = JSON.parse(localStorage.getItem('invoices') || '[]')
      
      const invoiceData = {
        id: isEdit ? location.state.invoice.id : Date.now(),
        ...values,
        quotationId: selectedQuotation?.id,
        quotationNumber: selectedQuotation?.quotationNumber,
        invoiceFile: invoiceFile,
        createdDate: dayjs().format('YYYY-MM-DD'),
        status: 'Generated'
      }
      
      if (isEdit) {
        const index = existing.findIndex(inv => inv.id === invoiceData.id)
        existing[index] = invoiceData
      } else {
        existing.push(invoiceData)
      }
      
      localStorage.setItem('invoices', JSON.stringify(existing))
      
      message.success(`Invoice ${isEdit ? 'updated' : 'created'} successfully!`)
      navigate('/sales/invoice')
    } catch (error) {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} invoice`)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/sales/invoice')}
            />
            <span style={{ fontSize: '25px', fontWeight: '600' }}>
              {isEdit ? 'Edit Invoice' : 'Create Invoice'}
            </span>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Work Order Number"
                name="workOrderNumber"
                rules={[{ required: true, message: 'Please select work order' }]}
              >
                <Select
                  placeholder="Select work order"
                  onChange={handleWorkOrderChange}
                  showSearch
                  optionFilterProp="children"
                  disabled={isEdit}
                >
                  {quotations.map(quotation => (
                    <Option key={quotation.id} value={quotation.workOrderNumber}>
                      {quotation.workOrderNumber} - {quotation.projectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Quotation Number"
                name="quotationNumber"
              >
                <Input disabled />
              </Form.Item>
              
              <Form.Item
                label="Customer Name"
                name="customerName"
              >
                <Input disabled />
              </Form.Item>
              
              <Form.Item
                label="Project Name"
                name="projectName"
              >
                <Input disabled />
              </Form.Item>
              
              <Form.Item
                label="Invoice Number"
                name="invoiceNumber"
                rules={[{ required: true, message: 'Please enter invoice number' }]}
              >
                <Input placeholder="Enter invoice number" />
              </Form.Item>
              
              <Form.Item
                label="Invoice Date"
                name="invoiceDate"
                rules={[{ required: true, message: 'Please select invoice date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                label="Total Amount"
                name="totalAmount"
                rules={[{ required: true, message: 'Please enter total amount' }]}
              >
                <Input prefix="₹" placeholder="Enter total amount" type="number" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item label="Invoice File">
                <Upload.Dragger
                  beforeUpload={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xlsx,.xls"
                  showUploadList={false}
                  style={{ padding: '20px', height: '400px', display: 'flex', alignItems: 'center' }}
                >
                  <div style={{ textAlign: 'center', width: '100%', position: 'relative' }}>
                    {invoiceFile && (
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleRemoveFile}
                        style={{
                          position: 'absolute',
                          top: '-7px',
                          right: '10px',
                          color: '#ff4d4f',
                          fontSize: '16px'
                        }}
                      />
                    )}
                    {getFileIcon(invoiceFile?.name)}
                    <div style={{ marginBottom: '4px', fontSize: '16px', fontWeight: '500' }}>
                      {invoiceFile ? invoiceFile.name : 'Click or drag file to upload'}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      Support PDF, DOC, DOCX, Excel files
                    </div>
                  </div>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              disabled={!selectedQuotation && !isEdit}
              size="large"
              style={{ 
                minWidth: '150px',
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
                color: 'white'
              }}
            >
              {isEdit ? 'Update Invoice' : 'Save Invoice'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}