import { DashboardLayout, ProtectedRoute } from '@/app/components'
import DashboardView from '@/app/components/dashboard/dashboard-view'
import React from 'react'

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardView />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export default Dashboard
