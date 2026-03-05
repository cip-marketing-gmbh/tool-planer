'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Wir holen die Daten und sagen TypeScript: "Das ist ein Text" (as string)
  const toolId = formData.get('toolId') as string
  const userName = formData.get('userName') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string

  // Validierung: Nur speichern, wenn alles da ist
  if (!toolId || !userName || !startDate || !endDate) {
    console.error('Pflichtfelder fehlen')
    return
  }

  const { error } = await supabase.from('bookings').insert([
    { 
      tool_id: toolId, 
      user_name: userName, 
      start_date: startDate, 
      end_date: endDate 
    }
  ])

  if (error) {
    console.error('Fehler beim Buchen:', error.message)
    throw new Error(error.message)
  }

  // Seite aktualisieren
  revalidatePath('/')
}
