'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  // Client mit Schema-Option 'chris' initialisieren
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'chris' } // Zwingt den Client, in deinem Schema zu arbeiten
    }
  )

  // Daten aus dem Formular ziehen
  const toolId = formData.get('toolId') as string
  const userName = formData.get('userName') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string

  // Sicherheits-Check
  if (!toolId || !userName || !startDate || !endDate) {
    return;
  }

  // Ab in die neue Tabelle 'tool-planner-bookings'
  const { error } = await supabase.from('tool-planner-bookings').insert([
    { 
      tool_id: toolId, 
      user_name: userName, 
      start_date: startDate, 
      end_date: endDate 
    }
  ])

  if (error) {
    console.error('Datenbank-Fehler:', error.message)
    throw new Error(error.message)
  }

  // Seite aktualisieren
  revalidatePath('/')
}
