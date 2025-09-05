// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BudgetContent from './components/Budget/BudgetContent';
import PlanningContent from './components/Planning/PlanningContent';

interface Project {
  project_id: number;
  project_name: string;
  acres_gross: number;
  start_date: string;
}

const LandscapeApp: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const response = await fetch('/api/projects');
      const projects = await response.json();
      if (projects.length > 0) {
        setProjectData(projects[0]); // Use first project for now
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewContent />;
      case 'planning':
        return <PlanningContent />;
      case 'budget':
        return <BudgetContent />;
      default:
        return (
          <div className="p-4">
            <div className="bg-gray-800 rounded border border-gray-700 p-6 text-center">
              <div className="text-gray-400 mb-1 text-sm">Coming Soon</div>
              <div className="text-lg font-medium text-white">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header projectData={projectData} />
      <div className="flex flex-1">
        <Navigation activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto bg-gray-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Temporary placeholder for Overview
const OverviewContent: React.FC = () => (
  <div className="p-4">
    <div className="bg-gray-800 rounded border border-gray-700 p-6 text-center">
      <div className="text-gray-400 mb-1 text-sm">Coming Soon</div>
      <div className="text-lg font-medium text-white">Overview Dashboard</div>
    </div>
  </div>
);

export default LandscapeApp;