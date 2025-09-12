import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    let subtypes;
    try {
      // Try the full query with joins
      subtypes = await sql`
        SELECT 
          s.subtype_id,
          s.family_id,
          s.code,
          s.name,
          COALESCE(s.ord, 0) as ord,
          COALESCE(s.active, true) as active,
          COALESCE(s.notes, '') as notes,
          s.created_at,
          s.updated_at,
          f.name as family_name
        FROM landscape.lu_subtype s
        LEFT JOIN landscape.lu_family f ON f.family_id = s.family_id
        WHERE COALESCE(s.active, true) = true
        ORDER BY s.family_id, COALESCE(s.ord, 0), s.name
      `;
    } catch (_e) {
      // Try simpler query without joins
      try {
        subtypes = await sql`
          SELECT 
            subtype_id,
            family_id,
            code,
            name,
            COALESCE(ord, 0) as ord,
            COALESCE(active, true) as active,
            COALESCE(notes, '') as notes,
            NOW() as created_at,
            NOW() as updated_at,
            '' as family_name
          FROM landscape.lu_subtype
          WHERE COALESCE(active, true) = true
          ORDER BY family_id, COALESCE(ord, 0), name
        `;
      } catch (error2) {
        const msg2 = error2 instanceof Error ? error2.message : String(error2)
        console.error('lu_subtype table issue:', msg2);
        return NextResponse.json([]);
      }
    }

    return NextResponse.json(subtypes || []);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error fetching subtypes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtypes', details: msg },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { family_id, code, name, ord = 0, active = true, notes } = await request.json();

    if (!family_id || !code || !name) {
      return NextResponse.json(
        { error: 'Family ID, code, and name are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO landscape.lu_subtype (family_id, code, name, ord, active, notes)
      VALUES (${family_id}, ${code}, ${name}, ${ord}, ${active}, ${notes})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating subtype:', error);
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('unique')) {
      return NextResponse.json(
        { error: 'Subtype code already exists for this family' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create subtype', details: msg },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { subtype_id, family_id, code, name, ord, active, notes } = await request.json();

    if (!subtype_id) {
      return NextResponse.json(
        { error: 'Subtype ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE landscape.lu_subtype 
      SET 
        family_id = COALESCE(${family_id}, family_id),
        code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        ord = COALESCE(${ord}, ord),
        active = COALESCE(${active}, active),
        notes = COALESCE(${notes}, notes)
      WHERE subtype_id = ${subtype_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Subtype not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error updating subtype:', error);
    return NextResponse.json(
      { error: 'Failed to update subtype', details: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subtypeId = searchParams.get('id');

    if (!subtypeId) {
      return NextResponse.json(
        { error: 'Subtype ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting active = false
    const result = await sql`
      UPDATE landscape.lu_subtype 
      SET active = false
      WHERE subtype_id = ${subtypeId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Subtype not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Subtype deleted successfully' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error deleting subtype:', error);
    return NextResponse.json(
      { error: 'Failed to delete subtype', details: msg },
      { status: 500 }
    );
  }
}
