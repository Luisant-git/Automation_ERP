import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import PurchaseReturnForm from '../../../components/PurchaseReturnForm'
import { purchaseReturnAPI, useApiLoading } from '../../../services/apiService'

export default function PurchaseReturnMaster() {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const returns = await executeWithLoading(() => purchaseReturnAPI.getAll())
      setData(returns)
    } catch (error) {
      message.error('Failed to load purchase returns')
    }
  }

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
      title: 'Return Type',
      dataIndex: 'returnType',
      key: 'returnType',
      render: (type) => {
        const types = { 1: 'Damage', 2: 'Quality', 3: 'Excess', 4: 'Other' }
        return <Tag color="blue">{types[type] || 'N/A'}</Tag>
      }
    },
    {
      title: 'Net Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => `₹${(val || 0).toFixed(2)}`
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
      details: typeof record.lineItems === 'string' ? JSON.parse(record.lineItems) : record.lineItems || [],
      returnStatus: record.status === 'Draft' ? 1 : record.status === 'Submitted' ? 2 : 3
    }
    setEditingRecord(editData)
    setShowForm(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Return',
      content: `Delete return ${record.returnNumber}?`,
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
          onClose={handleFormClose}
        />
      </div>
    )
  }

  return (
    <ERPMasterLayout
      title="Purchase Return Master"
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