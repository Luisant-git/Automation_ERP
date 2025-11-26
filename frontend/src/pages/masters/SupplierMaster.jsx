import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col, Space, Table, Modal, message, Select, Switch, Tag, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { supplierAPI, useApiLoading } from '../../services/apiService'

const SupplierMaster = () => {
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const { loading, executeWithLoading } = useApiLoading()
  
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
  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const data = await executeWithLoading(() => supplierAPI.getAll())
      setSuppliers(data.map(item => ({ ...item, key: item.id })))
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    }
  }

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'State', dataIndex: 'state', key: 'state' },

    // {
    //   title: 'Addresses',
    //   key: 'addresses',
    //   render: (_, record) => `${record.addresses?.length || 0} address(es)`,
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ]

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await executeWithLoading(() => supplierAPI.update(editingRecord.id, values))
        message.success('Supplier updated successfully')
      } else {
        await executeWithLoading(() => supplierAPI.create(values))
        message.success('Supplier added successfully')
      }
      setIsModalVisible(false)
      form.resetFields()
      setEditingRecord(null)
      fetchSuppliers()
    } catch (error) {
      console.error('Failed to save supplier:', error)
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      name: record.name,
      companyName: record.companyName,
      contactPerson: record.contactPerson,
      contactNo: record.phone,
      emailId: record.email,
      phoneNo: record.phone,
      gstNumber: record.gstNumber,
      isActive: record.isActive,
      addresses: [{
        address: record.address,
        city: record.city,
        state: record.state,
        stateCode: record.stateCode,
        country: record.country,
        pincode: record.pincode,
        contact: record.contact
      }]
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Supplier',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this supplier? This action cannot be undone.',
      okText: 'Yes, Delete',
      okButtonProps: { style: { backgroundColor: '#ff4d4f', color: '#ffffffff', borderColor: '#ff4d4f' } },
      cancelText: 'Cancel',
      async onOk() {
        try {
          await executeWithLoading(() => supplierAPI.delete(id))
          message.success('Supplier deleted successfully')
          fetchSuppliers()
        } catch (error) {
          console.error('Failed to delete supplier:', error)
        }
      }
    })
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Supplier Master" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Supplier</Button>}
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={suppliers} />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? 'Edit Supplier' : 'Add Supplier'}
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
            <Col span={12}>
              <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
          <Form.List name="addresses" initialValue={[{}]}>
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
                    <Row gutter={16}>
                      <Col span={4}>
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
                            filterOption={(input, option) =>
                              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              const selectedState = states.find(s => s.name === value)
                              form.setFieldValue(['addresses', name, 'stateCode'], selectedState?.code)
                            }}
                          >
                            {states.map(state => (
                              <Select.Option key={state.code} value={state.name}>
                                {state.name}
                              </Select.Option>
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
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'city']}
                          label="City"
                          rules={[{ required: true, message: 'Enter city' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'country']}
                          label="Country"
                          rules={[{ required: true, message: 'Enter country' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'pincode']}
                          label="Pincode"
                          rules={[{ required: true, message: 'Enter pincode' }]}
                        >
                          <Input placeholder="e.g., 400001" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'contact']}
                          label="Contact"
                        >
                          <Input placeholder="Phone" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={24} style={{ textAlign: 'right' }}>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                          >
                            Remove Address
                          </Button>
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
                    Add Address
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

export default SupplierMaster