import React from 'react'
import { Form, Input, Button, Card, Typography, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo (1).jpg'

const { Title, Text } = Typography

const Login = ({ onLogin }) => {
  const navigate = useNavigate()

  const handleSubmit = (values) => {
    // Static login validation
    if (values.username === 'admin@gmail.com' && values.password === 'Admin@123') {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify({ username: values.username }))
      onLogin && onLogin()
      navigate('/')
    } else {
      message.error('Invalid credentials!')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0b1030ff'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{
              width: '100px',
              height: '60px',
              borderRadius: '12px',
              margin: '0 auto 16px',
              objectFit: 'cover'
            }}
          />
          <Title level={3} style={{ margin: 0 }}>Smart Edge Automation</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox>Remember me</Checkbox>
              <a href="#" style={{ color: '#1890ff' }}>Forgot password?</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary">
            Don't have an account? <a href="#" style={{ color: '#1890ff' }}>Contact Admin</a>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login