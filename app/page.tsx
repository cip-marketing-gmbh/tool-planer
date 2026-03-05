export const revalidate = 0;
import { createClient } from '@supabase/supabase-js'
import { createBooking } from './actions' // Importiert die Speicher-Funktion

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Daten laden
  const { data: tools } = await supabase.from('tools').select('*')
  const { data: bookings } = await supabase.from('bookings').select('*').order('start_date', { ascending: true })

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', color: '#333' }}>
      <h1 style={{ borderBottom: '2px solid #0070f3', paddingBottom: '10px' }}>📅 Tool-Planer & Reservierung</h1>
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {tools?.map((tool) => (
          <div key={tool.id} style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#0070f3' }}>{tool.name}</h2>
            <span style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{tool.category}</span>
            
            <div style={{ marginTop: '20px' }}>
              <strong>Bestehende Buchungen:</strong>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                {bookings?.filter(b => b.tool_id === tool.id).length > 0 ? (
                  bookings?.filter(b => b.tool_id === tool.id).map(b => (
                    <li key={b.id} style={{ background: '#f0f7ff', margin: '5px 0', padding: '8px', borderRadius: '6px', fontSize: '0.9rem' }}>
                      👤 <strong>{b.user_name}</strong>: {new Date(b.start_date).toLocaleDateString('de-DE')} bis {new Date(b.end_date).toLocaleDateString('de-DE')}
                    </li>
                  ))
                ) : (
                  <li style={{ color: '#999', fontSize: '0.9rem' }}>Noch keine Reservierungen vorhanden.</li>
                )}
              </ul>
            </div>

            {/* Buchungs-Formular */}
            <form action={createBooking} style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
              <input type="hidden" name="toolId" value={tool.id} />
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Dein Name</label>
                <input name="userName" placeholder="Name" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Von</label>
                <input type="date" name="startDate" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Bis</label>
                <input type="date" name="endDate" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <button type="submit" style={{ padding: '9px 15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Reservieren
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
