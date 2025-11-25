import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import PurchaseReturnForm from './PurchaseReturnForm'

export default function PurchaseReturnList() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const returns = JSON.parse(localStorage.getItem('purchaseReturns') || '[]')
    setData(returns)
  }

  const columns = [
    {
      title: 'Return Number',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      render: (text) => <strong style={{ color: '#ff4d4f' }}>{text}</strong>
    },
    {
      title: 'Purchase Invoice Number',
      dataIndex: 'purchaseInvoiceNumber',
      key: 'purchaseInvoiceNumber',
      render: (text) => <strong style={{ color: '#52c41a' }}>{text}</strong>
    },
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber'
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
      title: 'Total Return Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => `₹${(val || 0).toFixed(2)}`
    },
    {
      title: 'Items Count',
      dataIndex: 'items',
      key: 'itemsCount',
      render: (items) => (
        <Tag color="orange">{items?.length || 0} items</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'returnStatus',
      key: 'returnStatus',
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
    { name: 'returnNumber', placeholder: 'Return Number', type: 'input' },
    { name: 'purchaseInvoiceNumber', placeholder: 'Purchase Invoice Number', type: 'input' },
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
      title: 'Delete Purchase Return',
      content: `Delete Return ${record.returnNumber}?`,
      onOk: () => {
        const updated = data.filter(item => item.id !== record.id)
        localStorage.setItem('purchaseReturns', JSON.stringify(updated))
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
        <PurchaseReturnForm 
          editingReturn={editingRecord}
          onReturnSaved={handleFormClose}
        />
      </div>
    )
  }

  return (
    <ERPMasterLayout
      title="Purchase Return List"
      data={data}
      columns={columns}
      searchFields={searchFields}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      buttonType="return"
    />
  )
}