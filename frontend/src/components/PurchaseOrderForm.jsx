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
import { PlusOutlined, DeleteOutlined, SaveOutlined, PrinterOutlined, ArrowLeftOutlined, MinusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { purchaseOrderAPI, supplierAPI, quotationAPI, useApiLoading } from '../services/apiService'

const { TextArea } = Input
const { Option } = Select

export default function PurchaseOrderForm({ editingOrder, onOrderSaved }) {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [quotations, setQuotations] = useState([])
  const [materials, setMaterials] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [remainingBudget, setRemainingBudget] = useState(0)
  const [addedItems, setAddedItems] = useState(new Set())
  const { loading, executeWithLoading } = useApiLoading()

  // Generate PO Number
  const generatePONumber = async (type = 'project') => {
    try {
      const existing = await executeWithLoading(() => purchaseOrderAPI.getAll())
      const prefix = type === 'project' ? 'PO-PRJ' : type === 'trade' ? 'PO-TRD' : 'PO-SHF'
      const sameType = existing.filter(po => po.purchaseOrderNumber?.startsWith(prefix))
      const numbers = sameType.map(po => parseInt(po.purchaseOrderNumber?.replace(prefix, '') || '0'))
      const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0
      return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`
    } catch (error) {
      console.error('Error generating PO number:', error)
      return `PO-PRJ001`
    }
  }

  // Handle PO Type change
  const handlePOTypeChange = async (type) => {
    if (!editingOrder) {
      const newPONumber = await generatePONumber(type)
      form.setFieldsValue({ poNumber: newPONumber })
    }
  }

  // Load data from API
  const loadData = async () => {
    try {
      // Load quotations from API
      const quotationsData = await quotationAPI.getAll()
      const allQuotations = quotationsData.data || quotationsData || []
      
      // Filter only approved quotations
      const approvedQuotations = allQuotations.filter(q => 
        q.status === 'Approved' || q.quotationStatus === 'Approved'
      )
      setQuotations(approvedQuotations)
      
      // Load materials from localStorage (keeping existing functionality)
      const savedMaterials = JSON.parse(localStorage.getItem('materials') || '[]')
      setMaterials(savedMaterials)
      
      // Load suppliers from API
      const suppliersData = await supplierAPI.getAll()
      console.log('Suppliers loaded:', suppliersData)
      setSuppliers(suppliersData.data || suppliersData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('Failed to load data from server')
      // Fallback to localStorage if API fails
      const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]')
      const approvedQuotations = savedQuotations.filter(q => 
        q.status === 'Approved' || q.quotationStatus === 'Approved'
      )
      setQuotations(approvedQuotations)
    }
  }

  // Initialize form
  useEffect(() => {
    const initializeForm = async () => {
      await loadData()
      
      if (editingOrder) {
        // Convert quotation numbers back to IDs for the multi-select
        const quotationIds = []
        if (editingOrder.workOrderNumber) {
          const workOrderNumbers = editingOrder.workOrderNumber.split(', ')
          workOrderNumbers.forEach(woNum => {
            const quotation = quotations.find(q => q.workOrderNumber === woNum.trim() || q.quotationNumber === woNum.trim())
            if (quotation) {
              quotationIds.push(quotation.id)
            }
          })
        }
        
        form.setFieldsValue({
          ...editingOrder,
          quotationNumber: quotationIds,
          poDate: editingOrder.purchaseOrderDate ? dayjs(editingOrder.purchaseOrderDate) : dayjs(),
          deliveryDate: editingOrder.deliveryDate ? dayjs(editingOrder.deliveryDate) : null,
          poNumber: editingOrder.purchaseOrderNumber
        })
        setItems(editingOrder.lineItems ? JSON.parse(editingOrder.lineItems) : [])
      } else {
        const newPONumber = await generatePONumber('project')
        form.setFieldsValue({
          poNumber: newPONumber,
          poDate: dayjs(),
          poStatus: 'Draft',
          currencyId: 1,
          exchangeRate: 1
        })
      }
    }
    
    initializeForm()
  }, [editingOrder])

  // Handle quotation selection
  const handleQuotationSelect = (quotationIds) => {
    if (!quotationIds || quotationIds.length === 0) {
      form.setFieldsValue({ 
        poType: undefined, 
        workOrderNumber: '', 
        quotationNumbers: '', 
        budgetValue: null 
      })
      setRemainingBudget(0)
      return
    }
    
    const selectedQuotations = quotations.filter(q => quotationIds.includes(q.id))
    let poType = ''
    const workOrderNumbers = []
    const quotationNumbers = []
    let totalBudget = 0
    
    selectedQuotations.forEach((quotation, qIndex) => {
      // Collect work order numbers (only if they exist and are different from quotation number)
      if (quotation.workOrderNumber && quotation.workOrderNumber !== quotation.quotationNumber) {
        workOrderNumbers.push(quotation.workOrderNumber)
      } else if (quotation.workOrderNumber) {
        workOrderNumbers.push(quotation.workOrderNumber)
      }
      
      // Always collect quotation numbers separately
      if (quotation.quotationNumber) {
        quotationNumbers.push(quotation.quotationNumber)
      }
      
      // Handle different possible field names for total amount
      const amount = quotation.totalAmount || quotation.grandTotal || quotation.total || 0
      totalBudget += amount
      
      if (qIndex === 0) poType = quotation.quotationType || quotation.type || 'project'
    })
    
    form.setFieldsValue({
      poType: poType,
      workOrderNumber: workOrderNumbers.join(', '),
      quotationNumbers: quotationNumbers.join(', '),
      budgetValue: totalBudget || null
    })
    setRemainingBudget(totalBudget || 0)
    updateRemainingBudget(items)
  }

  // Item management
  const handleAddItem = () => {
    const selectedQuotationIds = form.getFieldValue('quotationNumber') || []
    if (selectedQuotationIds.length === 0) {
      message.warning('Please select a work order first')
      return
    }
    
    const newItem = {
      key: Date.now(),
      quotationNumber: '',
      itemCode: '',
      itemName: '',
      category: '',
      partNumber: '',
      description: '',
      hsnCode: '',
      serialNumber: '',
      quantity: 1,
      unitId: 'Nos',
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
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    updateRemainingBudget(updatedItems)
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
    updateRemainingBudget(updatedItems)
  }

  const updateRemainingBudget = (currentItems) => {
    const budgetValue = form.getFieldValue('budgetValue') || 0
    const totalSpent = currentItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    setRemainingBudget(budgetValue - totalSpent)
  }

  const removeItem = (key) => {
    const updatedItems = items.filter(item => item.key !== key)
    setItems(updatedItems)
    updateRemainingBudget(updatedItems)
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
      width: 50,
      render: (_, record, index) => {
        const sameQuotationAndItem = items.filter(item => 
          item.quotationNumber === record.quotationNumber && 
          item.itemCode === record.itemCode
        )
        const itemIndex = sameQuotationAndItem.findIndex(item => item.key === record.key)
        return itemIndex + 1
      }
    },
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      width: 130,
      render: (text, record) => {
        const selectedQuotationIds = form.getFieldValue('quotationNumber') || []
        const selectedQuotations = quotations.filter(q => selectedQuotationIds.includes(q.id))
        return (
          <Select
            value={text}
            onChange={(value) => updateItem(record.key, 'quotationNumber', value)}
            style={{ width: '100%' }}
            placeholder="Select Quotation"
          >
            {selectedQuotations.map(q => (
              <Option key={q.id} value={q.quotationNumber}>
                {q.quotationNumber}
              </Option>
            ))}
          </Select>
        )
      }
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      width: 100,
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
      width: 180,
      render: (text, record) => {
        const selectedQuotation = quotations.find(q => q.quotationNumber === record.quotationNumber)
        // Handle different possible structures for line items
        let lineItems = []
        if (selectedQuotation?.lineItems) {
          lineItems = typeof selectedQuotation.lineItems === 'string' 
            ? JSON.parse(selectedQuotation.lineItems) 
            : selectedQuotation.lineItems
        }
        
        return (
          <Select
            value={text}
            onChange={(value) => {
              const selectedItem = lineItems.find(item => 
                item.itemName === value || item.description === value || item.item === value
              )
              if (selectedItem) {
                const material = materials.find(m => m.itemCode === selectedItem.itemCode)
                const taxRate = selectedItem.tax || selectedItem.gst || material?.tax || 18
                const unitPrice = selectedItem.unitPrice || selectedItem.rate || selectedItem.price || 0
                const qty = selectedItem.quantity || selectedItem.qty || 1
                const taxableAmount = qty * unitPrice
                const cgstPercentage = taxRate / 2
                const sgstPercentage = taxRate / 2
                const cgstAmount = taxableAmount * cgstPercentage / 100
                const sgstAmount = taxableAmount * sgstPercentage / 100
                const totalAmount = taxableAmount + cgstAmount + sgstAmount
                
                const updatedItems = items.map(item => {
                  if (item.key === record.key) {
                    return {
                      ...item,
                      itemCode: selectedItem.itemCode || selectedItem.code || '',
                      itemName: selectedItem.itemName || selectedItem.description || selectedItem.item || '',
                      category: selectedItem.category || material?.itemCategory || '',
                      description: selectedItem.description || selectedItem.itemName || selectedItem.item || '',
                      quantity: qty,
                      rate: unitPrice,
                      hsnCode: selectedItem.hsnCode || material?.hsnCode || '',
                      cgstPercentage: cgstPercentage,
                      sgstPercentage: sgstPercentage,
                      taxableAmount: taxableAmount,
                      cgstAmount: cgstAmount,
                      sgstAmount: sgstAmount,
                      totalAmount: totalAmount
                    }
                  }
                  return item
                })
                setItems(updatedItems)
                updateRemainingBudget(updatedItems)
              } else {
                updateItem(record.key, 'itemName', value)
              }
            }}
            style={{ width: '100%' }}
            placeholder="Select Item"
            showSearch
            filterOption={(input, option) => 
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {lineItems.map((item, idx) => (
              <Option key={idx} value={item.itemName || item.description || item.item}>
                {item.itemName || item.description || item.item}
              </Option>
            ))}
          </Select>
        )
      }
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
      title: 'Unit',
      dataIndex: 'unitId',
      width: 80,
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => updateItem(record.key, 'unitId', value)}
          style={{ width: '100%' }}
          placeholder="Unit"
        >
          <Option value="Nos">Nos</Option>
          <Option value="Kg">Kg</Option>
          <Option value="Mtr">Mtr</Option>
          <Option value="Ltr">Ltr</Option>
          <Option value="Set">Set</Option>
          <Option value="Pcs">Pcs</Option>
          <Option value="Box">Box</Option>
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
          onChange={(value) => updateItem(record.key, 'rate', value || 0)}
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
      // Validate items
      if (items.length === 0) {
        message.error('Please add at least one item to the purchase order')
        return
      }
      
      const invalidItems = items.filter(item => 
        !item.itemName || !item.quantity || item.quantity <= 0 || !item.rate || item.rate <= 0
      )
      
      if (invalidItems.length > 0) {
        message.error('Please fill all required fields (Item Name, Quantity, Rate) for all items')
        return
      }
      
      const selectedQuotations = quotations.filter(q => (values.quotationNumber || []).includes(q.id))
      const quotationNumbers = selectedQuotations.map(q => q.quotationNumber).join(', ')
      
      const orderData = {
        purchaseOrderNumber: values.poNumber,
        baseNumber: values.poNumber?.split('-')[1] || '001',
        version: 0,
        purchaseOrderId: values.poNumber,
        purchaseOrderType: values.poType || 'project',
        purchaseOrderDate: values.poDate?.format('YYYY-MM-DD'),
        validityDays: 30,
        supplierId: values.supplierId,
        projectName: values.projectName || '',
        description: values.description || '',
        status: values.poStatus || 'Draft',
        workOrderNumber: values.workOrderNumber || '',
        lineItems: JSON.stringify(items),
        subtotal: totals.totalAmount,
        totalDiscount: totals.totalDiscountAmount,
        gstDetails: JSON.stringify({
          cgst: totals.totalTaxAmount / 2,
          sgst: totals.totalTaxAmount / 2,
          igst: 0
        }),
        totalAmount: totals.grossAmount,
        termsAndConditions: values.termsConditions || '',
        excelFile: null
      }

      if (editingOrder) {
        await executeWithLoading(() => purchaseOrderAPI.update(editingOrder.id, orderData))
        message.success('Purchase Order updated successfully!')
      } else {
        await executeWithLoading(() => purchaseOrderAPI.create(orderData))
        message.success('Purchase Order created successfully!')
      }

      onOrderSaved && onOrderSaved()
    } catch (error) {
      console.error('Error saving purchase order:', error)
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
                <Form.Item name="quotationNumber" label="Work Order Number">
                  <Select 
                    mode="multiple"
                    placeholder="Select Work Orders" 
                    onChange={handleQuotationSelect}
                    showSearch
                    optionFilterProp="children"
                  >
                    {quotations.map(q => {
                      const displayText = q.workOrderNumber 
                        ? `${q.workOrderNumber} - ${q.projectName || q.customerName || 'N/A'}`
                        : `${q.quotationNumber} - ${q.projectName || q.customerName || 'N/A'}`
                      return (
                        <Option key={q.id} value={q.id}>
                          {displayText}
                        </Option>
                      )
                    })}
                  </Select>
                </Form.Item>
                <Form.Item name="workOrderNumber" label="Selected Work Orders">
                  <Input placeholder="Auto-filled from selection" disabled />
                </Form.Item>
                <Form.Item name="quotationNumbers" label="Quotation Numbers">
                  <Input placeholder="Auto-filled from work orders" disabled />
                </Form.Item>
                <Form.Item name="poType" hidden>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="poDate" label="PO Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="deliveryDate" label="Delivery Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="poStatus" label="Status" initialValue="Draft">
                  <Select>
                    <Option value="Draft">Draft</Option>
                    <Option value="Submitted">Submitted</Option>
                    <Option value="Approved">Approved</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Supplier Information */}
          <Row gutter={24} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card size="small" title="Supplier Details">
                <Form.Item 
                  name="supplierId" 
                  label="Supplier Name" 
                  rules={[{ required: true, message: 'Please select a supplier' }]}
                >
                  <Select 
                    placeholder="Select Supplier" 
                    loading={loading}
                    showSearch
                    optionFilterProp="children"
                    notFoundContent={suppliers.length === 0 ? 'No suppliers found' : 'No matching suppliers'}
                    allowClear
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.supplierName || supplier.name || `Supplier ${supplier.id}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <div style={{ marginTop: '-16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {suppliers.length === 0 && (
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        No suppliers loaded. Click refresh to reload.
                      </span>
                    )}
                  </div>
                  <Button 
                    size="small"
                    icon={<PlusOutlined />} 
                    onClick={loadData}
                    title="Refresh Suppliers"
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </div>
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
              <div style={{ marginBottom: '16px' }}>
                {(() => {
                  const selectedQuotationIds = form.getFieldValue('quotationNumber') || []
                  const selectedQuotations = quotations.filter(q => selectedQuotationIds.includes(q.id))
                  
                  if (selectedQuotations.length > 0) {
                    return (
                      <Table
                        size="small"
                        pagination={false}
                        style={{ marginBottom: '12px' }}
                        dataSource={selectedQuotations.map(quotation => {
                          const quotationItems = items.filter(item => item.quotationNumber === quotation.quotationNumber)
                          const spent = quotationItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
                          const budget = quotation.totalAmount || quotation.grandTotal || quotation.total || 0
                          const remaining = budget - spent
                          return {
                            key: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                            workOrderNumber: quotation.workOrderNumber,
                            budget,
                            spent,
                            remaining
                          }
                        })}
                        columns={[
                          { 
                            title: 'Work Order', 
                            dataIndex: 'workOrderNumber', 
                            width: 120,
                            render: (text, record) => text || record.quotationNumber
                          },
                          { title: 'Budget', dataIndex: 'budget', width: 120, render: (val) => `₹${val.toLocaleString()}` },
                          { title: 'Spent', dataIndex: 'spent', width: 120, render: (val) => `₹${val.toLocaleString()}` },
                          { 
                            title: 'Remaining', 
                            dataIndex: 'remaining', 
                            width: 120, 
                            render: (val) => (
                              <span style={{ color: val < 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                                ₹{val.toLocaleString()}
                              </span>
                            )
                          }
                        ]}
                      />
                    )
                  }
                  return null
                })()}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Items: {items.length}</strong>
                    {items.length > 0 && (
                      <span style={{ marginLeft: '16px', color: '#666' }}>
                        Total Qty: {totals.totalQuantity} | 
                        Total Value: ₹{totals.grossAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Space>
                    {items.length > 0 && (
                      <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => {
                          setItems([])
                          updateRemainingBudget([])
                          message.success('All items cleared')
                        }}
                      >
                        Clear All
                      </Button>
                    )}
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                      Add Item
                    </Button>
                  </Space>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1800 }}
                locale={{
                  emptyText: 'No items added. Click "Add Item" to start.'
                }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={7}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{totals.totalQuantity}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={8}></Table.Summary.Cell>
                      <Table.Summary.Cell index={9}>
                        <strong>₹{totals.totalAmount.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={10}>
                        <strong>₹{totals.grossAmount.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={11}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          </div>

          {/* Tax Section & Summary */}
          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={12}>
              {/* <Card size="small" title="Tax Section">
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
              </Card> */}
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
            loading={loading}
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