import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    let landuses;
    try {
      // Try the full query with joins
      landuses = await sql`
        SELECT 
          l.landuse_id,
          l.subtype_id,
          l.landuse_code,
          l.landuse_type,
          COALESCE(l.name, l.landuse_code) as name,
          COALESCE(l.description, '') as description,
          COALESCE(l.active, true) as active,
          l.created_at,
          l.updated_at,
          COALESCE(s.code, '') as subtype_code,
          COALESCE(s.name, '') as subtype_name,
          COALESCE(f.name, '') as family_name,
          CASE WHEN p.landuse_code IS NOT NULL THEN true ELSE false END as has_programming,
          CASE WHEN z.landuse_code IS NOT NULL THEN true ELSE false END as has_zoning
        FROM landscape.tbl_landuse l
        LEFT JOIN landscape.lu_subtype s ON s.subtype_id = l.subtype_id
        LEFT JOIN landscape.lu_family f ON f.family_id = s.family_id
        LEFT JOIN landscape.tbl_landuse_program p ON p.landuse_code = l.landuse_code
        LEFT JOIN landscape.tbl_zoning_control z ON z.landuse_code = l.landuse_code
        WHERE COALESCE(l.active, true) = true
        ORDER BY l.landuse_code
      `;
    } catch (_e1) {
      // Try simpler query with just tbl_landuse
      try {
        landuses = await sql`
          SELECT 
            COALESCE(landuse_id, 0) as landuse_id,
            COALESCE(subtype_id, 0) as subtype_id,
            landuse_code,
            COALESCE(landuse_type, '') as landuse_type,
            COALESCE(name, landuse_code) as name,
            COALESCE(description, '') as description,
            COALESCE(active, true) as active,
            NOW() as created_at,
            NOW() as updated_at,
            '' as subtype_code,
            '' as subtype_name,
            '' as family_name,
            false as has_programming,
            false as has_zoning
          FROM landscape.tbl_landuse
          WHERE COALESCE(active, true) = true
          ORDER BY landuse_code
        `;
      } catch (_e2) {
        // Try even simpler without optional columns
        try {
          landuses = await sql`
            SELECT 
              landuse_code,
              COALESCE(landuse_type, '') as landuse_type,
              landuse_code as name,
              '' as description,
              true as active,
              0 as landuse_id,
              0 as subtype_id,
              NOW() as created_at,
              NOW() as updated_at,
              '' as subtype_code,
              '' as subtype_name,
              '' as family_name,
              false as has_programming,
              false as has_zoning
            FROM landscape.tbl_landuse
            ORDER BY landuse_code
          `;
        } catch (error3) {
          console.error('tbl_landuse table issue:', error3.message);
          return NextResponse.json([]);
        }
      }
    }

    return NextResponse.json(landuses || []);
  } catch (error) {
    console.error('Error fetching land use codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch land use codes', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      subtype_id, 
      landuse_code, 
      landuse_type, 
      name, 
      description, 
      active = true 
    } = await request.json();

    if (!subtype_id || !landuse_code || !name) {
      return NextResponse.json(
        { error: 'Subtype ID, land use code, and name are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO landscape.tbl_landuse 
      (subtype_id, landuse_code, landuse_type, name, description, active)
      VALUES (${subtype_id}, ${landuse_code}, ${landuse_type}, ${name}, ${description}, ${active})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating land use code:', error);
    if (error.message?.includes('unique')) {
      return NextResponse.json(
        { error: 'Land use code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create land use code' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { 
      landuse_id, 
      subtype_id, 
      landuse_code, 
      landuse_type, 
      name, 
      description, 
      active 
    } = await request.json();

    if (!landuse_id) {
      return NextResponse.json(
        { error: 'Land use ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE landscape.tbl_landuse 
      SET 
        subtype_id = COALESCE(${subtype_id}, subtype_id),
        landuse_code = COALESCE(${landuse_code}, landuse_code),
        landuse_type = COALESCE(${landuse_type}, landuse_type),
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        active = COALESCE(${active}, active)
      WHERE landuse_id = ${landuse_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Land use code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating land use code:', error);
    return NextResponse.json(
      { error: 'Failed to update land use code' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const landUseId = searchParams.get('id');

    if (!landUseId) {
      return NextResponse.json(
        { error: 'Land use ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting active = false
    const result = await sql`
      UPDATE landscape.tbl_landuse 
      SET active = false
      WHERE landuse_id = ${landUseId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Land use code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Land use code deleted successfully' });
  } catch (error) {
    console.error('Error deleting land use code:', error);
    return NextResponse.json(
      { error: 'Failed to delete land use code' },
      { status: 500 }
    );
  }
}
