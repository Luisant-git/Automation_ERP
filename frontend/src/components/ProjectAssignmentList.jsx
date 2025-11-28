import React, { useState, useEffect } from 'react'
import { message, Modal, Tag } from 'antd'
import dayjs from 'dayjs'
import ERPMasterLayout from './ERPMasterLayout'
import { quotationAPI, materialAPI, employeeAPI, projectAssignmentAPI, useApiLoading } from '../services/apiService'

export default function ProjectAssignmentList({ onAdd, onEdit }) {
  const [assignments, setAssignments] = useState([])
  const [quotations, setQuotations] = useState([])
  const [materials, setMaterials] = useState([])
  const [employees, setEmployees] = useState([])
  const { loading, executeWithLoading } = useApiLoading()

  const getStatusColor = (status) => {
    const colors = {
      'Assigned': 'processing',
      'In Progress': 'warning',
      'Completed': 'success',
      'On Hold': 'default'
    }
    return colors[status] || 'default'
  }

  const columns = [
    {
      title: 'Work Order',
      dataIndex: 'workOrderNumber',
      key: 'workOrderNumber',
      width: 120,
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150
    },
    {
      title: 'Employee Name',
      dataIndex: 'employeeRole',
      key: 'employeeName',
      width: 120,
      render: (employeeRole) => {
        const employee = employees.find(e => (e.role || e.designation) === employeeRole)
        return employee ? employee.name : 'N/A'
      }
    },
    {
      title: 'Employee Role',
      dataIndex: 'employeeRole',
      key: 'employeeRole',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Assigned Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    }
  ]

  const searchFields = [
    {
      name: 'workOrderNumber',
      placeholder: 'Work Order Number',
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
        { value: 'Assigned', label: 'Assigned' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'On Hold', label: 'On Hold' }
      ]
    }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [quotationsData, materialsData, employeesData] = await Promise.all([
        executeWithLoading(() => quotationAPI.getAll()),
        executeWithLoading(() => materialAPI.getAll()),
        executeWithLoading(() => employeeAPI.getAll())
      ])
      
      setQuotations(quotationsData)
      setMaterials(materialsData)
      setEmployees(employeesData)
      
      const assignmentsData = await executeWithLoading(() => projectAssignmentAPI.getAll())
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } catch (error) {
      message.error('Failed to load data')
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Assignment',
      content: `Are you sure you want to delete assignment for "${record.workOrderNumber}"?`,
      onOk: async () => {
        try {
          await executeWithLoading(() => projectAssignmentAPI.delete(record.id))
          setAssignments(prev => prev.filter(a => a.id !== record.id))
          message.success('Assignment deleted successfully')
        } catch (error) {
          message.error('Failed to delete assignment')
        }
      }
    })
  }

  const handleView = (record) => {
    let materialSerials = []
    let materialNames = []
    
    try {
      materialSerials = typeof record.materialSerials === 'string' ? JSON.parse(record.materialSerials) : record.materialSerials || []
      materialNames = typeof record.materialNames === 'string' ? JSON.parse(record.materialNames) : record.materialNames || []
    } catch {}
    
    const employee = employees.find(e => (e.role || e.designation) === record.employeeRole)
    
    Modal.info({
      title: 'Project Assignment Details',
      width: 700,
      content: (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Work Order Number:</strong> {record.workOrderNumber || 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Project Name:</strong> {record.projectName || 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Purchase Entry Number:</strong> {record.purchaseEntryNumber || 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Material Names:</strong> {Array.isArray(materialNames) ? materialNames.join(', ') : 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Material Serial Numbers:</strong> {Array.isArray(materialSerials) ? materialSerials.join(', ') : 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Employee Name:</strong> {employee ? employee.name : 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Employee Role:</strong> {record.employeeRole || 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Status:</strong> <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Assigned Date:</strong> {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>Remarks:</strong> {record.remarks || 'N/A'}
          </div>
        </div>
      ),
      okText: 'Close'
    })
  }

  const handleSearch = (values) => {
    console.log('Search values:', values)
  }

  return (
    <ERPMasterLayout
      title="Project Assignments"
      data={assignments}
      columns={columns}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={handleDelete}
      onView={handleView}
      searchFields={searchFields}
      onSearch={handleSearch}
      loading={loading}
      buttonType="project"
    />
  )
}