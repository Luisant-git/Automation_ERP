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
import { purchaseReturnAPI, purchaseOrderEntryAPI, supplierAPI, useApiLoading } from '../services/apiService'

const { TextArea } = Input
const { Option } = Select

export default function PurchaseReturnForm({ editingReturn, onClose }) {
  const [form] = Form.useForm()
  const [returnDetails, setReturnDetails] = useState([])
  const [purchaseEntries, setPurchaseEntries] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  // Generate Return Number
  const generateReturnNumber = async () => {
    try {
      const existing = await executeWithLoading(() => purchaseReturnAPI.getAll())
      const prefix = 'PR-'
      const numbers = existing.map(entry => parseInt(entry.returnNumber?.replace(prefix, '') || '0'))
      const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0
      return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`
    } catch (error) {
      return 'PR-0001'
    }
  }

  // Load purchase entries and suppliers
  const loadPurchaseEntries = async () => {
    try {
      const [entries, suppliersData] = await Promise.all([
        executeWithLoading(() => purchaseOrderEntryAPI.getAll()),
        executeWithLoading(() => supplierAPI.getAll())
      ])
      setPurchaseEntries(entries)
      setSuppliers(suppliersData)
    } catch (error) {
      message.error('Failed to load data')
    }
  }

  // Get available items from selected invoice
  const getAvailableItems = () => {
    const invoiceNumber = form.getFieldValue('purchaseInvoiceNumber')
    if (!invoiceNumber) return []
    const entry = purchaseEntries.find(e => e.purchaseInvoiceNumber === invoiceNumber)
    if (!entry) return []
    const items = typeof entry.lineItems === 'string' ? JSON.parse(entry.lineItems) : entry.lineItems || []
    return items
  }

  // Handle purchase invoice selection
  const handleInvoiceSelect = (invoiceNumber) => {
    const entry = purchaseEntries.find(e => e.purchaseInvoiceNumber === invoiceNumber)
    if (entry) {
      form.setFieldsValue({ supplierId: entry.supplierId })
      message.success('Invoice selected. Add items manually from the table.')
    }
  }

  // Initialize form
  useEffect(() => {
    const initializeForm = async () => {
      await loadPurchaseEntries()
      if (editingReturn) {
        form.setFieldsValue({
          ...editingReturn,
          returnDate: editingReturn.returnDate ? dayjs(editingReturn.returnDate) : dayjs(),
          creditNoteDate: editingReturn.creditNoteDate ? dayjs(editingReturn.creditNoteDate) : null
        })
        setReturnDetails(editingReturn.details || [])
      } else {
        const returnNumber = await generateReturnNumber()
        form.setFieldsValue({
          returnNumber,
          returnDate: dayjs(),
          returnStatus: 1
        })
      }
    }
    initializeForm()
  }, [editingReturn])

  // Item management
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      itemCode: '',
      itemName: '',
      serialNumber: '',
      partNumber: '',
      category: '',
      description: '',
      hsnCode: '',
      returnQuantity: 1,
      unitId: 1,
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
      title: 'Sl. No.',
      width: 50,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      width: 100,
      render: (text) => text || '-'
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 180,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.id, 'itemName', e.target.value)}
          placeholder="Item Name"
        />
      )
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      width: 120,
      render: (text, record) => {
        const availableItems = getAvailableItems()
        return (
          <Select
            value={text}
            onChange={(value) => {
              const selectedItem = availableItems.find(item => item.serialNumber === value)
              if (selectedItem) {
                const updatedItems = returnDetails.map(item => {
                  if (item.id === record.id) {
                    return {
                      ...item,
                      itemCode: selectedItem.itemCode || '',
                      itemName: selectedItem.itemName || '',
                      serialNumber: selectedItem.serialNumber || '',
                      partNumber: selectedItem.partNumber || '',
                      category: selectedItem.category || '',
                      description: selectedItem.description || '',
                      hsnCode: selectedItem.hsnCode || '',
                      returnQuantity: selectedItem.quantity || 0,
                      unitId: selectedItem.unitId || 1,
                      rate: selectedItem.rate || 0,
                      discountAmount: selectedItem.discountAmount || 0,
                      cgstPercentage: selectedItem.cgstPercentage || 9,
                      sgstPercentage: selectedItem.sgstPercentage || 9,
                      igstPercentage: selectedItem.igstPercentage || 0,
                      taxableAmount: selectedItem.taxableAmount || 0,
                      cgstAmount: selectedItem.cgstAmount || 0,
                      sgstAmount: selectedItem.sgstAmount || 0,
                      igstAmount: selectedItem.igstAmount || 0,
                      totalAmount: selectedItem.totalAmount || 0
                    }
                  }
                  return item
                })
                setReturnDetails(updatedItems)
              }
            }}
            style={{ width: '100%' }}
            placeholder="Select Serial Number"
            showSearch
          >
            {availableItems.map((item, idx) => (
              <Option key={idx} value={item.serialNumber}>
                {item.serialNumber}
              </Option>
            ))}
          </Select>
        )
      }
    },
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.id, 'partNumber', e.target.value)}
          placeholder="Part Number"
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
          onChange={(e) => updateItem(record.id, 'category', e.target.value)}
          placeholder="Category"
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
          onChange={(e) => updateItem(record.id, 'description', e.target.value)}
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
          onChange={(e) => updateItem(record.id, 'hsnCode', e.target.value)}
          placeholder="HSN/SAC"
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'returnQuantity',
      width: 80,
      render: (text, record) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(record.id, 'returnQuantity', value || 0)}
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
          onChange={(value) => updateItem(record.id, 'unitId', value)}
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
          value={text || 0}
          onChange={(value) => updateItem(record.id, 'rate', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          placeholder="0.00"
        />
      )
    },
    {
      title: 'Discount',
      dataIndex: 'discountAmount',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text || 0}
          onChange={(value) => updateItem(record.id, 'discountAmount', value || 0)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          placeholder="0.00"
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
        returnNumber: values.returnNumber,
        purchaseInvoiceNumber: values.purchaseInvoiceNumber || '',
        supplierId: values.supplierId,
        returnDate: values.returnDate?.format('YYYY-MM-DD'),
        returnType: values.returnType ? String(values.returnType) : undefined,
        reason: values.reason || '',
        lineItems: JSON.stringify(returnDetails),
        subtotal: totals.totalTaxableAmount || 0,
        totalDiscount: 0,
        gstDetails: JSON.stringify({
          cgst: totals.totalCGSTAmount || 0,
          sgst: totals.totalSGSTAmount || 0,
          igst: totals.totalIGSTAmount || 0
        }),
        totalAmount: totals.netAmount || 0,
        notes: values.creditNoteNumber || '',
        status: values.returnStatus === 1 ? 'Draft' : values.returnStatus === 2 ? 'Submitted' : 'Approved'
      }

      console.log('Submitting return data:', returnData)

      if (editingReturn) {
        await executeWithLoading(() => purchaseReturnAPI.update(editingReturn.id, returnData))
        message.success('Purchase Return updated successfully!')
      } else {
        await executeWithLoading(() => purchaseReturnAPI.create(returnData))
        message.success('Purchase Return saved successfully!')
      }

      onClose && onClose()
    } catch (error) {
      console.error('Submit error:', error)
      message.error(error.response?.data?.message || 'Failed to save Purchase Return')
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
                <Form.Item name="purchaseInvoiceNumber" label="Purchase Invoice Number" rules={[{ required: true }]}>
                  <Select 
                    placeholder="Select Purchase Invoice" 
                    showSearch
                    onChange={handleInvoiceSelect}
                  >
                    {purchaseEntries.map(entry => (
                      <Option key={entry.id} value={entry.purchaseInvoiceNumber}>
                        {entry.purchaseInvoiceNumber}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="supplierId" label="Supplier" rules={[{ required: true }]}>
                  <Select placeholder="Select Supplier" disabled>
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name || supplier.companyName || `Supplier ${supplier.id}`}
                      </Option>
                    ))}
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
              {(() => {
                const invoiceNumber = form.getFieldValue('purchaseInvoiceNumber')
                if (invoiceNumber) {
                  const entry = purchaseEntries.find(e => e.purchaseInvoiceNumber === invoiceNumber)
                  if (entry) {
                    const totalPurchaseAmount = entry.grossAmount || entry.totalAmount || entry.netAmount || 0
                    const returnAmount = totals.netAmount
                    return (
                      <Table
                        size="small"
                        pagination={false}
                        style={{ marginBottom: '12px' }}
                        dataSource={[{
                          key: 1,
                          totalPurchaseAmount,
                          returnAmount
                        }]}
                        columns={[
                          { 
                            title: 'Total Purchase Entry Amount', 
                            dataIndex: 'totalPurchaseAmount', 
                            width: 250, 
                            render: (val) => <span style={{ fontWeight: 'bold', fontSize: '14px' }}>₹{val.toFixed(2)}</span>
                          },
                          { 
                            title: 'Return Amount', 
                            dataIndex: 'returnAmount', 
                            width: 250, 
                            render: (val) => <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff4d4f' }}>₹{val.toFixed(2)}</span>
                          }
                        ]}
                      />
                    )
                  }
                }
                return null
              })()}
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
                scroll={{ x: 2000 }}
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