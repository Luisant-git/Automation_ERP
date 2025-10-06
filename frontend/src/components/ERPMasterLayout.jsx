import React, { useState } from 'react'
import { Card, Button, Table, Space, Input, Form, Select, DatePicker } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

export default function ERPMasterLayout({ 
  title, 
  data, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView,
  searchFields = [],
  onSearch,
  buttonType = 'default' // 'order', 'return', 'sales', 'default'
}) {
  const [searchForm] = Form.useForm()

  const getButtonText = () => {
    switch(buttonType) {
      case 'order': return 'Add New Order'
      case 'return': return 'Add New Return'
      case 'sales': return 'Add New Order'
      case 'project': return 'Add New Project'
      case 'service': return 'Assign Service'
      default: return 'Add New'
    }
  }

  const handleSearch = (values) => {
    onSearch && onSearch(values)
  }

  const actionColumn = {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space>
        {onView && (
          <Button icon={<EyeOutlined />} size="small" onClick={() => onView(record)} />
        )}
        {onEdit && (
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
        )}
        {onDelete && (
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDelete(record)} />
        )}
      </Space>
    )
  }

  const tableColumns = [...columns, actionColumn]

  return (
    <div>
      {/* Search Section */}
      {searchFields.length > 0 && (
        <Card title="Search" size="small" style={{ marginBottom: 16 }}>
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            {searchFields.map(field => (
              <Form.Item key={field.name} name={field.name}>
                {field.type === 'select' ? (
                  <Select placeholder={field.placeholder} style={{ width: field.width || 150 }} allowClear>
                    {field.options?.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : field.type === 'dateRange' ? (
                  <RangePicker />
                ) : (
                  <Input placeholder={field.placeholder} />
                )}
              </Form.Item>
            ))}
            <Form.Item>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                Search
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Data Table */}
      <Card 
        title={title}
        extra={
          onAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              {getButtonText()}
            </Button>
          )
        }
      >
        <Table
          columns={tableColumns}
          dataSource={data}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </div>
  )
}