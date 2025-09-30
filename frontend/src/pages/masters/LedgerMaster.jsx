import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, InputNumber, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const LedgerMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [selectedType, setSelectedType] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [isControlAccount, setIsControlAccount] = useState(false)
  const [showBankReco, setShowBankReco] = useState(false)
  
  // Account Groups data
  const accountGroups = {
    Asset: [
      'Bank Accounts',
      'Cash-in-hand', 
      'Sundry Debtors',
      'Stock-in-hand',
      'Fixed Assets',
      'Investments'
    ],
    Liability: [
      'Sundry Creditors',
      'Bank Overdraft',
      'Secured Loans',
      'Unsecured Loans',
      'Capital Account'
    ],
    Income: [
      'Sales Account',
      'Service Income',
      'Other Income',
      'Interest Income'
    ],
    Expense: [
      'Purchase Account',
      'Direct Expenses',
      'Indirect Expenses',
      'Administrative Expenses'
    ]
  }
  
  // Subgroups based on selected group
  const subGroups = {
    'Bank Accounts': ['Savings Account', 'Current Account', 'Fixed Deposit'],
    'Cash-in-hand': ['Petty Cash', 'Cash Counter'],
    'Sundry Debtors': ['Trade Debtors', 'Other Debtors'],
    'Sundry Creditors': ['Trade Creditors', 'Other Creditors'],
    'Fixed Assets': ['Land & Building', 'Plant & Machinery', 'Furniture & Fixtures'],
    'Sales Account': ['Domestic Sales', 'Export Sales'],
    'Purchase Account': ['Raw Material', 'Finished Goods'],
    'Direct Expenses': ['Manufacturing', 'Labor Cost'],
    'Indirect Expenses': ['Office Expenses', 'Marketing Expenses']
  }
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
    // Check for unique code
    const codeExists = ledgers.some(l => 
      l.code === values.code && (!editingRecord || l.key !== editingRecord.key)
    )
    
    if (codeExists) {
      message.error('Code must be unique. This code already exists.')
      return
    }
    
    console.log('Form Data:', JSON.stringify(values, null, 2))
    
    if (editingRecord) {
      setLedgers(ledgers.map(l => l.key === editingRecord.key ? { ...values, key: editingRecord.key } : l))
      message.success('Ledger updated successfully')
    } else {
      setLedgers([...ledgers, { ...values, key: Date.now() }])
      message.success('Ledger added successfully')
    }
    setIsModalVisible(false)
    handleCancel()
  }
  
  const handleCancel = () => {
    form.resetFields()
    setEditingRecord(null)
    setSelectedType('')
    setSelectedGroup('')
    setIsControlAccount(false)
    setShowBankReco(false)
    // Set defaults
    form.setFieldsValue({
      currency: 'INR'
    })
  }
  
  const handleTypeChange = (type) => {
    setSelectedType(type)
    form.setFieldValue('group', undefined)
    form.setFieldValue('subgroup', undefined)
    setSelectedGroup('')
    
    // Auto-set balance type based on type
    if (type === 'Asset' || type === 'Expense') {
      form.setFieldValue('balanceType', 'Dr')
    } else if (type === 'Liability' || type === 'Income') {
      form.setFieldValue('balanceType', 'Cr')
    }
  }
  
  const handleGroupChange = (group) => {
    setSelectedGroup(group)
    form.setFieldValue('subgroup', undefined)
    
    // Show bank reconciliation toggle for Bank Accounts
    setShowBankReco(group === 'Bank Accounts')
    
    // Auto-set balance type based on group
    if (group.includes('Assets') || group.includes('Expenses')) {
      form.setFieldValue('balanceType', 'Dr')
    } else {
      form.setFieldValue('balanceType', 'Cr')
    }
  }
  
  const handleControlAccountChange = (checked) => {
    setIsControlAccount(checked)
    if (checked) {
      form.setFieldValue('subgroup', undefined)
    }
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
          handleCancel()
        }}
        afterOpenChange={(open) => {
          if (open && !editingRecord) {
            // Set defaults for new record
            form.setFieldsValue({
              currency: 'INR'
            })
          }
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
                <Select placeholder="Select Type" onChange={handleTypeChange}>
                  <Select.Option value="Asset">Asset</Select.Option>
                  <Select.Option value="Liability">Liability</Select.Option>
                  <Select.Option value="Income">Income</Select.Option>
                  <Select.Option value="Expense">Expense</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="group" label="Group" rules={[{ required: true }]}>
                <Select 
                  placeholder="Select Group" 
                  onChange={handleGroupChange}
                  disabled={!selectedType}
                >
                  {selectedType && accountGroups[selectedType]?.map(group => (
                    <Select.Option key={group} value={group}>{group}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="subgroup" label="Subgroup">
                <Select 
                  placeholder="Select Subgroup" 
                  disabled={isControlAccount || !selectedGroup}
                  allowClear
                >
                  {selectedGroup && subGroups[selectedGroup]?.map(subgroup => (
                    <Select.Option key={subgroup} value={subgroup}>{subgroup}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="openingBalance" 
                label="Opening Balance"
                rules={[
                  { type: 'number', message: 'Please enter a valid number' }
                ]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="0.00"
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                name="balanceType" 
                label="Balance Type" 
                rules={[
                  {
                    required: () => form.getFieldValue('openingBalance') > 0,
                    message: 'Balance Type is required when Opening Balance is entered'
                  }
                ]}
              >
                <Select placeholder="Dr/Cr">
                  <Select.Option value="Dr">Debit (Dr)</Select.Option>
                  <Select.Option value="Cr">Credit (Cr)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isControl" label="Control Account?" valuePropName="checked">
                <Switch onChange={handleControlAccountChange} />
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
            {showBankReco && (
              <Col span={8}>
                <Form.Item name="bankReco" label="Bank Reconciliation" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            )}
            <Col span={showBankReco ? 8 : 16}>
              <Form.Item name="currency" label="Currency" initialValue="INR">
                <Select>
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
                handleCancel()
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