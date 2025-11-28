import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CustomerMaster from './pages/masters/CustomerMaster'
import SupplierMaster from './pages/masters/SupplierMaster'
import MaterialMaster from './pages/masters/MaterialMaster'
import ServiceMaster from './pages/masters/ServiceMaster'
import EmployeeMaster from './pages/masters/EmployeeMaster'
import CategoryMaster from './pages/masters/CategoryMaster'
import BrandMaster from './pages/masters/BrandMaster'
import TaxMaster from './pages/masters/TaxMaster'
import LedgerMaster from './pages/masters/LedgerMaster'
import OpeningStockMaster from './pages/masters/OpeningStockMaster'
import PurchaseOrderEntry from './modules/project/po/entry'
import Procurement from './modules/project/procurement'

import PurchaseOrderMaster from './modules/procurement/purchase-order-master'
import PurchaseOrderDetails from './modules/procurement/purchase-order-details'
import PurchaseReturnMaster from './modules/procurement/purchase-return-master'
import PurchaseReturnDetails from './modules/procurement/purchase-return-details'
import { ProjectList, CreateProject } from './modules/project/management'
import ServiceAssignment from './modules/project/service/ServiceAssignment'
import ServiceStatus from './modules/project/service/ServiceStatus'
import CreateServiceAssignment from './modules/project/service/CreateServiceAssignment'
import ProjectAssignmentPage from './pages/ProjectAssignmentPage'
import ProjectTrackingPage from './pages/ProjectTrackingPage'

import SalesOrderForm from './modules/project/invoice/SalesInvoiceForm'
import SalesReturns from './modules/sales/returns/SalesReturns'
import InvoiceList from './pages/InvoiceList'
import InvoiceForm from './pages/InvoiceForm'
import { QuotationForm, QuotationList } from './modules/quotation'
import NotFound from './pages/NotFound'
import { migrateDataWithStates } from './services/dataUtils'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    setIsAuthenticated(auth === 'true')
    
    // Initialize data migration for GST calculations
    migrateDataWithStates()
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  return (
    <ConfigProvider>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="masters/customers" element={<CustomerMaster />} />
          <Route path="masters/suppliers" element={<SupplierMaster />} />
          <Route path="masters/materials" element={<MaterialMaster />} />
          <Route path="masters/services" element={<ServiceMaster />} />
          <Route path="masters/employees" element={<EmployeeMaster />} />
          <Route path="masters/categories" element={<CategoryMaster />} />
          <Route path="masters/brands" element={<BrandMaster />} />
          <Route path="masters/taxes" element={<TaxMaster />} />
          <Route path="masters/opening-stock" element={<OpeningStockMaster />} />
          <Route path="masters/ledgers" element={<LedgerMaster />} />
          <Route path="procurement/purchase-orders" element={<PurchaseOrderEntry />} />
          <Route path="procurement" element={<Procurement />} />

          <Route path="procurement/purchase-order-master" element={<PurchaseOrderMaster />} />
          <Route path="procurement/purchase-order-details" element={<PurchaseOrderDetails />} />
          <Route path="procurement/purchase-return-master" element={<PurchaseReturnMaster />} />
          <Route path="procurement/purchase-return-details" element={<PurchaseReturnDetails />} />
          <Route path="projects/list" element={<ProjectList />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/planning" element={<ProjectAssignmentPage />} />
          <Route path="projects/tracking" element={<ProjectTrackingPage />} />
          <Route path="operations/service-assign" element={<ServiceAssignment />} />
          <Route path="operations/service-assign/create" element={<CreateServiceAssignment />} />
          <Route path="operations/service-status" element={<ServiceStatus />} />
          <Route path="sales/invoice" element={<InvoiceList />} />
          <Route path="sales/invoice/create" element={<InvoiceForm />} />
          <Route path="sales/invoice/edit" element={<InvoiceForm />} />
          <Route path="sales/orders" element={<SalesOrderForm />} />
          <Route path="sales/returns" element={<SalesReturns />} />
          <Route path="quotations" element={<QuotationList />} />
          <Route path="quotations/create" element={<QuotationForm />} />
          <Route path="quotations/edit" element={<QuotationForm />} />
         
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}