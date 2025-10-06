import React from 'react'
import { Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import ServiceAssignmentForm from './ServiceAssignmentForm'

export default function CreateServiceAssignment() {
  const navigate = useNavigate()

  const handleSubmit = (values) => {
    console.log('Creating service assignment:', values)
    // API call to create service assignment
    message.success('Service assigned successfully')
    navigate('/operations/service-assign')
  }

  const handleCancel = () => {
    navigate('/operations/service-assign')
  }

  return (
    <ServiceAssignmentForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}