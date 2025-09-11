// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import BudgetContent from './components/Budget/BudgetContent';
import MarketAssumptions from './components/MarketAssumptions';
import PlanningContent from './components/Planning/PlanningContent';
import PlanningWizard from './components/PlanningWizard/PlanningWizard';
import CategoryTree from './components/Admin/CategoryTree';
import LandUseSchema from './components/LandUse/LandUseSchema';
import ZoningGlossaryAdmin from './components/Glossary/ZoningGlossaryAdmin';

interface Project {
  project_id: number;
  project_name: string;
  acres_gross: number;
  start_date: string;
}

const LandscapeApp: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, []);

  // Listen for cross-component navigation requests (e.g., open Planning from Overview)
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ view?: string }>
      const v = ce?.detail?.view
      if (typeof v === 'string') setActiveView(v)
    }
    window.addEventListener('navigateToView', handler as EventListener)
    return () => window.removeEventListener('navigateToView', handler as EventListener)
  }, [])

  const fetchProjectData = async (projectId?: number) => {
    try {
      const response = await fetch('/api/projects');
      const projects = await response.json();
      if (projectId) {
        const selectedProject = projects.find((p: Project) => p.project_id === projectId);
        if (selectedProject) {
          setProjectData(selectedProject);
        }
      } else if (projects.length > 0) {
        setProjectData(projects[0]); // Use first project for now
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projectId: number) => {
    setLoading(true);
    fetchProjectData(projectId);
  };

  const renderContent = () => {
    switch (activeView) {
      // Dashboard
      case 'dashboard':
        return <DashboardContent />;
      
      // Planning section
      case 'planning-overview':
        return <PlanningContent />;
      case 'land-use':
        return <LandUseSchema />;
      case 'planning':
        return <PlanningWizard />;
      case 'mapping-gis':
        return <ComingSoonContent title="Mapping / GIS" />;
      
      // Assumptions section
      case 'acquisition':
        return <ComingSoonContent title="Acquisition" />;
      case 'market':
        return <MarketAssumptions projectId={projectData?.project_id ?? null} />;
      case 'project-costs':
        return <BudgetContent projectId={projectData?.project_id ?? null} />;
      case 'project-revenues':
        return <ComingSoonContent title="Project Revenues" />;
      
      // Development section
      case 'entitlements':
        return <ComingSoonContent title="Stage 1 - Entitlements" />;
      case 'engineering':
        return <ComingSoonContent title="Stage 2 - Engineering" />;
      case 'development':
        return <ComingSoonContent title="Stage 3 - Development" />;
      case 'disposition':
        return <ComingSoonContent title="Project Disposition" />;
      
      // Ownership section
      case 'debt':
        return <ComingSoonContent title="Debt" />;
      case 'equity':
        return <ComingSoonContent title="Equity" />;
      case 'muni-district':
        return <ComingSoonContent title="Muni / District" />;
      
      // Settings
      case 'settings':
        return <CategoryTree />;
      case 'zoning-glossary':
        return <ZoningGlossaryAdmin />;
      
      default:
        return <ComingSoonContent title={activeView.charAt(0).toUpperCase() + activeView.slice(1)} />;
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
      <Header projectData={projectData} onProjectChange={handleProjectChange} />
      <div className="flex flex-1">
        <Navigation activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-visible bg-gray-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Dashboard Content (formerly Overview)
const DashboardContent: React.FC = () => (
  <div className="p-4">
    <div className="bg-gray-800 rounded border border-gray-700 p-6 text-center">
      <div className="text-gray-400 mb-1 text-sm">Coming Soon</div>
      <div className="text-lg font-medium text-white">Dashboard</div>
    </div>
  </div>
);

// Reusable Coming Soon Component
const ComingSoonContent: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-4">
    <div className="bg-gray-800 rounded border border-gray-700 p-6 text-center">
      <div className="text-gray-400 mb-1 text-sm">Coming Soon</div>
      <div className="text-lg font-medium text-white">{title}</div>
    </div>
  </div>
);

export default LandscapeApp;
