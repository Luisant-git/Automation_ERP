import React, { useState } from 'react'
import { Card, Table, Input, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export default function ERPDetailsLayout({ 
  title, 
  data, 
  columns,
  loading = false 
}) {
  const [searchText, setSearchText] = useState('')

  const filteredData = data.filter(item => {
    if (!searchText) return true
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  })

  return (
    <Card title={title}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </Space>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        scroll={{ x: 1200 }}
        size="small"
      />
    </Card>
  )
}