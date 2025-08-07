import React from 'react'

import { Home } from '../pages/Home'

interface Route {
  name: string
  path: string
  component: JSX.Element
  isAnonymous?: boolean
  isProtected?: boolean
  hasFooter?: boolean
}

export const routesConfig: Route[] = [
  {
    name: 'home',
    path: '/',
    component: <Home />,
    hasFooter: true
  }
]
