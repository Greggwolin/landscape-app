// app/db-schema/page.tsx
import { sql } from '@/lib/db'
import SchemaAccordion from './SchemaAccordion'

type Column = {
  name: string
  type: string
  nullable: boolean
  position: number
}

type FK = {
  column: string
  references: { table: string; column: string }
}

type TableInfo = { columns: Column[]; foreignKeys: FK[] }

export const dynamic = 'force-dynamic'

export default async function DbSchemaPage() {
  const tables = await sql<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'landscape' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `

  const columns = await sql<{
    table_name: string
    column_name: string
    data_type: string
    is_nullable: 'YES' | 'NO'
    ordinal_position: number
  }[]>`
    SELECT table_name, column_name, data_type, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'landscape'
    ORDER BY table_name, ordinal_position;
  `

  const fks = await sql<{
    table_name: string
    column_name: string
    foreign_table_name: string
    foreign_column_name: string
  }[]>`
    SELECT 
      tc.table_name AS table_name,
      kcu.column_name AS column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'landscape'
    ORDER BY tc.table_name, kcu.column_name;
  `

  const byTable: Record<string, TableInfo> = Object.fromEntries(
    tables.map(t => [t.table_name, { columns: [], foreignKeys: [] } as TableInfo])
  )

  for (const c of columns) {
    if (!byTable[c.table_name]) byTable[c.table_name] = { columns: [], foreignKeys: [] }
    byTable[c.table_name].columns.push({
      name: c.column_name,
      type: c.data_type,
      nullable: c.is_nullable === 'YES',
      position: c.ordinal_position,
    })
  }

  for (const fk of fks) {
    if (!byTable[fk.table_name]) byTable[fk.table_name] = { columns: [], foreignKeys: [] }
    byTable[fk.table_name].foreignKeys.push({
      column: fk.column_name,
      references: { table: fk.foreign_table_name, column: fk.foreign_column_name },
    })
  }

  const tableNames = Object.keys(byTable).sort()

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-white">
      <div className="bg-gray-800 rounded border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h1 className="text-lg font-semibold">Database Schema: landscape</h1>
          <div className="text-xs text-gray-400 mt-1">Generated at {new Date().toLocaleString()}</div>
        </div>
      </div>

      <SchemaAccordion tableNames={tableNames} tables={byTable} />
    </div>
  )
}
