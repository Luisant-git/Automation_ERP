import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Select, DatePicker, Button, Steps, Progress, message } from 'antd'
import { CheckOutlined, LoadingOutlined, ClockCircleOutlined, ProjectOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { projectAssignmentAPI, useApiLoading } from '../services/apiService'

const { RangePicker } = DatePicker
const { Step } = Steps

export default function ProjectTrackingPage() {
  const [projects, setProjects] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const assignmentsData = await executeWithLoading(() => projectAssignmentAPI.getAll())
      
      // Group assignments by project name
      const projectMap = {}
      assignmentsData.forEach(assignment => {
        const projectName = assignment.projectName || 'Unnamed Project'
        if (!projectMap[projectName]) {
          projectMap[projectName] = {
            name: projectName,
            workOrderNumber: assignment.workOrderNumber,
            status: assignment.status,
            createdAt: assignment.createdAt,
            assignments: []
          }
        }
        projectMap[projectName].assignments.push(assignment)
      })

      // Convert to array and calculate progress
      const projectsArray = Object.values(projectMap).map((project, index) => {
        const statusProgress = {
          'Assigned': 25,
          'In Progress': 50,
          'Completed': 100,
          'On Hold': 10
        }
        const progress = statusProgress[project.status] || 0

        return {
          id: index + 1,
          name: project.name,
          progress: progress,
          status: project.status,
          startDate: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A',
          endDate: 'N/A',
          steps: [
            { title: 'Assigned', status: progress >= 25 ? 'finish' : 'wait', description: 'Project assigned' },
            { title: 'In Progress', status: progress >= 50 ? 'finish' : progress >= 25 ? 'process' : 'wait', description: 'Work ongoing' },
            { title: 'Testing', status: progress >= 75 ? 'finish' : progress >= 50 ? 'process' : 'wait', description: 'Quality check' },
            { title: 'Completed', status: progress === 100 ? 'finish' : progress >= 75 ? 'process' : 'wait', description: 'Project done' }
          ]
        }
      })

      setProjects(projectsArray)
    } catch (error) {
      message.error('Failed to load projects')
    }
  }

  const oldProjects = [
    { 
      id: 1, 
      name: 'ERP Implementation', 
      progress: 75, 
      status: 'In Progress', 
      startDate: '2024-01-15', 
      endDate: '2024-06-30',
      steps: [
        { title: 'Planning', status: 'finish', description: 'Requirements gathering' },
        { title: 'Development', status: 'finish', description: 'Core modules' },
        { title: 'Testing', status: 'process', description: 'Quality assurance' },
        { title: 'Deployment', status: 'wait', description: 'Go-live preparation' }
      ]
    },
    { 
      id: 2, 
      name: 'Website Redesign', 
      progress: 90, 
      status: 'Near Completion', 
      startDate: '2024-02-01', 
      endDate: '2024-04-15',
      steps: [
        { title: 'Design', status: 'finish', description: 'UI/UX mockups' },
        { title: 'Frontend', status: 'finish', description: 'React components' },
        { title: 'Backend', status: 'finish', description: 'API integration' },
        { title: 'Launch', status: 'process', description: 'Final testing' }
      ]
    },
    { 
      id: 3, 
      name: 'Mobile App Development', 
      progress: 45, 
      status: 'In Progress', 
      startDate: '2024-03-01', 
      endDate: '2024-08-30',
      steps: [
        { title: 'Wireframes', status: 'finish', description: 'App structure' },
        { title: 'Development', status: 'process', description: 'React Native' },
        { title: 'Testing', status: 'wait', description: 'Device testing' },
        { title: 'Store Release', status: 'wait', description: 'App stores' }
      ]
    },
    { 
      id: 4, 
      name: 'Database Migration', 
      progress: 100, 
      status: 'Completed', 
      startDate: '2024-01-01', 
      endDate: '2024-03-15',
      steps: [
        { title: 'Backup', status: 'finish', description: 'Data backup' },
        { title: 'Migration', status: 'finish', description: 'Data transfer' },
        { title: 'Validation', status: 'finish', description: 'Data integrity' },
        { title: 'Cleanup', status: 'finish', description: 'Old system removal' }
      ]
    },
    { 
      id: 5, 
      name: 'Security Audit', 
      progress: 25, 
      status: 'Planning', 
      startDate: '2024-04-01', 
      endDate: '2024-07-30',
      steps: [
        { title: 'Scope', status: 'finish', description: 'Audit planning' },
        { title: 'Assessment', status: 'wait', description: 'Security review' },
        { title: 'Report', status: 'wait', description: 'Findings documentation' },
        { title: 'Remediation', status: 'wait', description: 'Fix implementation' }
      ]
    }
  ]

  const statusData = [
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: '#52c41a' },
    { name: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, color: '#1890ff' },
    { name: 'Near Completion', value: projects.filter(p => p.status === 'Near Completion').length, color: '#faad14' },
    { name: 'Planning', value: projects.filter(p => p.status === 'Planning').length, color: '#f5222d' }
  ]

  const timelineData = [
    { month: 'Jan', completed: 1, inProgress: 2 },
    { month: 'Feb', completed: 1, inProgress: 3 },
    { month: 'Mar', completed: 2, inProgress: 3 },
    { month: 'Apr', completed: 2, inProgress: 3 },
    { month: 'May', completed: 2, inProgress: 3 },
    { month: 'Jun', completed: 3, inProgress: 2 }
  ]

  const CustomProgressBar = ({ project }) => {
    const getCurrentStep = () => {
      if (project.progress === 100) return 4;
      if (project.progress >= 75) return 3;
      if (project.progress >= 50) return 2;
      if (project.progress >= 25) return 1;
      return 0;
    };

    return (
      <div style={{ padding: '10px 0' }}>
        <Steps
          current={getCurrentStep()}
          size="small"
          items={project.steps}
          style={{
            '.ant-steps-item-finish .ant-steps-item-icon': {
              backgroundColor: '#1890ff',
              borderColor: '#1890ff'
            },
            '.ant-steps-item-process .ant-steps-item-icon': {
              backgroundColor: '#1890ff',
              borderColor: '#1890ff'
            }
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <div style={{ 
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1890ff',
          margin: 0
        }}>
          <ProjectOutlined style={{ marginRight: '16px' }} />
          Progress Bar for Project Tracking
        </h1>
      </div>

      <Row gutter={[24, 24]}>
        {projects.map(project => (
          <Col span={24} key={project.id}>
            <Card
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#262626',
                    margin: 0
                  }}>
                    {project.name}
                  </h2>
                  <p style={{
                    color: '#8c8c8c',
                    margin: '2px 0 0 0',
                    fontSize: '12px'
                  }}>
                    Started: {project.startDate}
                  </p>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1890ff'
                  }}>
                    {project.progress}%
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#8c8c8c',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Complete
                  </div>
                </div>
              </div>

              <CustomProgressBar project={project} />

              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontWeight: '500',
                  color: '#595959',
                  fontSize: '13px'
                }}>
                  Status: {project.status}
                </span>
                <Progress
                  percent={project.progress}
                  size="small"
                  strokeColor="#1890ff"
                  trailColor="#e8e8e8"
                  style={{ width: '150px' }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
        <Col span={12}>
          <Card
            title="Project Status Overview"
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="Monthly Progress Trend"
            style={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#52c41a" 
                  strokeWidth={3}
                  dot={{ fill: '#52c41a', strokeWidth: 2, r: 6 }}
                  name="Completed" 
                />
                <Line 
                  type="monotone" 
                  dataKey="inProgress" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                  name="In Progress" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row> */}
    </div>
  )
}