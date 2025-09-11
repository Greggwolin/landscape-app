import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // First check if lu_family table exists
    let families;
    try {
      families = await sql`
        SELECT 
          family_id,
          name,
          COALESCE(ord, 0) as ord,
          COALESCE(active, true) as active,
          COALESCE(notes, '') as notes,
          created_at,
          updated_at
        FROM landscape.lu_family
        WHERE COALESCE(active, true) = true
        ORDER BY COALESCE(ord, 0), name
      `;
    } catch (_e) {
      // Try simpler query without optional columns
      try {
        families = await sql`
          SELECT 
            family_id,
            name,
            0 as ord,
            true as active,
            '' as notes,
            NOW() as created_at,
            NOW() as updated_at
          FROM landscape.lu_family
          ORDER BY name
        `;
      } catch (error2) {
        console.error('lu_family table does not exist:', error2.message);
        return NextResponse.json([]);
      }
    }

    return NextResponse.json(families || []);
  } catch (error) {
    console.error('Error fetching families:', error);
    return NextResponse.json(
      { error: 'Failed to fetch families', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, ord = 0, active = true, notes } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO landscape.lu_family (name, ord, active, notes)
      VALUES (${name}, ${ord}, ${active}, ${notes})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating family:', error);
    return NextResponse.json(
      { error: 'Failed to create family' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { family_id, name, ord, active, notes } = await request.json();

    if (!family_id) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE landscape.lu_family 
      SET 
        name = COALESCE(${name}, name),
        ord = COALESCE(${ord}, ord),
        active = COALESCE(${active}, active),
        notes = COALESCE(${notes}, notes)
      WHERE family_id = ${family_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating family:', error);
    return NextResponse.json(
      { error: 'Failed to update family' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('id');

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting active = false
    const result = await sql`
      UPDATE landscape.lu_family 
      SET active = false
      WHERE family_id = ${familyId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Family deleted successfully' });
  } catch (error) {
    console.error('Error deleting family:', error);
    return NextResponse.json(
      { error: 'Failed to delete family' },
      { status: 500 }
    );
  }
}
