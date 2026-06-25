// FILE: frontend/src/modules/reporting/pages/ReportListPage.tsx
import { useState, useEffect } from 'react';
import { reportApi, ReportEntity, ReportField, ReportResult } from '@/shared/api/report.api';
import { useAuthStore } from '@/shared/store/auth.store';
import { useCompanyStore } from '@/shared/store/company.store';

// ── Entity metadata ───────────────────────────────────────────
const ENTITY_META: Record<string, { icon: React.ReactNode; bg: string; border: string; dot: string; desc: string }> = {
  customers:    { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>, bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6', desc: 'Data pelanggan aktif dan nonaktif' },
  vendors:      { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>, bg: '#f5f3ff', border: '#ddd6fe', dot: '#7c3aed', desc: 'Data pemasok dan mitra bisnis' },
  products:     { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>, bg: '#ecfeff', border: '#a5f3fc', dot: '#0891b2', desc: 'Produk, bahan baku, dan jasa' },
  employees:    { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, bg: '#fdf4ff', border: '#e9d5ff', dot: '#a855f7', desc: 'Data karyawan dan jabatan' },
  transactions: { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>, bg: '#f0fdf4', border: '#bbf7d0', dot: '#10b981', desc: 'Pemasukan dan pengeluaran' },
  leases:       { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, bg: '#f0fdf4', border: '#bbf7d0', dot: '#059669', desc: 'Kontrak dan sewa unit' },
  purchases:    { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>, bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', desc: 'Purchase order dan pembelian' },
  productions:  { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" /></svg>, bg: '#fff1f2', border: '#fecdd3', dot: '#f43f5e', desc: 'Batch produksi dan proses' },
  warehouses:   { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" /></svg>, bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', desc: 'Data gudang dan lokasi' },
  assets:       { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>, bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8', desc: 'Aset perusahaan dan kondisi' },
};

// ── Status options ────────────────────────────────────────────
const STATUS_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  customers:    [{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }],
  vendors:      [{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }],
  employees:    [{ value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }, { value: 'resigned', label: 'Resign' }],
  transactions: [{ value: 'draft', label: 'Draft' }, { value: 'approved', label: 'Disetujui' }],
  leases:       [{ value: 'active', label: 'Aktif' }, { value: 'completed', label: 'Selesai' }, { value: 'cancelled', label: 'Dibatalkan' }],
  purchases:    [{ value: 'draft', label: 'Draft' }, { value: 'approved', label: 'Disetujui' }, { value: 'received', label: 'Diterima' }],
  productions:  [{ value: 'draft', label: 'Draft' }, { value: 'approved', label: 'Disetujui' }, { value: 'completed', label: 'Selesai' }],
};

// ── Helpers ───────────────────────────────────────────────────
function formatValue(value: unknown, type: string): string {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'boolean') return value ? 'Aktif' : 'Nonaktif';
  if (type === 'date') {
    try { return new Date(value as string).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return String(value); }
  }
  if (type === 'number') {
    const n = typeof value === 'string' ? parseFloat(value) : (value as number);
    return isNaN(n) ? String(value) : n.toLocaleString('id-ID');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function computeTotals(data: Record<string, unknown>[], fields: ReportField[]) {
  return fields
    .filter((f) => f.type === 'number')
    .map((f) => ({
      key: f.key, label: f.label,
      total: data.reduce((s, r) => s + (parseFloat(String(r[f.key] ?? '0')) || 0), 0),
    }));
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    number:  { bg: '#eff6ff', text: '#1d4ed8' },
    date:    { bg: '#f5f3ff', text: '#6d28d9' },
    boolean: { bg: '#f0fdf4', text: '#065f46' },
    string:  { bg: '#f8fafc', text: '#475569' },
  };
  const s = map[type] ?? map.string;
  return (
    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: s.bg, color: s.text, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
      {type}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// PRINT DOCUMENT GENERATOR
// ════════════════════════════════════════════════════════════════
function buildPrintDocument(result: ReportResult, companyName: string, userName: string) {
  const totals  = computeTotals(result.data, result.selectedFields);
  const now     = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const docNo   = `RPT/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;
  const filterLine = [
    result.filters.startDate && `Dari: ${new Date(result.filters.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    result.filters.endDate   && `Sampai: ${new Date(result.filters.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    result.filters.status    && `Status: ${result.filters.status}`,
  ].filter(Boolean).join('  •  ') || 'Semua data tanpa filter';

  const rows = result.data.map((row, i) =>
    `<tr class="${i % 2 === 1 ? 'alt' : ''}">
       <td class="num">${i + 1}</td>
       ${result.selectedFields.map((f) => `<td class="${f.type === 'number' ? 'right' : ''}">${formatValue(row[f.key], f.type)}</td>`).join('')}
     </tr>`
  ).join('');

  const totalRow = totals.length > 0
    ? `<tr class="total-row"><td class="num">—</td>${result.selectedFields.map((f) => {
        const t = totals.find((x) => x.key === f.key);
        return `<td class="${t ? 'right bold' : ''}">${t ? t.total.toLocaleString('id-ID') : ''}</td>`;
      }).join('')}</tr>`
    : '';

  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/>
<title>Laporan ${result.entityLabel} — ${companyName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans','Segoe UI',sans-serif;font-size:11px;color:#1e293b;background:#fff;line-height:1.5}
  .page{padding:36px 44px 48px;max-width:1100px;margin:0 auto}
  .lh{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:18px;border-bottom:2.5px solid #0f172a;margin-bottom:22px}
  .lh-left .co-name{font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.4px}
  .lh-left .co-tag{font-size:9px;color:#94a3b8;letter-spacing:1.2px;text-transform:uppercase;margin-top:3px}
  .lh-right{text-align:right}
  .lh-right .rpt-label{font-size:9px;color:#94a3b8;letter-spacing:1.2px;text-transform:uppercase}
  .lh-right .rpt-title{font-size:15px;font-weight:700;color:#0f172a;margin-top:2px}
  .lh-right .rpt-meta{font-size:9.5px;color:#64748b;margin-top:3px}
  .info-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
  .chip{background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:3px 9px;font-size:9.5px;color:#475569}
  .chip b{color:#0f172a}
  .summary{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
  .sbox{border:1px solid #e2e8f0;border-radius:6px;padding:10px 16px;min-width:130px}
  .sbox.dark{background:#0f172a;border-color:#0f172a}
  .sbox .sl{font-size:8.5px;text-transform:uppercase;letter-spacing:0.7px;color:#94a3b8}
  .sbox .sv{font-size:20px;font-weight:700;color:#0f172a;line-height:1.2;margin-top:2px}
  .sbox.dark .sv{color:#fff}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  thead tr{background:#0f172a}
  thead th{padding:8px 11px;text-align:left;font-size:9px;font-weight:600;color:#cbd5e1;letter-spacing:0.5px;text-transform:uppercase;white-space:nowrap}
  thead th.num{width:32px;color:#475569;text-align:center}
  tbody td{padding:7.5px 11px;font-size:10.5px;color:#334155;border-bottom:1px solid #f1f5f9;vertical-align:top}
  tbody td.num{color:#94a3b8;font-size:9.5px;text-align:center}
  tbody td.right{text-align:right}
  tbody tr.alt td{background:#f8fafc}
  tfoot .total-row td{padding:8px 11px;font-size:10.5px;font-weight:600;color:#0f172a;border-top:2px solid #e2e8f0;background:#f8fafc}
  tfoot .total-row td.right.bold{font-weight:700}
  .doc-footer{display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid #e2e8f0}
  .df-left{font-size:9px;color:#94a3b8;line-height:1.8}
  .sign{text-align:center}
  .sign-box{width:150px;height:52px;border-bottom:1px solid #334155;margin-bottom:4px}
  .sign-name{font-size:9.5px;font-weight:600;color:#334155}
  .sign-role{font-size:8.5px;color:#94a3b8;margin-top:1px}
  @page{size:A4 landscape;margin:0}
  @media print{.page{padding:20px 28px}}
</style></head><body><div class="page">
  <div class="lh">
    <div class="lh-left"><div class="co-name">${companyName}</div><div class="co-tag">Enterprise Resource Planning System</div></div>
    <div class="lh-right"><div class="rpt-label">Dokumen Laporan</div><div class="rpt-title">LAPORAN ${result.entityLabel.toUpperCase()}</div><div class="rpt-meta">No. ${docNo}</div><div class="rpt-meta">Dicetak: ${now}</div></div>
  </div>
  <div class="info-row">
    <div class="chip"><b>Jenis Data:</b> ${result.entityLabel}</div>
    <div class="chip"><b>Total Baris:</b> ${result.totalRows}</div>
    <div class="chip"><b>Kolom:</b> ${result.selectedFields.length} field</div>
    <div class="chip"><b>Filter:</b> ${filterLine}</div>
  </div>
  <div class="summary">
    <div class="sbox dark"><div class="sl">Total Data</div><div class="sv">${result.totalRows}</div></div>
    ${totals.map((t) => `<div class="sbox"><div class="sl">Total ${t.label}</div><div class="sv">${t.total.toLocaleString('id-ID')}</div></div>`).join('')}
  </div>
  <table>
    <thead><tr><th class="num">#</th>${result.selectedFields.map((f) => `<th>${f.label}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>${totalRow}</tfoot>
  </table>
  <div class="doc-footer">
    <div class="df-left"><div style="font-weight:600;color:#334155;font-size:10px;">${companyName}</div><div>Dicetak oleh: ${userName} · ${now}</div><div>Dokumen ini digenerate secara otomatis oleh sistem ERP. Sah tanpa tanda tangan jika dikirim secara elektronik.</div></div>
    <div class="sign"><div class="sign-box"></div><div class="sign-name">${userName}</div><div class="sign-role">Dibuat Oleh</div></div>
  </div>
</div></body></html>`;
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export const ReportListPage = () => {
  const { user }                           = useAuthStore();
  const { activeCompany }                  = useCompanyStore();
  const companyName = activeCompany?.name  ?? 'PT Nexora Indonesia';
  const userName    = user?.name           ?? 'Administrator';

  const [entities,        setEntities]        = useState<ReportEntity[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [selectedEntity,  setSelectedEntity]  = useState<ReportEntity | null>(null);
  const [selectedFields,  setSelectedFields]  = useState<string[]>([]);
  const [startDate,       setStartDate]       = useState('');
  const [endDate,         setEndDate]         = useState('');
  const [statusFilter,    setStatusFilter]    = useState('');
  const [generating,      setGenerating]      = useState(false);
  const [result,          setResult]          = useState<ReportResult | null>(null);
  const [error,           setError]           = useState<string | null>(null);

  const step = !selectedEntity ? 1 : result ? 3 : 2;

  useEffect(() => {
    reportApi.getEntities()
      .then(setEntities)
      .catch(() => setError('Gagal memuat daftar laporan. Periksa koneksi server.'))
      .finally(() => setLoadingEntities(false));
  }, []);

  const handleSelectEntity = (entity: ReportEntity) => {
    setSelectedEntity(entity);
    setSelectedFields(entity.fields.map((f) => f.key));
    setResult(null); setError(null); setStatusFilter('');
  };

  const toggleField = (key: string) =>
    setSelectedFields((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key]);

  const moveField = (key: string, dir: 'up' | 'down') => {
    setSelectedFields((p) => {
      const i = p.indexOf(key); if (i === -1) return p;
      const n = [...p]; const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]]; return n;
    });
  };

  const handleGenerate = async () => {
    if (!selectedEntity || selectedFields.length === 0) return;
    try {
      setGenerating(true); setError(null);
      const data = await reportApi.generate({ entity: selectedEntity.key, fields: selectedFields, startDate: startDate || undefined, endDate: endDate || undefined, status: statusFilter || undefined });
      setResult(data);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message ?? 'Gagal membuat laporan. Periksa koneksi server.';
      setError(message);
    } finally { setGenerating(false); }
  };

  const handlePrint = () => {
    if (!result) return;
    const html = buildPrintDocument(result, companyName, userName);
    const win  = window.open('', '_blank');
    if (!win) return;
    win.document.write(html); win.document.close(); win.focus();
    setTimeout(() => { win.print(); win.close(); }, 700);
  };

  const orderedFields: ReportField[] = selectedFields
    .map((k) => selectedEntity?.fields.find((f) => f.key === k))
    .filter(Boolean) as ReportField[];

  const totals = result ? computeTotals(result.data, result.selectedFields) : [];

  // ── Loading ────────────────────────────────────────────────
  if (loadingEntities) {
    return (
      <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
          <div className="px-6 md:px-8 py-5 animate-pulse flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: 100, height: 15, background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ width: 180, height: 11, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl" style={{ height: 110, border: '1px solid #e9ecef' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f4f6f9', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e9ecef' }}>
        <div className="px-6 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">

            {/* Left: icon + title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: '0 4px 12px rgba(15,23,42,0.28)' }}>
                <svg width={17} height={17} className="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-slate-900" style={{ fontSize: 17, lineHeight: 1.2 }}>Laporan</h1>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Buat laporan kustom dari semua modul data sistem</p>
              </div>
            </div>

            {/* Right: step 3 actions */}
            {step === 3 && result && (
              <div className="flex items-center gap-2">
                <button onClick={() => setResult(null)}
                  className="flex items-center gap-1.5"
                  style={{ padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  Ubah Konfigurasi
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 text-white font-semibold"
                  style={{ padding: '7px 16px', fontSize: 13, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: '0 4px 14px rgba(15,23,42,0.3)', cursor: 'pointer', fontFamily: 'inherit', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(15,23,42,0.42)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(15,23,42,0.3)'}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Cetak / Simpan PDF
                </button>
              </div>
            )}
          </div>

          {/* ── Step indicator ────────────────────────────── */}
          <div className="flex items-center gap-0 mt-5" style={{ marginLeft: 52 }}>
            {[
              { n: 1, label: 'Pilih Jenis Data' },
              { n: 2, label: 'Konfigurasi Kolom' },
              { n: 3, label: 'Preview & Cetak' },
            ].map(({ n, label }, i) => {
              const done = step > n; const active = step === n;
              return (
                <div key={n} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                      ...(done   ? { background: '#10b981', color: '#fff' }
                        : active ? { background: '#0f172a', color: '#fff', boxShadow: '0 0 0 4px rgba(15,23,42,0.1)' }
                                 : { background: '#f1f5f9', color: '#94a3b8' }),
                    }}>
                      {done ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : n}
                    </div>
                    <span className="hidden sm:block" style={{ fontSize: 12, fontWeight: 500, transition: 'color 0.2s', color: active ? '#0f172a' : done ? '#10b981' : '#94a3b8' }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ width: 60, height: 1, margin: '0 12px', background: step > n ? '#bbf7d0' : '#e2e8f0', transition: 'background 0.2s' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6">

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl"
            style={{ padding: '12px 16px', background: '#fff1f2', border: '1px solid #fecdd3', fontSize: 13, color: '#991b1b' }}>
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* ══ STEP 1: Pilih Entity ════════════════════════ */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 16 }}>
              Pilih jenis data laporan
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {entities.map((entity) => {
                const meta = ENTITY_META[entity.key] ?? { icon: null, bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8', desc: '' };
                return (
                  <button key={entity.key} onClick={() => handleSelectEntity(entity)}
                    className="group text-left transition-all duration-150"
                    style={{ padding: 16, background: '#ffffff', border: `1.5px solid ${meta.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = '1.5px solid #0f172a'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = `1.5px solid ${meta.border}`; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, border: `1px solid ${meta.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: meta.dot }}>
                      {meta.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{entity.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {meta.desc}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 10.5, fontWeight: 600, color: '#94a3b8' }}>{entity.fields.length} kolom</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STEP 2: Kolom + Filter ══════════════════════ */}
        {step === 2 && selectedEntity && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Field selector */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div className="flex items-center gap-2.5">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: (ENTITY_META[selectedEntity.key]?.bg ?? '#f8fafc'), border: `1px solid ${ENTITY_META[selectedEntity.key]?.border ?? '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ENTITY_META[selectedEntity.key]?.dot ?? '#94a3b8' }}>
                      {ENTITY_META[selectedEntity.key]?.icon}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Pilih Kolom Laporan</h2>
                      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{selectedEntity.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-3" style={{ fontSize: 12 }}>
                    <button onClick={() => setSelectedFields(selectedEntity.fields.map((f) => f.key))}
                      style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                      Pilih Semua
                    </button>
                    <span style={{ color: '#e2e8f0' }}>|</span>
                    <button onClick={() => setSelectedFields([])}
                      style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                      Reset
                    </button>
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {selectedEntity.fields.map((field) => {
                    const checked = selectedFields.includes(field.key);
                    const idx     = selectedFields.indexOf(field.key);
                    return (
                      <div key={field.key} onClick={() => toggleField(field.key)}
                        className="flex items-center gap-3.5 cursor-pointer select-none"
                        style={{ padding: '11px 20px', borderBottom: '1px solid #f8fafc', background: checked ? '#fafafa' : '#ffffff', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = checked ? '#fafafa' : '#ffffff')}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: checked ? 'none' : '1.5px solid #cbd5e1', background: checked ? '#0f172a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                          {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{field.label}</span>
                          <TypeBadge type={field.type} />
                        </div>
                        {checked && (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span style={{ width: 18, height: 18, background: '#0f172a', color: '#fff', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{idx + 1}</span>
                            <button type="button" onClick={() => moveField(field.key, 'up')} disabled={idx === 0}
                              style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, borderRadius: 4 }}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button type="button" onClick={() => moveField(field.key, 'down')} disabled={idx === selectedFields.length - 1}
                              style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: 'none', border: 'none', cursor: idx === selectedFields.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === selectedFields.length - 1 ? 0.3 : 1, borderRadius: 4 }}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '10px 20px', background: '#f8fafc' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>
                    <strong style={{ color: '#475569' }}>{selectedFields.length}</strong> dari {selectedEntity.fields.length} kolom dipilih
                    &nbsp;·&nbsp; Gunakan ▲▼ untuk mengatur urutan kolom
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Filter */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>Filter Data</span>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'start-date', label: 'Tanggal Mulai', type: 'date', value: startDate, onChange: setStartDate },
                    { id: 'end-date',   label: 'Tanggal Selesai', type: 'date', value: endDate,   onChange: setEndDate },
                  ].map(({ id, label, type, value, onChange }) => (
                    <div key={id}>
                      <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>{label}</label>
                      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: '#1e293b', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#0f172a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)'; }}
                        onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}
                  {STATUS_OPTIONS[selectedEntity.key] && (
                    <div>
                      <label htmlFor="status-filter" style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#64748b', marginBottom: 6 }}>Status</label>
                      <div className="relative">
                        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                          style={{ width: '100%', padding: '8px 32px 8px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#ffffff', color: statusFilter ? '#1e293b' : '#94a3b8', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = '#0f172a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.08)'; }}
                          onBlur={(e)  => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                          <option value="">Semua Status</option>
                          {STATUS_OPTIONS[selectedEntity.key].map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Column order preview */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#94a3b8' }}>Urutan Kolom</span>
                </div>
                <div style={{ padding: 16 }}>
                  {orderedFields.length === 0 ? (
                    <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>Belum ada kolom dipilih</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {orderedFields.map((f, i) => (
                        <div key={f.key} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                          <span style={{ width: 16, height: 16, background: '#f1f5f9', color: '#475569', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ flex: 1, fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                          <TypeBadge type={f.type} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={handleGenerate} disabled={generating || selectedFields.length === 0}
                  className="w-full flex items-center justify-center gap-2 font-semibold text-white"
                  style={{ padding: '10px 16px', fontSize: 13.5, borderRadius: 9, border: 'none', background: generating || selectedFields.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: generating || selectedFields.length === 0 ? 'none' : '0 4px 14px rgba(15,23,42,0.3)', cursor: generating || selectedFields.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={(e) => { if (!generating && selectedFields.length > 0) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(15,23,42,0.42)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = generating || selectedFields.length === 0 ? 'none' : '0 4px 14px rgba(15,23,42,0.3)'; }}>
                  {generating ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Memproses...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Generate Laporan</>
                  )}
                </button>
                <button onClick={() => { setSelectedEntity(null); setResult(null); }}
                  style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#ffffff'}>
                  ← Ganti Jenis Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Preview ═════════════════════════════ */}
        {step === 3 && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: '0 4px 14px rgba(15,23,42,0.25)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Total Data</p>
                <p style={{ fontSize: 32, fontWeight: 800, marginTop: 4, lineHeight: 1 }}>{result.totalRows}</p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{result.entityLabel}</p>
              </div>
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Kolom</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 4, lineHeight: 1 }}>{result.selectedFields.length}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>field ditampilkan</p>
              </div>
              {totals.slice(0, 2).map((t) => (
                <div key={t.key} className="bg-white rounded-xl p-4" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Total {t.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.total.toLocaleString('id-ID')}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>akumulasi</p>
                </div>
              ))}
            </div>

            {/* Report table */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e9ecef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Letterhead */}
              <div style={{ background: '#0f172a', padding: '16px 24px' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>Dokumen Laporan</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>Laporan {result.entityLabel}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{companyName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11.5, color: '#64748b' }}>
                      {new Date(result.generatedAt).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p style={{ fontSize: 10.5, color: '#475569', marginTop: 3 }}>Dibuat oleh: {userName}</p>
                  </div>
                </div>
              </div>

              {/* Active filters */}
              <div className="flex items-center gap-2 flex-wrap" style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginRight: 4 }}>Filter:</span>
                {[
                  result.filters.startDate && `Dari: ${new Date(result.filters.startDate).toLocaleDateString('id-ID')}`,
                  result.filters.endDate   && `Sampai: ${new Date(result.filters.endDate).toLocaleDateString('id-ID')}`,
                  result.filters.status    && `Status: ${result.filters.status}`,
                ].filter(Boolean).map((f, i) => (
                  <span key={i} style={{ fontSize: 11, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', color: '#475569' }}>{f}</span>
                ))}
                {!result.filters.startDate && !result.filters.endDate && !result.filters.status && (
                  <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Semua data tanpa filter</span>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {result.data.length === 0 ? (
                  <div className="text-center py-16">
                    <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Tidak ada data ditemukan</p>
                    <p style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 6 }}>Coba ubah filter atau rentang tanggal</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', background: '#f8fafc', width: 40 }}>#</th>
                        {result.selectedFields.map((field) => (
                          <th key={field.key} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', background: '#f8fafc', whiteSpace: 'nowrap' }}>
                            {field.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', background: idx % 2 === 1 ? '#fafafa' : '#ffffff', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 1 ? '#fafafa' : '#ffffff')}>
                          <td style={{ padding: '10px 16px', fontSize: 10.5, color: '#cbd5e1', fontFamily: 'ui-monospace, monospace' }}>
                            {String(idx + 1).padStart(3, '0')}
                          </td>
                          {result.selectedFields.map((field) => {
                            const raw = row[field.key];
                            const fmt = formatValue(raw, field.type);
                            return (
                              <td key={field.key} style={{ padding: '10px 16px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>
                                {field.type === 'boolean' ? (
                                  <span className="inline-flex items-center gap-1.5"
                                    style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99, ...(raw ? { background: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' } : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }) }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: raw ? '#10b981' : '#94a3b8' }} />{fmt}
                                  </span>
                                ) : field.type === 'number' ? (
                                  <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: '#0f172a' }}>{fmt}</span>
                                ) : field.type === 'date' ? (
                                  <span style={{ fontSize: 12.5, color: '#64748b' }}>{fmt}</span>
                                ) : <span>{fmt}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                    {totals.length > 0 && (
                      <tfoot>
                        <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
                          <td style={{ padding: '10px 16px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Total</td>
                          {result.selectedFields.map((field) => {
                            const t = totals.find((x) => x.key === field.key);
                            return (
                              <td key={field.key} style={{ padding: '10px 16px' }}>
                                {t && <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>{t.total.toLocaleString('id-ID')}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}
              </div>

              {result.data.length > 0 && (
                <div className="flex items-center justify-between" style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>
                    Menampilkan <strong style={{ color: '#475569' }}>{result.totalRows}</strong> baris · {result.selectedFields.length} kolom
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>{companyName}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};