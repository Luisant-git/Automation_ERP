import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import PurchaseOrderForm from '../../../components/PurchaseOrderForm'
import { purchaseOrderAPI, useApiLoading } from '../../../services/apiService'

export default function PurchaseOrderMaster() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const orders = await executeWithLoading(() => purchaseOrderAPI.getAll())
      setData(orders)
    } catch (error) {
      console.error('Error loading purchase orders:', error)
      message.error('Failed to load purchase orders')
    }
  }

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Work Order Number',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber'
    },
    // {
    //   title: 'PO Type',
    //   dataIndex: 'poType',
    //   key: 'poType',
    //   render: (text) => {
    //     const typeMap = { project: 'Project', trade: 'Trade', shift: 'Shift' }
    //     return typeMap[text] || 'N/A'
    //   }
    // },
    {
      title: 'PO Date',
      dataIndex: 'purchaseOrderDate',
      key: 'purchaseOrderDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier, record) => {
        // Handle different possible supplier data structures
        if (supplier?.supplierName) {
          return supplier.supplierName
        }
        if (supplier?.name) {
          return supplier.name
        }
        if (record.supplierName) {
          return record.supplierName
        }
        if (record.supplierId) {
          return `Supplier ID: ${record.supplierId}`
        }
        return 'No Supplier'
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => `₹${(val || 0).toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'Draft': { color: 'orange', text: 'Draft' },
          'Submitted': { color: 'blue', text: 'Submitted' },
          'Approved': { color: 'green', text: 'Approved' }
        }
        const info = statusMap[status] || { color: 'default', text: status || 'Unknown' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    }
  ]

  const searchFields = [
    { name: 'purchaseOrderNumber', placeholder: 'PO Number', type: 'input' },
    { name: 'status', placeholder: 'Status', type: 'select', options: [
      { value: 'Draft', label: 'Draft' },
      { value: 'Submitted', label: 'Submitted' },
      { value: 'Approved', label: 'Approved' }
    ]},
    { name: 'dateRange', placeholder: 'Date Range', type: 'dateRange' }
  ]

  const handleAdd = () => {
    setEditingRecord(null)
    setShowForm(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Order',
      content: `Delete PO ${record.purchaseOrderNumber}?`,
      onOk: async () => {
        try {
          await executeWithLoading(() => purchaseOrderAPI.delete(record.id))
          message.success('Purchase Order deleted successfully')
          loadData()
        } catch (error) {
          console.error('Error deleting purchase order:', error)
          message.error('Failed to delete purchase order')
        }
      }
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingRecord(null)
    loadData()
  }

  if (showForm) {
    return (
      <div>
        <PurchaseOrderForm 
          editingOrder={editingRecord}
          onOrderSaved={handleFormClose}
        />
      </div>
    )
  }

  return (
    <ERPMasterLayout
      title="Purchase Order Master"
      data={data}
      columns={columns}
      searchFields={searchFields}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      buttonType="order"
      loading={loading}
    />
  )
}