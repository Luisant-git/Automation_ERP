import React, { useState, useEffect } from 'react'
import ERPDetailsLayout from '../../../components/ERPDetailsLayout'

export default function PurchaseOrderDetails() {
  const [data, setData] = useState([])

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    const allDetails = orders.flatMap(order => 
      (order.items || []).map(item => ({
        ...item,
        id: item.key,
        poNumber: order.poNumber,
        poDate: order.poDate,
        supplierId: order.supplierId
      }))
    )
    setData(allDetails)
  }, [])

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120
    },
    {
      title: 'PO Date',
      dataIndex: 'poDate',
      key: 'poDate',
      width: 100
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplierId',
      width: 100,
      render: (id) => `Supplier ${id}`
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: 'HSN Code',
      dataIndex: 'hsnCode',
      key: 'hsnCode',
      width: 100
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (qty) => qty?.toFixed(3)
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (rate) => `₹${rate?.toFixed(2)}`
    },
    {
      title: 'Taxable Amount',
      dataIndex: 'taxableAmount',
      key: 'taxableAmount',
      width: 120,
      render: (amount) => `₹${amount?.toFixed(2)}`
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `₹${amount?.toFixed(2)}`
    }
  ]

  return (
    <ERPDetailsLayout
      title="Purchase Order Details"
      data={data}
      columns={columns}
    />
  )
}