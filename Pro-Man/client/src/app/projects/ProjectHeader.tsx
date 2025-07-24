import {
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Grid3x3,
  List as ListIcon,
  PlusSquare,
  Share2,
  Table as TableIcon,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import ModalNewProject from "./ModalNewProject";
import Header from "../_components/Header";

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number | null;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
}

interface ProjectTeam {
  id: number;
  teamId: number;
  projectId: number;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tasks?: Task[];
  projectTeams?: ProjectTeam[];
}

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  project: Project;
};

function calculateProgress(start?: string, end?: string): number {
  if (!start || !end) return 0;

  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const now = Date.now();

  if (now >= endDate) return 100;
  if (now <= startDate) return 0;

  const total = endDate - startDate;
  const elapsed = now - startDate;
  return Math.round((elapsed / total) * 100);
}

const ProjectHeader = ({ activeTab, setActiveTab, project }: Props) => {
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const taskStats = {
    total: project.tasks?.length || 0,
    completed: project.tasks?.filter(task => task.status === "Completed").length || 0,
    inProgress: project.tasks?.filter(task => task.status === "Work In Progress").length || 0,
    urgent: project.tasks?.filter(task => task.priority === "Urgent").length || 0,
  };

  return (
    <div className="project-header-container">
      <ModalNewProject
        isOpen={isModalNewProjectOpen}
        onClose={() => setIsModalNewProjectOpen(false)}
      />
      <div className="header-wrapper">
        <Header
          name={project.name}
          buttonComponent={
            <button
              className="primary-button"
              onClick={() => setIsModalNewProjectOpen(true)}
              aria-label="Create new board"
            >
              <PlusSquare className="primary-button-icon" />
              <span className="whitespace-nowrap">New Project</span>
            </button>
          }
        />
      </div>
      {/* Project info section */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-lg border-b border-gray-200/80 dark:border-gray-700 dark:bg-gray-900/80 rounded-t-lg shadow-sm">
        {project.description && (
          <p className="text-gray-800 dark:text-gray-200 text-[15px] mb-4 leading-relaxed max-w-4xl">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
          {/* Date information */}
          {project.startDate && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600 dark:text-gray-400">Start:</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium font-mono tracking-tight">
                  {formatDate(project.startDate)}
                </span>
              </div>
            </div>
          )}

          {project.endDate && (
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600 dark:text-gray-400">End:</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium font-mono tracking-tight">
                  {formatDate(project.endDate)}
                </span>
              </div>
            </div>
          )}

          {/* Teams information */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600 dark:text-gray-400">Teams:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {project.projectTeams?.length || 0}
              </span>
            </div>
          </div>

          {/* Task statistics */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-600 dark:text-gray-400">Tasks:</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {taskStats.completed}/{taskStats.total}
              </span>
            </div>
          </div>

          {/* Urgent tasks */}
          {taskStats.urgent > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-600 dark:text-gray-400">Urgent:</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {taskStats.urgent}
                </span>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {(project.startDate && project.endDate) && (
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Project Progress
                </span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {calculateProgress(project.startDate, project.endDate)}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full"
                  style={{ width: `${calculateProgress(project.startDate, project.endDate)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-group">
          <TabButton
            name="Board"
            icon={<Grid3x3 className="tab-button-icon" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="List"
            icon={<ListIcon className="tab-button-icon" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="tab-button-icon" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Table"
            icon={<TableIcon className="tab-button-icon" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="action-button"
            aria-label="Filter tasks"
          >
            <Filter className="action-button-icon" />
          </button>
          <button
            className="action-button"
            aria-label="Share project"
          >
            <Share2 className="action-button-icon" />
          </button>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Task"
              className="search-input"
              aria-label="Search tasks"
            />
            <Grid3x3 className="search-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(name)}
      aria-current={isActive ? "page" : undefined}
    >
      {icon}
      <span>{name}</span>
      {isActive && <span className="tab-indicator" />}
    </button>
  );
};

export default ProjectHeader;