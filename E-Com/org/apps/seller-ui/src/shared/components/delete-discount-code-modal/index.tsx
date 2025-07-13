import { X } from 'lucide-react';
import React from 'react'

const DeleteDiscountCodeModal = ({ discount, onClose, onConfirm }: { discount: any; onClose: () => void; onConfirm?: any }) => {

  return (
    <div className='fixed top-0 left-o w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className="bg-gray-800 p-6 rounded-lg w-f[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Delete Discount Code</h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-gray-300">
                Are you sure you want to delete {" "} <span className="font-semibold text-white">{discount.public_name}</span>?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
  )
}

export default DeleteDiscountCodeModal
