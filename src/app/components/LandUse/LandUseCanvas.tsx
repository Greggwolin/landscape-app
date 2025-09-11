'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';

// Type definitions matching the existing structure
interface Family {
  family_id: number;
  name: string;
  ord: number;
  active: boolean;
  notes?: string;
}

interface Subtype {
  subtype_id: number;
  family_id: number;
  code: string;
  name: string;
  ord: number;
  active: boolean;
  notes?: string;
}

interface LandUse {
  landuse_id: number;
  subtype_id: number | null;
  landuse_code: string;
  landuse_type: string;
  name: string;
  description?: string;
  active: boolean;
  has_programming?: boolean;
  has_zoning?: boolean;
}

interface LandUseCanvasProps {
  selectedFamilyIds?: Set<number>;
  onAddFamily?: () => void;
  onAddSubtype?: (familyId: number) => void;
  onAddLandUse?: (subtypeId: number) => void;
  onOpenFamily?: (familyId: number) => void;
  onOpenSubtype?: (familyId: number, subtypeId: number) => void;
  onOpenLandUse?: (familyId: number, subtypeId: number, landUseId: number) => void;
}

const LandUseCanvas: React.FC<LandUseCanvasProps> = ({
  selectedFamilyIds,
  onAddFamily,
  onAddSubtype,
  onAddLandUse,
  onOpenFamily,
  onOpenSubtype,
  onOpenLandUse
}) => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [landuses, setLanduses] = useState<LandUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLandUse, setSelectedLandUse] = useState<LandUse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [familiesRes, subtypesRes, landusesRes] = await Promise.all([
        fetch('/api/landuse/families'),
        fetch('/api/landuse/subtypes'), 
        fetch('/api/landuse/codes')
      ]);

      const familiesData = await familiesRes.json();
      const subtypesData = await subtypesRes.json();
      const landusesData = await landusesRes.json();

      // Convert string IDs to numbers for consistency
      const familiesWithNumberIds = Array.isArray(familiesData) ? familiesData.map(f => ({
        ...f,
        family_id: parseInt(f.family_id)
      })) : [];
      
      const subtypesWithNumberIds = Array.isArray(subtypesData) ? subtypesData.map(s => ({
        ...s,
        subtype_id: parseInt(s.subtype_id),
        family_id: parseInt(s.family_id)
      })) : [];

      setFamilies(familiesWithNumberIds);
      setSubtypes(subtypesWithNumberIds);
      setLanduses(Array.isArray(landusesData) ? landusesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const getSubtypesForFamily = (familyId: number) => {
    return subtypes.filter(s => s.family_id === familyId && s.active);
  };

  const getLandUsesForSubtype = (subtypeId: number) => {
    return landuses.filter(l => l.subtype_id === subtypeId && l.active);
  };

  const getStatusColor = (hasData?: boolean) => {
    if (hasData === undefined) return 'bg-gray-600';
    return hasData ? 'bg-green-600' : 'bg-yellow-600';
  };

  const getStatusText = (hasData?: boolean) => {
    if (hasData === undefined) return 'Not Set';
    return hasData ? 'Complete' : 'Pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading land use data...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 bg-gray-950">
        <div className="bg-gray-800 border border-gray-700 rounded-lg h-full">
          {/* Canvas Area - no header */}
          <div className="p-6 h-full overflow-y-auto">
            <div className="grid grid-cols-3 gap-6">
              {families.filter(f => f.active && (!selectedFamilyIds || selectedFamilyIds.has(f.family_id))).map((family) => {
                const familySubtypes = getSubtypesForFamily(family.family_id);
                const colors = getFamilyColor(family.name);
                
                return (
                  <div key={family.family_id} className="min-h-200">
                    <div 
                      className="min-h-full rounded-lg bg-gray-800 cursor-pointer border-2 border-gray-500 border-solid transition-all duration-200 group overflow-hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFamily?.(family.family_id);
                      }}
                    >
                      {/* Colored Header */}
                      <div className={`${colors.bg} p-4 text-center`}>
                        <h3 className={`font-semibold ${colors.text}`}>{family.name}</h3>
                        {family.notes && (
                          <p className={`text-xs ${colors.text} opacity-90 mt-1`}>{family.notes}</p>
                        )}
                      </div>
                      
                      {/* Grey Content Area */}
                      <div className="p-4">
                      
                      {familySubtypes.length === 0 ? (
                        <div className="text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSubtype?.(family.family_id);
                            }}
                            className="px-4 py-2 bg-gray-700 border-2 border-solid border-gray-600 text-white rounded-lg font-medium hover:outline hover:outline-2 transition-all duration-200"
                            style={{outlineColor: 'rgb(33,88,226)'}}
                          >
                            Add Subtype
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col flex-1">
                          <div className="flex flex-col gap-2">
                            {familySubtypes.map((subtype) => {
                              const subtypeLandUses = getLandUsesForSubtype(subtype.subtype_id);
                              
                              return (
                                <div
                                  key={subtype.subtype_id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenSubtype?.(family.family_id, subtype.subtype_id);
                                  }}
                                  className="bg-gray-700 rounded p-3 cursor-pointer border-2 border-solid border-gray-600 hover:border-blue-400 transition-all duration-200"
                                >
                                  <div className="mb-2">
                                    <div className="font-medium text-sm text-white">
                                      {subtype.code} - {subtype.name}
                                    </div>
                                    {subtype.notes && (
                                      <p className="text-xs text-gray-300 text-left mt-1">{subtype.notes}</p>
                                    )}
                                  </div>
                                  
                                  {subtypeLandUses.length > 0 && (
                                    <div className="text-xs text-gray-400">
                                      {subtypeLandUses.length} land use code{subtypeLandUses.length === 1 ? '' : 's'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Family Action Chips */}
                          <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddSubtype?.(family.family_id);
                              }}
                              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-all duration-200"
                            >
                              + Add Subtype
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to most recent subtype or create one if none exist
                                if (familySubtypes.length > 0) {
                                  const lastSubtype = familySubtypes[familySubtypes.length - 1];
                                  onOpenSubtype?.(family.family_id, lastSubtype.subtype_id);
                                } else {
                                  onAddSubtype?.(family.family_id);
                                }
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-all duration-200"
                            >
                              + Add / Manage Land Uses
                            </button>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-600 shadow-xl">
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedLandUse?.landuse_code} Details
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-full"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <div className="text-center text-gray-400 py-8">
                  <div className="text-lg mb-2">Coming Soon</div>
                  <div className="text-sm">Detailed land use information will be available here</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandUseCanvas;