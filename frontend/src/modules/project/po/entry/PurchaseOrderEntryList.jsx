import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../../components/ERPMasterLayout'

export default function PurchaseOrderEntryList({ onEdit, onAdd }) {
  const [data, setData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const entries = JSON.parse(localStorage.getItem('purchaseOrderEntries') || '[]')
    setData(entries)
  }

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Work Order Number',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber'
    },
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumbers',
      key: 'quotationNumbers'
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

  const handleEdit = (record) => {
    onEdit(record)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Order Entry',
      content: `Delete PO ${record.poNumber}?`,
      onOk: () => {
        const updated = data.filter(item => item.id !== record.id)
        localStorage.setItem('purchaseOrderEntries', JSON.stringify(updated))
        setData(updated)
        message.success('Deleted successfully')
      }
    })
  }

  return (
    <ERPMasterLayout
      title="Purchase Entry List"
      data={data}
      columns={columns}
      searchFields={searchFields}
      onAdd={onAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      buttonType="order"
    />
  )
}