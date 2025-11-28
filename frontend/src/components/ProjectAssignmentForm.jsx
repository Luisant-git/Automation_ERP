import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  message,
  Typography,
  Space
} from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { quotationAPI, materialAPI, employeeAPI, purchaseEntryAPI, projectAssignmentAPI, useApiLoading } from '../services/apiService'

const { TextArea } = Input
const { Option } = Select

export default function ProjectAssignmentForm({ onClose, editData }) {
  const [form] = Form.useForm()
  const [quotations, setQuotations] = useState([])
  const [materials, setMaterials] = useState([])
  const [employees, setEmployees] = useState([])
  const [purchaseEntries, setPurchaseEntries] = useState([])
  const [allMaterialSerials, setAllMaterialSerials] = useState([])
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const [selectedProjectName, setSelectedProjectName] = useState('')
  const [isEditLoaded, setIsEditLoaded] = useState(false)
  const { loading, executeWithLoading } = useApiLoading()

  // Load data from API
  const loadData = async () => {
    try {
      const [quotationsData, materialsData, employeesData, purchaseEntriesData] = await Promise.all([
        executeWithLoading(() => quotationAPI.getAll()),
        executeWithLoading(() => materialAPI.getAll()),
        executeWithLoading(() => employeeAPI.getAll()),
        executeWithLoading(() => purchaseEntryAPI.getAll())
      ])
      
      // Filter approved quotations with work order numbers
      const approvedQuotations = quotationsData.filter(q => 
        (q.status === 'Approved' || q.quotationStatus === 'Approved') && q.workOrderNumber
      )
      
      setQuotations(approvedQuotations)
      setMaterials(materialsData)
      setEmployees(employeesData)
      setPurchaseEntries(purchaseEntriesData)
      
      // Map materials from quotations
      const materialsWithWorkOrder = []
      approvedQuotations.forEach(quotation => {
        if (quotation.lineItems && Array.isArray(quotation.lineItems)) {
          quotation.lineItems.forEach(item => {
            const material = materialsData.find(m => m.id === item.materialId || m.itemCode === item.itemCode)
            if (material) {
              const qty = item.quantity || 1
              for (let i = 1; i <= qty; i++) {
                materialsWithWorkOrder.push({
                  workOrderNumber: quotation.workOrderNumber,
                  serialNumber: `${quotation.workOrderNumber}-${material.itemCode}-${i}`,
                  materialId: material.id,
                  materialName: material.itemName,
                  materialCode: material.itemCode
                })
              }
            }
          })
        }
      })
      setAllMaterialSerials(materialsWithWorkOrder)
    } catch (error) {
      message.error('Failed to load data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (editData && purchaseEntries.length > 0 && !isEditLoaded) {
      // Parse materialSerials if it's a string
      const formData = { ...editData }
      if (typeof editData.materialSerials === 'string') {
        try {
          formData.materialSerials = JSON.parse(editData.materialSerials)
        } catch {
          formData.materialSerials = []
        }
      }
      
      form.setFieldsValue(formData)
      setSelectedProjectName(editData.projectName || '')
      
      // If there's a purchase entry number, trigger the selection to populate materials
      if (editData.purchaseEntryNumber) {
        handlePurchaseEntrySelect(editData.purchaseEntryNumber)
      }
      
      setIsEditLoaded(true)
    }
  }, [editData, purchaseEntries, isEditLoaded])

  // Handle purchase entry selection
  const handlePurchaseEntrySelect = async (purchaseEntryNumber) => {
    const selectedEntry = purchaseEntries.find(e => e.purchaseEntryNumber === purchaseEntryNumber || e.purchaseInvoiceNumber === purchaseEntryNumber)
    if (selectedEntry) {
      // Get PO Number from purchase entry
      const poNumber = selectedEntry.purchaseOrderId
      
      // Find purchase order and get work order number
      let workOrderNumbers = []
      if (selectedEntry.workOrderNumber) {
        workOrderNumbers = selectedEntry.workOrderNumber.split(',').map(w => w.trim())
      } else if (selectedEntry.purchaseOrder && selectedEntry.purchaseOrder.workOrderNumber) {
        workOrderNumbers = selectedEntry.purchaseOrder.workOrderNumber.split(',').map(w => w.trim())
      }
      
      // Set work order number (join if multiple)
      form.setFieldsValue({ workOrderNumber: workOrderNumbers.join(', ') || 'N/A' })
      
      // Find quotation and set project name from first work order
      if (workOrderNumbers.length > 0) {
        const selectedQuotation = quotations.find(q => q.workOrderNumber === workOrderNumbers[0])
        if (selectedQuotation) {
          setSelectedProjectName(selectedQuotation.projectName || 'No Project Name')
        }
      }
      
      // Extract materials from purchase entry line items
      const entryMaterials = []
      if (selectedEntry.lineItems) {
        const lineItems = typeof selectedEntry.lineItems === 'string' ? JSON.parse(selectedEntry.lineItems) : selectedEntry.lineItems
        lineItems.forEach(item => {
          const material = materials.find(m => m.itemCode === item.itemCode || m.id === item.materialId)
          if (material) {
            const serialNumber = item.serialNumber || `${purchaseEntryNumber}-${item.itemCode}`
            entryMaterials.push({
              serialNumber: serialNumber,
              materialId: material.id,
              materialName: material.itemName,
              materialCode: material.itemCode
            })
          }
        })
      }
      setFilteredMaterials(entryMaterials)
    } else {
      form.setFieldsValue({ workOrderNumber: undefined })
      setSelectedProjectName('')
      setFilteredMaterials([])
    }
    
    // Only clear materialSerials if not in edit mode
    if (!editData) {
      form.setFieldsValue({ materialSerials: [] })
    }
  }

  const handleSubmit = async (values) => {
    try {
      // Extract material names from selected serials
      const selectedMaterials = values.materialSerials.map(serial => {
        const material = filteredMaterials.find(m => m.serialNumber === serial)
        return material ? material.materialName : serial
      })

      const assignmentData = {
        workOrderNumber: values.workOrderNumber,
        projectName: selectedProjectName,
        purchaseEntryNumber: values.purchaseEntryNumber,
        materialSerials: JSON.stringify(values.materialSerials),
        materialNames: JSON.stringify(selectedMaterials),
        employeeRole: values.employeeRole,
        status: values.status || 'Assigned',
        remarks: values.remarks
      }

      if (editData) {
        await executeWithLoading(() => projectAssignmentAPI.update(editData.id, assignmentData))
      } else {
        await executeWithLoading(() => projectAssignmentAPI.create(assignmentData))
      }
      
      message.success(`Project Assignment ${editData ? 'updated' : 'saved'} successfully!`)
      
      if (onClose) {
        onClose(true) // Pass true to indicate data was saved
      } else {
        form.resetFields()
        setSelectedProjectName('')
      }
      
    } catch (error) {
      message.error('Failed to save Project Assignment')
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
              style={{ marginRight: '8px' }}
            />
            <Typography.Title level={3} style={{ margin: '0', color: '#333' }}>
              Project Assignment
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Assignment Details">
                <Form.Item 
                  name="purchaseEntryNumber" 
                  label="Purchase Entry Number"
                  rules={[{ required: true, message: 'Please select a purchase entry' }]}
                >
                  <Select 
                    placeholder="Select Purchase Entry Number"
                    showSearch
                    optionFilterProp="children"
                    onChange={handlePurchaseEntrySelect}
                  >
                    {purchaseEntries.map(entry => (
                      <Option key={entry.id} value={entry.purchaseEntryNumber || entry.purchaseInvoiceNumber}>
                        {entry.purchaseEntryNumber || entry.purchaseInvoiceNumber}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="workOrderNumber" 
                  label="Work Order Number"
                >
                  <Input disabled placeholder="Auto-filled from purchase entry" />
                </Form.Item>

                <Form.Item label="Project Name">
                  <Input 
                    value={selectedProjectName} 
                    disabled 
                    placeholder="Auto-filled from work order"
                  />
                </Form.Item>

                <Form.Item 
                  name="materialSerials" 
                  label="Material Selection (by Serial Number)" 
                  rules={[{ required: true, message: 'Please select materials' }]}
                >
                  <Select 
                    mode="multiple"
                    placeholder="Select Purchase Entry first"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => 
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {filteredMaterials.map((item, idx) => (
                      <Option key={idx} value={item.serialNumber}>
                        {item.materialName} - SN {item.serialNumber}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Assignment Information">
                <Form.Item 
                  name="employeeRole" 
                  label="Employee Role" 
                  rules={[{ required: true, message: 'Please select an employee role' }]}
                >
                  <Select 
                    placeholder="Select Employee Role"
                    showSearch
                    optionFilterProp="children"
                  >
                    {employees.map(employee => (
                      <Option key={employee.id} value={employee.role || employee.designation}>
                        {employee.name} - {employee.role || employee.designation || 'No Role'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="status" 
                  label="Status" 
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select Status">
                    <Option value="Assigned">Assigned</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="On Hold">On Hold</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="remarks" label="Remarks">
                  <TextArea 
                    rows={4} 
                    placeholder="Enter any remarks or additional notes"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Space size="large">
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ minWidth: '150px' }}
              >
                {editData ? 'Update Assignment' : 'Save Assignment'}
              </Button>
              <Button 
                onClick={() => {
                  form.resetFields()
                  setSelectedProjectName('')
                }}
                size="large"
                style={{ minWidth: '120px' }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}