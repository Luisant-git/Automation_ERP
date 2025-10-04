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
import CategoryMaster from './pages/masters/CategoryMaster'
import BrandMaster from './pages/masters/BrandMaster'
import TaxMaster from './pages/masters/TaxMaster'
import LedgerMaster from './pages/masters/LedgerMaster'
import OpeningStockMaster from './pages/masters/OpeningStockMaster'
import PurchaseOrderEntry from './modules/project/po/entry'
import Procurement from './modules/project/procurement'
import PurchaseReturn from './modules/trading/purchase/return'
import PurchaseOrderMaster from './modules/procurement/purchase-order-master'
import PurchaseOrderDetails from './modules/procurement/purchase-order-details'
import PurchaseReturnMaster from './modules/procurement/purchase-return-master'
import PurchaseReturnDetails from './modules/procurement/purchase-return-details'

import SalesOrderForm from './modules/project/invoice/SalesInvoiceForm'
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
          <Route path="masters/categories" element={<CategoryMaster />} />
          <Route path="masters/brands" element={<BrandMaster />} />
          <Route path="masters/taxes" element={<TaxMaster />} />
          <Route path="masters/opening-stock" element={<OpeningStockMaster />} />
          <Route path="masters/ledgers" element={<LedgerMaster />} />
          <Route path="procurement/purchase-orders" element={<PurchaseOrderEntry />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="trading/purchase/return" element={<PurchaseReturn />} />
          <Route path="procurement/purchase-order-master" element={<PurchaseOrderMaster />} />
          <Route path="procurement/purchase-order-details" element={<PurchaseOrderDetails />} />
          <Route path="procurement/purchase-return-master" element={<PurchaseReturnMaster />} />
          <Route path="procurement/purchase-return-details" element={<PurchaseReturnDetails />} />
          <Route path="sales/orders" element={<SalesOrderForm />} />
         
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ConfigProvider>
  )
}