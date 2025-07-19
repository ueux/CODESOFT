"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const { data: projects } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  return (
    <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : "expanded"}`}>
      {/* Header Section */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">PMLIST</h1>
        <button
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          className="close-button"
          aria-label="Close sidebar"
        >
          <X className="close-icon" />
        </button>
      </div>

      {/* Team Info */}
      <div className="team-info">
        <div className="team-logo">
          <Image src="/logo.png" alt="Team Logo" fill className="object-cover" />
        </div>
        <div>
          <h3 className="team-name">PRO-MAN TEAM</h3>
          <div className="team-status">
            <LockIcon className="lock-icon" />
            <span>Private</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <SidebarLink icon={Home} label="Home" href="/" />
        <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
        <SidebarLink icon={Search} label="Search" href="/search" />
        <SidebarLink icon={Settings} label="Settings" href="/settings" />
        <SidebarLink icon={User} label="Users" href="/users" />
        <SidebarLink icon={Users} label="Teams" href="/teams" />

        {/* Projects Section */}
        <div className="mt-2">
          <CollapsibleSection
            title="Projects"
            isOpen={showProjects}
            onClick={() => setShowProjects(!showProjects)}
          />
          {showProjects && (
            <div className="sidebar-links">
              {projects?.map((project) => (
                <SidebarLink
                  key={project.id}
                  icon={Briefcase}
                  label={project.name}
                  href={`/projects/${project.id}`}
                  indent
                />
              ))}
            </div>
          )}
        </div>

        {/* Priority Section */}
        <div className="mt-2">
          <CollapsibleSection
            title="Priority"
            isOpen={showPriority}
            onClick={() => setShowPriority(!showPriority)}
          />
          {showPriority && (
            <div className="sidebar-links">
              <SidebarLink icon={AlertCircle} label="Urgent" href="/priority/urgent" indent />
              <SidebarLink icon={ShieldAlert} label="High" href="/priority/high" indent />
              <SidebarLink icon={AlertTriangle} label="Medium" href="/priority/medium" indent />
              <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" indent />
              <SidebarLink icon={Layers3} label="Backlog" href="/priority/backlog" indent />
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

const CollapsibleSection = ({ title, isOpen, onClick }: { title: string; isOpen: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="collapsible-section"
    aria-expanded={isOpen}
    aria-controls={`${title.toLowerCase()}-section`}
  >
    <span>{title}</span>
    {isOpen ? (
      <ChevronUp className="chevron-icon" />
    ) : (
      <ChevronDown className="chevron-icon" />
    )}
  </button>
);

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  indent?: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, indent = false }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`sidebar-link ${indent ? "indented" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <div className={`sidebar-link-content ${isActive ? "active" : ""}`}>
        <Icon className="sidebar-link-icon" />
        <span className="sidebar-link-label">{label}</span>
      </div>
    </Link>
  );
};

export default Sidebar;