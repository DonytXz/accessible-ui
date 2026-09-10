import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastProvider } from '@/components/Toast/ToastProvider'
import { WorkbenchApp } from '@/workbench/WorkbenchApp'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <WorkbenchApp />
    </ToastProvider>
  </React.StrictMode>
)
