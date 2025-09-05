// app/components/Navigation.tsx
import React from 'react';

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'planning', label: 'Planning', icon: '🗺️' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'revenue', label: 'Revenue', icon: '📈' },
    { id: 'finance', label: 'Finance', icon: '🏦' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ];

  return (
    <nav className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-gray-300 text-sm font-medium">Project Navigation</h2>
      </div>
      
      <div className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-gray-700 transition-colors ${
              activeView === item.id 
                ? 'bg-gray-700 text-white border-r-2 border-blue-500' 
                : 'text-gray-300'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Project ID: 7</div>
          <div>Last saved: Just now</div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;