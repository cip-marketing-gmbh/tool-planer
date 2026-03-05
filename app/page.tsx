export const revalidate = 0;
import { createClient } from '@supabase/supabase-js'
import { createBooking } from './actions'

export default async function Home({ searchParams }: { searchParams: any }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Alle Tools laden
  const { data: tools } = await supabase.from('tools').select('*').order('name');
  
  // 2. Ausgewähltes Tool aus der URL fangen
  const selectedToolId = searchParams?.toolId;
  const selectedTool = tools?.find(t => t.id === selectedToolId);

  // 3. Buchungen laden
  let toolBookings: any[] = []
  if (selectedToolId) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('tool_id', selectedToolId)
    toolBookings = data || []
  }

  const isBooked = (dateStr: string) => {
    return toolBookings.some(b => {
      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();
      const current = new Date(dateStr).getTime();
      return current >= start && current <= end;
    });
  }

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>🛠 Equipment Planer</h1>

      {/* REPARIERTES DROPDOWN (Ohne window.location Fehler) */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <form method="GET" action="/">
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Gerät wählen:</label>
          <select 
            name="toolId" 
            onInput={(e) => (e.target as HTMLFormElement).form.submit()}
            defaultValue={selectedToolId || ""}
            style={{ padding: '12px', width: '100%', maxWidth: '400px', borderRadius: '8px' }}
          >
            <option value="">-- Bitte wählen --</option>
            {tools?.map(tool => (
              <option key={tool.id} value={tool.id}>{tool.name}</option>
            ))}
          </select>
          <noscript><button type="submit">Anzeigen</button></noscript>
        </form>
      </div>

      {selectedToolId ? (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0070f3' }}>📅 {selectedTool?.name}</h2>
          <p>Status für März 2026:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '20px' }}>
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>{d}</div>
            ))}
            
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
              const booked = isBooked(dateStr);
              
              return (
                <div key={i} style={{
                  height: '50px',
                  borderRadius: '6px',
                  backgroundColor: booked ? '#ffcccc' : '#f0fff4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #eee',
                  color: booked ? '#cc0000' : '#2f855a'
                }}>
                  {day}
                </div>
              );
            })}
          </div>

          {/* BUCHUNGSFORMULAR */}
          <form action={createBooking} style={{ marginTop: '30px', display: 'grid', gap: '10px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <input type="hidden" name="toolId" value={selectedToolId} />
            <input name="userName" placeholder="Dein Name" required style={{ padding: '10px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" name="startDate" required style={{ flex: 1, padding: '10px' }} />
              <input type="date" name="endDate" required style={{ flex: 1, padding: '10px' }} />
            </div>
            <button type="submit" style={{ padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              Reservierung speichern
            </button>
          </form>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px', border: '2px dashed #eee' }}>
          Bitte wähle oben ein Tool aus.
        </div>
      )}
    </div>
  )
}
