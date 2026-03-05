import { createClient } from '@supabase/supabase-js'

export default async function Home() {
  // NUR DIESE EINE VERSION BEHALTEN:
  const supabase = createClient(
    'https://sb_publishable_-5AFCYGBjq8H_JQhTsmgkw_FX007quv', // DEINE ECHTE URL
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2dzYmNxbG9nYndzb3R1cm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Mjg1ODQsImV4cCI6MjA4ODIwNDU4NH0.Ust7KCa1sx0G6kt3N9ElWAfzTQ-P180hoVy2xnCrolg'                // DEIN ECHTER ANON KEY
  )

  const { data: tools, error } = await supabase.from('tools').select('*')

  if (error) return <div style={{ padding: '40px' }}>Fehler beim Laden: {error.message}</div>

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>🛠 Tool-Übersicht (Direkt-Verbindung)</h1>
      <hr />
      <div style={{ marginTop: '20px' }}>
        {tools && tools.length > 0 ? (
          <ul>
            {tools.map((tool) => (
              <li key={tool.id} style={{ marginBottom: '10px' }}>
                <strong>{tool.name}</strong> — <span style={{ color: '#666' }}>{tool.category}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Keine Tools gefunden. Hast du Daten in Supabase eingetragen?</p>
        )}
      </div>
    </div>
  )
}