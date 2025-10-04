import React from 'react'
import { Card, Table } from 'antd'

export default function ERPDetailsLayout({ 
  title, 
  data, 
  columns,
  loading = false 
}) {
  return (
    <Card title={title}>
      <Table
        columns={columns}
        dataSource={data}
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