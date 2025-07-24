import Header from "@/app/_components/Header";
import { useAppSelector } from "@/app/redux";
import { useGetTasksQuery } from "@/state/api";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import {  Flag, Loader2, Tag, User } from "lucide-react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const StatusCell = ({ value }: { value: string }) => {
  const statusColors = {
    "To Do": "bg-gray-100 text-gray-800",
    "Work In Progress": "bg-blue-100 text-blue-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    "Completed": "bg-green-100 text-green-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
      {value}
    </span>
  );
};

const PriorityCell = ({ value }: { value: string }) => {
  const priorityColors = {
    "Urgent": "bg-red-100 text-red-800",
    "High": "bg-orange-100 text-orange-800",
    "Medium": "bg-yellow-100 text-yellow-800",
    "Low": "bg-blue-100 text-blue-800",
    "Backlog": "bg-gray-100 text-gray-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${priorityColors[value as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'}`}>
      <Flag className="mr-1 h-3 w-3" />
      {value}
    </span>
  );
};

const UserCell = ({ value }: { value: { username?: string } }) => {
  return (
    <div className="flex items-center">
      <User className="mr-2 h-4 w-4 text-gray-500" />
      <span>{value?.username || "Unassigned"}</span>
    </div>
  );
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 200,
    renderCell: (params: GridRenderCellParams) => (
      <span className="font-medium">{params.value}</span>
    ),
  },
  {
    field: "description",
    headerName: "Description",
    width: 250,
    renderCell: (params: GridRenderCellParams) => (
      <span className="line-clamp-2 text-sm text-gray-600">{params.value}</span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: (params: GridRenderCellParams) => <StatusCell value={params.value} />,
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 150,
    renderCell: (params: GridRenderCellParams) => <PriorityCell value={params.value} />,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 150,
    renderCell: (params: GridRenderCellParams) => (
      <div className="flex flex-wrap gap-1">
        {params.value?.split(",").map((tag: string) => (
          <span key={tag} className="flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">
            <Tag className="mr-1 h-3 w-3" />
            {tag.trim()}
          </span>
        ))}
      </div>
    ),
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm">{params.value || "-"}</span>
    ),
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <span className="text-sm">{params.value || "-"}</span>
    ),
  },
  {
    field: "author",
    headerName: "Author",
    width: 180,
    renderCell: (params: GridRenderCellParams) => <UserCell value={params.value} />,
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 180,
    renderCell: (params: GridRenderCellParams) => <UserCell value={params.value} />,
  },
];

const TableView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: tasks, error, isLoading } = useGetTasksQuery({ projectId: Number(id) });

  const getDataGridStyles = () => ({
    "& .MuiDataGrid-root": {
      border: "none",
      fontFamily: "inherit",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6",
      color: isDarkMode ? "#e5e7eb" : "#374151",
      borderBottom: "none",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiDataGrid-row": {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      "&:hover": {
        backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
      },
    },
    "& .MuiDataGrid-footerContainer": {
      backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6",
      borderTop: "none",
    },
    "& .MuiTablePagination-root": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiDataGrid-virtualScroller": {
      backgroundColor: isDarkMode ? "#111827" : "#ffffff",
    },
    "& .MuiDataGrid-toolbarContainer": {
      padding: "8px 16px",
      backgroundColor: isDarkMode ? "#1f2937" : "#f3f4f6",
    },
    "& .MuiButton-text": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
    "& .MuiDataGrid-menuIconButton": {
      color: isDarkMode ? "#e5e7eb" : "#374151",
    },
  });

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    </div>
  );

  if (error || !tasks) return (
    <div className="flex h-64 items-center justify-center text-red-500">
      An error occurred while fetching tasks
    </div>
  );

  return (
    <div className="h-[calc(100vh-180px)] w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="Task Table"
          buttonComponent={
            <button
              className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      <div className="mt-4 h-full w-full">
        <DataGrid
          rows={tasks}
          columns={columns}
          checkboxSelection
          sx={getDataGridStyles()}
        />
      </div>
    </div>
  );
};

export default TableView;