'use client'
import React, { useState } from 'react'
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {Toaster} from "sonner"

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
        {children}
        <Toaster/>
          </QueryClientProvider>
    </div>
  )
}

export default Providers
