import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, Switch, Tag, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const EmployeeMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [employees, setEmployees] = useState([
    {
      key: 1,
      employeeName: 'Arjun Mehta',
      contactNo: '+91-9876543212',
      emailId: 'arjun.mehta@company.com',
      role: 'manager',
      username: 'arjun.mehta',
      password: '********',
      dateOfJoin: '2023-01-15',
      isActive: true
    },
    {
      key: 2,
      employeeName: 'Kavita Sharma',
      contactNo: '+91-9123456787',
      emailId: 'kavita.sharma@company.com',
      role: 'engineer',
      username: 'kavita.sharma',
      password: '********',
      dateOfJoin: '2023-03-20',
      isActive: true
    },
    {
      key: 3,
      employeeName: 'Rohit Patel',
      contactNo: '+91-9988776653',
      emailId: 'rohit.patel@company.com',
      role: 'technician',
      username: 'rohit.patel',
      password: '********',
      dateOfJoin: '2023-05-10',
      isActive: false
    },
    {
      key: 4,
      employeeName: 'Sneha Reddy',
      contactNo: '+91-9555666777',
      emailId: 'sneha.reddy@company.com',
      role: 'supervisor',
      username: 'sneha.reddy',
      password: '********',
      dateOfJoin: '2023-02-28',
      isActive: true
    },
    {
      key: 5,
      employeeName: 'Manoj Kumar',
      contactNo: '+91-9444555666',
      emailId: 'manoj.kumar@company.com',
      role: 'operator',
      username: 'manoj.kumar',
      password: '********',
      dateOfJoin: '2023-04-05',
      isActive: true
    },
    {
      key: 6,
      employeeName: 'Admin User',
      contactNo: '+91-9000000000',
      emailId: 'admin@company.com',
      role: 'admin',
      username: 'admin',
      password: '********',
      dateOfJoin: '2022-12-01',
      isActive: true
    }
  ])

  const columns = [
    { title: 'Employee Name', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Contact No', dataIndex: 'contactNo', key: 'contactNo' },
    { title: 'Email ID', dataIndex: 'emailId', key: 'emailId' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { 
      title: 'Date of Join', 
      dataIndex: 'dateOfJoin', 
      key: 'dateOfJoin',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive', 
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      dateOfJoin: values.dateOfJoin ? values.dateOfJoin.format('YYYY-MM-DD') : null
    }
    
    if (editingRecord) {
      setEmployees(employees.map(e => e.key === editingRecord.key ? { ...formattedValues, key: editingRecord.key } : e))
      message.success('Employee updated successfully')
    } else {
      setEmployees([...employees, { ...formattedValues, key: Date.now() }])
      message.success('Employee added successfully')
    }
    setIsModalVisible(false)
    form.resetFields()
    setEditingRecord(null)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      dateOfJoin: record.dateOfJoin ? dayjs(record.dateOfJoin) : null
    })
    setIsModalVisible(true)
  }

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Delete Employee',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this employee? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setEmployees(employees.filter(e => e.key !== key))
        message.success('Employee deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Employee Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Employee</Button>}
      >
        <Table columns={columns} dataSource={employees} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Employee' : 'Add Employee'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingRecord(null)
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="employeeName" label="Employee Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactNo" label="Contact No" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="emailId" label="Email ID" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select Role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="supervisor">Supervisor</Select.Option>
              <Select.Option value="technician">Technician</Select.Option>
              <Select.Option value="operator">Operator</Select.Option>
              <Select.Option value="engineer">Engineer</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateOfJoin" label="Date of Join" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? 'Update' : 'Save'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false)
                form.resetFields()
                setEditingRecord(null)
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EmployeeMaster