// /app/api/projects/route.js
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
return Response.json(projects);
} catch (error) {
console.error('Database error details:', error);
return Response.json({
error: 'Failed to fetch projects',
details: error.message
}, { status: 500 });
}
}