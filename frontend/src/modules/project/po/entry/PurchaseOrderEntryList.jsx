import React, { useState, useEffect } from 'react'
import { Modal, message, Tag } from 'antd'
import ERPMasterLayout from '../../../../components/ERPMasterLayout'
import { purchaseOrderEntryAPI, useApiLoading } from '../../../../services/apiService'

export default function PurchaseOrderEntryList({ onEdit, onAdd }) {
  const [data, setData] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const entries = await executeWithLoading(() => purchaseOrderEntryAPI.getAll())
      setData(entries)
    } catch (error) {
      message.error('Failed to load purchase entries')
    }
  }

  const columns = [
    {
      title: 'Purchase Entry Number',
      dataIndex: 'purchaseEntryNumber',
      key: 'purchaseEntryNumber',
      render: (text) => <strong style={{ color: '#722ed1' }}>{text || 'N/A'}</strong>
    },
    {
      title: 'Purchase Invoice Number',
      dataIndex: 'purchaseInvoiceNumber',
      key: 'purchaseInvoiceNumber',
      render: (text) => <strong style={{ color: '#52c41a' }}>{text || 'N/A'}</strong>
    },
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text, record) => {
        const poNumber = text || record.purchaseOrderId || (Array.isArray(record.poNumber) ? record.poNumber.join(', ') : record.poNumber)
        return <strong style={{ color: '#1890ff' }}>{poNumber}</strong>
      }
    },
    // {
    //   title: 'Work Order Number',
    //   dataIndex: 'workOrderNumber',
    //   key: 'workOrderNumber'
    // },
    // {
    //   title: 'Quotation Number',
    //   dataIndex: 'quotationNumbers',
    //   key: 'quotationNumbers'
    // },
    {
      title: 'PO Date',
      dataIndex: 'poDate',
      key: 'poDate',
      render: (text, record) => {
        const date = text || record.invoiceDate
        return date ? new Date(date).toLocaleDateString('en-GB') : 'N/A'
      }
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: (id, record) => record.supplierName || record.supplier?.name || record.supplier || (id ? `Supplier ${id}` : 'N/A')
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val, record) => {
        const amount = val || record.grossAmount || 0
        return `₹${amount.toFixed(2)}`
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const finalStatus = status || (record.poStatus === 1 ? 'Draft' : record.poStatus === 2 ? 'Submitted' : 'Approved')
        const statusMap = {
          'Draft': { color: 'orange', text: 'Draft' },
          'Submitted': { color: 'blue', text: 'Submitted' },
          'Approved': { color: 'green', text: 'Approved' }
        }
        const info = statusMap[finalStatus] || { color: 'default', text: finalStatus || 'Unknown' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    }
  ]

  const searchFields = [
    { name: 'purchaseInvoiceNumber', placeholder: 'Purchase Invoice Number', type: 'input' },
    { name: 'poNumber', placeholder: 'PO Number', type: 'input' },
    { name: 'supplierId', placeholder: 'Supplier', type: 'select', options: [
      { value: 1, label: 'Supplier 1' },
      { value: 2, label: 'Supplier 2' }
    ]},
    { name: 'dateRange', placeholder: 'Date Range', type: 'dateRange' }
  ]

  const handleEdit = (record) => {
    const editData = {
      ...record,
      items: typeof record.lineItems === 'string' ? JSON.parse(record.lineItems) : record.lineItems || [],
      poNumber: typeof record.purchaseOrderId === 'string' ? [record.purchaseOrderId] : record.poNumber
    }
    onEdit(editData)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Order Entry',
      content: `Delete Purchase Entry ${record.purchaseInvoiceNumber || record.poNumber}?`,
      onOk: async () => {
        try {
          await executeWithLoading(() => purchaseOrderEntryAPI.delete(record.id))
          await loadData()
          message.success('Deleted successfully')
        } catch (error) {
          message.error('Failed to delete purchase entry')
        }
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
      loading={loading}
    />
  )
}