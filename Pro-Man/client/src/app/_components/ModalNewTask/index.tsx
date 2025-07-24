import { Priority, Status, useCreateTaskMutation } from "@/state/api";
import React, { useState } from "react";
import { formatISO, isAfter } from "date-fns";
import Modal from "../Modal";
import { useAppSelector } from "@/app/redux";
import { Calendar, Circle, Flag, Loader2, Tag, User, User2 } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [createTask, { isLoading }] = useCreateTaskMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: Status.ToDo,
    priority: Priority.Medium,
    tags: "",
    startDate: "",
    dueDate: "",
    authorUserId: "",
    assignedUserId: "",
    projectId: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.authorUserId) newErrors.authorUserId = "Author is required";
    if (id === null && !formData.projectId) newErrors.projectId = "Project ID is required";

    // Validate dates
    if (formData.startDate && formData.dueDate) {
      if (isAfter(new Date(formData.startDate), new Date(formData.dueDate))) {
        newErrors.dueDate = "Due date must be after start date";
      }
    }

    // Validate user IDs are numbers
    if (formData.authorUserId && isNaN(Number(formData.authorUserId))) {
      newErrors.authorUserId = "Author ID must be a number";
    }
    if (formData.assignedUserId && isNaN(Number(formData.assignedUserId))) {
      newErrors.assignedUserId = "Assignee ID must be a number";
    }
    if (formData.projectId && isNaN(Number(formData.projectId))) {
      newErrors.projectId = "Project ID must be a number";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
       await createTask({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags,
        startDate: formData.startDate ? formatISO(new Date(formData.startDate)) : undefined,
        dueDate: formData.dueDate ? formatISO(new Date(formData.dueDate)) : undefined,
        authorUserId: parseInt(formData.authorUserId),
        assignedUserId: formData.assignedUserId ? parseInt(formData.assignedUserId) : undefined,
        projectId: id !== null ? Number(id) : Number(formData.projectId),
      }).unwrap();

      toast.success("Task created successfully!");

      // Reset form on success
      setFormData({
        title: "",
        description: "",
        status: Status.ToDo,
        priority: Priority.Medium,
        tags: "",
        startDate: "",
        dueDate: "",
        authorUserId: "",
        assignedUserId: "",
        projectId: ""
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const inputBaseStyles = `w-full rounded-lg border p-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
    isDarkMode ?
    'bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/30' :
    'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
  }`;

  const errorStyles = "mt-1 text-sm text-red-500";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Create New Task"
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input
            type="text"
            name="title"
            className={`${inputBaseStyles} ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Task title"
            value={formData.title}
            onChange={handleChange}
            autoFocus
          />
          {errors.title && <p className={errorStyles}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            className={`${inputBaseStyles} min-h-[100px]`}
            placeholder="Task description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              <Circle className="mr-2 h-4 w-4" />
              Status
            </label>
            <select
              name="status"
              className={inputBaseStyles}
              value={formData.status}
              onChange={handleChange}
            >
              {Object.values(Status).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              <Flag className="mr-2 h-4 w-4" />
              Priority
            </label>
            <select
              name="priority"
              className={inputBaseStyles}
              value={formData.priority}
              onChange={handleChange}
            >
              {Object.values(Priority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            <Tag className="mr-2 h-4 w-4" />
            Tags
          </label>
          <input
            type="text"
            name="tags"
            className={inputBaseStyles}
            placeholder="Comma separated tags"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              <Calendar className="mr-2 h-4 w-4" />
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              className={`${inputBaseStyles} ${errors.startDate ? 'border-red-500' : ''}`}
              value={formData.startDate}
              onChange={handleChange}
              title="Start Date"

            />
            {errors.startDate && <p className={errorStyles}>{errors.startDate}</p>}
          </div>

          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              <Calendar className="mr-2 h-4 w-4" />
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              className={`${inputBaseStyles} ${errors.dueDate ? 'border-red-500' : ''}`}
              value={formData.dueDate}
              onChange={handleChange}
              min={formData.startDate}
              title="Due Date"

            />
            {errors.dueDate && <p className={errorStyles}>{errors.dueDate}</p>}
          </div>
        </div>

        {/* User IDs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              <User className="mr-2 h-4 w-4" />
              Author ID *
            </label>
            <input
              type="text"
              name="authorUserId"
              className={`${inputBaseStyles} ${errors.authorUserId ? 'border-red-500' : ''}`}
              placeholder="Author user ID"
              value={formData.authorUserId}
              onChange={handleChange}
            />
            {errors.authorUserId && <p className={errorStyles}>{errors.authorUserId}</p>}
          </div>

          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              <User2 className="mr-2 h-4 w-4" />
              Assignee ID
            </label>
            <input
              type="text"
              name="assignedUserId"
              className={`${inputBaseStyles} ${errors.assignedUserId ? 'border-red-500' : ''}`}
              placeholder="Assignee user ID"
              title="Assignee user ID"
              value={formData.assignedUserId}
              onChange={handleChange}
            />
            {errors.assignedUserId && <p className={errorStyles}>{errors.assignedUserId}</p>}
          </div>
        </div>

        {/* Project ID (conditional) */}
        {id === null && (
          <div>
            <label className="mb-1 block text-sm font-medium">Project ID *</label>
            <input
              type="text"
              name="projectId"
              className={`${inputBaseStyles} ${errors.projectId ? 'border-red-500' : ''}`}
              placeholder="Project ID"
              value={formData.projectId}
              onChange={handleChange}
            />
            {errors.projectId && <p className={errorStyles}>{errors.projectId}</p>}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading ? 'cursor-not-allowed opacity-80' : ''
          } ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Task...
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;