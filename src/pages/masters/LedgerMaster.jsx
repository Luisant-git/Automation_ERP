import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, InputNumber, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const LedgerMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [ledgers, setLedgers] = useState([
    {
      key: 1,
      code: '1001',
      name: 'Cash in Hand',
      type: 'Asset',
      group: 'Current Assets',
      subgroup: 'Cash & Bank',
      openingBalance: 50000,
      balanceType: 'Dr',
      isControl: false,
      gstTag: '',
      bankReco: false,
      branch: 'Head Office',
      costCenter: 'Admin',
      currency: 'INR'
    },
    {
      key: 2,
      code: '1002',
      name: 'Bank Account - SBI',
      type: 'Asset',
      group: 'Current Assets',
      subgroup: 'Cash & Bank',
      openingBalance: 250000,
      balanceType: 'Dr',
      isControl: false,
      gstTag: '',
      bankReco: true,
      branch: 'Head Office',
      costCenter: 'Admin',
      currency: 'INR'
    },
    {
      key: 3,
      code: '2001',
      name: 'Accounts Receivable',
      type: 'Asset',
      group: 'Current Assets',
      subgroup: 'Debtors',
      openingBalance: 150000,
      balanceType: 'Dr',
      isControl: true,
      gstTag: 'Taxable',
      bankReco: false,
      branch: 'Head Office',
      costCenter: 'Sales',
      currency: 'INR'
    },
    {
      key: 4,
      code: '3001',
      name: 'Accounts Payable',
      type: 'Liability',
      group: 'Current Liabilities',
      subgroup: 'Creditors',
      openingBalance: 80000,
      balanceType: 'Cr',
      isControl: true,
      gstTag: 'Taxable',
      bankReco: false,
      branch: 'Head Office',
      costCenter: 'Purchase',
      currency: 'INR'
    },
    {
      key: 5,
      code: '4001',
      name: 'Sales Revenue',
      type: 'Income',
      group: 'Direct Income',
      subgroup: 'Sales',
      openingBalance: 0,
      balanceType: 'Cr',
      isControl: false,
      gstTag: 'Taxable',
      bankReco: false,
      branch: 'Head Office',
      costCenter: 'Sales',
      currency: 'INR'
    },
    {
      key: 6,
      code: '5001',
      name: 'Office Rent',
      type: 'Expense',
      group: 'Indirect Expenses',
      subgroup: 'Administrative',
      openingBalance: 0,
      balanceType: 'Dr',
      isControl: false,
      gstTag: 'Taxable',
      bankReco: false,
      branch: 'Head Office',
      costCenter: 'Admin',
      currency: 'INR'
    }
  ])

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code', width: 80 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 100 },
    { title: 'Group', dataIndex: 'group', key: 'group', width: 150 },
    { title: 'Opening Balance', key: 'balance', width: 120, render: (_, record) => `₹${record.openingBalance} ${record.balanceType}` },
    { title: 'Control', dataIndex: 'isControl', key: 'isControl', width: 80, render: (val) => val ? 'Yes' : 'No' },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = (values) => {
    if (editingRecord) {
      setLedgers(ledgers.map(l => l.key === editingRecord.key ? { ...values, key: editingRecord.key } : l))
      message.success('Ledger updated successfully')
    } else {
      setLedgers([...ledgers, { ...values, key: Date.now() }])
      message.success('Ledger added successfully')
    }
    setIsModalVisible(false)
    form.resetFields()
    setEditingRecord(null)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Delete Ledger',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this ledger? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setLedgers(ledgers.filter(l => l.key !== key))
        message.success('Ledger deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Ledger Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Ledger</Button>}
      >
        <Table columns={columns} dataSource={ledgers} scroll={{ x: 1000 }} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Ledger' : 'Add Ledger'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setEditingRecord(null)
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                <Input placeholder="e.g., 1001" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="e.g., Cash in Hand" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select placeholder="Select Type">
                  <Select.Option value="Asset">Asset</Select.Option>
                  <Select.Option value="Liability">Liability</Select.Option>
                  <Select.Option value="Income">Income</Select.Option>
                  <Select.Option value="Expense">Expense</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="group" label="Group" rules={[{ required: true }]}>
                <Select placeholder="Select Group">
                  <Select.Option value="Current Assets">Current Assets</Select.Option>
                  <Select.Option value="Fixed Assets">Fixed Assets</Select.Option>
                  <Select.Option value="Current Liabilities">Current Liabilities</Select.Option>
                  <Select.Option value="Long Term Liabilities">Long Term Liabilities</Select.Option>
                  <Select.Option value="Direct Income">Direct Income</Select.Option>
                  <Select.Option value="Indirect Income">Indirect Income</Select.Option>
                  <Select.Option value="Direct Expenses">Direct Expenses</Select.Option>
                  <Select.Option value="Indirect Expenses">Indirect Expenses</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="subgroup" label="Subgroup">
                <Input placeholder="e.g., Cash & Bank" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="openingBalance" label="Opening Balance">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="balanceType" label="Balance Type" rules={[{ required: true }]}>
                <Select placeholder="Dr/Cr">
                  <Select.Option value="Dr">Debit (Dr)</Select.Option>
                  <Select.Option value="Cr">Credit (Cr)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isControl" label="Is Control Account?" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gstTag" label="GST Tag">
                <Select placeholder="Select GST Tag" allowClear>
                  <Select.Option value="Taxable">Taxable</Select.Option>
                  <Select.Option value="Exempt">Exempt</Select.Option>
                  <Select.Option value="Zero Rated">Zero Rated</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bankReco" label="Bank Reconciliation" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currency" label="Currency">
                <Select defaultValue="INR">
                  <Select.Option value="INR">INR</Select.Option>
                  <Select.Option value="USD">USD</Select.Option>
                  <Select.Option value="EUR">EUR</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="branch" label="Branch">
                <Input placeholder="e.g., Head Office" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="costCenter" label="Cost Center">
                <Input placeholder="e.g., Admin" />
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

export default LedgerMaster