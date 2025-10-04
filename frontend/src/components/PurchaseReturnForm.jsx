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

export default function PurchaseReturnForm({ editingReturn, onClose }) {
  const [form] = Form.useForm()
  const [returnDetails, setReturnDetails] = useState([])

  // Generate Return Number
  const generateReturnNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `RET${year}${month}${random}`
  }

  // Initialize form
  useEffect(() => {
    if (editingReturn) {
      form.setFieldsValue({
        ...editingReturn,
        returnDate: editingReturn.returnDate ? dayjs(editingReturn.returnDate) : dayjs(),
        creditNoteDate: editingReturn.creditNoteDate ? dayjs(editingReturn.creditNoteDate) : null
      })
      setReturnDetails(editingReturn.details || [])
    } else {
      form.setFieldsValue({
        returnNumber: generateReturnNumber(),
        returnDate: dayjs(),
        returnStatus: 1
      })
    }
  }, [editingReturn])

  // Item management
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      itemId: null,
      description: '',
      hsnCode: '',
      returnQuantity: 1,
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
      totalAmount: 0,
      returnReason: ''
    }
    setReturnDetails([...returnDetails, newItem])
  }

  const updateItem = (id, field, value) => {
    const updatedItems = returnDetails.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate amounts
        const taxableAmount = (updatedItem.returnQuantity * updatedItem.rate) - (updatedItem.discountAmount || 0)
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
    setReturnDetails(updatedItems)
  }

  const removeItem = (id) => {
    setReturnDetails(returnDetails.filter(item => item.id !== id))
  }

  // Calculate totals
  const totals = {
    totalQuantity: returnDetails.reduce((sum, item) => sum + (item.returnQuantity || 0), 0),
    totalTaxableAmount: returnDetails.reduce((sum, item) => sum + (item.taxableAmount || 0), 0),
    totalCGSTAmount: returnDetails.reduce((sum, item) => sum + (item.cgstAmount || 0), 0),
    totalSGSTAmount: returnDetails.reduce((sum, item) => sum + (item.sgstAmount || 0), 0),
    totalIGSTAmount: returnDetails.reduce((sum, item) => sum + (item.igstAmount || 0), 0),
    netAmount: returnDetails.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }

  // Table columns with inline editing
  const columns = [
    {
      title: 'S.No',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Item',
      dataIndex: 'itemId',
      width: 150,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.id, 'itemId', value)}
          placeholder="Select Item"
          style={{ width: '100%' }}
        >
          <Option value={1}>Item 1</Option>
          <Option value={2}>Item 2</Option>
        </Select>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.id, 'description', e.target.value)}
          placeholder="Description"
        />
      )
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsnCode',
      width: 100,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.id, 'hsnCode', e.target.value)}
          placeholder="HSN"
        />
      )
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnQuantity',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.id, 'returnQuantity', value || 0)}
          min={0}
          step={0.001}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit',
      dataIndex: 'unitId',
      width: 80,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.id, 'unitId', value)}
          placeholder="Unit"
          style={{ width: '100%' }}
        >
          <Option value={1}>Nos</Option>
          <Option value={2}>Kg</Option>
        </Select>
      )
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.id, 'rate', value || 0)}
          min={0}
          step={0.01}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Discount %',
      dataIndex: 'discountPercentage',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.id, 'discountPercentage', value || 0)}
          min={0}
          max={100}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'CGST %',
      dataIndex: 'cgstPercentage',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.id, 'cgstPercentage', value || 0)}
          min={0}
          max={50}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'SGST %',
      dataIndex: 'sgstPercentage',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.id, 'sgstPercentage', value || 0)}
          min={0}
          max={50}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      width: 120,
      render: (text) => `₹${(text || 0).toFixed(2)}`
    },
    {
      title: 'Return Reason',
      dataIndex: 'returnReason',
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.id, 'returnReason', e.target.value)}
          placeholder="Reason"
        />
      )
    },
    {
      title: 'Action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.id)}
          size="small"
        />
      )
    }
  ]

  const handleSubmit = async (values) => {
    try {
      const returnData = {
        ...values,
        details: returnDetails,
        ...totals,
        returnDate: values.returnDate?.format('YYYY-MM-DD'),
        creditNoteDate: values.creditNoteDate?.format('YYYY-MM-DD'),
        createdDate: new Date().toISOString(),
        createdBy: 1,
        companyId: 1,
        financialYearId: 1,
        isActive: true
      }

      const existingReturns = JSON.parse(localStorage.getItem('purchaseReturns') || '[]')

      if (editingReturn) {
        const updatedReturns = existingReturns.map(ret =>
          ret.id === editingReturn.id ? { ...returnData, id: editingReturn.id } : ret
        )
        localStorage.setItem('purchaseReturns', JSON.stringify(updatedReturns))
        message.success('Purchase Return updated successfully!')
      } else {
        const newReturn = { id: Date.now(), ...returnData }
        existingReturns.push(newReturn)
        localStorage.setItem('purchaseReturns', JSON.stringify(existingReturns))
        message.success('Purchase Return saved successfully!')
      }

      onClose && onClose()
    } catch (error) {
      message.error('Failed to save Purchase Return')
    }
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => onClose && onClose()}
              style={{ marginRight: '8px', fontWeight: 'bold' }}
            />
            <Typography.Title level={4} style={{ margin: '0', color: '#333', fontWeight: 'bold' }}>
              Create Purchase Return
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Header Section */}
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Return Details">
                <Form.Item name="returnNumber" label="Return Number (auto-generated)">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="returnDate" label="Return Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="returnType" label="Return Type" rules={[{ required: true }]}>
                  <Select placeholder="Select Return Type">
                    <Option value={1}>Damage</Option>
                    <Option value={2}>Quality</Option>
                    <Option value={3}>Excess</Option>
                    <Option value={4}>Other</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="returnStatus" label="Status" initialValue={1}>
                  <Select>
                    <Option value={1}>Draft</Option>
                    <Option value={2}>Issued</Option>
                    <Option value={3}>Approved</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Reference Details">
                <Form.Item name="supplierId" label="Supplier" rules={[{ required: true }]}>
                  <Select placeholder="Select Supplier">
                    <Option value={1}>Supplier 1</Option>
                    <Option value={2}>Supplier 2</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="purchaseId" label="Purchase Reference" rules={[{ required: true }]}>
                  <Select placeholder="Select Purchase">
                    <Option value={1}>PUR001</Option>
                    <Option value={2}>PUR002</Option>
                  </Select>
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="creditNoteNumber" label="Credit Note No.">
                      <Input placeholder="Credit Note Number" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="creditNoteDate" label="Date">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="reason" label="Return Reason">
                  <TextArea rows={2} placeholder="Return reason" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Return Items Table */}
          <div style={{ marginTop: '24px' }}>
            <Card size="small" title="Purchase Return Items">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography.Text strong>Items/Services</Typography.Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>
              <Table
                columns={columns}
                dataSource={returnDetails}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1600 }}
              />
            </Card>
          </div>

          {/* Tax Section & Summary */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Card size="small" title="Tax Section">
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Subtotal (Taxable Value)</Col>
                  <Col>₹{totals.totalTaxableAmount.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Tax Amount</Col>
                  <Col>₹{(totals.totalCGSTAmount + totals.totalSGSTAmount + totals.totalIGSTAmount).toFixed(2)}</Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Summary">
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Quantity</Col>
                  <Col>{totals.totalQuantity.toFixed(3)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Amount (before tax)</Col>
                  <Col>₹{totals.totalTaxableAmount.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Tax Amount</Col>
                  <Col>₹{(totals.totalCGSTAmount + totals.totalSGSTAmount + totals.totalIGSTAmount).toFixed(2)}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                  <Col>Net Total</Col>
                  <Col>₹{totals.netAmount.toFixed(2)}</Col>
                </Row>
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
            {editingReturn ? 'Update' : 'Save'} Return
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