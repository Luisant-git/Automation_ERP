import React from 'react'
import { Card, Typography, Space, Button } from 'antd'
import { FileTextOutlined, PrinterOutlined } from '@ant-design/icons'
import PurchaseOrderForm from './PurchaseOrderForm'

const { Title, Paragraph } = Typography

const PurchaseOrderDemo = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={2}>SMARTEDGE AUTOMATION - Purchase Order System</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Complete Purchase Order management system for Industrial Automation and CNC Services
            </Paragraph>
          </div>
          
          <div style={{ backgroundColor: '#f0f2f5', padding: '16px', borderRadius: '8px' }}>
            <Title level={4}>Features:</Title>
            <ul style={{ marginLeft: '20px' }}>
              <li>Complete Purchase Order form with all required fields</li>
              <li>Dynamic item addition with automatic calculations</li>
              <li>Tax calculations (SGST, CGST, IGST)</li>
              <li>Print-friendly format</li>
              <li>Professional invoice layout</li>
              <li>Number to words conversion</li>
              <li>Supplier and contact management</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button type="primary" size="large" icon={<FileTextOutlined />}>
                Create New Purchase Order
              </Button>
              <Button size="large" icon={<PrinterOutlined />}>
                Print Preview
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      <PurchaseOrderForm />
    </div>
  )
}

export default PurchaseOrderDemo