import React from 'react'
import { Table, Card } from 'antd'

export default function DataTable({ title, columns, data, rowKey='id', extra }){
  return (
    <Card title={title} extra={extra} style={{ marginTop: 12 }}>
      <Table columns={columns} dataSource={data} rowKey={rowKey} pagination={{ pageSize: 8 }} />
    </Card>
  )
}
