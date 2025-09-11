// /app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    console.log('Querying landscape.tbl_project...');
    const projects = await sql`
      SELECT project_id, project_name, acres_gross, start_date
      FROM landscape.tbl_project
      ORDER BY project_id
      LIMIT 5
    `;
    console.log('Found projects:', projects);
    return NextResponse.json(projects);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Database error details:', error);
    return NextResponse.json({
      error: 'Failed to fetch projects',
      details: message
    }, { status: 500 });
  }
}