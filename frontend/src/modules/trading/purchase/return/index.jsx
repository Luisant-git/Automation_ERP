import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Table, 
  Select, 
  DatePicker, 
  Modal, 
  Space, 
  InputNumber, 
  message,
  Tag
} from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import DataTable from '../../../../components/DataTable'

const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

function PurchaseReturn() {
  const [searchForm] = Form.useForm()
  const [form] = Form.useForm()
  const [detailForm] = Form.useForm()
  const [returns, setReturns] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)
  const [returnDetails, setReturnDetails] = useState([])
  const [editingDetail, setEditingDetail] = useState(null)

  // Mock data
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C']
  const purchaseNumbers = ['PUR001', 'PUR002', 'PUR003']
  const returnTypes = [
    { value: 1, label: 'Damage' },
    { value: 2, label: 'Quality' },
    { value: 3, label: 'Excess' },
    { value: 4, label: 'Other' }
  ]
  const statuses = [
    { value: 1, label: 'Draft' },
    { value: 2, label: 'Issued' },
    { value: 3, label: 'Approved' },
    { value: 4, label: 'Cancelled' }
  ]
  const units = ['Nos', 'Kg', 'Mtr', 'Ltr']

  // Generate return number
  const generateReturnNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `RET${year}${month}${random}`
  }

  // Load returns from localStorage
  useEffect(() => {
    const savedReturns = JSON.parse(localStorage.getItem('purchaseReturns') || '[]')
    setReturns(savedReturns)
  }, [])

  // Table columns for returns list
  const columns = [
    {
      title: 'Return Number',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate'
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (id) => `Supplier ${id}`
    },
    {
      title: 'Purchase Ref',
      dataIndex: 'purchaseId',
      key: 'purchaseId',
      render: (id) => `PUR${String(id).padStart(3, '0')}`
    },
    {
      title: 'Return Type',
      dataIndex: 'returnType',
      key: 'returnType',
      render: (type) => {
        const typeObj = returnTypes.find(t => t.value === type)
        return <Tag color="blue">{typeObj?.label || 'Unknown'}</Tag>
      }
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (amount) => `₹${(amount || 0).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'returnStatus',
      key: 'returnStatus',
      render: (status) => {
        const statusObj = statuses.find(s => s.value === status)
        const colors = { 1: 'orange', 2: 'blue', 3: 'green', 4: 'red' }
        return <Tag color={colors[status]}>{statusObj?.label || 'Unknown'}</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record)} />
        </Space>
      )
    }
  ]

  // Table columns for return details
  const detailColumns = [
    {
      title: 'S.No',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName'
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsnCode',
      key: 'hsnCode'
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnQuantity',
      key: 'returnQuantity',
      render: (qty) => qty?.toFixed(3)
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate) => `₹${rate?.toFixed(2)}`
    },
    {
      title: 'Taxable Amount',
      dataIndex: 'taxableAmount',
      key: 'taxableAmount',
      render: (amount) => `₹${amount?.toFixed(2)}`
    },
    {
      title: 'GST',
      key: 'gst',
      render: (_, record) => {
        const gst = (record.cgstAmount || 0) + (record.sgstAmount || 0) + (record.igstAmount || 0)
        return `₹${gst.toFixed(2)}`
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `₹${amount?.toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditDetail(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDeleteDetail(record.id)}
          />
        </Space>
      )
    }
  ]

  const handleSearch = (values) => {
    // Implement search logic
    console.log('Search values:', values)
  }

  const handleView = (record) => {
    setEditingReturn(record)
    setReturnDetails(record.details || [])
    form.setFieldsValue({
      ...record,
      returnDate: record.returnDate ? new Date(record.returnDate) : null
    })
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingReturn(record)
    setReturnDetails(record.details || [])
    form.setFieldsValue({
      ...record,
      returnDate: record.returnDate ? new Date(record.returnDate) : null
    })
    setIsModalVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Return',
      content: `Are you sure you want to delete return ${record.returnNumber}?`,
      onOk: () => {
        const updatedReturns = returns.filter(ret => ret.id !== record.id)
        setReturns(updatedReturns)
        localStorage.setItem('purchaseReturns', JSON.stringify(updatedReturns))
        message.success('Purchase return deleted successfully')
      }
    })
  }

  const handleSubmit = (values) => {
    try {
      const returnData = {
        ...values,
        details: returnDetails,
        totalQuantity: returnDetails.reduce((sum, item) => sum + (item.returnQuantity || 0), 0),
        totalTaxableAmount: returnDetails.reduce((sum, item) => sum + (item.taxableAmount || 0), 0),
        totalCGSTAmount: returnDetails.reduce((sum, item) => sum + (item.cgstAmount || 0), 0),
        totalSGSTAmount: returnDetails.reduce((sum, item) => sum + (item.sgstAmount || 0), 0),
        totalIGSTAmount: returnDetails.reduce((sum, item) => sum + (item.igstAmount || 0), 0),
        netAmount: calculateNetAmount(),
        returnDate: values.returnDate?.format('YYYY-MM-DD'),
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
        setReturns(updatedReturns)
        localStorage.setItem('purchaseReturns', JSON.stringify(updatedReturns))
        message.success('Purchase return updated successfully')
      } else {
        const newReturn = { 
          id: Date.now(), 
          returnNumber: generateReturnNumber(),
          ...returnData 
        }
        const updatedReturns = [...existingReturns, newReturn]
        setReturns(updatedReturns)
        localStorage.setItem('purchaseReturns', JSON.stringify(updatedReturns))
        message.success('Purchase return created successfully')
      }

      setIsModalVisible(false)
      setEditingReturn(null)
      setReturnDetails([])
      form.resetFields()
    } catch (error) {
      message.error('Failed to save purchase return')
    }
  }

  const handleAddDetail = () => {
    setEditingDetail(null)
    detailForm.resetFields()
    setDetailModalVisible(true)
  }

  const handleEditDetail = (detail) => {
    setEditingDetail(detail)
    detailForm.setFieldsValue(detail)
    setDetailModalVisible(true)
  }

  const handleDetailSubmit = (values) => {
    const taxableAmount = (values.returnQuantity * values.rate) - (values.discountAmount || 0)
    const cgstAmount = taxableAmount * (values.cgstPercentage || 0) / 100
    const sgstAmount = taxableAmount * (values.sgstPercentage || 0) / 100
    const igstAmount = taxableAmount * (values.igstPercentage || 0) / 100
    const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount

    const newDetail = {
      ...values,
      id: editingDetail ? editingDetail.id : Date.now(),
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount
    }

    if (editingDetail) {
      setReturnDetails(returnDetails.map(detail => 
        detail.id === editingDetail.id ? newDetail : detail
      ))
    } else {
      setReturnDetails([...returnDetails, newDetail])
    }

    setDetailModalVisible(false)
    detailForm.resetFields()
    setEditingDetail(null)
  }

  const handleDeleteDetail = (id) => {
    setReturnDetails(returnDetails.filter(detail => detail.id !== id))
  }

  const calculateNetAmount = () => {
    return returnDetails.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }

  return (
    <div>
      <Card title="Search Purchase Returns" size="small" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="returnNumber">
            <Input placeholder="Return Number" />
          </Form.Item>
          <Form.Item name="supplierId">
            <Select placeholder="Select Supplier" style={{ width: 150 }} allowClear>
              {suppliers.map((supplier, index) => (
                <Option key={index + 1} value={index + 1}>{supplier}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dateRange">
            <RangePicker />
          </Form.Item>
          <Form.Item name="returnStatus">
            <Select placeholder="Status" style={{ width: 120 }} allowClear>
              {statuses.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">Search</Button>
          </Form.Item>
        </Form>
      </Card>

      <DataTable 
        title="Purchase Return List" 
        columns={columns} 
        data={returns}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Add New Return
          </Button>
        }
      />

      <Modal
        title={editingReturn ? 'Edit Purchase Return' : 'Add New Purchase Return'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingReturn(null)
          setReturnDetails([])
          form.resetFields()
        }}
        footer={null}
        width={1200}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card title="Header Information" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="returnNumber" label="Return Number">
                  <Input placeholder="Auto-generated" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="returnDate" label="Return Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="supplierId" label="Supplier" rules={[{ required: true }]}>
                  <Select placeholder="Select Supplier">
                    {suppliers.map((supplier, index) => (
                      <Option key={index + 1} value={index + 1}>{supplier}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="purchaseId" label="Purchase Reference" rules={[{ required: true }]}>
                  <Select placeholder="Select Purchase">
                    {purchaseNumbers.map((purchase, index) => (
                      <Option key={index + 1} value={index + 1}>{purchase}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="returnType" label="Return Type" rules={[{ required: true }]}>
                  <Select placeholder="Select Return Type">
                    {returnTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="returnStatus" label="Status" initialValue={1}>
                  <Select>
                    {statuses.map(status => (
                      <Option key={status.value} value={status.value}>{status.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="creditNoteNumber" label="Credit Note Number">
                  <Input placeholder="Credit Note Number" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="creditNoteDate" label="Credit Note Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="reason" label="Reason">
                  <TextArea rows={2} placeholder="Return reason" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Return Details" size="small" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDetail}>
                Add Item
              </Button>
            </div>
            <Table 
              columns={detailColumns} 
              dataSource={returnDetails} 
              rowKey="id" 
              pagination={false}
              size="small"
            />
          </Card>

          <Card title="Amount Summary" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <div><strong>Total Qty:</strong> {returnDetails.reduce((sum, item) => sum + (item.returnQuantity || 0), 0).toFixed(3)}</div>
              </Col>
              <Col span={6}>
                <div><strong>Taxable Amount:</strong> ₹{returnDetails.reduce((sum, item) => sum + (item.taxableAmount || 0), 0).toFixed(2)}</div>
              </Col>
              <Col span={6}>
                <div><strong>GST:</strong> ₹{returnDetails.reduce((sum, item) => sum + (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0), 0).toFixed(2)}</div>
              </Col>
              <Col span={6}>
                <div><strong>Net Amount:</strong> ₹{calculateNetAmount().toFixed(2)}</div>
              </Col>
            </Row>
          </Card>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false)
                setEditingReturn(null)
                setReturnDetails([])
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingReturn ? 'Update' : 'Save'} Return
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingDetail ? 'Edit Return Item' : 'Add Return Item'}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setEditingDetail(null)
          detailForm.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form form={detailForm} layout="vertical" onFinish={handleDetailSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="itemId" label="Item" rules={[{ required: true }]}>
                <Select placeholder="Select Item">
                  <Option value={1}>Item 1</Option>
                  <Option value={2}>Item 2</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hsnCode" label="HSN Code">
                <Input placeholder="HSN Code" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={2} placeholder="Item Description" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="returnQuantity" label="Return Qty" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unitId" label="Unit" rules={[{ required: true }]}>
                <Select placeholder="Unit">
                  {units.map((unit, index) => (
                    <Option key={index + 1} value={index + 1}>{unit}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rate" label="Rate" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="discountPercentage" label="Discount %">
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discountAmount" label="Discount Amount">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="batchNumber" label="Batch Number">
                <Input placeholder="Batch Number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="cgstPercentage" label="CGST %">
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sgstPercentage" label="SGST %">
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="igstPercentage" label="IGST %">
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="returnReason" label="Return Reason">
                <TextArea rows={2} placeholder="Item return reason" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setDetailModalVisible(false)
                setEditingDetail(null)
                detailForm.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDetail ? 'Update' : 'Add'} Item
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default PurchaseReturn