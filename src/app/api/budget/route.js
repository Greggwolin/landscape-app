// app/api/budget/route.js
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        budget_id,
        devphase_id as phase_id,
        budget_category,
        budget_subcategory,
        amount
      FROM landscape.tbl_budget
      WHERE devphase_id IN (
        SELECT phase_id FROM landscape.tbl_phase WHERE project_id = 7
      )
      ORDER BY budget_category, budget_subcategory;
    `;

    // Handle empty result
    return Response.json(result || []);
  } catch (error) {
    console.error('Budget API error:', error);
    return Response.json({ 
      error: 'Failed to fetch budget data',
      details: error.message 
    }, { status: 500 });
  }
}