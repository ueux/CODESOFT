'use client'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import useSidebar from 'apps/seller-ui/src/hooks/useSiderbar'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import Box from '../box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import Logo from 'apps/seller-ui/src/assets/svgs/logo'
import SidebarItem from './sidebar.item'
import { HomeIcon } from 'apps/seller-ui/src/assets/icons/home'
import SidebarMenu from './sidebar.menu'
import { BellPlus, BellRing, CalendarPlus, Headset, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent } from 'lucide-react'
import Payment from 'apps/seller-ui/src/assets/icons/payment'

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar()
  const pathName = usePathname()
  const { seller } = useSeller()
  useEffect(() => {
    setActiveSidebar(pathName)
  },[pathName,setActiveSidebar])
  const getIconColor=(route:string)=>activeSidebar===route?"#0085ff":"#969696"
  return (
    <Box css={{ height: "100vh", zIndex: 202, position: "sticky", padding: "8px", top: "0", overflow: "scroll", scrollbarWidth: "none" }} className='sidebar-wrapper'>
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className='flex justify-center text-center gap-2'>
            <Logo />
            <Box className='pl-4'>
              <h3 className='"text-xl font-medium text-[#ecedee]'>{seller?.shop?.name}</h3>
              <h5 className='font-medium text-xm text-[#ecedee] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]'>
                {seller?.shop?.address}
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
              <SidebarItem title='Payments'  icon={<Payment fill={getIconColor("/payments")}  />} isActive={activeSidebar === "/dashboard/payments"} href='/dashboard/payments' />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem title='Create Product' icon={<SquarePlus color={getIconColor("/dashboard/create-product")} size={24} />} isActive={activeSidebar === "/dashboard/create-product"} href='/dashboard/create-product' />
              <SidebarItem title='All Products'  icon={<PackageSearch fill={getIconColor("/dashboard/all-products")} size={22} />} isActive={activeSidebar === "/dashboard/all-products"} href='/dashboard/all-products' />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem title='Create Event' icon={<CalendarPlus color={getIconColor("/dashboard/create-event")} size={24} />} isActive={activeSidebar === "/dashboard/create-event"} href='/dashboard/create-event' />
              <SidebarItem title='All Events'  icon={<BellPlus fill={getIconColor("/dashboard/all-events")} size={24} />} isActive={activeSidebar === "/dashboard/all-events"} href='/dashboard/all-events' />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem title='Inbox' icon={<Mail color={getIconColor("/dashboard/inbox")} size={20} />} isActive={activeSidebar === "/dashboard/inbox"} href='/dashboard/inbox' />
              <SidebarItem title='Setings'  icon={<Settings fill={getIconColor("/dashboard/settings")} size={22} />} isActive={activeSidebar === "/dashboard/settings"} href='/dashboard/settings' />
              <SidebarItem title='Notifications'  icon={<BellRing fill={getIconColor("/dashboard/notifications")} size={24} />} isActive={activeSidebar === "/dashboard/notifications"} href='/dashboard/notifications' />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem title='Discount Codes' icon={<TicketPercent color={getIconColor("/dashboard/discount-codes")} size={20} />} isActive={activeSidebar === "/dashboard/discount-codes"} href='/dashboard/discount-codes' />
              <SidebarItem title='Logout'  icon={<LogOut fill={getIconColor("/dashboard/logout")} size={20} />} isActive={activeSidebar === "/dashboard/logout"} href='/dashboard/logout' />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
        </div>
    </Box>
  )
}

export default SidebarBarWrapper
