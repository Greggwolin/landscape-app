// app/components/Planning/PlanningContent.tsx
import React, { useState, useEffect } from 'react';
import useSWR from 'swr'
import ParcelDetailCard from '../PlanningWizard/cards/ParcelDetailCard'

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

type Props = { projectId?: number | null }
const PlanningContent: React.FC<Props> = ({ projectId = null }) => {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)

  const fetcher = (url: string) => fetch(url).then(r => r.json())
  const { data: parcelsData } = useSWR(projectId ? `/api/parcels?project_id=${projectId}` : null, fetcher)
  const { data: phasesData } = useSWR(projectId ? `/api/phases?project_id=${projectId}` : null, fetcher)
  useEffect(() => {
    if (parcelsData) setParcels(Array.isArray(parcelsData) ? parcelsData : [])
    if (phasesData) setPhases(Array.isArray(phasesData) ? phasesData : [])
    if (projectId != null) setLoading(false)
  }, [parcelsData, phasesData, projectId])

  // number formatting helpers moved inline in JSX

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

  // Sidecard state for parcel detail (wizard card embedded on this page)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailCtx, setDetailCtx] = useState<any>(null)

  const openDetailForParcel = (p: Parcel) => {
    // Map Overview parcel to Wizard types (minimal fields used by card)
    const [, pStr] = String(p.phase_name).split('.')
    const areaNo = Number(p.area_no)
    const phaseNo = Number(pStr)
    const area = { id: `area-${areaNo}`, name: `Area ${areaNo}`, phases: [], saved: true }
    const phase = { id: `phase-${areaNo}-${phaseNo}`, name: `Phase ${areaNo}.${phaseNo}`, parcels: [], saved: true }
    const landUseOptions = ['MDR','HDR','LDR','MHDR','C','MU','OS'] as const
    const landUse = (landUseOptions as readonly string[]).includes(p.usecode) ? (p.usecode as any) : 'MDR'
    const parcel = {
      id: `parcel-db-${p.parcel_id}`,
      name: `Parcel: ${p.parcel_name}`,
      landUse,
      acres: Number(p.acres ?? 0),
      units: Number(p.units ?? 0),
      product: p.product ?? '',
      efficiency: Number(p.efficiency ?? 0),
      frontage: (p as any).frontfeet ?? 0,
      dbId: p.parcel_id,
    }
    setDetailCtx({ parcel, phase, area })
    setDetailOpen(true)
  }

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
              {(() => {
                const distinctAreas = Array.from(new Set(parcels.map(p => p.area_no))).sort((a, b) => a - b)
                const list = distinctAreas.length > 0 ? distinctAreas : [1, 2, 3, 4]
                return list
              })().map(areaNo => {
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-gray-300 font-medium">Phase</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Gross Acres</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Net Acres</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Units</th>
                    <th className="text-center py-2 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase, index) => (
                    <PhaseRow
                      key={phase.phase_id}
                      phase={phase}
                      index={index}
                    />
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
        <div className={detailOpen ? 'p-2 grid grid-cols-3 gap-4' : 'overflow-x-auto'}>
          <div className={detailOpen ? 'col-span-2 overflow-x-auto' : ''}>
          <table className="w-full text-sm">
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
                <EditableParcelRow key={parcel.parcel_id} parcel={parcel} index={index}
                  onSaved={(updated) => setParcels(prev => prev.map(p => p.parcel_id === updated.parcel_id ? { ...p, ...updated } : p))}
                  onOpenDetail={() => openDetailForParcel(parcel)}
                />
              ))}
            </tbody>
          </table>
          </div>
          {detailOpen && detailCtx && (
            <div className="col-span-1">
              <ParcelDetailCard
                parcel={detailCtx.parcel}
                phase={detailCtx.phase}
                area={detailCtx.area}
                isOpen={true}
                projectId={projectId ?? null}
                onSave={async (_areaId, _phaseId, _parcelId, updates: any) => {
                  try {
                    await fetch(`/api/parcels/${detailCtx.parcel.dbId}`, {
                      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        usecode: updates.landUse,
                        acres: updates.acres,
                        units: updates.units,
                        product: updates.product ?? null,
                        frontfeet: updates.frontage ?? null
                      })
                    })
                    // Refresh row in table
                    setParcels(prev => prev.map(p => p.parcel_id === detailCtx.parcel.dbId
                      ? { ...p, usecode: updates.landUse, acres: updates.acres, units: updates.units, product: updates.product ?? p.product }
                      : p
                    ))
                  } catch (e) { console.error('Save via sidecard failed', e) }
                }}
                onClose={() => setDetailOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline-editable parcel row
const EditableParcelRow: React.FC<{ parcel: Parcel; index: number; onSaved: (p: Parcel) => void; onOpenDetail?: () => void }> = ({ parcel, index, onSaved, onOpenDetail }) => {
  const [editing, setEditing] = useState(false)
  const [codes, setCodes] = useState<{ landuse_code: string; name: string; family_id?: string; subtype_id?: string }[]>([])
  const [families, setFamilies] = useState<{ family_id: string; name: string }[]>([])
  const [subtypes, setSubtypes] = useState<{ subtype_id: string; family_id: string; name: string }[]>([])
  const [selectedFamily, setSelectedFamily] = useState<string>('')
  const [selectedSubtype, setSelectedSubtype] = useState<string>('')
  const [draft, setDraft] = useState({
    usecode: parcel.usecode ?? '',
    product: parcel.product ?? '',
    acres: parcel.acres ?? 0,
    units: parcel.units ?? 0,
    efficiency: parcel.efficiency ?? 0,
    frontfeet: (parcel as any).frontfeet ?? 0,
  })

  useEffect(() => {
    if (editing) {
      ;(async () => {
        try {
          const [codesRes, famRes, subRes] = await Promise.all([
            fetch('/api/landuse/codes'),
            fetch('/api/landuse/families'),
            fetch('/api/landuse/subtypes')
          ])
          const data = await codesRes.json();
          const fam = await famRes.json();
          const sub = await subRes.json();
          const list = Array.isArray(data) ? data : []
          setCodes(list.map((r: any) => ({ landuse_code: r.landuse_code, name: r.name ?? r.landuse_code, family_id: (r as any).family_id ?? undefined, subtype_id: (r as any).subtype_id ?? undefined })))
          setFamilies(Array.isArray(fam) ? fam : [])
          setSubtypes(Array.isArray(sub) ? sub : [])
        } catch (e) { console.error('Failed to load land use lists', e) }
      })()
    }
  }, [editing])

  const save = async () => {
    try {
      const res = await fetch(`/api/parcels/${parcel.parcel_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usecode: draft.usecode,
          product: draft.product,
          acres: Number(draft.acres),
          units: Number(draft.units),
          efficiency: Number(draft.efficiency),
          frontfeet: Number(draft.frontfeet),
        })
      })
      if (!res.ok) throw new Error(await res.text())
      onSaved({ ...parcel, ...draft, acres: Number(draft.acres), units: Number(draft.units), efficiency: Number(draft.efficiency) } as Parcel)
      setEditing(false)
    } catch (e) {
      console.error('Save parcel failed', e)
      alert('Failed to save parcel')
    }
  }

  return (
    <tr className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
      <td className="px-2 py-1.5 text-gray-300">{parcel.area_no}</td>
      <td className="px-2 py-1.5 text-gray-300">{parcel.phase_name}</td>
      <td className="px-2 py-1.5 text-gray-300">{parcel.parcel_name}</td>
      <td className="px-2 py-1.5 text-center">
        {editing ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-2">
              <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs" value={selectedFamily} onChange={e => { setSelectedFamily(e.target.value); setSelectedSubtype('') }}>
                <option value="">All Families</option>
                {families.map(f => <option key={f.family_id} value={f.family_id}>{f.name}</option>)}
              </select>
              <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs" value={selectedSubtype} onChange={e => setSelectedSubtype(e.target.value)}>
                <option value="">All Subtypes</option>
                {subtypes.filter(st => !selectedFamily || st.family_id === selectedFamily).map(st => <option key={st.subtype_id} value={st.subtype_id}>{st.name}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1 justify-center max-w-[520px]">
            {codes.filter(c => (!selectedFamily || c.family_id === selectedFamily) && (!selectedSubtype || c.subtype_id === selectedSubtype)).map(c => (
              <button key={c.landuse_code}
                type="button"
                className={`px-2 py-0.5 rounded-full text-xs border ${draft.usecode === c.landuse_code ? 'bg-blue-700 border-blue-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-200'}`}
                onClick={() => setDraft(d => ({ ...d, usecode: c.landuse_code }))}
                title={c.name}
              >
                {c.landuse_code}
              </button>
            ))}
            </div>
          </div>
        ) : (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
            parcel.usecode === 'SF' ? 'bg-blue-900 text-blue-300' :
            parcel.usecode === 'MF' ? 'bg-purple-900 text-purple-300' :
            parcel.usecode === 'RET' ? 'bg-orange-900 text-orange-300' :
            'bg-indigo-900 text-indigo-300'
          }`}>
            {parcel.usecode}
          </span>
        )}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-300">
        {editing ? (
          <input className="w-28 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center"
            value={draft.product} onChange={e => setDraft(d => ({ ...d, product: e.target.value }))}
          />
        ) : (
          parcel.product
        )}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-300">
        {editing ? (
          <input className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center" inputMode="decimal"
            value={draft.acres} onChange={e => setDraft(d => ({ ...d, acres: e.target.value === '' ? 0 : Number(e.target.value) }))}
          />
        ) : (
          new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(parcel.acres)
        )}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-300">
        {editing ? (
          <input className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center" inputMode="decimal"
            value={draft.units} onChange={e => setDraft(d => ({ ...d, units: e.target.value === '' ? 0 : Number(e.target.value) }))}
          />
        ) : (
          new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(parcel.units)
        )}
      </td>
      <td className="px-2 py-1.5 text-center text-gray-300">{(parcel.efficiency * 100).toFixed(0)}%</td>
      <td className="px-2 py-1.5 text-center">
        {editing ? (
          <div className="flex items-center gap-2 justify-center">
            <button className="px-1.5 py-0.5 text-xs bg-blue-700 text-white rounded" onClick={save}>Save</button>
            <button className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-200 rounded" onClick={() => { setEditing(false); setDraft({ usecode: parcel.usecode, product: parcel.product, acres: parcel.acres, units: parcel.units, efficiency: parcel.efficiency, frontfeet: (parcel as any).frontfeet ?? 0 }) }}>Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <button className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600" onClick={() => setEditing(true)}>Edit</button>
            <button className="px-1.5 py-0.5 text-xs bg-indigo-700 text-white rounded hover:bg-indigo-600" onClick={() => onOpenDetail && onOpenDetail()}>Detail</button>
          </div>
        )}
      </td>
    </tr>
  )
}

export default PlanningContent;

// Inline-edit for phase label/description (persist via PATCH)
const PhaseRow: React.FC<{ phase: Phase; index: number }> = ({ phase, index }) => {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // no-op defaults; label/description come from DB if/when added to GET
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`/api/phases/${phase.phase_id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, description }) })
      // Broadcast to other views (wizard) to refresh if needed
      try { window.dispatchEvent(new CustomEvent('dataChanged', { detail: { entity: 'phase', id: phase.phase_id } })) } catch {}
      setEditing(false)
    } catch (e) { console.error('Phase save failed', e) } finally { setSaving(false) }
  }

  return (
    <tr className={`border-b border-gray-700 hover:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
      <td className="py-2 px-2 text-gray-300">
        {phase.phase_name}
        {label && <span className="ml-2 text-xs text-gray-400">— {label}</span>}
      </td>
      <td className="py-2 px-2 text-center text-gray-300">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(phase.gross_acres)}</td>
      <td className="py-2 px-2 text-center text-gray-300">{new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(phase.net_acres)}</td>
      <td className="py-2 px-2 text-center text-gray-300">{phase.units_total}</td>
      <td className="py-2 px-2 text-center">
        {editing ? (
          <div className="flex items-center gap-2 justify-center">
            <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs w-28" placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
            <input className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs w-40" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <button className="px-2 py-1 text-xs bg-blue-700 text-white rounded" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600" onClick={() => setEditing(true)}>Edit</button>
        )}
      </td>
    </tr>
  )
}
