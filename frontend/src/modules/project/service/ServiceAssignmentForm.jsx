import React, { useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, Row, Col, Card, Space, Typography } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

export default function ServiceAssignmentForm({ initialValues, onSubmit, onCancel }) {
  const [form] = Form.useForm()

  const generateServiceId = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `SRV${year}${month}${random}`
  }

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        assignedDate: initialValues.assignedDate ? dayjs(initialValues.assignedDate) : dayjs(),
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
      })
    } else {
      form.setFieldsValue({
        serviceId: generateServiceId(),
        assignedDate: dayjs(),
        status: 'Assigned',
        priority: 'Medium'
      })
    }
  }, [initialValues])

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      assignedDate: values.assignedDate?.format('YYYY-MM-DD'),
      dueDate: values.dueDate?.format('YYYY-MM-DD'),
    }
    onSubmit(formattedValues)
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={onCancel}
              style={{ marginRight: '8px' }}
            />
            <Typography.Title level={3} style={{ margin: '0', color: '#333' }}>
              Create Service Assignment
            </Typography.Title>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="Assignment Details">
                <Form.Item name="serviceId" label="Service ID">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="assignedDate" label="Assigned Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Assigned">Assigned</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Completed">Completed</Option>
                    <Option value="On Hold">On Hold</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Assignment Information">
                <Form.Item name="employeeName" label="Employee" rules={[{ required: true }]}>
                  <Select placeholder="Select employee">
                    <Option value="John Smith">John Smith</Option>
                    <Option value="Sarah Johnson">Sarah Johnson</Option>
                    <Option value="Mike Wilson">Mike Wilson</Option>
                    <Option value="Lisa Brown">Lisa Brown</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="projectName" label="Project" rules={[{ required: true }]}>
                  <Select placeholder="Select project">
                    <Option value="Factory Automation">Factory Automation</Option>
                    <Option value="Warehouse Management">Warehouse Management</Option>
                    <Option value="Quality Control System">Quality Control System</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                  <Select>
                    <Option value="High">High</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="Low">Low</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="serviceName" label="Service Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter service name" />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: '24px' }}>
            <Col span={24}>
              <Card size="small" title="Service Description">
                <Form.Item name="description" label="Description">
                  <TextArea rows={3} placeholder="Enter service description" />
                </Form.Item>
                <Form.Item name="notes" label="Notes">
                  <TextArea rows={2} placeholder="Enter any additional notes" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            size="large"
            style={{ minWidth: '150px', paddingTop: '8px', paddingBottom: '8px' }}
          >
            {initialValues ? 'Update' : 'Save'}
          </Button>
        </Space>
      </div>
    </div>
  )
}