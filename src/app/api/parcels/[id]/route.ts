import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

type Params = { params: { id: string } }

// PATCH /api/parcels/[id]
// Accepts either UI field names (acres, units, efficiency, product, usecode, frontfeet)
// or DB column names (acres_gross, units_total, plan_efficiency, lot_product, landuse_code, lots_frontfeet)
export async function PATCH(request: Request, context: Params) {
  try {
    const id = context.params.id
    const body = await request.json().catch(() => ({}))

    // Map UI-friendly names to DB columns; allow both
    const landuse_code = body.landuse_code ?? body.usecode ?? null
    const lot_product = body.lot_product ?? body.product ?? null
    const acres_gross = body.acres_gross ?? body.acres ?? null
    const units_total = body.units_total ?? body.units ?? null
    const plan_efficiency = body.plan_efficiency ?? body.efficiency ?? null
    const lots_frontfeet = body.lots_frontfeet ?? body.frontfeet ?? null

    await sql`
      UPDATE landscape.tbl_parcel SET
        landuse_code = COALESCE(${landuse_code}::text, landuse_code),
        lot_product = COALESCE(${lot_product}::text, lot_product),
        acres_gross = COALESCE(${acres_gross}::numeric, acres_gross),
        units_total = COALESCE(${units_total}::integer, units_total),
        plan_efficiency = COALESCE(${plan_efficiency}::numeric, plan_efficiency),
        lots_frontfeet = COALESCE(${lots_frontfeet}::numeric, lots_frontfeet)
      WHERE parcel_id = ${id}::bigint
    `

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Parcels PATCH error:', e)
    return NextResponse.json({ error: 'Failed to update parcel', details: msg }, { status: 500 })
  }
}

