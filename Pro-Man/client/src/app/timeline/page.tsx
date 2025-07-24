"use client";

import { useAppSelector } from "@/app/redux";
import { useGetProjectsQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import Header from "../_components/Header";

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (
      projects?.map((project) => ({
        start: new Date(project.startDate as string),
        end: new Date(project.endDate as string),
        name: project.name,
        id: `Project-${project.id}`,
        type: "project" as TaskTypeItems,
        progress: 50,
        isDisabled: false,
      })) || []
    );
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center text-lg text-gray-600 dark:text-gray-300">Loading projects timeline...</div>;
  if (isError || !projects)
    return <div className="flex h-64 items-center justify-center text-lg text-red-500 dark:text-red-400">An error occurred while fetching projects</div>;

  return (
    <div className={`max-w-full p-4 md:p-8 ${isDarkMode ? 'bg-dark-primary' : 'bg-gray-50'}`}>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
          <Header name="Projects Timeline" />
          <div className="relative w-full md:w-64">
            <select
              className={`block w-full rounded-lg border px-4 py-2 pr-8 leading-tight shadow-sm transition-all focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'border-dark-tertiary bg-dark-secondary text-white focus:border-dark-accent focus:ring-dark-accent'
                  : 'border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={displayOptions.viewMode}
              onChange={handleViewModeChange}
            >
              <option value={ViewMode.Day}>Day View</option>
              <option value={ViewMode.Week}>Week View</option>
              <option value={ViewMode.Month}>Month View</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg
                className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </header>

        <div className={`overflow-hidden rounded-xl shadow-lg ${
          isDarkMode ? 'bg-dark-secondary' : 'bg-white'
        }`}>
          <div className="timeline p-2">
            <Gantt
              tasks={ganttTasks}
              {...displayOptions}
              columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
              listCellWidth="100px"
              projectBackgroundColor={isDarkMode ? "#1e293b" : "#f1f5f9"}
              projectProgressColor={isDarkMode ? "#334155" : "#cbd5e1"}
              projectProgressSelectedColor={isDarkMode ? "#475569" : "#94a3b8"}
              barBackgroundColor={isDarkMode ? "#4f46e5" : "#6366f1"}
              barProgressColor={isDarkMode ? "#818cf8" : "#a5b4fc"}
              barCornerRadius={6}
              fontSize={isDarkMode ? "14px" : "13px"}
              arrowColor={isDarkMode ? "#94a3b8" : "#64748b"}
              arrowIndent={20}
              todayColor={isDarkMode ? "#f43f5e" : "#ef4444"}
              TooltipContent={({ task }) => (
                <div className={`rounded-lg p-3 shadow-lg ${
                  isDarkMode ? 'bg-dark-primary text-white' : 'bg-white text-gray-800'
                }`}>
                  <strong>{task.name}</strong>
                  <div>Start: {task.start.toLocaleDateString()}</div>
                  <div>End: {task.end.toLocaleDateString()}</div>
                  <div>Progress: {task.progress}%</div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;