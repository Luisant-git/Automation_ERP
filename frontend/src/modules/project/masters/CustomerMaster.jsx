import React, { useEffect, useState, useMemo } from 'react'
import { Button, Input, Form, Select, DatePicker, Space, Popconfirm, message } from 'antd'
import DataTable from '../../../components/DataTable'
import FormModal from '../../../components/FormModal'
import { api } from '../../../services/api'

const STORAGE_KEY = 'customers'

export default function CustomerMaster(){
  const [rows, setRows] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    (async () => {
      const list = await api.list(STORAGE_KEY)
      if (list.length === 0) {
        // seed few
        await api.create(STORAGE_KEY, { name:'Acme Industries', code:'ACM001', gst:'29ABCDE1234F1Z5', contact:'Prakash', phone:'9876543210', email:'ops@acme.com', type:'End Customer' })
        await api.create(STORAGE_KEY, { name:'Nova Automation', code:'NVA015', gst:'33WXYZP9988K1Z2', contact:'Meena', phone:'9876501234', email:'sales@nova.io', type:'Integrator' })
      }
      setRows(await api.list(STORAGE_KEY))
    })()
  }, [])

  const filtered = useMemo(()=> rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())), [rows, search])

  const columns = [
    { title:'Code', dataIndex:'code', width:120 },
    { title:'Name', dataIndex:'name' },
    { title:'Type', dataIndex:'type', width:140 },
    { title:'GST', dataIndex:'gst', width:180 },
    { title:'Contact', dataIndex:'contact' },
    { title:'Phone', dataIndex:'phone', width:140 },
    { title:'Email', dataIndex:'email' },
    {
      title:'Actions',
      width:170,
      render: (_, rec) => (
        <Space>
          <Button size="small" onClick={()=>{ setEditing(rec); setModalOpen(true) }}>Edit</Button>
          <Popconfirm title="Delete this customer?" onConfirm={async()=>{
            await api.remove(STORAGE_KEY, rec.id)
            setRows(await api.list(STORAGE_KEY))
            message.success('Deleted')
          }}>
            <Button danger size="small">Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const onSubmit = async (values) => {
    if (editing) {
      await api.update(STORAGE_KEY, editing.id, values)
      message.success('Updated')
    } else {
      await api.create(STORAGE_KEY, values)
      message.success('Created')
    }
    setModalOpen(false); setEditing(null)
    setRows(await api.list(STORAGE_KEY))
  }

  return (
    <div>
      <div className="page-header">
        <h2>Customer Master</h2>
        <Space>
          <Input.Search allowClear placeholder="Search" onSearch={setSearch} onChange={e=>setSearch(e.target.value)} style={{ width: 260 }} />
          <Button type="primary" onClick={()=>{ setEditing(null); setModalOpen(true) }}>New Customer</Button>
        </Space>
      </div>

      <DataTable title="Customers" columns={columns} data={filtered} extra={<span>Total: {filtered.length}</span>} />

      <FormModal
        open={modalOpen}
        title={editing ? 'Edit Customer' : 'New Customer'}
        onCancel={()=>{ setModalOpen(false); setEditing(null) }}
        onSubmit={onSubmit}
        initialValues={editing || { type:'End Customer' }}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form.Item name="code" label="Customer Code" rules={[{ required:true }]}>
          <Input/>
        </Form.Item>
        <Form.Item name="name" label="Customer Name" rules={[{ required:true }]}>
          <Input/>
        </Form.Item>
        <Form.Item name="type" label="Customer Type" rules={[{ required:true }]}>
          <Select
            options={[
              { value:'End Customer', label:'End Customer' },
              { value:'Integrator', label:'Integrator' },
              { value:'OEM', label:'OEM' }
            ]}
          />
        </Form.Item>
        <Form.Item name="gst" label="GST Number">
          <Input/>
        </Form.Item>
        <Form.Item name="contact" label="Contact Person">
          <Input/>
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input/>
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type:'email', message:'Invalid email' }]}>
          <Input/>
        </Form.Item>
        <Form.Item name="onboarded" label="Onboarded On">
          <DatePicker style={{ width:'100%' }} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3}/>
        </Form.Item>
      </FormModal>
    </div>
  )
}
