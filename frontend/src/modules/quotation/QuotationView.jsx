import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Table, Button, Space, Tag, Divider, message } from 'antd'
import { PrinterOutlined, DownloadOutlined, EditOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { quotationAPI, useApiLoading } from '../../services/apiService'

export default function QuotationView({ quotation: propQuotation }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quotation, setQuotation] = useState(propQuotation)
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    if (!propQuotation && id) {
      fetchQuotation()
    }
  }, [id, propQuotation])

  const fetchQuotation = async () => {
    try {
      const data = await executeWithLoading(() => quotationAPI.getById(id))
      setQuotation(data)
    } catch (error) {
      message.error('Failed to fetch quotation')
      navigate('/quotations')
    }
  }
  const mockQuotation = {
    quotationId: 'QUO-2024-001',
    referenceNumber: 'REF-001',
    date: '2024-01-15',
    validUntil: '2024-02-14',
    customer: 'ABC Industries',
    customerAddress: '123 Industrial Area, Mumbai, Maharashtra - 400001',
    projectName: 'Factory Automation System',
    description: 'Complete automation solution for manufacturing line including PLC, HMI, and SCADA systems.',
    status: 'Draft',
    lineItems: [
      {
        key: '1',
        description: 'PLC System - Siemens S7-1500',
        quantity: 2,
        unitPrice: 75000,
        amount: 150000
      },
      {
        key: '2',
        description: 'HMI Panel - 15 inch Touch Screen',
        quantity: 3,
        unitPrice: 25000,
        amount: 75000
      },
      {
        key: '3',
        description: 'Installation & Commissioning',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000
      }
    ],
    subtotal: 275000,
    gstRate: 18,
    gstAmount: 49500,
    totalAmount: 324500,
    termsConditions: `1. Prices are valid for 30 days from quotation date.
2. Payment terms: 50% advance, 50% on delivery.
3. Delivery time: 15-20 working days from order confirmation.
4. GST extra as applicable.
5. Installation and training included.`
  }

  const data = quotation || mockQuotation

  const handleEdit = () => {
    navigate(`/quotations/edit/${data.id}`)
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
  }

  const columns = [
    {
      title: 'S.No',
      key: 'sno',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center'
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price) => `₹ ${price.toLocaleString()}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount) => `₹ ${amount.toLocaleString()}`
    }
  ]

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Sent': 'processing',
      'Approved': 'success',
      'Rejected': 'error',
      'Expired': 'warning'
    }
    return colors[status] || 'default'
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Quotation Details</h2>
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>Edit</Button>
            <Button icon={<SendOutlined />} type="primary">Send</Button>
            <Button icon={<PrinterOutlined />}>Print</Button>
            <Button icon={<DownloadOutlined />}>Download PDF</Button>
          </Space>
        </div>

        <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="Quotation ID">{data.quotationId}</Descriptions.Item>
          <Descriptions.Item label="Reference Number">{data.referenceNumber}</Descriptions.Item>
          <Descriptions.Item label="Date">{dayjs(data.date).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Valid Until">{dayjs(data.validUntil).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Customer">{data.customer}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(data.status)}>{data.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Project Name" span={2}>{data.projectName}</Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{data.description}</Descriptions.Item>
        </Descriptions>

        <Divider>Quotation Items</Divider>

        <Table
          columns={columns}
          dataSource={data.lineItems}
          pagination={false}
          size="small"
          style={{ marginBottom: '24px' }}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Subtotal:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>₹ {data.subtotal.toLocaleString()}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>GST ({data.gstRate}%):</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>₹ {data.gstAmount.toLocaleString()}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong style={{ fontSize: '16px' }}>Total Amount:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ fontSize: '16px' }}>₹ {data.totalAmount.toLocaleString()}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        <Divider>Terms & Conditions</Divider>
        <div style={{ whiteSpace: 'pre-line', padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
          {data.termsConditions}
        </div>
      </Card>
    </div>
  )
}