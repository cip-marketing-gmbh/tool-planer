'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Daten aus dem Formular ziehen und sicherstellen, dass sie als Text erkannt werden
  const toolId = formData.get('toolId') as string
  const userName = formData.get('userName') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string

  // Sicherheits-Check: Wenn etwas fehlt, abbrechen
  if (!toolId || !userName || !startDate || !endDate) {
    return;
  }

  // Ab in die Datenbank damit
  const { error } = await supabase.from('bookings').insert([
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

  // Die Seite zwingen, sich zu aktualisieren, damit die neue Buchung erscheint
  revalidatePath('/')
}
