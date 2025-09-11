import React, { useState, useEffect } from 'react'
import LandUseCanvas from './LandUseCanvas'

interface Family {
  family_id: number;
  name: string;
  ord: number;
  active: boolean;
  notes?: string;
}

const LandUseSchema: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/landuse/families');
      const familiesData = await response.json();
      
      const familiesWithNumberIds = Array.isArray(familiesData) ? familiesData.map(f => ({
        ...f,
        family_id: parseInt(f.family_id)
      })) : [];
      
      setFamilies(familiesWithNumberIds);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
    }
  };

  // Family colors mapping (matching the existing pattern)
  const familyColors = {
    'Residential': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
    'Commercial': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
    'Industrial': { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-500' },
    'Open Space': { bg: 'bg-green-600', text: 'text-white', border: 'border-green-500' },
    'Common Areas': { bg: 'bg-yellow-600', text: 'text-white', border: 'border-yellow-500' },
    'Institutional': { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-500' },
    'Mixed Use': { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-500' },
    'Utilities': { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-500' },
    'Transportation': { bg: 'bg-slate-600', text: 'text-white', border: 'border-slate-500' }
  };

  const getFamilyColor = (familyName: string) => {
    return familyColors[familyName as keyof typeof familyColors] || 
      { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-500' };
  };

  // Mock jurisdiction data - replace with actual project data
  const jurisdiction = {
    city: "Riverside",
    county: "Riverside County", 
    state: "California"
  };

  // Desired order for family tiles
  const familyOrder = ['Residential', 'Commercial', 'Mixed Use', 'Industrial', 'Open Space', 'Public', 'Other'];

  // Sort families by desired order
  const sortedFamilies = families.filter(f => f.active).sort((a, b) => {
    const aIndex = familyOrder.indexOf(a.name);
    const bIndex = familyOrder.indexOf(b.name);
    const aOrder = aIndex === -1 ? familyOrder.length : aIndex;
    const bOrder = bIndex === -1 ? familyOrder.length : bIndex;
    return aOrder - bOrder;
  });

  const handleFamilyToggle = (familyId: number) => {
    setSelectedFamilyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(familyId)) {
        newSet.delete(familyId);
      } else {
        newSet.add(familyId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Top Bar with Family Tiles and Jurisdiction Info */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex justify-between items-start">
          {/* Left side - Title and Family Tiles */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-1">{jurisdiction.city}</h2>
              <p className="text-sm text-gray-400">
                Jurisdiction: {jurisdiction.city}, {jurisdiction.county}, {jurisdiction.state}
              </p>
            </div>
            
            {/* Family Tiles - larger than navigation tiles */}
            <div className="flex gap-4 flex-wrap">
              {!loading && sortedFamilies.map((family) => {
                const colors = getFamilyColor(family.name);
                const isSelected = selectedFamilyIds.has(family.family_id);
                
                return (
                  <button
                    key={family.family_id}
                    onClick={() => handleFamilyToggle(family.family_id)}
                    className={`flex items-center justify-center h-20 w-24 cursor-pointer border-2 border-gray-500 border-solid transition-all duration-200 rounded-lg hover:outline hover:outline-2 ${
                      isSelected 
                        ? colors.bg
                        : `bg-gray-700 hover:${colors.bg}`
                    }`}
                    style={{outlineColor: 'rgb(33,88,226)'}}
                  >
                    <div className="text-center">
                      <div className={`text-xs font-medium leading-tight transition-colors duration-200 ${
                        isSelected ? colors.text : `text-gray-300 hover:${colors.text}`
                      }`}>
                        {family.name}
                      </div>
                    </div>
                  </button>
                );
              })}
              {loading && (
                <div className="text-gray-400 text-sm">Loading families...</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Content Area - full height */}
      <div className="flex-1">
        {selectedFamilyIds.size > 0 ? (
          <LandUseCanvas 
            selectedFamilyIds={selectedFamilyIds}
            onAddSubtype={(familyId) => console.log('Add Subtype for family:', familyId)}
            onAddLandUse={(subtypeId) => console.log('Add Land Use for subtype:', subtypeId)}
            onOpenFamily={(familyId) => console.log('Open family:', familyId)}
            onOpenSubtype={(familyId, subtypeId) => console.log('Open subtype:', familyId, subtypeId)}
            onOpenLandUse={(familyId, subtypeId, landUseId) => console.log('Open land use:', familyId, subtypeId, landUseId)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-950">
            <div className="text-center text-gray-400">
              <div className="text-lg mb-2">Select Land Use Families</div>
              <div className="text-sm">Click on family tiles above to view their subtypes and land use codes</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandUseSchema