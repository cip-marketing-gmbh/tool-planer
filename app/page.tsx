export const revalidate = 0;
import { createClient } from '@supabase/supabase-js'
import { createBooking } from './actions'

export default async function Home({ searchParams }: { searchParams: any }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Daten laden
  const { data: tools } = await supabase.from('tools').select('*')
  const selectedToolId = searchParams.toolId; // Wir nutzen die URL für die Auswahl

  // 2. Buchungen für das gewählte Tool laden
  let toolBookings: any[] = []
  if (selectedToolId) {
    const { data } = await supabase
      .from('bookings')
      .filter('tool_id', 'eq', selectedToolId)
      .select('*')
    toolBookings = data || []
  }

  // Hilfsfunktion: Ist ein Tag gebucht?
  const isBooked = (dateStr: string) => {
    return toolBookings.some(b => {
      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();
      const current = new Date(dateStr).getTime();
      return current >= start && current <= end;
    });
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🛠 Tool-Verleih 2024</h1>

      {/* TOOL AUSWAHL */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px 0' }}>
        {tools?.map(tool => (
          <a 
            key={tool.id} 
            href={`?toolId=${tool.id}`}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedToolId === tool.id ? '#0070f3' : '#eee',
              color: selectedToolId === tool.id ? 'white' : 'black',
              borderRadius: '20px',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {tool.name}
          </a>
        ))}
      </div>

      {selectedToolId ? (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <h2>Belegungskalender</h2>
          <p>Rote Tage sind bereits reserviert.</p>
          
          {/* EINFACHE KALENDER-MATRIX (Beispiel für einen Monat) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '5px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            padding: '10px'
          }}>
            {/* Hier könnte man eine Schleife über alle Tage des Jahres machen */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2024-05-${day.toString().padStart(2, '0')}`; // Beispiel Mai
              const booked = isBooked(dateStr);
              
              return (
                <div key={i} style={{
                  height: '60px',
                  border: '1px solid #eee',
                  backgroundColor: booked ? '#ffcccc' : '#e6fffa',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: booked ? '#cc0000' : '#2d3748'
                }}>
                  <strong>{day}</strong>
                  {booked && <small>belegt</small>}
                </div>
              );
            })}
          </div>

          {/* BUCHUNGSFORMULAR UNTER DEM KALENDER */}
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #0070f3', borderRadius: '8px' }}>
            <h3>Neue Reservierung für dieses Tool</h3>
            <form action={createBooking} style={{ display: 'grid', gap: '10px' }}>
              <input type="hidden" name="toolId" value={selectedToolId} />
              <input name="userName" placeholder="Dein Name" required style={{ padding: '10px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" name="startDate" required style={{ padding: '10px', flex: 1 }} />
                <input type="date" name="endDate" required style={{ padding: '10px', flex: 1 }} />
              </div>
              <button type="submit" style={{ padding: '15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Jetzt verbindlich reservieren
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
          <p>Bitte wähle oben ein Tool aus, um den Kalender zu sehen.</p>
        </div>
      )}
    </div>
  )
}
