export const revalidate = 0;
import { createClient } from '@supabase/supabase-js'
import { createBooking } from './actions'

export default async function Home({ searchParams }: { searchParams: any }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Alle Tools für die Auswahl laden
  const { data: tools } = await supabase.from('tools').select('*')
  
  // 2. Prüfen, welches Tool gerade ausgewählt ist
  const selectedToolId = searchParams?.toolId;

  // 3. Buchungen nur für das ausgewählte Tool laden
  let toolBookings: any[] = []
  if (selectedToolId) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('tool_id', selectedToolId)
    toolBookings = data || []
  }

  // Hilfsfunktion für den Kalender: Check ob Tag belegt ist
  const isBooked = (dateStr: string) => {
    return toolBookings.some(b => {
      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();
      const current = new Date(dateStr).getTime();
      return current >= start && current <= end;
    });
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', color: '#333' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>🛠 Tool-Verleih Planer</h1>
        <p>Wähle ein Gerät aus, um die Verfügbarkeit zu prüfen.</p>
      </header>

      {/* TOOL AUSWAHL NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px 0', borderBottom: '1px solid #eee' }}>
        {tools?.map(tool => (
          <a 
            key={tool.id} 
            href={`?toolId=${tool.id}`}
            style={{
              padding: '12px 20px',
              backgroundColor: selectedToolId === tool.id ? '#0070f3' : '#f0f0f0',
              color: selectedToolId === tool.id ? 'white' : '#333',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tool.name}
          </a>
        ))}
      </div>

      {/* KALENDER ANSICHT */}
      {selectedToolId ? (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0070f3' }}>
            Kalender: {tools?.find(t => t.id === selectedToolId)?.name}
          </h2>
          
          <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
            <span><span style={{ display: 'inline-block', width: '15px', height: '15px', background: '#e6fffa', border: '1px solid #eee' }}></span> Frei</span>
            <span><span style={{ display: 'inline-block', width: '15px', height: '15px', background: '#ffcccc', border: '1px solid #eee' }}></span> Belegt</span>
          </div>

          {/* Beispiel-Matrix für einen Monat (Mai 2026 als Beispiel) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '8px',
            marginTop: '20px'
          }}>
            {/* Wochentage Header */}
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', padding: '5px' }}>{d}</div>
            ))}
            
            {/* Tage-Grid */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
              const booked = isBooked(dateStr);
              
              return (
                <div key={i} style={{
                  height: '70px',
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  backgroundColor: booked ? '#ffcccc' : '#e6fffa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontSize: '1rem'
                }}>
                  <span style={{ fontWeight: booked ? 'bold' : 'normal' }}>{day}</span>
                  {booked && <small style={{ position: 'absolute', bottom: '5px', fontSize: '0.6rem', color: '#cc0000' }}>belegt</small>}
                </div>
              );
            })}
          </div>

          {/* BUCHUNGSFORMULAR */}
          <div style={{ marginTop: '40px', padding: '25px', background: '#f8f9fa', borderRadius: '10px' }}>
            <h3>Neue Reservierung eintragen</h3>
            <form action={createBooking} style={{ display: 'grid', gap: '15px', maxWidth: '500px' }}>
              <input type="hidden" name="toolId" value={selectedToolId} />
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Dein Name</label>
                <input name="userName" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Startdatum</label>
                  <input type="date" name="startDate" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Enddatum</label>
                  <input type="date" name="endDate" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <button type="submit" style={{ 
                padding: '12px', 
                backgroundColor: '#0070f3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                Reservierung speichern
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ padding: '80px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '15px', border: '2px dashed #ddd' }}>
          <h2 style={{ color: '#999' }}>Kein Tool ausgewählt</h2>
          <p>Klicke oben auf ein Gerät, um den Kalender und die Buchungen zu sehen.</p>
        </div>
      )}
    </div>
  )
}
