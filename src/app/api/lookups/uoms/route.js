import { sql } from '@/lib/db'

export async function GET() {
  try {
    const uoms = await sql`
      SELECT 
        uom_code as uom_id,
        uom_code,
        name
      FROM landscape.core_fin_uom 
      WHERE is_active = true
      ORDER BY uom_code
    `
    
    return Response.json(uoms || [])
  } catch (error) {
    console.error('Error fetching UOMs:', error)
    return Response.json([], { status: 500 })
  }
}