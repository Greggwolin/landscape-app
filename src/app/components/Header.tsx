// app/components/Header.tsx
import React, { useState, useEffect } from 'react';

interface Project {
  project_id: number;
  project_name: string;
}

interface HeaderProps {
  projectData: {
    project_name?: string;
    project_id?: number;
  } | null;
  onProjectChange?: (projectId: number) => void;
}

const Header: React.FC<HeaderProps> = ({ projectData, onProjectChange }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setIsDropdownOpen(false);
    if (onProjectChange) {
      onProjectChange(project.project_id);
    }
  };

  const handleAddNew = () => {
    setIsDropdownOpen(false);
    // TODO: Implement add new project functionality
    console.log('Add new project clicked');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center">
      <div className="flex items-center">
        <img 
          src="/logo-invert.png" 
          alt="Landscape Logo" 
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Project Dropdown - aligned to content area */}
      <div className="flex items-center space-x-4 ml-6">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            <span className="text-sm">
              {projectData?.project_name || `Project ${projectData?.project_id}` || 'Select Project'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
              <div className="py-1 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-2 text-gray-400 text-sm">Loading projects...</div>
                ) : (
                  <>
                    {projects.map((project) => (
                      <button
                        key={project.project_id}
                        onClick={() => handleProjectSelect(project)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          projectData?.project_id === project.project_id
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300'
                        }`}
                      >
                        {project.project_name || `Project ${project.project_id}`}
                      </button>
                    ))}
                    <hr className="border-gray-600 my-1" />
                    <button
                      onClick={handleAddNew}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 transition-colors"
                    >
                      + Add New Project
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

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