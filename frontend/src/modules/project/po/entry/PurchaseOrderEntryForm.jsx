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
import { purchaseOrderEntryAPI, quotationAPI, materialAPI, purchaseOrderAPI, supplierAPI, useApiLoading } from '../../../../services/apiService'

const { TextArea } = Input
const { Option } = Select

export default function PurchaseOrderEntryForm({ editingOrder, onOrderSaved }) {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [quotations, setQuotations] = useState([])
  const [materials, setMaterials] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [remainingBudget, setRemainingBudget] = useState(0)
  const [addedItems, setAddedItems] = useState(new Set())
  const { loading, executeWithLoading } = useApiLoading()



  // Generate Purchase Invoice Number
  const generatePurchaseInvoiceNumber = async () => {
    try {
      const existing = await executeWithLoading(() => purchaseOrderEntryAPI.getAll())
      const prefix = 'PI-'
      const numbers = existing.map(entry => parseInt(entry.purchaseInvoiceNumber?.replace(prefix, '') || '0'))
      const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0
      return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`
    } catch (error) {
      const prefix = 'PI-'
      return `${prefix}0001`
    }
  }

  // Handle PO Type change
  const handlePOTypeChange = (type) => {
    if (!editingOrder) {
      const newPONumber = generatePONumber(type)
      form.setFieldsValue({ poNumber: newPONumber })
    }
  }

  // Load data from API
  const loadData = async () => {
    try {
      const [quotationsData, materialsData, purchaseOrdersData, suppliersData] = await Promise.all([
        executeWithLoading(() => quotationAPI.getAll()),
        executeWithLoading(() => materialAPI.getAll()),
        executeWithLoading(() => purchaseOrderAPI.getAll()),
        executeWithLoading(() => supplierAPI.getAll())
      ])
      setQuotations(quotationsData)
      setMaterials(materialsData)
      setPurchaseOrders(purchaseOrdersData)
      setSuppliers(suppliersData)
    } catch (error) {
      message.error('Failed to load data')
    }
  }

  // Initialize form
  useEffect(() => {
    const initializeForm = async () => {
      await loadData()
      if (editingOrder) {
        form.setFieldsValue({
          ...editingOrder,
          poDate: editingOrder.poDate ? dayjs(editingOrder.poDate) : dayjs(),
          deliveryDate: editingOrder.deliveryDate ? dayjs(editingOrder.deliveryDate) : null
        })
        setItems(editingOrder.items || [])
      } else {
        const invoiceNumber = await generatePurchaseInvoiceNumber()
        form.setFieldsValue({
          purchaseInvoiceNumber: invoiceNumber,
          poDate: dayjs(),
          poStatus: 1,
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
      form.setFieldsValue({ poType: undefined, quotationNumbers: '', budgetValue: null })
      setRemainingBudget(0)
      return
    }
    
    const selectedQuotations = quotations.filter(q => quotationIds.includes(q.id))
    let poType = ''
    const workOrderNumbers = []
    const quotationNumbers = []
    let totalBudget = 0
    
    selectedQuotations.forEach((quotation, qIndex) => {
      if (quotation.workOrderNumber) {
        workOrderNumbers.push(quotation.workOrderNumber)
      }
      if (quotation.quotationNumber) {
        quotationNumbers.push(quotation.quotationNumber)
      }
      if (quotation.totalAmount) {
        totalBudget += quotation.totalAmount
      }
      if (qIndex === 0) poType = quotation.quotationType || 'project'
    })
    
    form.setFieldsValue({
      poType: poType,
      quotationNumbers: quotationNumbers.join(', '),
      budgetValue: totalBudget || null
    })
    setRemainingBudget(totalBudget || 0)
    updateRemainingBudget(items)
  }

  // Item management
  const handleAddItem = () => {
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
      title: 'PO Number',
      dataIndex: 'poNumber',
      width: 130,
      render: (text, record) => {
        const selectedPONumbers = form.getFieldValue('poNumber') || []
        return (
          <Select
            value={text}
            onChange={(value) => updateItem(record.key, 'poNumber', value)}
            style={{ width: '100%' }}
            placeholder="Select PO Number"
          >
            {selectedPONumbers.map(poNumber => (
              <Option key={poNumber} value={poNumber}>
                {poNumber}
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
      render: (text) => text || '-'
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      width: 180,
      render: (text, record) => {
        const selectedQuotationIds = form.getFieldValue('quotationNumber') || []
        const selectedQuotations = quotations.filter(q => selectedQuotationIds.includes(q.id))
        const allLineItems = selectedQuotations.flatMap(q => q.lineItems || [])
        
        return (
          <Select
            value={text}
            onChange={(value) => {
              const selectedItem = allLineItems.find(item => item.itemName === value)
              if (selectedItem) {
                const material = materials.find(m => m.itemCode === selectedItem.itemCode)
                const taxRate = selectedItem.tax || material?.tax || 18
                const taxableAmount = (selectedItem.quantity || 1) * (selectedItem.unitPrice || 0)
                const cgstPercentage = taxRate / 2
                const sgstPercentage = taxRate / 2
                const cgstAmount = taxableAmount * cgstPercentage / 100
                const sgstAmount = taxableAmount * sgstPercentage / 100
                const totalAmount = taxableAmount + cgstAmount + sgstAmount
                
                const updatedItems = items.map(item => {
                  if (item.key === record.key) {
                    return {
                      ...item,
                      itemCode: selectedItem.itemCode || '',
                      itemName: selectedItem.itemName || '',
                      category: selectedItem.category || material?.itemCategory || '',
                      description: selectedItem.description || selectedItem.itemName || '',
                      quantity: selectedItem.quantity || 1,
                      rate: selectedItem.unitPrice || 0,
                      hsnCode: material?.hsnCode || '',
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
            {allLineItems.map((item, idx) => (
              <Option key={idx} value={item.itemName}>
                {item.itemName}
              </Option>
            ))}
          </Select>
        )
      }
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'serialNumber', e.target.value)}
          placeholder="Serial Number"
        />
      )
    },
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      width: 120,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateItem(record.key, 'partNumber', e.target.value)}
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
      title: 'Balance Qty',
      dataIndex: 'balanceQuantity',
      width: 90,
      render: (text, record) => {
        // Show empty if no item name is selected
        if (!record.itemName) {
          return <span>-</span>
        }
        
        // Get Purchase Order Master data
        const selectedPONumbers = form.getFieldValue('poNumber') || []
        const selectedPOs = purchaseOrders.filter(po => 
          selectedPONumbers.includes(po.poNumber || po.purchaseOrderNumber)
        )
        
        // Find matching item in PO Master
        let originalQty = 0
        selectedPOs.forEach(po => {
          const poItems = Array.isArray(po.items) ? po.items : 
                         Array.isArray(po.lineItems) ? po.lineItems : []
          const poItem = poItems.find(item => 
            item.description === record.itemName || 
            item.itemName === record.itemName ||
            item.name === record.itemName
          )
          if (poItem) {
            originalQty += poItem.quantity || 0
          }
        })
        
        // Calculate already ordered quantity for this item
        const orderedQty = items
          .filter(item => item.itemName === record.itemName && item.key !== record.key)
          .reduce((sum, item) => sum + (item.quantity || 0), 0)
        
        const balance = originalQty - orderedQty - (record.quantity || 0)
        return (
          <span style={{ color: balance < 0 ? '#ff4d4f' : balance === 0 ? '#faad14' : '#52c41a' }}>
            {balance}
          </span>
        )
      }
    },
    {
      title: 'Unit (per)',
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
      title: 'Discount',
      dataIndex: 'discountAmount',
      width: 100,
      render: (text, record) => (
        <InputNumber
          value={text || 0}
          onChange={(value) => updateItem(record.key, 'discountAmount', value || 0)}
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
      const orderData = {
        purchaseInvoiceNumber: values.purchaseInvoiceNumber,
        purchaseOrderId: Array.isArray(values.poNumber) ? values.poNumber[0] : values.poNumber,
        supplierId: values.supplierId,
        invoiceDate: values.poDate?.format('YYYY-MM-DD'),
        dueDate: values.deliveryDate?.format('YYYY-MM-DD'),
        lineItems: JSON.stringify(items),
        subtotal: totals.totalAmount,
        totalDiscount: totals.totalDiscountAmount,
        gstDetails: JSON.stringify({
          cgst: items.reduce((sum, item) => sum + (item.cgstAmount || 0), 0),
          sgst: items.reduce((sum, item) => sum + (item.sgstAmount || 0), 0),
          igst: items.reduce((sum, item) => sum + (item.igstAmount || 0), 0)
        }),
        totalAmount: totals.grossAmount,
        status: values.poStatus === 1 ? 'Draft' : values.poStatus === 2 ? 'Submitted' : 'Approved',
        workOrderNumber: Array.isArray(values.workOrderNumber) ? values.workOrderNumber.join(', ') : values.workOrderNumber,
        quotationNumbers: values.quotationNumbers
      }

      if (editingOrder) {
        await executeWithLoading(() => purchaseOrderEntryAPI.update(editingOrder.id, orderData))
        message.success('Purchase Order Entry updated successfully!')
      } else {
        await executeWithLoading(() => purchaseOrderEntryAPI.create(orderData))
        message.success('Purchase Order Entry saved successfully!')
      }

      onOrderSaved && onOrderSaved()
    } catch (error) {
      message.error('Failed to save Purchase Order Entry')
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
              Create Purchase Entry
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Header Section */}
          <Card size="small" title="Order Details" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="purchaseInvoiceNumber" label="Purchase Invoice Number">
                  <Input disabled placeholder="Auto-generated" />
                </Form.Item>
                <Form.Item name="poNumber" label="PO Number" rules={[{ required: true }]}>
                  <Select 
                    mode="multiple"
                    placeholder="Select PO Numbers"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => 
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {purchaseOrders
                      .filter(order => order.status === 'Approved' || order.poStatus === 3)
                      .map(order => (
                        <Option key={order.id} value={order.poNumber || order.purchaseOrderNumber}>
                          {order.poNumber || order.purchaseOrderNumber} - {order.projectName || 'N/A'}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item name="workOrderNumber" label="Work Order Number">
                  <Select 
                    mode="multiple"
                    placeholder="Select Work Order Numbers" 
                    showSearch
                    optionFilterProp="children"
                    onChange={(selectedWorkOrders) => {
                      // Find matching quotation IDs for the selected work orders
                      const matchingQuotationIds = quotations
                        .filter(q => selectedWorkOrders.includes(q.workOrderNumber || q.quotationNumber))
                        .map(q => q.id)
                      
                      const quotationNumbers = quotations
                        .filter(q => selectedWorkOrders.includes(q.workOrderNumber || q.quotationNumber))
                        .map(q => q.quotationNumber)
                        .join(', ')
                      
                      form.setFieldsValue({
                        quotationNumber: matchingQuotationIds,
                        quotationNumbers: quotationNumbers
                      })
                      
                      handleQuotationSelect(matchingQuotationIds)
                    }}
                  >
                    {quotations.map(q => (
                      <Option key={q.id} value={q.workOrderNumber || q.quotationNumber}>
                        {q.workOrderNumber || q.quotationNumber} - {q.projectName || 'N/A'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="quotationNumbers" label="Quotation Number">
                  <Input placeholder="Auto-filled from PO selection" disabled />
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
                <Form.Item name="poStatus" label="Status" initialValue={1}>
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
                  <Select 
                    placeholder="Select Supplier"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => 
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name || supplier.companyName || `Supplier ${supplier.id}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
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
                          const budget = quotation.totalAmount || 0
                          const remaining = budget - spent
                          return {
                            key: quotation.id,
                            quotationNumber: quotation.quotationNumber,
                            budget,
                            spent,
                            remaining
                          }
                        })}
                        columns={[
                          { title: 'Quotation', dataIndex: 'quotationNumber', width: 150 },
                          { title: 'Budget', dataIndex: 'budget', width: 150, render: (val) => `₹${val.toLocaleString()}` },
                          { title: 'Spent', dataIndex: 'spent', width: 150, render: (val) => `₹${val.toLocaleString()}` },
                          { 
                            title: 'Remaining', 
                            dataIndex: 'remaining', 
                            width: 150, 
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
                <div style={{ textAlign: 'right' }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 2200 }}
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
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Total Discount</Col>
                  <Col>-₹{totals.totalDiscountAmount.toFixed(2)}</Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: '8px' }}>
                  <Col>Additional Discount</Col>
                  <Col>
                    <Form.Item name="additionalDiscount" style={{ margin: 0 }}>
                      <InputNumber
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        style={{ width: '100px' }}
                        addonBefore="₹"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider style={{ margin: '8px 0' }} />
                <Row justify="space-between" style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                  <Col>Gross Total</Col>
                  <Col>₹{(totals.grossAmount - (form.getFieldValue('additionalDiscount') || 0)).toFixed(2)}</Col>
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