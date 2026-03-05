export const revalidate = 0;
import { createClient } from '@supabase/supabase-js'

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Daten laden (Tools und deren Buchungen)
  const { data: tools } = await supabase.from('tools').select('*')
  const { data: bookings } = await supabase.from('bookings').select('*')

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📅 Tool-Planer</h1>
      
      {tools?.map((tool) => (
        <div key={tool.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>{tool.name} ({tool.category})</h3>
          
          <p><strong>Reservierungen:</strong></p>
          <ul>
            {bookings?.filter(b => b.tool_id === tool.id).length > 0 ? (
              bookings?.filter(b => b.tool_id === tool.id).map(b => (
                <li key={b.id}>
                  {b.user_name}: {new Date(b.start_date).toLocaleDateString()} bis {new Date(b.end_date).toLocaleDateString()}
                </li>
              ))
            ) : (
              <li>Noch keine Buchungen</li>
            )}
          </ul>

          {/* Einfaches Buchungs-Formular (funktioniert über Server Actions oder API, aber hier als Demo-UI) */}
          <div style={{ background: '#f9f9f9', padding: '10px', marginTop: '10px' }}>
            <small>Neue Buchung (Demo-Ansicht):</small><br/>
            <input type="date" /> bis <input type="date" />
            <button style={{ marginLeft: '10px' }}>Buchen</button>
          </div>
        </div>
      ))}
    </div>
  )
}
