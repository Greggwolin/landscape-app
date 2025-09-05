import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const rows = await sql`
  SELECT
  p.project_id,
  p.phase_id,
  a.area_no,
  p.phase_no,
  p.phase_name as phase,  -- UI might expect 'phase' field
  p.phase_name as phase_code,
  p.phase_name as phase_name,
        COALESCE(SUM(par.units_total), 0) AS units_total,
        COALESCE(SUM(CAST(par.acres_gross AS FLOAT)), 0) AS gross_acres,
        0 AS net_acres,
        NULL AS start_date,
        'Active' AS status,
        p.phase_name AS description
      FROM landscape.tbl_phase p
      JOIN landscape.tbl_area a ON a.area_id = p.area_id
      LEFT JOIN landscape.tbl_parcel par ON par.phase_id = p.phase_id
      WHERE p.project_id = 7
      GROUP BY p.project_id, p.phase_id, a.area_no, p.phase_no, p.phase_name
      ORDER BY a.area_no, p.phase_no;
    `;

    return Response.json(rows);
  } catch (error) {
    console.error('Database error (phases):', error);
    return Response.json({
      error: 'Failed to fetch phases',
      details: error.message
    }, { status: 500 });
  }
}