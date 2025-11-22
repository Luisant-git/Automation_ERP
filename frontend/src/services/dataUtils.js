import { INDIAN_STATES } from './gstCalculator'

// Utility to ensure customer/supplier data has state field
export const ensureStateField = (records, type = 'customer') => {
  return records.map(record => {
    if (!record.state) {
      // Default to Maharashtra if no state is specified
      return { ...record, state: 'Maharashtra' }
    }
    return record
  })
}

// Initialize default company settings if not exists
export const initializeCompanySettings = () => {
  const existing = localStorage.getItem('companySettings')
  if (!existing) {
    const defaultSettings = {
      name: 'Your Company Name',
      state: 'Maharashtra',
      gstNumber: '',
      address: ''
    }
    localStorage.setItem('companySettings', JSON.stringify(defaultSettings))
    return defaultSettings
  }
  return JSON.parse(existing)
}

// Update existing customer/supplier records to include state if missing
export const migrateDataWithStates = () => {
  // Update customers
  const customers = JSON.parse(localStorage.getItem('customers') || '[]')
  const updatedCustomers = ensureStateField(customers, 'customer')
  localStorage.setItem('customers', JSON.stringify(updatedCustomers))
  
  // Update suppliers
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]')
  const updatedSuppliers = ensureStateField(suppliers, 'supplier')
  localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers))
  
  // Initialize company settings
  initializeCompanySettings()
}