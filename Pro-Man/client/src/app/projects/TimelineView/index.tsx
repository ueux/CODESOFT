import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DisplayOption, Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: tasks, error, isLoading } = useGetTasksQuery({ projectId: Number(id) });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return tasks?.map((task) => ({
      start: new Date(task.startDate as string),
      end: new Date(task.dueDate as string),
      name: task.title,
      id: task.id.toString(),
      type: "task" as const,
      progress: task.points ? Math.min(100, Math.max(0, (task.points / 10) * 100) ): 0,
      isDisabled: false,
      styles: {
        backgroundColor: getTaskColor(task.priority, isDarkMode),
        backgroundSelectedColor: getSelectedTaskColor(task.priority, isDarkMode),
        progressColor: getProgressColor(task.priority, isDarkMode),
        progressSelectedColor: getSelectedProgressColor(task.priority, isDarkMode),
      },
      ...(task.description && { description: task.description }),
      ...(task.status && { status: task.status }),
    })) || [];
  }, [tasks, isDarkMode]);

  const handleViewModeChange = (mode: ViewMode) => {
    setDisplayOptions(prev => ({
      ...prev,
      viewMode: mode
    }));
  };

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  if (error || !tasks) return (
    <div className="flex h-64 items-center justify-center text-red-500">
      Failed to load timeline data
    </div>
  );

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold dark:text-white">
          Project Timeline
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex rounded-md shadow-sm" role="group">
            {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg ${
                  displayOptions.viewMode === mode
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleViewModeChange(mode)}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className={`rounded-lg shadow-md ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="overflow-x-auto p-2">
          <Gantt
            tasks={ganttTasks}
            viewMode={displayOptions.viewMode}
            locale={displayOptions.locale}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="150px"
            fontSize="12px"
            TooltipContent={CustomTooltip}
            barCornerRadius={4}
            barProgressColor={isDarkMode ? '#ffffff' : '#000000'}
            barProgressSelectedColor={isDarkMode ? '#ffffff' : '#000000'}
            arrowColor={isDarkMode ? '#d1d5db' : '#6b7280'}
            arrowIndent={20}
            todayColor={isDarkMode ? '#ef4444' : '#dc2626'}
            rowHeight={44}
            listCellHeight={44}
            headerHeight={50}
            ganttHeight={Math.min(800, ganttTasks.length * 44 + 100)}
            preStepsCount={1}
          />
        </div>
      </div>
    </div>
  );
};

// Helper functions for task colors
const getTaskColor = (priority: string | undefined, isDarkMode: boolean) => {
  switch (priority) {
    case 'Urgent': return isDarkMode ? '#ef4444' : '#f87171';
    case 'High': return isDarkMode ? '#f59e0b' : '#fbbf24';
    case 'Medium': return isDarkMode ? '#10b981' : '#34d399';
    case 'Low': return isDarkMode ? '#3b82f6' : '#60a5fa';
    default: return isDarkMode ? '#6b7280' : '#9ca3af';
  }
};

const getSelectedTaskColor = (priority: string | undefined, isDarkMode: boolean) => {
  switch (priority) {
    case 'Urgent': return isDarkMode ? '#dc2626' : '#ef4444';
    case 'High': return isDarkMode ? '#d97706' : '#f59e0b';
    case 'Medium': return isDarkMode ? '#059669' : '#10b981';
    case 'Low': return isDarkMode ? '#2563eb' : '#3b82f6';
    default: return isDarkMode ? '#4b5563' : '#6b7280';
  }
};

const getProgressColor = (priority: string | undefined, isDarkMode: boolean) => {
  return isDarkMode ? '#ffffff' : '#000000';
};

const getSelectedProgressColor = (priority: string | undefined, isDarkMode: boolean) => {
  return isDarkMode ? '#ffffff' : '#000000';
};

// Custom Tooltip Component
const CustomTooltip = ({ task }: { task: Task }) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  return (
    <div className={`rounded-md p-3 shadow-lg ${
      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
    }`}>
      <h3 className="mb-1 font-bold">{task.name}</h3>
      <p className="text-sm">
        {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
      </p>
      {task.description && (
        <p className="mt-1 text-sm">{task.description}</p>
      )}
      <div className="mt-2 flex items-center">
        <span className="mr-2 text-sm">Progress:</span>
        <div className="h-2 w-full rounded-full bg-gray-300">
          <div
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
        <span className="ml-2 text-sm">{task.progress}%</span>
      </div>
    </div>
  );
};

export default Timeline;