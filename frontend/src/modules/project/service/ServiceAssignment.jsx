import React, { useState, useEffect } from 'react'
import { message, Modal, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import ERPMasterLayout from '../../../components/ERPMasterLayout'
import ServiceAssignmentForm from './ServiceAssignmentForm'

export default function ServiceAssignment() {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)

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
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={
          priority === 'High' ? 'red' : 
          priority === 'Medium' ? 'orange' : 'green'
        }>
          {priority}
        </Tag>
      )
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      width: 120,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={
          status === 'Assigned' ? 'blue' : 
          status === 'In Progress' ? 'orange' : 
          status === 'Completed' ? 'green' : 'default'
        }>
          {status}
        </Tag>
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
      name: 'priority',
      placeholder: 'Priority',
      type: 'select',
      options: [
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]
    }
  ]

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const mockData = [
        {
          id: 1,
          serviceId: 'SRV001',
          serviceName: 'Equipment Installation',
          employeeName: 'John Smith',
          projectName: 'Factory Automation',
          priority: 'High',
          assignedDate: '2024-01-15',
          dueDate: '2024-01-25',
          status: 'In Progress'
        },
        {
          id: 2,
          serviceId: 'SRV002',
          serviceName: 'System Configuration',
          employeeName: 'Sarah Johnson',
          projectName: 'Warehouse Management',
          priority: 'Medium',
          assignedDate: '2024-01-16',
          dueDate: '2024-01-30',
          status: 'Assigned'
        }
      ]
      setAssignments(mockData)
    } catch (error) {
      message.error('Failed to fetch service assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    navigate('/operations/service-assign/create')
  }

  const handleEdit = (record) => {
    setEditingAssignment(record)
    setModalVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Assignment',
      content: `Are you sure you want to delete assignment "${record.serviceId}"?`,
      onOk: () => {
        setAssignments(assignments.filter(a => a.id !== record.id))
        message.success('Assignment deleted successfully')
      }
    })
  }

  const handleFormSubmit = (values) => {
    if (editingAssignment) {
      setAssignments(assignments.map(a => 
        a.id === editingAssignment.id ? { ...values, id: editingAssignment.id } : a
      ))
      message.success('Assignment updated successfully')
    } else {
      const newAssignment = { ...values, id: Date.now() }
      setAssignments([...assignments, newAssignment])
      message.success('Assignment created successfully')
    }
    setModalVisible(false)
  }

  return (
    <>
      <ERPMasterLayout
        title="Service Assignment"
        data={assignments}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchFields={searchFields}
        loading={loading}
        buttonType="service"
      />
      
      <Modal
        title={editingAssignment ? 'Edit Assignment' : 'New Service Assignment'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <ServiceAssignmentForm
          initialValues={editingAssignment}
          onSubmit={handleFormSubmit}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </>
  )
}