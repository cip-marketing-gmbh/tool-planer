// 1. Das ist der wichtigste Teil: Zwingt Next.js, die URL-Parameter (searchParams) zu lesen!
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js'
import { createBooking } from './actions'

export default async function Home({ searchParams }: { searchParams: any }) {
  // Wir warten explizit auf die searchParams (neuer Standard in Next.js)
  const params = await searchParams;
  const selectedToolId = params?.toolId;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Daten laden
  const { data: tools } = await supabase.from('tools').select('*').order('name');
  const selectedTool = tools?.find(t => t.id === selectedToolId);

  let toolBookings: any[] = []
  if (selectedToolId) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('tool_id', selectedToolId)
    toolBookings = data || []
  }

  const monate = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  
  const getStatus = (day: number, month: number) => {
    const date = new Date(2026, month, day);
    if (date.getMonth() !== month) return "invalid";
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const time = date.getTime();
    
    const booked = toolBookings.some(b => {
      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();
      return time >= start && time <= end;
    });

    if (booked) return "booked";
    if (isWeekend) return "weekend";
    return "free";
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>🗓 Equipment Planer 2026</h1>

      {/* DROPDOWN - Absolut sicher programmiert */}
      <div style={{ marginBottom: '30px', textAlign: 'center', background: '#f7fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <form method="GET" action="/">
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Gerät wählen:</label>
          <select 
            name="toolId" 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', minWidth: '250px' }}
          >
            <option value="">-- Bitte wählen --</option>
            {tools?.map(tool => (
              <option 
                key={tool.id} 
                value={tool.id} 
                selected={selectedToolId === tool.id}
              >
                {tool.name}
              </option>
            ))}
          </select>
          <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Kalender laden
          </button>
        </form>
      </div>

      {/* KALENDER ANZEIGE */}
      {selectedToolId ? (
        <div>
          <h2 style={{ color: '#2b6cb0' }}>📍 Plan für: {selectedTool?.name || 'Unbekanntes Tool'}</h2>
          
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#edf2f7' }}>
                  <th style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Monat</th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} style={{ padding: '5px', border: '1px solid #e2e8f0', width: '30px' }}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monate.map((monat, mIdx) => (
                  <tr key={monat}>
                    <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold', background: '#f8fafc' }}>{monat}</td>
                    {Array.from({ length: 31 }, (_, dIdx) => {
                      const status = getStatus(dIdx + 1, mIdx);
                      let bgColor = 'transparent';
                      if (status === 'invalid') bgColor = '#f7fafc';
                      if (status === 'weekend') bgColor = '#edf2f7';
                      if (status === 'booked') bgColor = '#fc8181';

                      return (
                        <td key={dIdx} style={{ border: '1px solid #e2e8f0', backgroundColor: bgColor, height: '30px', textAlign: 'center' }}>
                          {status !== 'invalid' ? (dIdx + 1) : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BUCHUNGS-FORMULAR */}
          <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #3182ce', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Reservieren</h3>
            <form action={createBooking} style={{ display: 'grid', gap: '10px' }}>
              <input type="hidden" name="toolId" value={selectedToolId} />
              <input name="userName" placeholder="Dein Name" required style={{ padding: '8px' }} />
              <input type="date" name="startDate" required style={{ padding: '8px' }} />
              <input type="date" name="endDate" required style={{ padding: '8px' }} />
              <button type="submit" style={{ padding: '10px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px' }}>
                Speichern
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#a0aec0', border: '2px dashed #eee', padding: '40px' }}>
          <h3>Kein Gerät ausgewählt</h3>
          <p>Wähle oben ein Tool und klicke auf "Kalender laden".</p>
        </div>
      )}
    </div>
  )
}
