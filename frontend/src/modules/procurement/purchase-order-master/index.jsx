import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import PurchaseOrderForm from '../../../components/PurchaseOrderForm'

export default function PurchaseOrderMaster() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    setData(orders)
  }

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber'
    },
    {
      title: 'PO Type',
      dataIndex: 'poType',
      key: 'poType',
      render: (text) => {
        const typeMap = { project: 'Project', trade: 'Trade', shift: 'Shift' }
        return typeMap[text] || 'N/A'
      }
    },
    {
      title: 'PO Date',
      dataIndex: 'poDate',
      key: 'poDate'
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (id) => `Supplier ${id}`
    },
    {
      title: 'Total Amount',
      dataIndex: 'grossAmount',
      key: 'grossAmount',
      render: (val) => `₹${(val || 0).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'poStatus',
      key: 'poStatus',
      render: (status) => {
        const statusMap = {
          1: { color: 'orange', text: 'Draft' },
          2: { color: 'blue', text: 'Submitted' },
          3: { color: 'green', text: 'Approved' }
        }
        const info = statusMap[status] || { color: 'default', text: 'Unknown' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    }
  ]

  const searchFields = [
    { name: 'poNumber', placeholder: 'PO Number', type: 'input' },
    { name: 'supplierId', placeholder: 'Supplier', type: 'select', options: [
      { value: 1, label: 'Supplier 1' },
      { value: 2, label: 'Supplier 2' }
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
      content: `Delete PO ${record.poNumber}?`,
      onOk: () => {
        const updated = data.filter(item => item.id !== record.id)
        localStorage.setItem('purchaseOrders', JSON.stringify(updated))
        setData(updated)
        message.success('Deleted successfully')
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
    />
  )
}