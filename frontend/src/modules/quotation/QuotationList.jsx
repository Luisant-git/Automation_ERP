import React, { useState, useEffect } from 'react'
import { message, Modal, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import ERPMasterLayout from '../../components/ERPMasterLayout'

export default function QuotationList() {
  const navigate = useNavigate()
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(false)



  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Sent': 'processing',
      'Approved': 'success',
      'Rejected': 'error',
      'Expired': 'warning'
    }
    return colors[status] || 'default'
  }

  const columns = [
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      width: 150,
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `₹ ${amount?.toLocaleString()}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    }
  ]

  const searchFields = [
    {
      name: 'quotationId',
      placeholder: 'Quotation ID',
      type: 'input'
    },
    {
      name: 'customer',
      placeholder: 'Customer',
      type: 'input'
    },
    {
      name: 'status',
      placeholder: 'Status',
      type: 'select',
      options: [
        { value: 'Draft', label: 'Draft' },
        { value: 'Sent', label: 'Sent' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Expired', label: 'Expired' }
      ]
    },
    {
      name: 'dateRange',
      placeholder: 'Date Range',
      type: 'dateRange'
    }
  ]

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    setLoading(true)
    try {
      const savedQuotations = JSON.parse(localStorage.getItem('quotations') || '[]')
      
      // Add sample data if no quotations exist
      if (savedQuotations.length === 0) {
        const mockData = [
          {
            id: 1,
            quotationId: 'QUO-001',
            quotationNumber: 'QUO-001',
            date: '2024-01-15',
            validUntil: '2024-02-14',
            customer: 'ABC Industries',
            projectName: 'Factory Automation',
            totalAmount: 250000,
            status: 'Draft'
          },
          {
            id: 2,
            quotationId: 'QUO-002',
            quotationNumber: 'QUO-002',
            date: '2024-01-16',
            validUntil: '2024-02-15',
            customer: 'XYZ Corporation',
            projectName: 'Conveyor System',
            totalAmount: 180000,
            status: 'Sent'
          }
        ]
        localStorage.setItem('quotations', JSON.stringify(mockData))
        setQuotations(mockData)
      } else {
        setQuotations(savedQuotations)
      }
    } catch (error) {
      message.error('Failed to fetch quotations')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    navigate('/quotations/create')
  }

  const handleEdit = (record) => {
    navigate('/quotations/edit', { state: { quotation: record } })
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Quotation',
      content: `Are you sure you want to delete quotation "${record.quotationId}"?`,
      onOk: () => {
        const updated = quotations.filter(q => q.id !== record.id)
        setQuotations(updated)
        localStorage.setItem('quotations', JSON.stringify(updated))
        message.success('Quotation deleted successfully')
      }
    })
  }

  const handleView = (record) => {
    console.log('View quotation:', record)
    message.info(`Viewing quotation ${record.quotationId}`)
  }

  const handleSearch = (values) => {
    console.log('Search values:', values)
  }



  return (
    <ERPMasterLayout
      title="Quotations"
      data={quotations}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      searchFields={searchFields}
      onSearch={handleSearch}
      loading={loading}
      buttonType="quotation"
    />
  )
}