import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'

const CustomerMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  
  const states = [
    { code: '28', name: 'Andhra Pradesh' },
    { code: '12', name: 'Arunachal Pradesh' },
    { code: '18', name: 'Assam' },
    { code: '10', name: 'Bihar' },
    { code: '22', name: 'Chhattisgarh' },
    { code: '07', name: 'Delhi' },
    { code: '30', name: 'Goa' },
    { code: '24', name: 'Gujarat' },
    { code: '06', name: 'Haryana' },
    { code: '02', name: 'Himachal Pradesh' },
    { code: '01', name: 'Jammu and Kashmir' },
    { code: '20', name: 'Jharkhand' },
    { code: '29', name: 'Karnataka' },
    { code: '32', name: 'Kerala' },
    { code: '23', name: 'Madhya Pradesh' },
    { code: '27', name: 'Maharashtra' },
    { code: '14', name: 'Manipur' },
    { code: '17', name: 'Meghalaya' },
    { code: '15', name: 'Mizoram' },
    { code: '13', name: 'Nagaland' },
    { code: '21', name: 'Odisha' },
    { code: '03', name: 'Punjab' },
    { code: '08', name: 'Rajasthan' },
    { code: '11', name: 'Sikkim' },
    { code: '33', name: 'Tamil Nadu' },
    { code: '36', name: 'Telangana' },
    { code: '16', name: 'Tripura' },
    { code: '09', name: 'Uttar Pradesh' },
    { code: '05', name: 'Uttarakhand' },
    { code: '19', name: 'West Bengal' }
  ]
  const [customers, setCustomers] = useState([
    {
      key: 1,
      name: 'Rajesh Kumar',
      companyName: 'Tata Steel Ltd',
      contactPerson: 'Amit Sharma',
      contactNo: '+91-9876543210',
      emailId: 'rajesh.kumar@tatasteel.com',
      phoneNo: '+91-22-66658000',
      gstNumber: '27AAACT2727Q1ZZ',
      billingAddress: { address: 'Bombay House, 24 Homi Mody Street, Mumbai 400001', state: 'Maharashtra', stateCode: '27', city: 'Mumbai', country: 'India' },
      shippingAddresses: [
        { address: 'Tata Steel Complex, Jamshedpur, Jharkhand 831001', state: 'Jharkhand', stateCode: '20', city: 'Jamshedpur', country: 'India' }
      ]
    },
    {
      key: 2,
      name: 'Priya Patel',
      companyName: 'Reliance Industries',
      contactPerson: 'Suresh Patel',
      contactNo: '+91-9123456789',
      emailId: 'priya.patel@ril.com',
      phoneNo: '+91-22-30386000',
      gstNumber: '24AAACR5055K1Z5',
      billingAddress: { address: '3rd Floor, Maker Chambers IV, Nariman Point, Mumbai 400021', state: 'Maharashtra', stateCode: '27', city: 'Mumbai', country: 'India' },
      shippingAddresses: [
        { address: 'Reliance Corporate Park, Navi Mumbai 400701', state: 'Maharashtra', stateCode: '27', city: 'Navi Mumbai', country: 'India' }
      ]
    },
    {
      key: 3,
      name: 'Vikram Singh',
      companyName: 'Larsen & Toubro',
      contactPerson: 'Ravi Kumar',
      contactNo: '+91-9988776655',
      emailId: 'vikram.singh@larsentoubro.com',
      phoneNo: '+91-44-28267000',
      gstNumber: '33AAACL0072A1ZG',
      billingAddress: { address: 'L&T House, N.M. Marg, Ballard Estate, Mumbai 400001', state: 'Maharashtra', stateCode: '27', city: 'Mumbai', country: 'India' },
      shippingAddresses: [
        { address: 'L&T House, Ballard Estate, Mumbai 400001', state: 'Maharashtra', stateCode: '27', city: 'Mumbai', country: 'India' }
      ]
    }
  ])

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Company', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: 'Phone', dataIndex: 'phoneNo', key: 'phoneNo' },
    { title: 'Email', dataIndex: 'emailId', key: 'emailId' },
    { title: 'GST Number', dataIndex: 'gstNumber', key: 'gstNumber' },
    {
      title: 'Shipping Addresses',
      key: 'shippingAddresses',
      render: (_, record) => `${record.shippingAddresses?.length || 0} address(es)`,
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
    if (editingRecord) {
      setCustomers(customers.map(c => c.key === editingRecord.key ? { ...values, key: editingRecord.key } : c))
      message.success('Customer updated successfully')
    } else {
      setCustomers([...customers, { ...values, key: Date.now() }])
      message.success('Customer added successfully')
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
      title: 'Delete Customer',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this customer? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      onOk() {
        setCustomers(customers.filter(c => c.key !== key))
        message.success('Customer deleted successfully')
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Customer Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Customer</Button>}
      >
        <Table columns={columns} dataSource={customers} />
      </Card>

      <Modal
        title={editingRecord ? 'Edit Customer' : 'Add Customer'}
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
            <Col span={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactNo" label="Contact No">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="emailId" label="Email ID">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneNo" label="Phone No">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gstNumber" label="GST Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <h4 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>Billing Address</h4>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name={['billingAddress', 'address']} label="Address" rules={[{ required: true, message: 'Please enter billing address' }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name={['billingAddress', 'state']} label="State" rules={[{ required: true, message: 'Select state' }]}>
                <Select
                  showSearch
                  placeholder="Select state"
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  onChange={(value) => {
                    const selectedState = states.find(s => s.name === value)
                    form.setFieldValue(['billingAddress', 'stateCode'], selectedState?.code)
                  }}
                >
                  {states.map(state => (
                    <Select.Option key={state.code} value={state.name}>{state.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['billingAddress', 'stateCode']} label="State Code">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['billingAddress', 'city']} label="City" rules={[{ required: true, message: 'Enter city' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['billingAddress', 'country']} label="Country" rules={[{ required: true, message: 'Enter country' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <h4 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>Shipping Addresses</h4>
          <Form.List name="shippingAddresses" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ marginBottom: 16, padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'address']}
                          label="Address"
                          rules={[{ required: true, message: 'Please enter address' }]}
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16} align="bottom">
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'state']}
                          label="State"
                          rules={[{ required: true, message: 'Select state' }]}
                        >
                          <Select
                            showSearch
                            placeholder="Select state"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                            onChange={(value) => {
                              const selectedState = states.find(s => s.name === value)
                              form.setFieldValue(['shippingAddresses', name, 'stateCode'], selectedState?.code)
                            }}
                          >
                            {states.map(state => (
                              <Select.Option key={state.code} value={state.name}>{state.name}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'stateCode']}
                          label="State Code"
                        >
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'city']}
                          label="City"
                          rules={[{ required: true, message: 'Enter city' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'country']}
                          label="Country"
                          rules={[{ required: true, message: 'Enter country' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={5} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginBottom: '24px' }}
                          />
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    Add Shipping Address
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
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

export default CustomerMaster