import React from 'react'
import { Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import ProjectForm from './ProjectForm'

export default function CreateProject() {
  const navigate = useNavigate()

  const handleSubmit = (values) => {
    console.log('Creating project:', values)
    // API call to create project
    message.success('Project created successfully')
    navigate('/projects/list')
  }

  const handleCancel = () => {
    navigate('/projects/list')
  }

  return (
    <Card title="Create New Project">
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Card>
  )
}