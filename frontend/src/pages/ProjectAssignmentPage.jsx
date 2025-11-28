import React, { useState } from 'react'
import ProjectAssignmentForm from '../components/ProjectAssignmentForm'
import ProjectAssignmentList from '../components/ProjectAssignmentList'

export default function ProjectAssignmentPage() {
  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState(null)

  const handleAdd = () => {
    setEditRecord(null)
    setShowForm(true)
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setShowForm(true)
  }

  const handleClose = (dataSaved = false) => {
    setShowForm(false)
    setEditRecord(null)
    // Force re-render of list component when data is saved
    if (dataSaved) {
      window.location.reload() // Simple refresh - you can implement better state management
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {showForm ? (
        <ProjectAssignmentForm 
          onClose={handleClose}
          editData={editRecord}
        />
      ) : (
        <ProjectAssignmentList 
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}