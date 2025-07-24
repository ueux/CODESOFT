import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";
import { Clock, MessageSquare, Tag, Flag, Circle, CheckCircle } from "lucide-react";
import { useAppSelector } from "@/app/redux";

type Props = {
  task: Task;
  className?: string;
};

const TaskCard = ({ task, className = "" }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const PriorityIndicator = ({ priority }: { priority: string }) => {
    const priorityColors = {
      Urgent: "bg-red-500",
      High: "bg-yellow-500",
      Medium: "bg-green-500",
      Low: "bg-blue-500",
      default: "bg-gray-400"
    };

    const color = priorityColors[priority as keyof typeof priorityColors] || priorityColors.default;

    return (
      <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <Flag className="mr-1 h-4 w-4" />
        <span className={`inline-block h-2 w-2 rounded-full ${color} mr-1`} />
        {priority}
      </div>
    );
  };

  const StatusIndicator = ({ status }: { status: string }) => {
    const statusIcons = {
      "To Do": <Circle className="h-4 w-4 text-gray-400" />,
      "Work In Progress": <Circle className="h-4 w-4 text-blue-500 animate-pulse" />,
      "Under Review": <Circle className="h-4 w-4 text-yellow-500" />,
      "Completed": <CheckCircle className="h-4 w-4 text-green-500" />,
      default: <Circle className="h-4 w-4" />
    };

    const icon = statusIcons[status as keyof typeof statusIcons] || statusIcons.default;

    return (
      <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {icon}
        <span className="ml-1">{status}</span>
      </div>
    );
  };

  const formattedStartDate = task.startDate ? format(new Date(task.startDate), "MMM d") : null;
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), "MMM d") : null;
  const tags = task.tags ? task.tags.split(",").filter(tag => tag.trim()) : [];
  const commentCount = task.comments?.length || 0;

  return (
    <div className={`rounded-lg border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} ${className}`}>
      {/* Task Image */}
      {task.attachments?.[0] && (
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={`https://pm--s3--images0.s3.ap-south-1.amazonaws.com/public/${task.attachments[0].fileURL}`}
            alt={task.attachments[0].fileName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Task Content */}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          {task.points && (
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
              {task.points} pts
            </span>
          )}
        </div>

        {task.description && (
          <p className={`mb-4 line-clamp-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`flex items-center rounded-full px-2 py-1 text-xs ${isDarkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {task.priority && <PriorityIndicator priority={task.priority} />}
            {task.status && <StatusIndicator status={task.status} />}
          </div>

          {(formattedStartDate || formattedDueDate) && (
            <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="mr-2 h-4 w-4" />
              {formattedStartDate && <span>{formattedStartDate}</span>}
              {formattedStartDate && formattedDueDate && <span className="mx-1">-</span>}
              {formattedDueDate && <span>{formattedDueDate}</span>}
            </div>
          )}

          {/* Assignee and Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {task.assignee && (
                <div className="flex items-center">
                  <div className="relative mr-2 h-6 w-6">
                    <Image
                      src={`https://pm--s3--images0.s3.ap-south-1.amazonaws.com/public/${task.assignee.profilePictureUrl}`}
                      alt={task.assignee.username}
                      fill
                      className="rounded-full border object-cover"
                      style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                    />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {task.assignee.username}
                  </span>
                </div>
              )}
            </div>

            {commentCount > 0 && (
              <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageSquare className="mr-1 h-4 w-4" />
                {commentCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;