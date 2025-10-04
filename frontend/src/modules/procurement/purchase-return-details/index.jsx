import React, { useState, useEffect } from 'react'
import { Tag } from 'antd'
import ERPDetailsLayout from '../../../components/ERPDetailsLayout'

export default function PurchaseReturnDetails() {
  const [data, setData] = useState([])

  useEffect(() => {
    const returns = JSON.parse(localStorage.getItem('purchaseReturns') || '[]')
    const allDetails = returns.flatMap(returnItem => 
      (returnItem.details || []).map(detail => ({
        ...detail,
        returnNumber: returnItem.returnNumber,
        returnDate: returnItem.returnDate,
        supplierId: returnItem.supplierId,
        returnType: returnItem.returnType
      }))
    )
    setData(allDetails)
  }, [])

  const returnTypes = {
    1: 'Damage',
    2: 'Quality', 
    3: 'Excess',
    4: 'Other'
  }

  const columns = [
    {
      title: 'Return Number',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      width: 120
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
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
      title: 'Return Type',
      dataIndex: 'returnType',
      key: 'returnType',
      width: 100,
      render: (type) => <Tag color="blue">{returnTypes[type]}</Tag>
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
      title: 'Return Qty',
      dataIndex: 'returnQuantity',
      key: 'returnQuantity',
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
    },
    {
      title: 'Return Reason',
      dataIndex: 'returnReason',
      key: 'returnReason',
      width: 150
    }
  ]

  return (
    <ERPDetailsLayout
      title="Purchase Return Details"
      data={data}
      columns={columns}
    />
  )
}