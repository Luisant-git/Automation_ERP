import React from 'react'
import { Card, Row, Col, Select, Statistic, Progress } from 'antd'

const Dashboard = () => {
  const kpiData = [
    { title: 'Active Projects', value: 24, target: 30, percentage: 80 },
    { title: 'Work Orders MTD', value: 156, target: 200, percentage: 78 },
    { title: 'Equipment Efficiency', value: '94.2%', target: '95%', percentage: 94.2 },
    { title: 'Revenue (Base) MTD', value: '₹2.8M', target: '₹3.2M', percentage: 87.5 },
    { title: 'Service Completion Rate', value: '98.5%', target: '100%', percentage: 98.5 }
  ]

  const projectData = [
    { type: 'Manufacturing', value: 45, percentage: 28.8 },
    { type: 'Installation', value: 66, percentage: 42.3 },
    { type: 'Maintenance', value: 32, percentage: 20.5 },
    { type: 'Consulting', value: 13, percentage: 8.3 }
  ]

  const revenueByRegion = [
    { region: 'North India', value: 45.2 },
    { region: 'West India', value: 32.8 },
    { region: 'South India', value: 28.5 },
    { region: 'East India', value: 18.3 },
    { region: 'Central India', value: 12.7 }
  ]

  const workOrderTrend = [
    { month: 'Jan', orders: 45 }, { month: 'Feb', orders: 52 }, { month: 'Mar', orders: 48 },
    { month: 'Apr', orders: 61 }, { month: 'May', orders: 55 }, { month: 'Jun', orders: 67 },
    { month: 'Jul', orders: 43 }, { month: 'Aug', orders: 58 }, { month: 'Sep', orders: 52 },
    { month: 'Oct', orders: 64 }, { month: 'Nov', orders: 48 }, { month: 'Dec', orders: 71 }
  ]

  const equipmentStatus = [
    { status: 'Operational', count: 45 }, { status: 'Maintenance', count: 8 },
    { status: 'Repair', count: 3 }, { status: 'Idle', count: 12 }
  ]

  const topServices = [
    { service: 'Equipment Installation', count: 28 },
    { service: 'Preventive Maintenance', count: 24 },
    { service: 'System Integration', count: 19 },
    { service: 'Technical Support', count: 16 },
    { service: 'Equipment Repair', count: 14 },
    { service: 'Process Optimization', count: 12 },
    { service: 'Training Services', count: 11 },
    { service: 'Spare Parts Supply', count: 9 }
  ]

  return (
    <div style={{ padding: '16px', background: '#faf9f8' }}>
      {/* Header Controls */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Select date</div>
            <Select defaultValue="2024" style={{ width: '100%' }} size="small">
              <Select.Option value="2024">2024</Select.Option>
              <Select.Option value="2023">2023</Select.Option>
            </Select>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Project Type</div>
            <Select defaultValue="All" style={{ width: '100%' }} size="small">
              <Select.Option value="All">All</Select.Option>
              <Select.Option value="Manufacturing">Manufacturing</Select.Option>
              <Select.Option value="Installation">Installation</Select.Option>
            </Select>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Region</div>
            <Select defaultValue="All" style={{ width: '100%' }} size="small">
              <Select.Option value="All">All</Select.Option>
              <Select.Option value="North">North India</Select.Option>
              <Select.Option value="South">South India</Select.Option>
            </Select>
          </Card>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#666' }}>
            Last Refreshed<br />
            {new Date().toLocaleString()}
          </div>
        </Col>
      </Row>

      {/* KPI Cards */}
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Key performance indicators</div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {kpiData.map((kpi, index) => (
          <Col span={4.8} key={index}>
            <Card size="small" style={{ textAlign: 'center', minHeight: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1890ff' }}>{kpi.value}</div>
              <div style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{kpi.title}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>Target: {kpi.target} ({kpi.percentage.toFixed(1)}%)</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Projects by type" size="small">
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'conic-gradient(#1890ff 0deg 104deg, #52c41a 104deg 256deg, #faad14 256deg 330deg, #f5222d 330deg 360deg)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', background: 'white' }}></div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              {projectData.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '12px' }}>
                  <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: ['#1890ff', '#52c41a', '#faad14', '#f5222d'][index], marginRight: '8px' }}></span>{item.type}</span>
                  <span>{item.value} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Revenue by region" size="small">
            <div style={{ height: '300px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>Regional Revenue Distribution</div>
                {revenueByRegion.map((item, index) => (
                  <div key={index} style={{ margin: '8px 0', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '200px' }}>
                    <span>{item.region}</span>
                    <div style={{ flex: 1, margin: '0 8px', height: '8px', background: '#e6f7ff', borderRadius: '4px' }}>
                      <div style={{ width: `${(item.value / 50) * 100}%`, height: '100%', background: '#1890ff', borderRadius: '4px' }}></div>
                    </div>
                    <span style={{ fontWeight: '600' }}>₹{item.value}M</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bottom Charts Row */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Work orders by month" size="small">
            <div style={{ height: '200px', display: 'flex', alignItems: 'end', justifyContent: 'space-between', padding: '20px 0' }}>
              {workOrderTrend.map((item, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '20px', height: `${(item.orders / 80) * 150}px`, background: '#1890ff', marginBottom: '4px', borderRadius: '2px' }}></div>
                  <div style={{ fontSize: '10px', transform: 'rotate(-45deg)', transformOrigin: 'center' }}>{item.month}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Equipment status" size="small">
            <div style={{ height: '200px', display: 'flex', alignItems: 'end', justifyContent: 'space-around', padding: '20px 0' }}>
              {equipmentStatus.map((item, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: `${(item.count / 50) * 150}px`, background: ['#52c41a', '#faad14', '#f5222d', '#d9d9d9'][index], marginBottom: '8px', borderRadius: '4px' }}></div>
                  <div style={{ fontSize: '10px', textAlign: 'center', width: '60px' }}>{item.status}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>{item.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Top services by demand" size="small">
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {topServices.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ flex: 1 }}>{item.service}</span>
                  <div style={{ width: '60px', height: '8px', background: '#e6f7ff', borderRadius: '4px', marginRight: '8px' }}>
                    <div style={{ width: `${(item.count / 30) * 100}%`, height: '100%', background: '#1890ff', borderRadius: '4px' }}></div>
                  </div>
                  <span style={{ color: '#1890ff', fontWeight: '600', minWidth: '20px' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard