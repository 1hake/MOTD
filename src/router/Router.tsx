import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppProvider from '../context/AppContext'
import { Layout } from '../layouts/Layout'
import { routesConfig } from './RoutesConfig'

export const Router = () => {
  const publicRoutes = routesConfig.filter((route) => !route.isProtected && !route.isAnonymous)
  const anonymousRoutes = routesConfig.filter((route) => route.isAnonymous)
  const protectedRoutes = routesConfig.filter((route) => route.isProtected)

  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {publicRoutes.map((route) => (
              <Route key={route.name} path={route.path} element={route.component} />
            ))}
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
