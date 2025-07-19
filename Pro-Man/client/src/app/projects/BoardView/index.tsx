import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useAppSelector } from "@/app/redux";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: tasks, isLoading, error } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) return <div className="p-4 text-gray-500 dark:text-gray-400">Loading tasks...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  isDarkMode,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColors = {
    "To Do": "#3b82f6",
    "Work In Progress": "#10b981",
    "Under Review": "#f59e0b",
    "Completed": "#000000",
  };

  const statusBgColors = {
    "To Do": "bg-blue-100 dark:bg-blue-900/20",
    "Work In Progress": "bg-green-100 dark:bg-green-900/20",
    "Under Review": "bg-yellow-100 dark:bg-yellow-900/20",
    "Completed": "bg-gray-100 dark:bg-gray-800/20",
  };

  return (
    <div
      ref={drop}
      className={`rounded-lg transition-all duration-200 ${isOver ? (isDarkMode ? "bg-gray-900/50" : "bg-blue-50") : ""} ${
        statusBgColors[status as keyof typeof statusBgColors]
      }`}
    >
      <div className="sticky top-0 z-10 p-4">
        <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
          <div className="flex items-center">
            <div
              className="mr-3 h-3 w-3 rounded-full"
              style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
            />
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {status}
            </h3>
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium dark:bg-gray-700 dark:text-gray-300">
              {tasksCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700">
              <EllipsisVertical size={18} />
            </button>
            <button
              className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => setIsModalNewTaskOpen(true)}
              aria-label={`Add task to ${status}`}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-2">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <Task key={task.id} task={task} isDarkMode={isDarkMode} />
          ))}
      </div>
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  isDarkMode: boolean;
};

const Task = ({ task, isDarkMode }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTags = task.tags ? task.tags.split(",").filter(tag => tag.trim()) : [];
  const formattedStartDate = task.startDate ? format(new Date(task.startDate), "MMM d") : "";
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), "MMM d") : "";
  const commentCount = task.comments?.length || 0;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => {
    const priorityStyles = {
      Urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      High: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      Medium: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[priority as keyof typeof priorityStyles]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div
      ref={drag}
      className={`transform rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
        isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {task.attachments?.[0] && (
        <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
          <Image
            src={`/${task.attachments[0].fileURL}`}
            alt={task.attachments[0].fileName}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {task.priority && <PriorityTag priority={task.priority} />}
          {taskTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-3 flex items-start justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {task.points} pts
            </span>
          )}
        </div>

        {task.description && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {task.description}
          </p>
        )}

        {(formattedStartDate || formattedDueDate) && (
          <div className="mb-3 flex items-center text-xs text-gray-500 dark:text-gray-500">
            {formattedStartDate && <span>{formattedStartDate}</span>}
            {formattedStartDate && formattedDueDate && (
              <span className="mx-1">-</span>
            )}
            {formattedDueDate && <span>{formattedDueDate}</span>}
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <div className="flex -space-x-2">
            {task.assignee && (
              <div className="relative h-8 w-8">
                <Image
                  src={`/${task.assignee.profilePictureUrl}`}
                  alt={task.assignee.username}
                  fill
                  className="rounded-full border-2 border-white object-cover dark:border-gray-800"
                />
              </div>
            )}
            {task.author && (
              <div className="relative h-8 w-8">
                <Image
                  src={`/${task.author.profilePictureUrl}`}
                  alt={task.author.username}
                  fill
                  className="rounded-full border-2 border-white object-cover dark:border-gray-800"
                />
              </div>
            )}
          </div>

          {commentCount > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <MessageSquareMore size={16} className="mr-1" />
              <span className="text-xs">{commentCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardView;