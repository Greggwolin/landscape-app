// app/api/parcels/route.js
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT
        p.parcel_id,
        p.project_id,
        p.area_id,
        p.phase_id,
        a.area_no AS area_no,
        ph.phase_no AS phase_no,
        CONCAT(a.area_no::text, '.', ph.phase_no::text) AS phase_name,
        CONCAT(
          a.area_no::text,
          '.',
          ph.phase_no::text,
          LPAD(
            ROW_NUMBER() OVER (PARTITION BY a.area_no, ph.phase_no ORDER BY p.parcel_id)::text,
            2,
            '0'
          )
        ) AS parcel_name,
        COALESCE(p.landuse_code, '') as usecode,
        COALESCE(CAST(p.acres_gross AS FLOAT), 0) as acres,
        COALESCE(p.lot_product, '') as product,
        COALESCE(p.units_total, 0) as units,
        COALESCE(CAST(p.plan_efficiency AS FLOAT), 0) as efficiency,
        COALESCE(CAST(p.lots_frontfeet AS FLOAT), 0) as frontfeet
      FROM landscape.tbl_parcel p
      JOIN landscape.tbl_area a ON a.area_id = p.area_id
      JOIN landscape.tbl_phase ph ON ph.phase_id = p.phase_id
      WHERE p.project_id = 7
      ORDER BY a.area_no, ph.phase_no, p.parcel_id;
    `;

    return Response.json(result || []);
  } catch (error) {
    console.error('Parcels API error:', error);
    return Response.json({ 
      error: 'Failed to fetch parcels',
      details: error.message 
    }, { status: 500 });
  }
}
