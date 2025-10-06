import React, { useState, useEffect } from 'react'
import { message, Tag, Progress, Card, Row, Col, Statistic } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, PauseCircleOutlined } from '@ant-design/icons'
import ERPMasterLayout from '../../../components/ERPMasterLayout'

export default function ServiceStatus() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({})

  const columns = [
    {
      title: 'Service ID',
      dataIndex: 'serviceId',
      key: 'serviceId',
      width: 100,
    },
    {
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 180,
    },
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = {
          'Assigned': { color: 'blue', icon: <ClockCircleOutlined /> },
          'In Progress': { color: 'orange', icon: <SyncOutlined spin /> },
          'Completed': { color: 'green', icon: <CheckCircleOutlined /> },
          'On Hold': { color: 'red', icon: <PauseCircleOutlined /> }
        }
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {status}
          </Tag>
        )
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: 'Days Left',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      width: 100,
      render: (days) => (
        <span style={{ color: days < 0 ? 'red' : days < 3 ? 'orange' : 'green' }}>
          {days < 0 ? `${Math.abs(days)} overdue` : `${days} days`}
        </span>
      )
    }
  ]

  const searchFields = [
    {
      name: 'serviceId',
      placeholder: 'Service ID',
      type: 'input'
    },
    {
      name: 'employeeName',
      placeholder: 'Employee Name',
      type: 'input'
    },
    {
      name: 'status',
      placeholder: 'Status',
      type: 'select',
      options: [
        { value: 'Assigned', label: 'Assigned' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'On Hold', label: 'On Hold' }
      ]
    },
    {
      name: 'projectName',
      placeholder: 'Project',
      type: 'select',
      options: [
        { value: 'Factory Automation', label: 'Factory Automation' },
        { value: 'Warehouse Management', label: 'Warehouse Management' },
        { value: 'Quality Control System', label: 'Quality Control System' }
      ]
    }
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const mockData = [
        {
          id: 1,
          serviceId: 'SRV001',
          serviceName: 'Equipment Installation',
          employeeName: 'John Smith',
          projectName: 'Factory Automation',
          progress: 75,
          status: 'In Progress',
          startDate: '2024-01-15',
          dueDate: '2024-01-25',
          daysLeft: 3
        },
        {
          id: 2,
          serviceId: 'SRV002',
          serviceName: 'System Configuration',
          employeeName: 'Sarah Johnson',
          projectName: 'Warehouse Management',
          progress: 100,
          status: 'Completed',
          startDate: '2024-01-10',
          dueDate: '2024-01-20',
          daysLeft: 0
        },
        {
          id: 3,
          serviceId: 'SRV003',
          serviceName: 'Quality Testing',
          employeeName: 'Mike Wilson',
          projectName: 'Quality Control System',
          progress: 25,
          status: 'Assigned',
          startDate: '2024-01-18',
          dueDate: '2024-01-28',
          daysLeft: 6
        }
      ]
      setServices(mockData)
      
      // Calculate stats
      const totalServices = mockData.length
      const completed = mockData.filter(s => s.status === 'Completed').length
      const inProgress = mockData.filter(s => s.status === 'In Progress').length
      const overdue = mockData.filter(s => s.daysLeft < 0).length
      
      setStats({
        total: totalServices,
        completed,
        inProgress,
        overdue,
        completionRate: Math.round((completed / totalServices) * 100)
      })
    } catch (error) {
      message.error('Failed to fetch service status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              valueStyle={{ color: '#faad14' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={stats.overdue}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <ERPMasterLayout
        title="Service Status Tracking"
        data={services}
        columns={columns}
        searchFields={searchFields}
        loading={loading}
      />
    </div>
  )
}