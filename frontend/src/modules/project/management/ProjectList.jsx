import React, { useState, useEffect } from 'react'
import { message, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import ProjectForm from './ProjectForm'

export default function ProjectList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const columns = [
    {
      title: 'Project Code',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 120,
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span style={{ 
          color: status === 'Active' ? '#52c41a' : 
                status === 'Completed' ? '#1890ff' : '#faad14' 
        }}>
          {status}
        </span>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (budget) => `₹${budget?.toLocaleString()}`
    }
  ]

  const searchFields = [
    {
      name: 'projectCode',
      placeholder: 'Project Code',
      type: 'input'
    },
    {
      name: 'projectName',
      placeholder: 'Project Name',
      type: 'input'
    },
    {
      name: 'status',
      placeholder: 'Status',
      type: 'select',
      options: [
        { value: 'Planning', label: 'Planning' },
        { value: 'Active', label: 'Active' },
        { value: 'On Hold', label: 'On Hold' },
        { value: 'Completed', label: 'Completed' }
      ]
    },
    {
      name: 'dateRange',
      placeholder: 'Date Range',
      type: 'dateRange'
    }
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const mockData = [
        {
          id: 1,
          projectCode: 'PRJ001',
          projectName: 'Factory Automation System',
          clientName: 'ABC Manufacturing',
          status: 'Active',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          budget: 500000,
          description: 'Complete automation system for manufacturing plant'
        },
        {
          id: 2,
          projectCode: 'PRJ002',
          projectName: 'Warehouse Management',
          clientName: 'XYZ Logistics',
          status: 'Planning',
          startDate: '2024-02-01',
          endDate: '2024-08-15',
          budget: 750000,
          description: 'Automated warehouse management solution'
        }
      ]
      setProjects(mockData)
    } catch (error) {
      message.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    navigate('/projects/create')
  }

  const handleEdit = (record) => {
    setEditingProject(record)
    setModalVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Project',
      content: `Are you sure you want to delete project "${record.projectName}"?`,
      onOk: () => {
        setProjects(projects.filter(p => p.id !== record.id))
        message.success('Project deleted successfully')
      }
    })
  }

  const handleView = (record) => {
    console.log('View project:', record)
  }

  const handleSearch = (values) => {
    console.log('Search values:', values)
  }

  const handleFormSubmit = (values) => {
    if (editingProject) {
      setProjects(projects.map(p => 
        p.id === editingProject.id ? { ...values, id: editingProject.id } : p
      ))
      message.success('Project updated successfully')
    } else {
      const newProject = { ...values, id: Date.now() }
      setProjects([...projects, newProject])
      message.success('Project created successfully')
    }
    setModalVisible(false)
  }

  return (
    <>
      <ERPMasterLayout
        title="Project Management"
        data={projects}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchFields={searchFields}
        onSearch={handleSearch}
        loading={loading}
        buttonType="project"
      />
      
      <Modal
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProjectForm
          initialValues={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </>
  )
}