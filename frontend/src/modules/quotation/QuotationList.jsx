import React, { useState, useEffect } from 'react'
import { message, Modal, Tag, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import ERPMasterLayout from '../../components/ERPMasterLayout'
import { quotationAPI, customerAPI, useApiLoading } from '../../services/apiService'

export default function QuotationList() {
  const navigate = useNavigate()
  const [quotations, setQuotations] = useState([])
  const [customers, setCustomers] = useState([])
  const { loading, executeWithLoading } = useApiLoading()



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
      title: 'Type',
      dataIndex: 'quotationType',
      key: 'quotationType',
      width: 100,
      render: (type) => {
        const typeMap = { project: 'Project', trade: 'Trade', shifting: 'Shifting' }
        return <Tag color="blue">{typeMap[type] || 'N/A'}</Tag>
      }
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
      dataIndex: 'customerId',
      key: 'customer',
      width: 150,
      render: (customerId) => {
        const customer = customers.find(c => c.id === customerId)
        return customer?.name || customer?.companyName || 'N/A'
      }
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
    },
    {
      title: 'Costing Sheet',
      key: 'download',
      width: 120,
      render: (_, record) => record.excelFile ? (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadExcel(record)}
        >
          Download
        </Button>
      ) : '-'
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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [quotationsData, customersData] = await Promise.all([
        executeWithLoading(() => quotationAPI.getAll()),
        executeWithLoading(() => customerAPI.getAll())
      ])
      // Sort quotations by creation date/id in descending order (newest first)
      const sortedQuotations = quotationsData.sort((a, b) => b.id - a.id)
      setQuotations(sortedQuotations)
      setCustomers(customersData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
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
      content: `Are you sure you want to delete quotation "${record.quotationNumber}"?`,
      onOk: async () => {
        try {
          await executeWithLoading(() => quotationAPI.delete(record.id))
          setQuotations(prev => prev.filter(q => q.id !== record.id))
          message.success('Quotation deleted successfully')
        } catch (error) {
          console.error('Failed to delete quotation:', error)
        }
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

  const handleDownloadExcel = (record) => {
    if (!record.excelFile) {
      message.error('No file available')
      return
    }
    try {
      const binary = atob(record.excelFile.data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: record.excelFile.type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = record.excelFile.name
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('File downloaded successfully')
    } catch (error) {
      message.error('Failed to download file')
    }
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