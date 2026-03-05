export const revalidate = 0;
import { createClient } from '@supabase/supabase-js'
import { createBooking } from './actions'

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: tools } = await supabase.from('tools').select('*')
  const { data: bookings } = await supabase.from('bookings').select('*')

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📅 Tool-Planer</h1>
      
      {tools?.map((tool: any) => (
        <div key={tool.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
          <h2>{tool.name}</h2>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Buchungen:</strong>
            {bookings?.filter((b: any) => b.tool_id === tool.id).map((b: any) => (
              <div key={b.id} style={{ fontSize: '0.9rem', color: '#555' }}>
                {b.user_name}: {b.start_date} bis {b.end_date}
              </div>
            ))}
          </div>

          <form action={createBooking} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <input type="hidden" name="toolId" value={tool.id} />
            <input name="userName" placeholder="Dein Name" required style={{ padding: '5px' }} />
            <input type="date" name="startDate" required style={{ padding: '5px' }} />
            <input type="date" name="endDate" required style={{ padding: '5px' }} />
            <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>Reservieren</button>
          </form>
        </div>
      ))}
    </div>
  )
}
