'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createBooking } from './actions';

// Supabase Initialisierung (Client-seitig)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [tools, setTools] = useState<any[]>([]);
  const [selectedToolId, setSelectedToolId] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [range, setRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const monate = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  // 1. Tools laden
  useEffect(() => {
    supabase.from('tools').select('*').order('name').then(({ data }) => setTools(data || []));
  }, []);

  // 2. Buchungen laden, wenn Tool gewechselt wird
  useEffect(() => {
    if (selectedToolId) {
      supabase.from('bookings').select('*').eq('tool_id', selectedToolId).then(({ data }) => setBookings(data || []));
      setRange({ start: null, end: null }); // Reset bei Tool-Wechsel
    }
  }, [selectedToolId]);

  // Logik für Klick im Kalender
  const handleDateClick = (dateStr: string, isBooked: boolean, isInvalid: boolean) => {
    if (isBooked || isInvalid) return;

    if (!range.start || (range.start && range.end)) {
      setRange({ start: dateStr, end: null });
    } else {
      const start = new Date(range.start);
      const end = new Date(dateStr);
      if (end < start) {
        setRange({ start: dateStr, end: null });
      } else {
        setRange({ ...range, end: dateStr });
      }
    }
  };

  const getStatus = (day: number, month: number) => {
    const year = 2026;
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) return "invalid";
    
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const time = date.getTime();
    
    const isBooked = bookings.some(b => {
      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();
      return time >= start && time <= end;
    });

    const isSelected = range.start && range.end 
      ? (time >= new Date(range.start).getTime() && time <= new Date(range.end).getTime())
      : (range.start === dateStr);

    if (isBooked) return "booked";
    if (isSelected) return "selected";
    if (date.getDay() === 0 || date.getDay() === 6) return "weekend";
    return "free";
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', color: '#2d3748' }}>
      <h1 style={{ textAlign: 'center' }}>🗓 Equipment Planer 2026</h1>

      {/* OBEN: AUSWAHL & BUCHUNG */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Tool Dropdown */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>1. Gerät auswählen</label>
          <select 
            value={selectedToolId} 
            onChange={(e) => setSelectedToolId(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
          >
            <option value="">-- Bitte wählen --</option>
            {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Buchungsformular (Aktion) */}
        <div style={{ opacity: selectedToolId ? 1 : 0.5, pointerEvents: selectedToolId ? 'auto' : 'none' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>2. Zeitraum reservieren</label>
          <form action={createBooking} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="hidden" name="toolId" value={selectedToolId} />
            <input name="userName" placeholder="Dein Name" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', flex: 1 }} />
            <input type="date" name="startDate" value={range.start || ''} readOnly required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#edf2f7' }} />
            <input type="date" name="endDate" value={range.end || ''} readOnly required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#edf2f7' }} />
            <button type="submit" style={{ padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Buchen
            </button>
          </form>
          <small style={{ color: '#718096' }}>Tipp: Klicke Start- und Endtag einfach unten im Kalender an.</small>
        </div>
      </div>

      {/* UNTEN: JAHRESPLANER */}
      {selectedToolId ? (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#edf2f7' }}>
                <th style={{ padding: '10px', border: '1px solid #e2e8f0', textAlign: 'left' }}>Monat</th>
                {Array.from({ length: 31 }, (_, i) => <th key={i} style={{ padding: '5px', border: '1px solid #e2e8f0', width: '30px' }}>{i + 1}</th>)}
              </tr>
            </thead>
            <tbody>
              {monate.map((monat, mIdx) => (
                <tr key={monat}>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold', background: '#f8fafc' }}>{monat}</td>
                  {Array.from({ length: 31 }, (_, dIdx) => {
                    const status = getStatus(dIdx + 1, mIdx);
                    const dateStr = `2026-${(mIdx + 1).toString().padStart(2, '0')}-${(dIdx + 1).toString().padStart(2, '0')}`;
                    
                    let bgColor = 'transparent';
                    let cursor = 'pointer';
                    if (status === 'invalid') { bgColor = '#f7fafc'; cursor = 'default'; }
                    if (status === 'weekend') bgColor = '#edf2f7';
                    if (status === 'booked') { bgColor = '#fc8181'; cursor = 'not-allowed'; }
                    if (status === 'selected') bgColor = '#4299e1';

                    return (
                      <td 
                        key={dIdx} 
                        onClick={() => handleDateClick(dateStr, status === 'booked', status === 'invalid')}
                        style={{ 
                          border: '1px solid #e2e8f0', 
                          backgroundColor: bgColor, 
                          height: '35px', 
                          textAlign: 'center', 
                          cursor: cursor,
                          color: (status === 'booked' || status === 'selected') ? 'white' : 'inherit',
                          transition: 'all 0.1s'
                        }}
                      >
                        {status !== 'invalid' ? (dIdx + 1) : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px', border: '2px dashed #e2e8f0', borderRadius: '20px', color: '#a0aec0' }}>
          <h2>Wähle oben ein Gerät aus, um den Planer zu aktivieren.</h2>
        </div>
      )}
    </div>
  );
}
