import React from 'react'
import { Card, Statistic, Row, Col } from 'antd'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './Dashboard.module.scss'

const data = [
  { name: 'Jan', sales: 12, service: 22 },
  { name: 'Feb', sales: 18, service: 26 },
  { name: 'Mar', sales: 25, service: 29 },
  { name: 'Apr', sales: 21, service: 20 },
  { name: 'May', sales: 29, service: 35 },
  { name: 'Jun', sales: 36, service: 38 }
]

export default function Dashboard(){
  return (
    <div>
      <div className="page-header">
        <h2>ERP Dashboard</h2>
      </div>

      <div className={styles.grid}>
        <Card><div className="kpi"><Statistic title="Open Work Orders" value={42} /></div></Card>
        <Card><div className="kpi"><Statistic title="Active Projects" value={17} /></div></Card>
        <Card><div className="kpi"><Statistic title="Pending Services" value={9} /></div></Card>
        <Card><div className="kpi"><Statistic title="Inventory Value (₹L)" value={56} precision={2} /></div></Card>
      </div>

      <Card title="Sales & Service Trend" style={{ marginTop: 12 }}>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" />
              <Line type="monotone" dataKey="service" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
