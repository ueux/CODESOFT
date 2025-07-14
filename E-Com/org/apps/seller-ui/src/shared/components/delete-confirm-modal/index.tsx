'use client'
import React from 'react';
import { AlertTriangle, Trash2, Undo2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  product: any;
  onClose: () => void;
  onConfirm: () => void;
  onRestore: () => void;
}

const DeleteConfirmationModal = ({
  product,
  onClose,
  onConfirm,
  onRestore
}: DeleteConfirmationModalProps) => {
  const isDeleted = product?.isDeleted;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-yellow-500" size={24} />
          <h3 className="text-xl font-semibold text-white">
            {isDeleted ? 'Confirm Restoration' : 'Confirm Deletion'}
          </h3>
        </div>

        <p className="text-gray-300 mb-6">
          {isDeleted
            ? `Are you sure you want to restore "${product?.title}"?`
            : `Are you sure you want to delete "${product?.title}"? This action cannot be undone.`}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={isDeleted ? onRestore : onConfirm}
            className={`px-4 py-2 rounded-md text-white font-semibold transition ${
              isDeleted
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {isDeleted ? <Undo2 size={18} /> : <Trash2 size={18} />}
              {isDeleted ? "Restore" : "Delete"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;