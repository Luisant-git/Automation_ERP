import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'

export default function FormModal({ open, title, onCancel, onSubmit, initialValues, children, okText='Save' }){
  const [form] = Form.useForm()

  useEffect(()=>{ form.resetFields(); form.setFieldsValue(initialValues || {}) }, [initialValues, open])
  return (
    <Modal open={open} title={title} onCancel={onCancel} onOk={()=>form.submit()} okText={okText} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {children}
      </Form>
    </Modal>
  )
}
