import React from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Button, Row, Col } from 'antd'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

export default function ProjectForm({ initialValues, onSubmit, onCancel }) {
  const [form] = Form.useForm()

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      startDate: values.startDate?.format('YYYY-MM-DD'),
      endDate: values.endDate?.format('YYYY-MM-DD'),
    }
    onSubmit(formattedValues)
  }

  const initialFormValues = initialValues ? {
    ...initialValues,
    startDate: initialValues.startDate ? dayjs(initialValues.startDate) : null,
    endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
  } : {}

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialFormValues}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="projectCode"
            label="Project Code"
            rules={[{ required: true, message: 'Please enter project code' }]}
          >
            <Input placeholder="Enter project code" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="clientName"
            label="Client Name"
            rules={[{ required: true, message: 'Please enter client name' }]}
          >
            <Input placeholder="Enter client name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Planning">Planning</Option>
              <Option value="Active">Active</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: 'Please select end date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="budget"
            label="Budget (₹)"
            rules={[{ required: true, message: 'Please enter budget' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter budget amount"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="priority"
            label="Priority"
          >
            <Select placeholder="Select priority">
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
              <Option value="Critical">Critical</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Description"
      >
        <TextArea
          rows={4}
          placeholder="Enter project description"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          {initialValues ? 'Update' : 'Create'} Project
        </Button>
      </Form.Item>
    </Form>
  )
}