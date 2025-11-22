import React, { useState, useEffect } from 'react'
import { message, Modal, Tag, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import ERPMasterLayout from '../components/ERPMasterLayout'

export default function InvoiceList() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status) => {
    const colors = {
      'Generated': 'success',
      'Sent': 'processing',
      'Paid': 'green',
      'Overdue': 'error'
    }
    return colors[status] || 'default'
  }

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 100,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150
    },
    {
      title: 'Work Order',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
      width: 120
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
    },
    {
      title: 'Invoice File',
      key: 'download',
      width: 120,
      render: (_, record) => record.invoiceFile ? (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadFile(record)}
        >
          Download
        </Button>
      ) : '-'
    }
  ]

  const searchFields = [
    {
      name: 'invoiceNumber',
      placeholder: 'Invoice Number',
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
        { value: 'Generated', label: 'Generated' },
        { value: 'Sent', label: 'Sent' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Overdue', label: 'Overdue' }
      ]
    },
    {
      name: 'dateRange',
      placeholder: 'Date Range',
      type: 'dateRange'
    }
  ]

  useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('customers') || '[]')
    setCustomers(savedCustomers)
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')
      setInvoices(savedInvoices)
    } catch (error) {
      message.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    navigate('/sales/invoice/create')
  }

  const handleEdit = (record) => {
    navigate('/sales/invoice/edit', { state: { invoice: record } })
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Invoice',
      content: `Are you sure you want to delete invoice "${record.invoiceNumber}"?`,
      onOk: () => {
        const updated = invoices.filter(inv => inv.id !== record.id)
        setInvoices(updated)
        localStorage.setItem('invoices', JSON.stringify(updated))
        message.success('Invoice deleted successfully')
      }
    })
  }

  const handleView = (record) => {
    console.log('View invoice:', record)
    message.info(`Viewing invoice ${record.invoiceNumber}`)
  }

  const handleSearch = (values) => {
    console.log('Search values:', values)
  }

  const handleDownloadFile = (record) => {
    if (!record.invoiceFile) {
      message.error('No file available')
      return
    }
    try {
      const binary = atob(record.invoiceFile.data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: record.invoiceFile.type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = record.invoiceFile.name
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('File downloaded successfully')
    } catch (error) {
      message.error('Failed to download file')
    }
  }

  return (
    <ERPMasterLayout
      title="Invoices"
      data={invoices}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onView={handleView}
      searchFields={searchFields}
      onSearch={handleSearch}
      loading={loading}
      buttonType="invoice"
    />
  )
}