// app/components/Planning/PlanningContent.tsx
import React, { useState, useEffect } from 'react';

interface Parcel {
  parcel_id: number;
  area_no: number;
  phase_name: string;
  parcel_name: string;
  usecode: string;
  product: string;
  acres: number;
  units: number;
  efficiency: number;
}

interface Phase {
  phase_id: number;
  area_no: number;
  phase_name: string;
  gross_acres: number;
  net_acres: number;
  units_total: number;
  start_date: string | null;
  status: string;
}

const PlanningContent: React.FC = () => {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState<number | null>(null)

  useEffect(() => {
    // Load a default project id, then fetch planning data that depends on it
    const load = async () => {
      try {
        // Get available projects and pick the first for now
        const projRes = await fetch('/api/projects')
        const projects = await projRes.json().catch(() => [])
        const id = Array.isArray(projects) && projects.length > 0 ? Number(projects[0]?.project_id) : null
        setProjectId(id)
        if (!id) return

        // Fetch parcels and phases for the selected project
        const [parcelsRes, phasesRes] = await Promise.all([
          fetch(`/api/parcels?project_id=${id}`),
          fetch(`/api/phases?project_id=${id}`)
        ])
        const parcelsData = await parcelsRes.json().catch(() => [])
        const phasesData = await phasesRes.json().catch(() => [])
        setParcels(Array.isArray(parcelsData) ? parcelsData : [])
        setPhases(Array.isArray(phasesData) ? phasesData : [])
      } catch (error) {
        console.error('Error fetching planning data:', error)
        setParcels([])
        setPhases([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getAreaStats = (areaNo: number) => {
    const areaParcels = parcels.filter(p => p.area_no === areaNo);
    const areaPhases = [...new Set(areaParcels.map(p => p.phase_name))].sort();
    
    return {
      grossAcres: Math.round(areaParcels.reduce((sum, p) => sum + (p.acres || 0), 0)),
      phases: areaPhases.length,
      parcels: areaParcels.length,
      units: areaParcels.reduce((sum, p) => sum + (p.units || 0), 0)
    };
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-gray-400">Loading planning data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-gray-950 min-h-screen">
      {/* Areas and Development Phasing Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Areas Card */}
        <div className="bg-gray-800 rounded border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Areas</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(areaNo => {
                const stats = getAreaStats(areaNo);
                return (
                  <div key={areaNo} className="bg-gray-700 rounded p-3 border border-gray-600">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white mb-1">Area {areaNo}</div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div>{stats.grossAcres} acres</div>
                        <div>{stats.phases} phases</div>
                        <div>{stats.parcels} parcels</div>
                        <div>{stats.units} units</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Development Phasing Card */}
        <div className="bg-gray-800 rounded border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Development Phasing</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-gray-300 font-medium">Phase</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Gross Acres</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Net Acres</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Units</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Start Date</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Status</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase, index) => (
                    <tr key={phase.phase_id} className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
                  <td className="py-2 px-2 text-gray-300">{phase.phase_name}</td>
                      <td className="py-2 px-2 text-center text-gray-300">{formatNumber(phase.gross_acres)}</td>
                      <td className="py-2 px-2 text-center text-gray-300">{formatNumber(phase.net_acres)}</td>
                      <td className="py-2 px-2 text-center text-gray-300">{phase.units_total}</td>
                      <td className="py-2 px-2 text-center text-gray-300">{phase.start_date || '-'}</td>
                      <td className="py-2 px-2 text-center">
                        <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">
                          {phase.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Parcel Detail Section */}
      <div className="bg-gray-800 rounded border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Parcel Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-2 py-2 font-medium text-gray-300">Area</th>
                <th className="text-left px-2 py-2 font-medium text-gray-300">Phase</th>
                <th className="text-left px-2 py-2 font-medium text-gray-300">Parcel ID</th>
                <th className="text-center px-2 py-2 font-medium text-gray-300">Use Code</th>
                <th className="text-center px-2 py-2 font-medium text-gray-300">Product</th>
                <th className="text-center px-2 py-2 font-medium text-gray-300">Acres</th>
                <th className="text-center px-2 py-2 font-medium text-gray-300">Units</th>
                <th className="text-center px-2 py-2 font-medium text-gray-300">Efficiency</th>
                <th className="text-center px-2 py-2 font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel, index) => (
                <tr key={parcel.parcel_id} className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
                  <td className="px-2 py-1.5 text-gray-300">{parcel.area_no}</td>
                  <td className="px-2 py-1.5 text-gray-300">{parcel.phase_name}</td>
                  <td className="px-2 py-1.5 text-gray-300">{parcel.parcel_name}</td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      parcel.usecode === 'SF' ? 'bg-blue-900 text-blue-300' :
                      parcel.usecode === 'MF' ? 'bg-purple-900 text-purple-300' :
                      parcel.usecode === 'RET' ? 'bg-orange-900 text-orange-300' :
                      'bg-indigo-900 text-indigo-300'
                    }`}>
                      {parcel.usecode}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center text-gray-300">{parcel.product}</td>
                  <td className="px-2 py-1.5 text-center text-gray-300">{formatNumber(parcel.acres)}</td>
                  <td className="px-2 py-1.5 text-center text-gray-300">{formatNumber(parcel.units)}</td>
                  <td className="px-2 py-1.5 text-center text-gray-300">{(parcel.efficiency * 100).toFixed(0)}%</td>
                  <td className="px-2 py-1.5 text-center">
                    <button className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanningContent;
