'use client'
import React, { useState } from 'react'
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "sonner"
import useSeller from '../hooks/useSeller'
import { WebSocketProvider } from '../context/web-socket-context'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5
      }
    }
  }))
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ProviderWithWebSocket>
          {children}
        </ProviderWithWebSocket>
        <Toaster />
      </QueryClientProvider>
    </div>
  )
}

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { seller, isLoading } = useSeller()
  if (isLoading) return null
  return (<>{seller &&
    <WebSocketProvider seller={seller}>
      {children}
    </WebSocketProvider>
  }
    {!seller && children}
  </>)
}

export default Providers
