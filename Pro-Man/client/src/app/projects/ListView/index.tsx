import Header from "@/app/_components/Header";
import TaskCard from "@/app/_components/TaskCard";
import { Task, useGetTasksQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "@/app/redux";
import { Plus } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: tasks, error, isLoading } = useGetTasksQuery({ projectId: Number(id) });

  if (isLoading) return (
    <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      Loading tasks...
    </div>
  );

  if (error) return (
    <div className={`p-8 text-center ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
      Error loading tasks
    </div>
  );

  return (
    <div className={`px-4 pb-8 transition-colors duration-300 xl:px-6 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="pt-5">
        <Header
          name="List View"
          buttonComponent={
            <button
              className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                ${isDarkMode ?
                  'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-800' :
                  'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isDarkMode ? 'focus:ring-offset-dark-bg' : 'focus:ring-offset-white'}
              `}
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </button>
          }
          isSmallText
        />
      </div>

      {tasks?.length === 0 ? (
        <div className={`rounded-lg p-8 text-center ${isDarkMode ? 'bg-dark-secondary' : 'bg-white'} shadow-sm`}>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            No tasks found. Create your first task to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {tasks?.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              className="transition-all duration-200 hover:scale-[1.02]"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListView;