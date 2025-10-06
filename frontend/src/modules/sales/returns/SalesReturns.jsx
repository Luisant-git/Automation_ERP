import React, { useState, useEffect } from 'react'
import { message, Modal, Tag } from 'antd'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import SalesReturnForm from './SalesReturnForm'

export default function SalesReturns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)

  const columns = [
    {
      title: 'Return ID',
      dataIndex: 'returnId',
      key: 'returnId',
      width: 120,
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 120,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
    },
    {
      title: 'Original Invoice',
      dataIndex: 'originalInvoice',
      key: 'originalInvoice',
      width: 130,
    },
    {
      title: 'Return Amount',
      dataIndex: 'returnAmount',
      key: 'returnAmount',
      width: 120,
      render: (val) => `₹${(val || 0).toFixed(2)}`
    },
    {
      title: 'Reason',
      dataIndex: 'returnReason',
      key: 'returnReason',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          'Pending': { color: 'orange', text: 'Pending' },
          'Approved': { color: 'green', text: 'Approved' },
          'Rejected': { color: 'red', text: 'Rejected' },
          'Processed': { color: 'blue', text: 'Processed' }
        }
        const info = statusMap[status] || { color: 'default', text: 'Unknown' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    }
  ]

  const searchFields = [
    { name: 'returnId', placeholder: 'Return ID', type: 'input' },
    { name: 'customerName', placeholder: 'Customer Name', type: 'input' },
    { name: 'status', placeholder: 'Status', type: 'select', options: [
      { value: 'Pending', label: 'Pending' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Rejected', label: 'Rejected' },
      { value: 'Processed', label: 'Processed' }
    ]},
    { name: 'dateRange', placeholder: 'Date Range', type: 'dateRange' }
  ]

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const mockData = [
        {
          id: 1,
          returnId: 'SR001',
          returnDate: '2024-01-20',
          customerName: 'ABC Corp',
          originalInvoice: 'INV001',
          returnAmount: 15000,
          returnReason: 'Defective Product',
          status: 'Pending'
        },
        {
          id: 2,
          returnId: 'SR002',
          returnDate: '2024-01-18',
          customerName: 'XYZ Ltd',
          originalInvoice: 'INV002',
          returnAmount: 8500,
          returnReason: 'Wrong Item',
          status: 'Approved'
        }
      ]
      setReturns(mockData)
    } catch (error) {
      message.error('Failed to fetch sales returns')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingReturn(null)
    setShowForm(true)
  }

  const handleEdit = (record) => {
    setEditingReturn(record)
    setShowForm(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Sales Return',
      content: `Delete return ${record.returnId}?`,
      onOk: () => {
        const updated = returns.filter(item => item.id !== record.id)
        setReturns(updated)
        message.success('Sales return deleted successfully')
      }
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingReturn(null)
    fetchReturns()
  }

  if (showForm) {
    return (
      <div>
        <SalesReturnForm 
          editingReturn={editingReturn}
          onReturnSaved={handleFormClose}
        />
      </div>
    )
  }

  return (
    <ERPMasterLayout
      title="Sales Returns"
      data={returns}
      columns={columns}
      searchFields={searchFields}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={loading}
      buttonType="return"
    />
  )
}