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

export default function PurchaseReturnForm({ editingReturn, onReturnSaved }) {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [purchaseEntries, setPurchaseEntries] = useState([])

  // Generate Purchase Return Number
  const generateReturnNumber = () => {
    const prefix = 'PR-'
    const existing = JSON.parse(localStorage.getItem('purchaseReturns') || '[]')
    const numbers = existing.map(entry => parseInt(entry.returnNumber?.replace(prefix, '') || '0'))
    const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`
  }

  // Load purchase entries from localStorage
  const loadPurchaseEntries = () => {
    const savedEntries = JSON.parse(localStorage.getItem('purchaseOrderEntries') || '[]')
    setPurchaseEntries(savedEntries)
  }

  // Initialize form
  useEffect(() => {
    loadPurchaseEntries()
    if (editingReturn) {
      form.setFieldsValue({
        ...editingReturn,
        returnDate: editingReturn.returnDate ? dayjs(editingReturn.returnDate) : dayjs()
      })
      setItems(editingReturn.items || [])
    } else {
      form.setFieldsValue({
        returnNumber: generateReturnNumber(),
        returnDate: dayjs(),
        returnStatus: 1
      })
    }
  }, [editingReturn])

  // Handle purchase entry selection
  const handlePurchaseEntrySelect = (purchaseInvoiceNumber) => {
    const selectedEntry = purchaseEntries.find(entry => entry.purchaseInvoiceNumber === purchaseInvoiceNumber)
    if (selectedEntry) {
      form.setFieldsValue({
        supplierId: selectedEntry.supplierId,
        poNumber: Array.isArray(selectedEntry.poNumber) ? selectedEntry.poNumber.join(', ') : selectedEntry.poNumber
      })
    }
  }

  // Item management
  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      itemCode: '',
      itemName: '',
      description: '',
      returnQuantity: 1,
      unitId: 1,
      rate: 0,
      returnReason: '',
      totalAmount: 0
    }
    setItems([...items, newItem])
  }

  const updateItem = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate total amount
        if (field === 'returnQuantity' || field === 'rate') {
          updatedItem.totalAmount = (updatedItem.returnQuantity || 0) * (updatedItem.rate || 0)
        }
        
        return updatedItem
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
    totalQuantity: items.reduce((sum, item) => sum + (item.returnQuantity || 0), 0),
    totalAmount: items.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }

  // Table columns
  const columns = [
    {
      title: 'Sl. No.',
      width: 60,
      render: (_, record, index) => index + 1
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'itemCode', e.target.value)}
          placeholder="Item Code"
        />
      )
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 200,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'itemName', e.target.value)}
          placeholder="Item Name"
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
      title: 'Return Quantity',
      dataIndex: 'returnQuantity',
      width: 120,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.key, 'returnQuantity', value || 0)}
          min={0}
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
      title: 'Rate',
      dataIndex: 'rate',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text || 0}
          onChange={(value) => updateItem(record.key, 'rate', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Return Reason',
      dataIndex: 'returnReason',
      width: 150,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'returnReason', value)}
          style={{ width: '100%' }}
          placeholder="Select Reason"
        >
          <Option value="Damaged">Damaged</Option>
          <Option value="Wrong Item">Wrong Item</Option>
          <Option value="Quality Issue">Quality Issue</Option>
          <Option value="Excess Quantity">Excess Quantity</Option>
          <Option value="Other">Other</Option>
        </Select>
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
      const returnData = {
        ...values,
        items,
        ...totals,
        returnDate: values.returnDate?.format('YYYY-MM-DD'),
        createdDate: new Date().toISOString(),
        createdBy: 1,
        companyId: 1,
        isActive: true
      }

      const existingReturns = JSON.parse(localStorage.getItem('purchaseReturns') || '[]')

      if (editingReturn) {
        const updatedReturns = existingReturns.map(returnItem =>
          returnItem.id === editingReturn.id ? { ...returnData, id: editingReturn.id } : returnItem
        )
        localStorage.setItem('purchaseReturns', JSON.stringify(updatedReturns))
        message.success('Purchase Return updated successfully!')
      } else {
        const newReturn = { id: Date.now(), ...returnData }
        existingReturns.push(newReturn)
        localStorage.setItem('purchaseReturns', JSON.stringify(existingReturns))
        message.success('Purchase Return saved successfully!')
      }

      onReturnSaved && onReturnSaved()
    } catch (error) {
      message.error('Failed to save Purchase Return')
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
              onClick={() => onReturnSaved && onReturnSaved()}
              style={{ marginRight: '8px' }}
            />
            <Typography.Title level={3} style={{ margin: '0', color: '#333' }}>
              Create Purchase Return
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Header Section */}
          <Card size="small" title="Return Details" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="returnNumber" label="Return Number">
                  <Input disabled placeholder="Auto-generated" />
                </Form.Item>
                <Form.Item name="purchaseInvoiceNumber" label="Purchase Invoice Number" rules={[{ required: true }]}>
                  <Select 
                    placeholder="Select Purchase Invoice"
                    showSearch
                    optionFilterProp="children"
                    onChange={handlePurchaseEntrySelect}
                  >
                    {purchaseEntries.map(entry => (
                      <Option key={entry.id} value={entry.purchaseInvoiceNumber}>
                        {entry.purchaseInvoiceNumber}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="poNumber" label="PO Number">
                  <Input placeholder="Auto-filled from purchase invoice" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="returnDate" label="Return Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="returnStatus" label="Status" initialValue={1}>
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
                  <Select placeholder="Select Supplier" disabled>
                    <Option value={1}>Supplier 1</Option>
                    <Option value={2}>Supplier 2</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="returnReason" label="Overall Return Reason">
                  <TextArea rows={2} placeholder="Reason for return" />
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Return Information">
                <Form.Item name="remarks" label="Remarks">
                  <TextArea rows={2} placeholder="Additional remarks" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Items Table */}
          <div style={{ marginTop: '24px' }}>
            <Card size="small" title="Return Items">
              <div style={{ marginBottom: '16px', textAlign: 'right' }}>
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
                scroll={{ x: 1400 }}
              />
            </Card>
          </div>

          {/* Summary */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={12}></Col>
            <Col span={12}>
              <Card size="small" title="Return Summary">
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Return Quantity</Col>
                  <Col>{totals.totalQuantity}</Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                  <Col>Total Return Amount</Col>
                  <Col>₹{totals.totalAmount.toFixed(2)}</Col>
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
            {editingReturn ? 'Update' : 'Save'} Purchase Return
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