'use client'
import React, { Children, useState } from 'react'
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {Toaster} from "sonner"
import useUser from '../hooks/useUser'
import { WebSocketProvider } from '../context/web-socket-context'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime:1000*60*5
        }
      }
    }))
  return (
      <div>
          <QueryClientProvider client={queryClient}>
        <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
        <Toaster/>
          </QueryClientProvider>
    </div>
  )
}

export default Providers


const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  return (<>{user &&
  <WebSocketProvider user={user}>
    {children}
  </WebSocketProvider>
  }
    {!user && children}
  </>)
}