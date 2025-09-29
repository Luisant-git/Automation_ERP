
import React, { useState } from 'react'
import { Button, Form, Input, Card } from 'antd'
import DataTable from '../../../components/DataTable'

export default function TrackServicebyProjectAndEmployee() {
  const [rows, setRows] = useState([])
  const columns = [
    { title:'Name', dataIndex:'name' },
    { title:'Description', dataIndex:'desc' }
  ]
  const onCreate = (values) => {
    setRows([{ id: Date.now(), ...values }, ...rows])
  }
  return (
    <div>
      <div className="page-header">
        <h2>Track Service by Project & Employee</h2>
      </div>
      <Card title="Quick Create">
        <Form layout="inline" onFinish={onCreate}>
          <Form.Item name="name" rules={[{required:true}]}>
            <Input placeholder="Name"/>
          </Form.Item>
          <Form.Item name="desc">
            <Input placeholder="Description"/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add</Button>
          </Form.Item>
        </Form>
      </Card>
      <DataTable title="Track Service by Project & Employee List" columns={columns} data={rows} />
    </div>
  )
}
