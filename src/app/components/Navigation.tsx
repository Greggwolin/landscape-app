// app/components/Navigation.tsx
import React, { useState } from 'react';

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
  isCollapsible?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const navSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' }
      ]
    },
    {
      title: 'Property',
      items: [
        { id: 'planning-overview', label: 'Overview', icon: '🗺️' },
        { id: 'land-use', label: 'Land Use', icon: '🏞️' },
        { id: 'planning', label: 'Planning', icon: '🪄' },
        { id: 'mapping-gis', label: 'Mapping / GIS', icon: '🌍' }
      ],
      isCollapsible: true
    },
    {
      title: 'Assumptions',
      items: [
        { id: 'acquisition', label: 'Acquisition', icon: '🏡' },
        { id: 'market', label: 'Market', icon: '🧮' },
        { id: 'project-costs', label: 'Project Costs', icon: '💰' },
        { id: 'project-revenues', label: 'Project Revenues', icon: '📈' }
      ],
      isCollapsible: true
    },
    {
      title: 'Development',
      items: [
        { id: 'entitlements', label: 'Stage 1 - Entitlements', icon: '📋' },
        { id: 'engineering', label: 'Stage 2 - Engineering', icon: '⚙️' },
        { id: 'development', label: 'Stage 3 - Development', icon: '🏗️' },
        { id: 'disposition', label: 'Project Disposition', icon: '🎯' }
      ],
      isCollapsible: true
    },
    {
      title: 'Ownership',
      items: [
        { id: 'debt', label: 'Debt', icon: '🏦' },
        { id: 'equity', label: 'Equity', icon: '📊' },
        { id: 'muni-district', label: 'Muni / District', icon: '🏛️' }
      ],
      isCollapsible: true
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'zoning-glossary', label: 'Zoning Glossary', icon: '🏷️' }
      ]
    }
  ];

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  return (
    <nav className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-gray-300 text-sm font-medium">Project Navigation</h2>
      </div>

      <div className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-1">
            {section.isCollapsible ? (
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide hover:text-gray-300 flex items-center justify-between transition-colors"
              >
                <span>{section.title}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${collapsedSections[section.title] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                {section.title}
              </div>
            )}
            
            {(!section.isCollapsible || !collapsedSections[section.title]) && (
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full text-left px-6 py-2 text-sm flex items-center space-x-3 hover:bg-gray-700 transition-colors ${
                      activeView === item.id
                        ? 'bg-gray-700 text-white border-r-2 border-blue-500'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
