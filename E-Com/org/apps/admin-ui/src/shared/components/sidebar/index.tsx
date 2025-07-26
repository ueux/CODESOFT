'use client'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import Box from '../box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import SidebarItem from './sidebar.item'
import SidebarMenu from './sidebar.menu'
import { BellPlus, BellRing, CalendarPlus, FileClock, ListOrdered, LogOut, Mail, PackageSearch, PencilRuler, Settings, SquarePlus, Store, TicketPercent, Users } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import useSidebar from 'apps/admin-ui/src/hooks/useSidebar'
import useAdmin from 'apps/admin-ui/src/hooks/useAdmin'
import Logo from 'apps/admin-ui/src/assets/svgs/logo'
import { HomeIcon } from 'apps/admin-ui/src/assets/svgs/home'
import Payments from 'apps/admin-ui/src/assets/svgs/payment'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar()
  const pathName = usePathname()
  const {admin,isLoading,isError,refetch}=useAdmin()
  const queryClient = useQueryClient()
  const router=useRouter()
  useEffect(() => {
    setActiveSidebar(pathName)
  },[pathName,setActiveSidebar])
  const getIconColor = (route: string) => activeSidebar === route ? "#0085ff" : "#969696"
  const logOutHandler = async () => {
    await axiosInstance.get("/api/logout-seller");
    queryClient.invalidateQueries({ queryKey: ["seller"] });
    router.push("/login");
  };
  return (
    <Box css={{ height: "100vh", zIndex: 202, position: "sticky", padding: "8px", top: "0", overflow: "scroll", scrollbarWidth: "none" }} className='sidebar-wrapper'>
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className='flex justify-center text-center gap-2'>
            <Logo />
            <Box className='pl-4'>
              <h3 className='"text-xl font-medium text-[#ecedee]'>{admin?.name}</h3>
              <h5 className='font-medium text-xs text-[#ecedee] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]'>
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className='block my-3 h-full'>
        <Sidebar.Body className='body sidebar'>
          <SidebarItem title='Dashboard' icon={<HomeIcon fill={getIconColor("/dashboard")} />} isActive={activeSidebar === "/dashboard"} href='/dashboard' />
          <div className='mt-2 block'>
            <SidebarMenu title="Main Menu">
              <SidebarItem title='Orders' icon={<ListOrdered color={getIconColor("/accounts")} size={26} />} isActive={activeSidebar === "/dashboard/orders"} href='/dashboard/orders' />
              <SidebarItem title='Payments'  icon={<Payments fill={getIconColor("/payments")}  />} isActive={activeSidebar === "/dashboard/payments"} href='/dashboard/payments' />
              <SidebarItem title=' Products'  icon={<PackageSearch fill={getIconColor("/dashboard/products")} size={22} />} isActive={activeSidebar === "/dashboard/products"} href='/dashboard/products' />
              <SidebarItem title=' Events'  icon={<BellPlus fill={getIconColor("/dashboard/events")} size={24} />} isActive={activeSidebar === "/dashboard/events"} href='/dashboard/events' />
              <SidebarItem title=' Users'  icon={<Users fill={getIconColor("/dashboard/users")} size={24} />} isActive={activeSidebar === "/dashboard/users"} href='/dashboard/users' />
              <SidebarItem title=' sellers'  icon={<Store fill={getIconColor("/dashboard/sellers")} size={24} />} isActive={activeSidebar === "/dashboard/sellers"} href='/dashboard/sellers' />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem title='Loggers' icon={<FileClock color={getIconColor("/dashboard/loggers")} size={24} />} isActive={activeSidebar === "/dashboard/loggers"} href='/dashboard/loggers' />
              <SidebarItem title='Management'  icon={<Settings fill={getIconColor("/dashboard/management")} size={22} />} isActive={activeSidebar === "/dashboard/management"} href='/dashboard/management' />
              <SidebarItem title='Notifications'  icon={<BellRing fill={getIconColor("/dashboard/notifications")} size={22} />} isActive={activeSidebar === "/dashboard/notifications"} href='/dashboard/notifications' />
            </SidebarMenu>
            <SidebarMenu title="Customzation">
              <SidebarItem title='All Customizations' icon={<PencilRuler color={getIconColor("/dashboard/customization")} size={24} />} isActive={activeSidebar === "/dashboard/customization"} href='/dashboard/customization' />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem title='Logout'  icon={<LogOut fill={getIconColor("/logout")} size={20} />} isActive={activeSidebar === "/logout"} href='/' />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
        </div>
    </Box>
  )
}

export default SidebarBarWrapper
