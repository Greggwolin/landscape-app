// app/components/Header.tsx
import React from 'react';

interface HeaderProps {
  projectData: {
    project_name?: string;
    project_id?: number;
  } | null;
}

const Header: React.FC<HeaderProps> = ({ projectData }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-white font-semibold">Landscape</span>
        </div>
        
        {projectData && (
          <div className="flex items-center space-x-2 text-gray-300">
            <span className="text-gray-500">|</span>
            <span className="text-sm">
              {projectData.project_name || `Project ${projectData.project_id}`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
          Save
        </button>
        <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
          Export
        </button>
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-gray-300 text-xs">U</span>
        </div>
      </div>
    </header>
  );
};

export default Header;