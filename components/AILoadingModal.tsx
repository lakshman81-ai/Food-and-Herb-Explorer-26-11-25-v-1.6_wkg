
import React from 'react';
import type { AILoadingState } from '../types';

interface AILoadingModalProps {
  state: AILoadingState;
  onClose: () => void;
}

const AILoadingModal: React.FC<AILoadingModalProps> = ({ state, onClose }) => {
  if (!state.show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000]">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-4/5">
        {state.showSpinner && (
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        )}
        <p className="text-gray-800 text-base">{state.message}</p>
        {state.showClose && (
          <button
            onClick={onClose}
            className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default AILoadingModal;
