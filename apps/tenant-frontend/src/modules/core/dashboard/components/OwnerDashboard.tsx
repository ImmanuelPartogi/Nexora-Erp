// ============================================
// FILE: frontend/src/modules/core/dashboard/components/OwnerDashboard.tsx
// Enterprise-grade Owner-only analytics dashboard.
// Renders only when active role === 'Owner'.
// ============================================

import { useEffect, useMemo, useState } from 'react';
import { reportApi } from '@/shared/api/report.api';
import type { OwnerDashboardStats, TrendPoint } from '@/shared/types/owner-dashboard.types';

// ── Helpers ───────────────────────────────────────────────────
function fmtIDR(n: number | null | undefined, compact = true): string {
  if (n == null) return '—';
  if (compact) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
    if (abs >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  }
  return `Rp ${Number(n).toLocaleString('id-ID')}`;
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return '0';
  return Number(n).toLocaleString('id-ID');
}

function fmtPct(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// ── Trend Badge ───────────────────────────────────────────────
function TrendBadge({ pct, invertColors = false, size = 'sm' }: { pct: number; invertColors?: boolean; size?: 'sm' | 'xs' }) {
  const isPositive = pct >= 0;
  const good = invertColors ? !isPositive : isPositive;
  const color = good ? '#10b981' : '#ef4444';
  const bg = good ? '#ecfdf5' : '#fef2f2';
  const pad = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
  const fs = size === 'xs' ? 10 : 11;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full font-semibold ${pad}`} style={{ fontSize: fs, color, background: bg }}>
      <svg className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {isPositive ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        )}
      </svg>
      {fmtPct(Math.abs(pct))}
    </span>
  );
}

// ── Area Chart (SVG line chart with gradient fill) ────────────
function AreaChart({
  points,
  color = '#6366f1',
  height = 160,
  showAxis = true,
}: {
  points: TrendPoint[];
  color?: string;
  height?: number;
  showAxis?: boolean;
}) {
  const w = 600;
  const padL = showAxis ? 48 : 8;
  const padB = showAxis ? 28 : 8;
  const padT = 16;
  const padR = 12;
  const cw = w - padL - padR;
  const ch = height - padT - padB;

  const data = points.map((p) => p.value);
  const labels = points.map((p) => p.label);
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const stepX = cw / Math.max(data.length - 1, 1);
  const coords = data.map((v, i) => ({
    x: padL + i * stepX,
    y: padT + ch - ((v - min) / range) * ch,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x},${c.y}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${padT + ch} L${coords[0].x},${padT + ch} Z`;
  const gid = `area-${color.replace('#', '')}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(min + t * range));

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showAxis &&
        yTicks.map((tick, i) => {
          const y = padT + ch - (i / 4) * ch;
          return (
            <g key={i}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,3" />
              <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
              </text>
            </g>
          );
        })}
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          {showAxis && (
            <text x={c.x} y={height - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {labels[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniBarChart({
  points,
  color = '#6366f1',
  height = 100,
}: {
  points: TrendPoint[];
  color?: string;
  height?: number;
}) {
  const w = 360;
  const padL = 8, padB = 20, padT = 8, padR = 8;
  const cw = w - padL - padR;
  const ch = height - padT - padB;
  const data = points.map((p) => p.value);
  const labels = points.map((p) => p.label);
  const max = Math.max(...data, 1);
  const barW = cw / data.length;
  const gap = barW * 0.3;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={`mb-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const bh = (v / max) * ch;
        const x = padL + i * barW + gap / 2;
        const y = padT + ch - bh;
        const bw = barW - gap;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={`url(#mb-${color.replace('#', '')})`} />
            <text x={x + bw / 2} y={height - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────
function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 130,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const sw = 16;
  let angle = -Math.PI / 2;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const startAngle = angle;
          angle += pct * 2 * Math.PI;
          const endAngle = angle;
          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);
          const large = pct > 0.5 ? 1 : 0;
          if (pct === 0) return null;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
            />
          );
        })}
        {centerValue && (
          <>
            <text x={cx} y={cy - 2} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">
              {centerValue}
            </text>
            {centerLabel && (
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block rounded-sm flex-shrink-0" style={{ width: 10, height: 10, background: s.color }} />
            <span className="truncate" style={{ fontSize: 12, color: '#475569' }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginLeft: 'auto', paddingLeft: 8 }}>
              {fmtNum(s.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Radial Gauge ──────────────────────────────────────────────
function RadialGauge({ value, max, label, color, size = 90 }: { value: number; max: number; label: string; color: string; size?: number }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <span style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────
function Card({
  title,
  subtitle,
  children,
  className = '',
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 transition-shadow hover:shadow-md ${className}`}
      style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            {title && <p className="font-bold text-slate-800" style={{ fontSize: 14 }}>{title}</p>}
            {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
  trendPct,
  invertTrend,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trendPct?: number;
  invertTrend?: boolean;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5" style={{ background: color, transform: 'translate(30px,-30px)' }} />
      <div className="flex items-start justify-between gap-2 relative">
        <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: color + '15', color }}>
          {icon}
        </div>
        {trendPct !== undefined && <TrendBadge pct={trendPct} invertColors={invertTrend} />}
      </div>
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</p>
        <p className="font-extrabold leading-tight mt-1" style={{ fontSize: 24, color: '#0f172a' }}>{value}</p>
        {sub && <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Ranking Row ───────────────────────────────────────────────
function RankRow({
  rank,
  name,
  sub,
  value,
  color,
  isAvatar = false,
}: {
  rank: number;
  name: string;
  sub: string;
  value: string;
  color: string;
  isAvatar?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5" style={{ borderBottom: `1px solid #f8fafc` }}>
      <span
        className={`flex items-center justify-center flex-shrink-0 font-bold ${isAvatar ? 'rounded-full text-white' : 'rounded-lg'}`}
        style={{
          width: isAvatar ? 30 : 28,
          height: isAvatar ? 30 : 28,
          fontSize: 12,
          background: isAvatar ? color : color + '15',
          color: isAvatar ? '#fff' : color,
        }}
      >
        {isAvatar ? name.charAt(0).toUpperCase() : rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ fontSize: 13, color: '#1e293b' }}>{name}</p>
        <p style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</p>
      </div>
      <span className="font-bold flex-shrink-0" style={{ fontSize: 13, color: '#0f172a' }}>{value}</span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────
const I = {
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
    </svg>
  ),
  dollar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  activity: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  database: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  ops: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  trophy: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  heartbeat: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  zap: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  globe: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-9 9h18" />
    </svg>
  ),
};

// ── Insight banner icons ──────────────────────────────────────
function InsightIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    'trend-up': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    'trend-down': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
    alert: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    clock: I.clock,
    inbox: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
      </svg>
    ),
    users: I.users,
    activity: I.activity,
  };
  return <>{icons[icon] ?? icons.alert}</>;
}

// ── Loading skeleton ──────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: '#e9ecef' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 rounded-2xl" style={{ background: '#e9ecef' }} />
        <div className="h-48 rounded-2xl" style={{ background: '#e9ecef' }} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN OWNER DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════════
export function OwnerDashboard() {
  const [data, setData] = useState<OwnerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = () => {
    setLoading(true);
    setError(false);
    reportApi
      .ownerDashboard()
      .then((d) => {
        setData(d);
        setLastRefresh(new Date());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const palette = useMemo(
    () => ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#a855f7'],
    []
  );

  if (loading) return <SkeletonGrid />;

  if (error || !data) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #e9ecef' }}>
        <div style={{ fontSize: 40 }} className="mb-3">⚠️</div>
        <p className="font-semibold text-slate-700">Gagal memuat analitik Owner</p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          Pastikan Anda memiliki akses Owner dan server tersedia
        </p>
        <button
          onClick={load}
          className="mt-5 px-4 py-2 rounded-lg font-medium text-white transition-colors"
          style={{ background: '#6366f1', fontSize: 13 }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const u = data.users;
  const f = data.financial;
  const op = data.operations;
  const sa = data.systemActivity;
  const md = data.masterData;
  const no = data.notifications;
  const dg = data.databaseGrowth;
  const ap = data.approvals;
  const te = data.topEntities;
  const h = data.health;
  const insights = data.insights;

  return (
    <div className="space-y-4">
      {/* ══ Header banner ═════════════════════════════════════ */}
      <div
        className="rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          boxShadow: '0 4px 24px rgba(15,23,42,0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.2)' }}
          >
            <svg className="w-6 h-6" style={{ color: '#818cf8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#818cf8' }}>
              Owner Analytics
            </p>
            <h2 className="text-white font-bold" style={{ fontSize: 17 }}>Platform Overview</h2>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            Diperbarui: {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-white transition-all"
            style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ══ Actionable Insights Banner ════════════════════════ */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.slice(0, 4).map((ins, i) => {
            const colors: Record<string, { bg: string; border: string; icon: string }> = {
              success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669' },
              warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706' },
              danger: { bg: '#fef2f2', border: '#fecaca', icon: '#dc2626' },
              info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb' },
            };
            const c = colors[ins.severity];
            return (
              <div
                key={i}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                <div className="flex-shrink-0" style={{ color: c.icon }}>
                  <InsightIcon icon={ins.icon} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold" style={{ fontSize: 12.5, color: '#1e293b' }}>{ins.title}</p>
                  <p style={{ fontSize: 11.5, color: '#475569', marginTop: 2, lineHeight: 1.4 }}>{ins.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ ROW 1: Primary KPI Cards ══════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard
          label="Total Pengguna"
          value={fmtNum(u.total)}
          sub={`${u.active} aktif`}
          icon={I.users}
          color="#6366f1"
          trendPct={u.newThisMonth > 0 ? (u.newThisMonth / Math.max(u.total - u.newThisMonth, 1)) * 100 : 0}
        />
        <KpiCard
          label="Pendapatan Bulan Ini"
          value={fmtIDR(f.incomeThisMonth)}
          sub="vs bulan lalu"
          icon={I.dollar}
          color="#10b981"
          trendPct={f.incomeChangePct}
        />
        <KpiCard
          label="Pengeluaran"
          value={fmtIDR(f.expenseThisMonth)}
          sub="vs bulan lalu"
          icon={I.dollar}
          color="#ef4444"
          trendPct={f.expenseChangePct}
          invertTrend
        />
        <KpiCard
          label="Laba Bersih"
          value={fmtIDR(f.netThisMonth)}
          sub="vs bulan lalu"
          icon={I.chart}
          color="#6366f1"
          trendPct={f.netChangePct}
        />
        <KpiCard
          label="Total Transaksi"
          value={fmtNum(f.totalTransactions)}
          sub={`${f.pendingApprovals} menunggu`}
          icon={I.activity}
          color="#f59e0b"
        />
        <KpiCard
          label="Sewa Aktif"
          value={fmtNum(op.activeLeases)}
          sub={`${op.expiringLeases} akan berakhir`}
          icon={I.building}
          color="#8b5cf6"
        />
        <KpiCard
          label="Audit Log"
          value={fmtNum(sa.totalAuditLogs)}
          sub={`${sa.logsToday} hari ini`}
          icon={I.shield}
          color="#14b8a6"
        />
        <KpiCard
          label="Persetujuan"
          value={fmtNum(ap.pending)}
          sub={`${ap.approvalRate}% approved`}
          icon={I.check}
          color="#ec4899"
        />
      </div>

      {/* ══ ROW 2: User Engagement KPIs ═══════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="DAU" value={fmtNum(u.dau)} sub="Aktif hari ini" icon={I.activity} color="#3b82f6" />
        <KpiCard label="WAU" value={fmtNum(u.wau)} sub="Aktif minggu ini" icon={I.users} color="#6366f1" />
        <KpiCard label="MAU" value={fmtNum(u.mau)} sub="Aktif bulan ini" icon={I.globe} color="#8b5cf6" />
        <KpiCard
          label="Retensi"
          value={`${u.retentionRate}%`}
          sub={`${u.newToday} baru hari ini`}
          icon={I.heartbeat}
          color="#10b981"
        />
        <KpiCard label="Rata-rata Transaksi" value={fmtIDR(f.avgTransactionValue)} sub="per transaksi approved" icon={I.dollar} color="#f59e0b" />
        <KpiCard
          label="Rasio Pengeluaran"
          value={`${f.expenseRatio}%`}
          sub="dari pendapatan"
          icon={I.chart}
          color={f.expenseRatio > 80 ? '#ef4444' : '#14b8a6'}
        />
      </div>

      {/* ══ ROW 3: Financial + User Growth ═════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Financial Net Trend */}
        <Card title="Tren Keuangan (Net)" subtitle="6 bulan terakhir — pemasukan dikurangi pengeluaran">
          <div className="flex items-end gap-3 mb-3 flex-wrap">
            <span className="font-extrabold" style={{ fontSize: 28, color: f.netThisMonth >= 0 ? '#10b981' : '#ef4444' }}>
              {fmtIDR(f.netThisMonth)}
            </span>
            <TrendBadge pct={f.netChangePct} />
            <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
              YTD: {fmtIDR(f.ytdNet)}
            </span>
          </div>
          <AreaChart points={f.monthlyTrend} color={f.netThisMonth >= 0 ? '#10b981' : '#ef4444'} height={160} />
        </Card>

        {/* User Growth Trend */}
        <Card title="Pertumbuhan Pengguna" subtitle="12 bulan terakhir — pengguna baru per bulan">
          <div className="flex items-end gap-3 mb-3 flex-wrap">
            <span className="font-extrabold" style={{ fontSize: 28, color: '#6366f1' }}>
              {fmtNum(u.total)}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              {u.newThisMonth} baru bulan ini · {u.retentionRate}% retensi
            </span>
          </div>
          <AreaChart points={u.trend} color="#6366f1" height={160} />
        </Card>
      </div>

      {/* ══ ROW 4: User Details + Master Data + Financial Cat ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User composition */}
        <Card title="Komposisi Pengguna" subtitle="Berdasarkan role">
          <DonutChart
            segments={u.byRole.map((r, i) => ({ label: r.role, value: r.count, color: palette[i % palette.length] }))}
            centerValue={fmtNum(u.total)}
            centerLabel="pengguna"
          />
          <div className="mt-4 pt-3 space-y-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
              <span style={{ color: '#475569' }}>Tingkat Aktif</span>
              <span className="font-bold" style={{ color: '#10b981' }}>{u.verifiedRate}%</span>
            </div>
            <ProgressBar value={u.active} max={u.total} color="#10b981" />
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center p-2 rounded-lg" style={{ background: '#f8fafc' }}>
                <p style={{ fontSize: 10, color: '#94a3b8' }}>HARI INI</p>
                <p className="font-bold" style={{ fontSize: 15, color: '#0f172a' }}>{u.newToday}</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: '#f8fafc' }}>
                <p style={{ fontSize: 10, color: '#94a3b8' }}>MINGGU INI</p>
                <p className="font-bold" style={{ fontSize: 15, color: '#0f172a' }}>{u.newThisWeek}</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: '#f8fafc' }}>
                <p style={{ fontSize: 10, color: '#94a3b8' }}>BULAN INI</p>
                <p className="font-bold" style={{ fontSize: 15, color: '#0f172a' }}>{u.newThisMonth}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Master data growth */}
        <Card title="Pertumbuhan Data Master" subtitle="Perubahan vs bulan lalu">
          <div className="space-y-3">
            {[
              { label: 'Pelanggan', data: md.customers, color: '#3b82f6' },
              { label: 'Vendor', data: md.vendors, color: '#f97316' },
              { label: 'Produk', data: md.products, color: '#22c55e' },
              { label: 'Karyawan', data: md.employees, color: '#a855f7' },
              { label: 'Aset', data: md.assets, color: '#64748b' },
              { label: 'Lokasi', data: md.locations, color: '#14b8a6' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span style={{ fontSize: 12, color: '#475569', minWidth: 70 }}>{item.label}</span>
                <span className="font-bold" style={{ fontSize: 14, color: '#0f172a', minWidth: 40 }}>
                  {fmtNum(item.data.current)}
                </span>
                <div className="flex-1">
                  <ProgressBar value={item.data.current} max={md.totalRecords} color={item.color} />
                </div>
                {item.data.change !== 0 && (
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: 11,
                      minWidth: 40,
                      textAlign: 'right',
                      color: item.data.change > 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {item.data.change > 0 ? '+' : ''}{item.data.change}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Financial category breakdown */}
        <Card title="Kategori Keuangan" subtitle="Bulan ini — pemasukan & pengeluaran">
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {f.byCategory.length === 0 ? (
              <p className="text-center py-8" style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada data</p>
            ) : (
              f.byCategory.map((cat, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <span style={{ fontSize: 12, color: '#475569', minWidth: 90 }} className="truncate">{cat.category}</span>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                        <div className="h-full rounded-full" style={{ width: `${(cat.income / (f.incomeThisMonth || 1)) * 100}%`, background: '#10b981' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>{fmtIDR(cat.income)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                        <div className="h-full rounded-full" style={{ width: `${(cat.expense / (f.expenseThisMonth || 1)) * 100}%`, background: '#ef4444' }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>{fmtIDR(cat.expense)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ══ ROW 5: System Activity + Operations ════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System activity trend */}
        <Card title="Aktivitas Sistem" subtitle="14 hari terakhir — total aksi per hari">
          <div className="flex items-end gap-4 mb-3 flex-wrap">
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Minggu ini</p>
              <p className="font-extrabold" style={{ fontSize: 22, color: '#0f172a' }}>{fmtNum(sa.logsThisWeek)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>User aktif</p>
              <p className="font-extrabold" style={{ fontSize: 22, color: '#14b8a6' }}>{fmtNum(sa.uniqueActiveUsersThisWeek)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Jam tersibuk</p>
              <p className="font-extrabold" style={{ fontSize: 22, color: '#f59e0b' }}>
                {sa.peakHour > 0 ? `${String(sa.peakHour).padStart(2, '0')}:00` : '—'}
              </p>
            </div>
          </div>
          <MiniBarChart points={sa.activityTrend} color="#14b8a6" height={100} />
        </Card>

        {/* Operations overview */}
        <Card title="Operasional" subtitle="Aktivitas bisnis berjalan">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Nilai Sewa Aktif</p>
              <p className="font-bold" style={{ fontSize: 18, color: '#0f172a' }}>{fmtIDR(op.totalLeaseValue)}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Rata-rata: {fmtIDR(op.avgLeaseValue)}/sewa</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Pembelian Terbuka</p>
              <p className="font-bold" style={{ fontSize: 18, color: '#0f172a' }}>{fmtNum(op.openPurchases)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Produksi Selesai</p>
              <p className="font-bold" style={{ fontSize: 18, color: '#10b981' }}>{fmtNum(op.completedProductions)}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{op.productionCompletionRate}% completion rate</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Produksi Tertunda</p>
              <p className="font-bold" style={{ fontSize: 18, color: '#f59e0b' }}>{fmtNum(op.pendingProductions)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Pergerakan Stok (Bln)</p>
              <p className="font-bold" style={{ fontSize: 18, color: '#06b6d4' }}>{fmtNum(op.stockMovementsThisMonth)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Gudang Aktif</p>
              <p className="font-bold" style={{ fontSize: 18, color: '#0f172a' }}>{fmtNum(op.warehouses)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ══ ROW 6: Top Entities (4 columns) ════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Top customers */}
        <Card title="Pelanggan Teratas" subtitle="Berdasarkan nilai sewa aktif">
          <div className="space-y-1">
            {te.topCustomersByLease.length === 0 ? (
              <p className="text-center py-6" style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada data</p>
            ) : (
              te.topCustomersByLease.map((c, i) => (
                <RankRow key={i} rank={i + 1} name={c.name} sub={`${c.leases} sewa aktif`} value={fmtIDR(c.value)} color={palette[i]} />
              ))
            )}
          </div>
        </Card>

        {/* Top vendors */}
        <Card title="Vendor Teratas" subtitle="Berdasarkan nilai pembelian">
          <div className="space-y-1">
            {te.topVendorsByPurchase.length === 0 ? (
              <p className="text-center py-6" style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada data</p>
            ) : (
              te.topVendorsByPurchase.map((v, i) => (
                <RankRow key={i} rank={i + 1} name={v.name} sub={`${v.purchases} PO`} value={fmtIDR(v.value)} color={palette[(i + 4) % palette.length]} />
              ))
            )}
          </div>
        </Card>

        {/* Top products */}
        <Card title="Produk Teratas" subtitle="Berdasarkan nilai stok">
          <div className="space-y-1">
            {te.topProductsByStockValue.length === 0 ? (
              <p className="text-center py-6" style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada data</p>
            ) : (
              te.topProductsByStockValue.map((p, i) => (
                <RankRow key={i} rank={i + 1} name={p.name} sub={`${fmtNum(p.quantity)} unit`} value={fmtIDR(p.value)} color={palette[(i + 2) % palette.length]} />
              ))
            )}
          </div>
        </Card>

        {/* Top active users */}
        <Card title="Pengguna Paling Aktif" subtitle="Minggu ini — berdasarkan aksi">
          <div className="space-y-1">
            {te.topUsersByActivity.length === 0 ? (
              <p className="text-center py-6" style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada aktivitas</p>
            ) : (
              te.topUsersByActivity.map((user, i) => (
                <RankRow key={i} rank={i + 1} name={user.name} sub="" value={`${user.actions} aksi`} color={palette[i]} isAvatar />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* ══ ROW 7: Recent Activity + System Health ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity feed */}
        <Card
          title="Aktivitas Terbaru"
          subtitle="8 aksi terakhir di sistem"
          className="lg:col-span-2"
        >
          <div className="space-y-1">
            {te.recentActivity.length === 0 ? (
              <p className="text-center py-6" style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada aktivitas</p>
            ) : (
              te.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #f8fafc' }}>
                  <div
                    className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ width: 32, height: 32, background: '#f1f5f9', color: '#64748b' }}
                  >
                    {I.clock}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, color: '#1e293b' }}>
                      <span className="font-semibold">{a.userName}</span>{' '}
                      <span style={{ color: '#94a3b8' }}>
                        {a.action} {a.entityType}
                      </span>
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{a.module} · {timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System Health */}
        <Card title="Kesehatan Sistem" subtitle="Status & konfigurasi platform">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f8fafc' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>Perusahaan Aktif</span>
              </div>
              <span className="font-bold" style={{ fontSize: 14, color: '#0f172a' }}>{fmtNum(h.activeCompanies)}</span>
            </div>
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f8fafc' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>Role Terdefinisi</span>
              </div>
              <span className="font-bold" style={{ fontSize: 14, color: '#0f172a' }}>{fmtNum(h.rolesCount)}</span>
            </div>
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f8fafc' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#a855f7' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>Permission Rules</span>
              </div>
              <span className="font-bold" style={{ fontSize: 14, color: '#0f172a' }}>{fmtNum(h.permissionsConfigured)}</span>
            </div>
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f8fafc' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#14b8a6' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>Modul Aktif</span>
              </div>
              <span className="font-bold" style={{ fontSize: 14, color: '#0f172a' }}>{fmtNum(h.modulesEnabled)}</span>
            </div>
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f8fafc' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                <span style={{ fontSize: 13, color: '#475569' }}>Notifikasi Unread</span>
              </div>
              <span className="font-bold" style={{ fontSize: 14, color: '#0f172a' }}>{fmtNum(no.unread)}</span>
            </div>
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: 12, color: '#475569' }}>Tingkat Baca Notifikasi</span>
                <span className="font-bold" style={{ fontSize: 12, color: '#10b981' }}>{no.readRate}%</span>
              </div>
              <ProgressBar value={no.total - no.unread} max={no.total || 1} color="#10b981" />
            </div>
          </div>
        </Card>
      </div>

      {/* ══ ROW 8: Operations Trends ═══════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transaction volume trend */}
        <Card title="Volume Transaksi" subtitle="6 bulan terakhir">
          <MiniBarChart points={op.transactionTrend} color="#6366f1" height={110} />
        </Card>

        {/* Production trend */}
        <Card title="Volume Produksi" subtitle="6 bulan terakhir">
          <MiniBarChart points={op.productionTrend} color="#ef4444" height={110} />
        </Card>
      </div>

      {/* ══ ROW 9: Database Growth ═════════════════════════════ */}
      <Card title="Pertumbuhan Database" subtitle={`Total ${fmtNum(dg.totalRows)} record di ${dg.tables.length} tabel`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {dg.tables.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center"
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
            >
              <p className="font-extrabold" style={{ fontSize: 20, color: palette[i % palette.length] }}>
                {fmtNum(t.rows)}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.name}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ ROW 10: Audit Module Breakdown + Approval + Gauges ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Module activity */}
        <Card title="Aktivitas per Modul" subtitle="Distribusi aksi sistem">
          <div className="space-y-2">
            {sa.byModule.slice(0, 6).map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span style={{ fontSize: 12, color: '#475569', minWidth: 100 }} className="truncate">{m.module}</span>
                <div className="flex-1">
                  <ProgressBar value={m.count} max={sa.byModule[0]?.count || 1} color={palette[i % palette.length]} />
                </div>
                <span className="font-semibold" style={{ fontSize: 12, color: '#0f172a', minWidth: 50, textAlign: 'right' }}>
                  {fmtNum(m.count)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Approval workflow */}
        <Card title="Status Persetujuan" subtitle="Ringkasan workflow persetujuan">
          <DonutChart
            segments={[
              { label: 'Disetujui', value: ap.approved, color: '#10b981' },
              { label: 'Menunggu', value: ap.pending, color: '#f59e0b' },
              { label: 'Ditolak', value: ap.rejected, color: '#ef4444' },
            ]}
            centerValue={`${ap.approvalRate}%`}
            centerLabel="approved"
          />
        </Card>

        {/* Performance Gauges */}
        <Card title="Indikator Kinerja" subtitle="Metrik kesehatan operasional">
          <div className="flex items-center justify-around flex-wrap gap-4">
            <RadialGauge value={u.retentionRate} max={100} label="Retensi" color="#10b981" />
            <RadialGauge value={op.productionCompletionRate} max={100} label="Produksi" color="#6366f1" />
            <RadialGauge value={no.readRate} max={100} label="Notifikasi" color="#f59e0b" />
          </div>
          <div className="mt-4 pt-3 grid grid-cols-2 gap-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
              <span style={{ color: '#475569' }}>Success Rate</span>
              <span className="font-bold" style={{ color: '#10b981' }}>{sa.actionSuccessRate}%</span>
            </div>
            <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
              <span style={{ color: '#475569' }}>Izin/Role</span>
              <span className="font-bold" style={{ color: '#0f172a' }}>{h.avgPermissionsPerRole}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}