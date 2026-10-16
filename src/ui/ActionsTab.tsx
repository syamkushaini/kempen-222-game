/**
 * Kempen 222 - Improved ActionsTab.tsx (P0 fix #1)
 * What changed vs original:
 * - Added Seat / State / National filters (fixes information overload)
 * - Shows fading + repeat penalty as a bar (from README: "repeating the same thing in the same place gives less")
 * - Shows seat-type effectiveness tooltip (Ceramah strong rural weak city, walkabout town, etc)
 * - Shows days + money + nomination deadline
 * - Small UX: disabled state when not enough days/money
 * 
 * Drop-in: replace src/ui/ActionsTab.tsx content with this, keep your existing imports for game state.
 * Assumes props shape from your existing tab - adjust types to match your src/sim/campaign/actions.ts
 */

import React, { useState, useMemo } from 'react';

type ActionScope = 'seat' | 'state' | 'national';
type SeatType = 'rural' | 'semi-urban' | 'urban' | 'mixed';

type Action = {
  id: string;
  label: string;
  labelMs: string;
  scope: ActionScope;
  days: number;
  money: number;
  // 0 = fresh, 1 = heavily faded
  fading: number; 
  // multiplier for current seat type
  effectiveness: number; // 0.5 = weak, 1.0 = normal, 1.5 = strong
  seatTypeNote?: string;
};

type Props = {
  actions: Action[];
  daysLeft: number;
  money: number;
  nominationDaysLeft: number; // from your game state: 21 - day
  seatType: SeatType;
  onDoAction: (id: string) => void;
  lang: 'en' | 'ms';
};

const SCOPE_LABEL: Record<ActionScope, { en: string; ms: string }> = {
  seat: { en: 'Seat', ms: 'Parlimen' },
  state: { en: 'State', ms: 'Negeri' },
  national: { en: 'National', ms: 'Nasional' },
};

function FadingBar({ fading }: { fading: number }) {
  // fading 0 = fresh (green), 1 = burnt out (red)
  const pct = Math.round((1 - fading) * 100);
  const color = pct > 60 ? '#16a34a' : pct > 30 ? '#eab308' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color: '#6b7280' }}>
        {pct}% {pct < 40 ? '• Repeat penalty' : '• Fresh'}
      </span>
    </div>
  );
}

export default function ActionsTab({ actions, daysLeft, money, nominationDaysLeft, seatType, onDoAction, lang }: Props) {
  const [filter, setFilter] = useState<'all' | ActionScope>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return actions;
    return actions.filter(a => a.scope === filter);
  }, [actions, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header: days + nomination countdown - P0 fix for DealsTab too */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8 }}>
        <span style={{ fontWeight: 600 }}>{lang === 'ms' ? 'Masa' : 'Time'}: {daysLeft} days left this week</span>
        <span style={{ color: nominationDaysLeft <= 3 ? '#dc2626' : '#000', fontWeight: nominationDaysLeft <= 3 ? 700 : 400 }}>
          {lang === 'ms' ? 'Penamaan' : 'Nomination'}: {nominationDaysLeft} days {nominationDaysLeft <= 3 ? '• Pacts closing!' : ''}
        </span>
      </div>

      {/* Filters - fixes overload */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['all', 'seat', 'state', 'national'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: filter === f ? '2px solid #111' : '1px solid #d1d5db',
              background: filter === f ? '#111' : '#fff',
              color: filter === f ? '#fff' : '#111',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? (lang === 'ms' ? 'Semua' : 'All') : SCOPE_LABEL[f as ActionScope][lang]}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>
          Seat: {seatType} • Ceramah strong rural, walkabout town, social = young
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map(a => {
          const notEnoughDays = a.days > daysLeft;
          const notEnoughMoney = a.money > money;
          const disabled = notEnoughDays || notEnoughMoney;
          const effLabel = a.effectiveness >= 1.3 ? 'Strong here' : a.effectiveness <= 0.7 ? 'Weak here' : 'Normal';
          const effColor = a.effectiveness >= 1.3 ? '#16a34a' : a.effectiveness <= 0.7 ? '#dc2626' : '#6b7280';

          return (
            <div
              key={a.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 12,
                background: disabled ? '#f9fafb' : '#fff',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{lang === 'ms' ? a.labelMs : a.label}</strong>
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10, background: '#f3f4f6' }}>{SCOPE_LABEL[a.scope][lang]}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13 }}>
                <span>⏱ {a.days}d</span>
                <span>💰 RM{a.money.toLocaleString()}</span>
                <span style={{ color: effColor, fontWeight: 600 }}>{effLabel}</span>
              </div>

              {a.seatTypeNote && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{a.seatTypeNote}</div>}

              <FadingBar fading={a.fading} />

              <button
                disabled={disabled}
                onClick={() => onDoAction(a.id)}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: disabled ? '#e5e7eb' : '#111827',
                  color: disabled ? '#9ca3af' : '#fff',
                  fontWeight: 700,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                title={disabled ? (notEnoughDays ? 'Not enough days left' : 'Not enough money') : `Do ${a.label} - ${effLabel} in ${seatType}`}
              >
                {disabled ? (notEnoughDays ? 'No days' : 'No funds') : lang === 'ms' ? 'Jalankan' : 'Run'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
HOW TO WIRE TO YOUR EXISTING GAME:
In your current src/ui/ActionsTab.tsx you already have game state. Replace your map over actions with:

const actionsWithMeta = useMemo(() => 
  rawActions.map(a => ({
    ...a,
    fading: getFading(a.id, seatId), // you already track fading in src/sim/campaign/turn.ts
    effectiveness: getSeatEffectiveness(a.id, seatType), // ceramah rural=1.5 urban=0.6 etc
    seatTypeNote: getSeatNote(a.id, seatType),
  })), [rawActions, seatId, seatType]);

Then <ActionsTab actions={actionsWithMeta} daysLeft={week.daysLeft} money={party.money} nominationDaysLeft={...} ... />

This file is intentionally self-contained so you can paste it even without your exact types.
*/
