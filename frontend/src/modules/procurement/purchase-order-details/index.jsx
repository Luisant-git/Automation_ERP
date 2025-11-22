import React, { useState, useEffect } from 'react'
import { Card, Table, Input, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Plus, Minus } from 'lucide-react'


export default function PurchaseOrderDetails() {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
    const groupedData = orders.map(order => {
      const totalQty = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
      const totalTaxable = (order.items || []).reduce((sum, item) => sum + (item.taxableAmount || 0), 0)
      const totalAmount = (order.items || []).reduce((sum, item) => sum + (item.totalAmount || 0), 0)
      
      return {
        id: order.id,
        poNumber: order.poNumber,
        quotationNumber: order.quotationNumber,
        poType: order.poType,
        poDate: order.poDate,
        supplierId: order.supplierId,
        items: order.items || [],
        itemCount: (order.items || []).length,
        totalQuantity: totalQty,
        totalTaxableAmount: totalTaxable,
        totalAmount: totalAmount
      }
    })
    setData(groupedData)
    setFilteredData(groupedData)
  }, [])

  const handleSearch = (value) => {
    setSearchText(value)
    const filtered = data.filter(item => 
      item.poNumber?.toLowerCase().includes(value.toLowerCase()) ||
      item.quotationNumber?.toLowerCase().includes(value.toLowerCase()) ||
      item.poType?.toLowerCase().includes(value.toLowerCase()) ||
      item.supplierId?.toString().includes(value)
    )
    setFilteredData(filtered)
  }

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120
    },
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      width: 150
    },
    {
      title: 'PO Type',
      dataIndex: 'poType',
      key: 'poType',
      width: 100,
      render: (text) => {
        const typeMap = { project: 'Project', trade: 'Trade', shift: 'Shift' }
        return typeMap[text] || 'N/A'
      }
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
      title: 'Item Count',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 100
    },
    {
      title: 'Total Quantity',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 120,
      render: (qty) => qty?.toFixed(3)
    },
    {
      title: 'Total Taxable Amount',
      dataIndex: 'totalTaxableAmount',
      key: 'totalTaxableAmount',
      width: 150,
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

  const expandedRowRender = (record) => {
    const itemColumns = [
      { title: 'Description', dataIndex: 'description', key: 'description', width: 200 },
      { title: 'HSN Code', dataIndex: 'hsnCode', key: 'hsnCode', width: 100 },
      { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100, render: (qty) => qty?.toFixed(3) },
      { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 100, render: (rate) => `₹${rate?.toFixed(2)}` },
      { title: 'Taxable Amount', dataIndex: 'taxableAmount', key: 'taxableAmount', width: 120, render: (amount) => `₹${amount?.toFixed(2)}` },
      { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (amount) => `₹${amount?.toFixed(2)}` }
    ]
    
    return (
      <Table
        columns={itemColumns}
        dataSource={record.items}
        pagination={false}
        rowKey="key"
        size="small"
      />
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Purchase Order Details">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.items.length > 0,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <Minus
                  className="custom-expand-icon"
                  onClick={(e) => onExpand(record, e)}
                  size={16}
                />
              ) : (
                <Plus
                  className="custom-expand-icon"
                  onClick={(e) => onExpand(record, e)}
                  size={16}
                />
              )
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  )
}