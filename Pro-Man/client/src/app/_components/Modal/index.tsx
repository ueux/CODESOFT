import React from "react";
import ReactDOM from "react-dom";
import Header from "../Header";
import { X } from "lucide-react";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

const Modal = ({ children, isOpen, onClose, name }: Props) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop with fade effect */}
      <div
        className="fixed inset-0 bg-gray-500/40 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal container with subtle pop animation */}
      <div className="relative w-full max-w-2xl animate-[fadeIn_0.2s_ease-out]">
        {/* Modal card with crisp white background */}
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.25)]">
          {/* Header with subtle bottom border */}
          <div className="border-b border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-gray-900">
                {name}
              </h3>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} className="transition-transform hover:scale-110" />
              </button>
            </div>
          </div>

          {/* Content area with comfortable padding */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {children}
          </div>

          {/* Optional subtle fade at bottom for scroll indication */}
          <div className="sticky bottom-0 h-8 w-full bg-gradient-to-t from-white/90 to-transparent" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;