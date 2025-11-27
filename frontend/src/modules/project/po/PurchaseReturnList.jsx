import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import PurchaseReturnForm from './PurchaseReturnForm'
import { purchaseReturnAPI, useApiLoading } from '../../../services/apiService'

export default function PurchaseReturnList() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('Fetching purchase returns...')
      const returns = await executeWithLoading(() => purchaseReturnAPI.getAll())
      console.log('Purchase returns:', returns)
      setData(returns)
    } catch (error) {
      console.error('Error loading purchase returns:', error)
      message.error('Failed to load purchase returns')
    }
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
      key: 'returnDate',
      render: (date) => date ? new Date(date).toLocaleDateString('en-GB') : 'N/A'
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (id, record) => record.supplier?.name || record.supplier?.companyName || `Supplier ${id}`
    },
    {
      title: 'Total Return Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => `₹${(val || 0).toFixed(2)}`
    },
    {
      title: 'Items Count',
      dataIndex: 'lineItems',
      key: 'itemsCount',
      render: (lineItems) => {
        const items = typeof lineItems === 'string' ? JSON.parse(lineItems) : lineItems
        return <Tag color="orange">{items?.length || 0} items</Tag>
      }
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
    const editData = {
      ...record,
      items: typeof record.lineItems === 'string' ? JSON.parse(record.lineItems) : record.lineItems || [],
      returnStatus: record.status === 'Draft' ? 1 : record.status === 'Submitted' ? 2 : 3
    }
    setEditingRecord(editData)
    setShowForm(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Return',
      content: `Delete Return ${record.returnNumber}?`,
      onOk: async () => {
        try {
          await executeWithLoading(() => purchaseReturnAPI.delete(record.id))
          await loadData()
          message.success('Deleted successfully')
        } catch (error) {
          message.error('Failed to delete purchase return')
        }
      }
    })
  }

  const handleFormClose = async () => {
    setShowForm(false)
    setEditingRecord(null)
    await loadData()
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
      loading={loading}
    />
  )
}