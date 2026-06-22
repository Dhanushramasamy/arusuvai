import React, { useState } from 'react';
import Modal from './Modal';

interface DatePickerModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  minDate?: string; // YYYY-MM-DD (optional bound)
  maxDate?: string; // YYYY-MM-DD (optional bound)
}

export default function DatePickerModal({
  open,
  onClose,
  selectedDate,
  onSelect,
  minDate,
  maxDate,
}: DatePickerModalProps) {
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(selectedDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDateObj.getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in current month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Days in previous month (to pad first week)
  const prevNumDays = new Date(currentYear, currentMonth, 0).getDate();

  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Pad previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevNumDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ dateStr, dayNum: day, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ dateStr, dayNum: day, isCurrentMonth: true });
  }

  // Pad next month days to complete grid (usually 42 cells)
  const totalCells = cells.length;
  const remCells = (7 - (totalCells % 7)) % 7;
  for (let day = 1; day <= remCells + (totalCells <= 35 ? 7 : 0); day++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ dateStr, dayNum: day, isCurrentMonth: false });
  }

  function changeMonth(dir: number) {
    if (dir === -1) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
        {/* Month selector header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{
              background: 'var(--color-primary-light)', border: 'none',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              color: 'var(--color-primary)', fontWeight: 700,
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ‹
          </button>
          <div style={{ fontWeight: 800, color: 'var(--color-text)', fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16 }}>
            {monthNames[currentMonth]} {currentYear}
          </div>
          <button
            onClick={() => changeMonth(1)}
            style={{
              background: 'var(--color-primary-light)', border: 'none',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
              color: 'var(--color-primary)', fontWeight: 700,
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ›
          </button>
        </div>

        {/* Days of week */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 8 }}>
          {daysOfWeek.map((d) => (
            <div key={d} style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            
            // Check if cell matches minDate and maxDate bounds
            const isDisabled = !!((minDate && cell.dateStr < minDate) || (maxDate && cell.dateStr > maxDate));

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onSelect(cell.dateStr);
                  onClose();
                }}
                style={{
                  padding: '8px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isSelected ? 800 : 600,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.25 : 1,
                  background: isSelected
                    ? 'var(--color-primary)'
                    : isToday
                    ? 'var(--color-primary-light)'
                    : 'transparent',
                  color: isSelected
                    ? 'white'
                    : cell.isCurrentMonth
                    ? 'var(--color-text)'
                    : 'var(--color-text-light)',
                  border: isToday && !isSelected ? '1px solid var(--color-primary)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
