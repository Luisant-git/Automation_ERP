import React, { useState } from 'react'
import PurchaseOrderEntryForm from './PurchaseOrderEntryForm'
import PurchaseOrderEntryList from './PurchaseOrderEntryList'

export default function PurchaseOrderEntry() {
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const handleAdd = () => {
    setEditingRecord(null)
    setShowForm(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingRecord(null)
  }

  if (showForm) {
    return (
      <PurchaseOrderEntryForm 
        editingOrder={editingRecord}
        onOrderSaved={handleFormClose}
      />
    )
  }

  return (
    <PurchaseOrderEntryList 
      onAdd={handleAdd}
      onEdit={handleEdit}
    />
  )
}
