import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CustomerMaster from './pages/masters/CustomerMaster'
import SupplierMaster from './pages/masters/SupplierMaster'
import MaterialMaster from './pages/masters/MaterialMaster'
import ServiceMaster from './pages/masters/ServiceMaster'
import EmployeeMaster from './pages/masters/EmployeeMaster'
import LedgerMaster from './pages/masters/LedgerMaster'
import PurchaseOrderEntry from './modules/project/po/entry'
import SalesInvoiceForm from './modules/project/invoice/SalesInvoiceForm'
import NotFound from './pages/NotFound'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    setIsAuthenticated(auth === 'true')
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <ConfigProvider>
        <Login onLogin={handleLogin} />
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider>
      <Routes>
        <Route path="/" element={<AppLayout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="masters/customers" element={<CustomerMaster />} />
          <Route path="masters/suppliers" element={<SupplierMaster />} />
          <Route path="masters/materials" element={<MaterialMaster />} />
          <Route path="masters/services" element={<ServiceMaster />} />
          <Route path="masters/employees" element={<EmployeeMaster />} />
          <Route path="masters/ledgers" element={<LedgerMaster />} />
          <Route path="procurement/purchase-orders" element={<PurchaseOrderEntry />} />
          <Route path="sales/invoicing" element={<SalesInvoiceForm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}