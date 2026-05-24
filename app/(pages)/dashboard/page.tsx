import { DashboardLayout, ProtectedRoute } from '@/app/components'
import React from 'react'

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        Dashboard
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export default Dashboard
