// =============================================================================
// prisma/seed.ts — NEXORA ERP · Multi-Tenant Seed
// Konsep:
//   - Tidak ada Super Admin global
//   - Semua data berbasis Company (multi-tenant)
//   - Owner mendapat SEMUA permission di company-nya
//   - Role lain mendapat permission sesuai konfigurasi yang dibuat owner
//   - Setiap company punya role & permission setup sendiri
// =============================================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const randInt  = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDec  = (min: number, max: number, d = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(d));
const randDate = (a: Date, b: Date) => new Date(a.getTime() + Math.random() * (b.getTime() - a.getTime()));
const randPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pad      = (n: number, len: number) => String(n).padStart(len, '0');
const phone    = () => `08${randInt(100000000, 999999999)}`;

const Y2018 = new Date('2018-01-01');
const Y2022 = new Date('2022-01-01');
const Y2023 = new Date('2023-01-01');
const Y2024 = new Date('2024-01-01');
const Y2025 = new Date('2025-01-01');
const NOW   = new Date();

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🌱  NEXORA ERP — Multi-Tenant Database Seed\n');

  // ───────────────────────────────────────────────────────────────────────────
  // 0. CLEANUP
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🧹  Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.document.deleteMany();
  await prisma.taggable.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.operationActivity.deleteMany();
  await prisma.operationPoint.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.productionItem.deleteMany();
  await prisma.production.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.location.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.codeConfig.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.companyUser.deleteMany();
  await prisma.role.deleteMany();
  await prisma.companyModule.deleteMany();
  await prisma.module.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  console.log('   ✓ done\n');

  // ───────────────────────────────────────────────────────────────────────────
  // 1. MODULES & PERMISSIONS (global — tidak terikat company)
  //    Ini adalah katalog sistem, bukan milik company manapun
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📦  Seeding modules & permissions...');

  // permPrefix = prefix string yang dipakai untuk membentuk kode permission
  // Kode permission dibentuk: `${permPrefix}.${action}` (mis. "data.customer.view")
  // Catatan: format ini HARUS sama dengan PERMISSIONS constant di backend & frontend.
  // OPS_WAREHOUSE menghasilkan dua prefix (warehouse + stock) karena modul stok
  // tidak punya module tersendiri namun punya permission sendiri (operations.stock.*).
  const moduleDefs = [
    // CORE
    { code: 'CORE_USERS',        permPrefixes: ['core.user'],         name: 'User Management',    layer: 'core',       description: 'Manajemen pengguna sistem' },
    { code: 'CORE_COMPANIES',    permPrefixes: ['core.company'],      name: 'Company Management', layer: 'core',       description: 'Manajemen data perusahaan' },
    { code: 'CORE_ROLES',        permPrefixes: ['core.role'],         name: 'Role & Permission',  layer: 'core',       description: 'Manajemen role dan hak akses' },
    { code: 'CORE_CODECONFIGS',  permPrefixes: ['core.code'],         name: 'Code Configuration', layer: 'core',       description: 'Konfigurasi kode otomatis' },
    // DATA
    { code: 'DATA_CUSTOMERS',    permPrefixes: ['data.customer'],     name: 'Customer',           layer: 'data',       description: 'Manajemen data pelanggan' },
    { code: 'DATA_VENDORS',      permPrefixes: ['data.vendor'],       name: 'Vendor & Supplier',  layer: 'data',       description: 'Manajemen vendor dan supplier' },
    { code: 'DATA_PRODUCTS',     permPrefixes: ['data.product'],      name: 'Produk & Katalog',   layer: 'data',       description: 'Manajemen produk dan katalog' },
    { code: 'DATA_ASSETS',       permPrefixes: ['data.asset'],        name: 'Asset Management',   layer: 'data',       description: 'Manajemen aset perusahaan' },
    { code: 'DATA_LOCATIONS',    permPrefixes: ['data.location'],     name: 'Lokasi & Cabang',    layer: 'data',       description: 'Manajemen lokasi dan cabang' },
    { code: 'DATA_EMPLOYEES',    permPrefixes: ['data.employee'],     name: 'Karyawan & HRD',     layer: 'data',       description: 'Manajemen data karyawan' },
    // OPERATIONS
    { code: 'OPS_WAREHOUSE',     permPrefixes: ['operations.warehouse', 'operations.stock'], name: 'Gudang & Stok', layer: 'operations', description: 'Manajemen gudang dan stok barang' },
    { code: 'OPS_PRODUCTION',    permPrefixes: ['operations.production'],   name: 'Produksi',           layer: 'operations', description: 'Manajemen proses produksi' },
    { code: 'OPS_TRANSACTIONS',  permPrefixes: ['operations.transaction'],  name: 'Transaksi Keuangan', layer: 'operations', description: 'Transaksi pemasukan dan pengeluaran' },
    { code: 'OPS_PURCHASES',     permPrefixes: ['operations.purchase'],     name: 'Purchase Order',     layer: 'operations', description: 'Manajemen pembelian dan PO' },
    { code: 'OPS_LEASES',        permPrefixes: ['operations.lease'],        name: 'Manajemen Sewa',     layer: 'operations', description: 'Manajemen kontrak sewa properti' },
    { code: 'OPS_OPERATIONS',    permPrefixes: ['operations.point'],        name: 'Titik Operasional',  layer: 'operations', description: 'Manajemen cabang dan outlet' },
    // SUPPORT
    { code: 'SUP_DOCUMENTS',     permPrefixes: ['support.document'],       name: 'Dokumen',            layer: 'support',    description: 'Manajemen dokumen dan lampiran' },
    { code: 'SUP_APPROVALS',     permPrefixes: ['support.approval'],       name: 'Approval Workflow',  layer: 'support',    description: 'Alur persetujuan dokumen' },
    { code: 'SUP_NOTIFICATIONS', permPrefixes: ['support.notification'],   name: 'Notifikasi',         layer: 'support',    description: 'Pusat notifikasi sistem' },
    { code: 'SUP_AUDIT',         permPrefixes: ['core.audit'],             name: 'Audit Trail',        layer: 'support',    description: 'Log jejak audit sistem' },
    // REPORTING — semua dilaporkan via permission reporting.report.*
    { code: 'RPT_FINANCE',       permPrefixes: ['reporting.report'],       name: 'Laporan Keuangan',   layer: 'reporting',  description: 'Laporan keuangan dan analitik' },
    { code: 'RPT_INVENTORY',     permPrefixes: ['reporting.report'],       name: 'Laporan Inventaris', layer: 'reporting',  description: 'Laporan stok dan inventaris' },
    { code: 'RPT_HR',            permPrefixes: ['reporting.report'],       name: 'Laporan SDM',        layer: 'reporting',  description: 'Laporan sumber daya manusia' },
    { code: 'RPT_SALES',         permPrefixes: ['reporting.report'],       name: 'Laporan Penjualan',  layer: 'reporting',  description: 'Laporan penjualan dan revenue' },
  ];

  await prisma.module.createMany({ data: moduleDefs.map(({ permPrefixes: _pp, ...d }) => ({ id: uuid(), ...d })) });
  const allModules = await prisma.module.findMany();

  // Semua aksi yang tersedia
  const ALL_ACTIONS = ['view', 'create', 'edit', 'delete', 'approve'];

  // Build module-code → permission-prefix mapping for correct dotted codes
  const modulePermPrefixMap = new Map(moduleDefs.map(d => [d.code, d.permPrefixes]));

  // Catatan: Beberapa modul SENGAJA berbagi prefix permission yang sama
  // (mis. semua modul RPT_* → "reporting.report.*"). Karena Permission.code
  // bersifat unik secara global, kita harus MENGHILANGKAN duplikat berdasarkan
  // `code`. Permission yang dibagikan tetap melekat pada satu modul (yang
  // pertama ditemui), dan resolver getPerms() melakukan pencocokan berbasis
  // prefix sehingga semua referensi RPT_* tetap terhubung dengan benar.
  const permSeedMap = new Map<string, { id: string; moduleId: string; action: string; code: string; description: string }>();
  for (const m of allModules) {
    const prefixes = modulePermPrefixMap.get(m.code) ?? [m.code.toLowerCase()];
    for (const prefix of prefixes) {
      for (const a of ALL_ACTIONS) {
        const code = `${prefix}.${a}`;
        if (permSeedMap.has(code)) continue; // prefix dibagikan → simpan yang pertama
        permSeedMap.set(code, {
          id:          uuid(),
          moduleId:    m.id,
          action:      a,
          code,
          description: `Dapat ${a} pada modul ${m.name}`,
        });
      }
    }
  }
  const permSeedRows = Array.from(permSeedMap.values());
  await prisma.permission.createMany({ data: permSeedRows });
  const allPermissions = await prisma.permission.findMany();
  console.log(`   ✓ ${allModules.length} modules, ${allPermissions.length} permissions`);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. USERS — semua adalah user biasa, tidak ada "super admin" global
  //    Akun dibuat per peran di masing-masing company
  // ───────────────────────────────────────────────────────────────────────────
  console.log('👤  Seeding users...');
  const pwd = await bcrypt.hash('Password123!', 10);

  // Owner setiap company
  const [uOwnerMBS, uOwnerKMD, uOwnerNPG, uOwnerSRF] = await Promise.all([
    prisma.user.create({ data: { id: uuid(), name: 'Budi Hartono',       email: 'budi.hartono@nexora.id',      password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Sari Dewi Kusuma',   email: 'sari.dewi@nexora.id',         password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Agus Wibowo',        email: 'agus.wibowo@nexora.id',       password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Rina Marlina',       email: 'rina.marlina@nexora.id',      password: pwd, isActive: true } }),
  ]);

  // Admin setiap company (ditunjuk owner)
  const [uAdminMBS, uAdminKMD, uAdminNPG, uAdminSRF] = await Promise.all([
    prisma.user.create({ data: { id: uuid(), name: 'Andi Prasetyo',      email: 'andi.prasetyo@nexora.id',     password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Nina Kurniawati',    email: 'nina.kurniawati@nexora.id',   password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Deni Setiawan',      email: 'deni.setiawan@nexora.id',     password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Maya Fitriani',      email: 'maya.fitriani@nexora.id',     password: pwd, isActive: true } }),
  ]);

  // Kepala divisi (satu per company, diberi role Finance / Sales / Legal / Production)
  const [uHeadMBS, uHeadKMD, uHeadNPG, uHeadSRF] = await Promise.all([
    prisma.user.create({ data: { id: uuid(), name: 'Hendra Wijaya',      email: 'hendra.wijaya@nexora.id',     password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Ratna Sari',         email: 'ratna.sari@nexora.id',        password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Fajar Nugroho',      email: 'fajar.nugroho@nexora.id',     password: pwd, isActive: true } }),
    prisma.user.create({ data: { id: uuid(), name: 'Wulan Permatasari',  email: 'wulan.permatasari@nexora.id', password: pwd, isActive: true } }),
  ]);

  // Staff karyawan biasa (32 orang, didistribusikan ke 4 company)
  const staffDefs: [string, string][] = [
    ['Joko Santoso',     'joko.santoso'],     ['Dewi Lestari',     'dewi.lestari'],
    ['Reza Firmansyah',  'reza.firmansyah'],  ['Fitri Handayani',  'fitri.handayani'],
    ['Wahyu Setiawan',   'wahyu.setiawan'],   ['Kartika Putri',    'kartika.putri'],
    ['Irfan Hakim',      'irfan.hakim'],      ['Layla Fitriani',   'layla.fitriani'],
    ['Gunawan Tri',      'gunawan.tri'],      ['Mira Oktavia',     'mira.oktavia'],
    ['Bambang Susilo',   'bambang.susilo'],   ['Citra Anggraini',  'citra.anggraini'],
    ['Eko Prasetyo',     'eko.prasetyo'],     ['Farida Hanum',     'farida.hanum'],
    ['Johan Pratama',    'johan.pratama'],    ['Silvy Arinda',     'silvy.arinda'],
    ['Teguh Santosa',    'teguh.santosa'],    ['Ulfa Wulandari',   'ulfa.wulandari'],
    ['Nanda Prayoga',    'nanda.prayoga'],    ['Qori Ananda',      'qori.ananda'],
    ['Marco Satria',     'marco.satria'],     ['Intan Permata',    'intan.permata'],
    ['Hafiz Mubarok',    'hafiz.mubarok'],    ['Grace Natalia',    'grace.natalia'],
    ['Edwin Hartanto',   'edwin.hartanto'],   ['Dinda Safira',     'dinda.safira'],
    ['Bintang Ramadhan', 'bintang.ramadhan'], ['Aisyah Putri',     'aisyah.putri'],
    ['Zainal Abidin',    'zainal.abidin'],    ['Yuli Susanti',     'yuli.susanti'],
    ['Vino Kusuma',      'vino.kusuma'],      ['Taufik Hidayat',   'taufik.hidayat'],
  ];

  await prisma.user.createMany({
    data: staffDefs.map(([name, slug]) => ({
      id: uuid(), name, email: `${slug}@nexora.id`, password: pwd, isActive: true,
    })),
  });

  const allUsers   = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  const staffUsers = allUsers.slice(12); // setelah 4 owner + 4 admin + 4 head
  console.log(`   ✓ ${allUsers.length} users`);

  // ───────────────────────────────────────────────────────────────────────────
  // 3. COMPANIES
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🏢  Seeding companies...');

  const [c1, c2, c3, c4] = await Promise.all([
    prisma.company.create({ data: { id: uuid(), name: 'PT Maju Bersama Sejahtera',   industryType: 'Manufacturing',    isActive: true, createdBy: uOwnerMBS.id } }),
    prisma.company.create({ data: { id: uuid(), name: 'CV Karya Mandiri Digital',    industryType: 'Trading & Retail', isActive: true, createdBy: uOwnerKMD.id } }),
    prisma.company.create({ data: { id: uuid(), name: 'PT Nusantara Property Group', industryType: 'Real Estate',      isActive: true, createdBy: uOwnerNPG.id } }),
    prisma.company.create({ data: { id: uuid(), name: 'UD Sumber Rejeki Food',       industryType: 'Food & Beverage',  isActive: true, createdBy: uOwnerSRF.id } }),
  ]);
  const companies = [c1, c2, c3, c4];
  const ownerMap  = new Map([
    [c1.id, uOwnerMBS], [c2.id, uOwnerKMD],
    [c3.id, uOwnerNPG], [c4.id, uOwnerSRF],
  ]);
  console.log(`   ✓ ${companies.length} companies`);

  // Aktifkan semua modul untuk semua company
  await prisma.companyModule.createMany({
    data: companies.flatMap(co =>
      allModules.map(m => ({ id: uuid(), companyId: co.id, moduleId: m.id, isActive: true }))
    ),
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ROLES PER COMPANY
  //    Setiap company punya role-nya sendiri yang dibuat oleh owner
  //    Role "Owner" adalah default & mendapat SEMUA permission
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🎭  Seeding roles per company...');

  // Role structure per industry (owner yang merancang, maka beda-beda)
  const roleDefsByCompany: Record<string, { name: string; isDefault: boolean; desc: string }[]> = {
    // PT Maju Bersama Sejahtera — Manufacturing
    [c1.id]: [
      { name: 'Owner',          isDefault: true,  desc: 'Pemilik perusahaan — akses penuh ke semua fitur' },
      { name: 'Administrator',  isDefault: false, desc: 'Admin IT & sistem ERP perusahaan' },
      { name: 'Manajer Pabrik', isDefault: false, desc: 'Kepala operasional pabrik dan produksi' },
      { name: 'Finance',        isDefault: false, desc: 'Staf keuangan, akuntansi, dan pajak' },
      { name: 'Gudang',         isDefault: false, desc: 'Kepala gudang bahan baku dan produk jadi' },
      { name: 'Purchasing',     isDefault: false, desc: 'Staf pembelian bahan baku dan material' },
      { name: 'Produksi',       isDefault: false, desc: 'Staf operasional lantai produksi' },
      { name: 'Sales & Marketing', isDefault: false, desc: 'Tim penjualan dan pemasaran produk' },
      { name: 'HRD',            isDefault: false, desc: 'Manajemen sumber daya manusia' },
      { name: 'Viewer',         isDefault: false, desc: 'Hanya bisa melihat data, tidak bisa edit' },
    ],
    // CV Karya Mandiri Digital — Trading & Retail
    [c2.id]: [
      { name: 'Owner',          isDefault: true,  desc: 'Pemilik perusahaan — akses penuh ke semua fitur' },
      { name: 'Administrator',  isDefault: false, desc: 'Admin operasional toko dan sistem' },
      { name: 'Kepala Toko',    isDefault: false, desc: 'Manajer toko dan operasional outlet' },
      { name: 'Kasir',          isDefault: false, desc: 'Staf kasir dan transaksi penjualan' },
      { name: 'Stok & Gudang',  isDefault: false, desc: 'Pengelolaan stok dan gudang barang' },
      { name: 'Purchasing',     isDefault: false, desc: 'Pembelian dan pengadaan barang dagangan' },
      { name: 'Sales Online',   isDefault: false, desc: 'Tim penjualan online dan marketplace' },
      { name: 'Finance',        isDefault: false, desc: 'Laporan keuangan dan pembukuan' },
      { name: 'Viewer',         isDefault: false, desc: 'Hanya bisa melihat data, tidak bisa edit' },
    ],
    // PT Nusantara Property Group — Real Estate
    [c3.id]: [
      { name: 'Owner',          isDefault: true,  desc: 'Pemilik perusahaan — akses penuh ke semua fitur' },
      { name: 'Direktur',       isDefault: false, desc: 'Direktur operasional dan pengembangan bisnis' },
      { name: 'Finance & Akuntansi', isDefault: false, desc: 'Keuangan, akuntansi, dan perpajakan' },
      { name: 'Legal & Notaris', isDefault: false, desc: 'Urusan hukum, PPJB, dan sertifikasi' },
      { name: 'Agen Properti',  isDefault: false, desc: 'Agen penjualan dan penyewaan properti' },
      { name: 'Marketing',      isDefault: false, desc: 'Tim pemasaran digital dan konvensional' },
      { name: 'Property Manager', isDefault: false, desc: 'Pengelolaan unit dan kontrak sewa' },
      { name: 'Admin Umum',     isDefault: false, desc: 'Administrasi umum dan dukungan operasional' },
      { name: 'Viewer',         isDefault: false, desc: 'Hanya bisa melihat data, tidak bisa edit' },
    ],
    // UD Sumber Rejeki Food — Food & Beverage
    [c4.id]: [
      { name: 'Owner',          isDefault: true,  desc: 'Pemilik perusahaan — akses penuh ke semua fitur' },
      { name: 'Manajer Operasional', isDefault: false, desc: 'Kepala operasional produksi dan distribusi' },
      { name: 'Finance',        isDefault: false, desc: 'Keuangan, kas, dan pembukuan' },
      { name: 'Kepala Produksi', isDefault: false, desc: 'Kepala dapur dan kualitas produksi' },
      { name: 'Staf Produksi',  isDefault: false, desc: 'Pekerja dapur dan produksi harian' },
      { name: 'Gudang & Logistik', isDefault: false, desc: 'Pengelolaan stok bahan baku dan pengiriman' },
      { name: 'Sales & Outlet', isDefault: false, desc: 'Tim penjualan outlet dan B2B' },
      { name: 'QC & BPOM',      isDefault: false, desc: 'Quality control dan kepatuhan regulasi pangan' },
      { name: 'Viewer',         isDefault: false, desc: 'Hanya bisa melihat data, tidak bisa edit' },
    ],
  };

  await prisma.role.createMany({
    data: companies.flatMap(co =>
      roleDefsByCompany[co.id].map(r => ({
        id:          uuid(),
        companyId:   co.id,
        name:        r.name,
        isDefault:   r.isDefault,
        description: r.desc,
      }))
    ),
  });
  const allRoles = await prisma.role.findMany();

  const getRoleByName = (coId: string, name: string) =>
    allRoles.find(r => r.companyId === coId && r.name === name)!;

  console.log(`   ✓ ${allRoles.length} roles`);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. ROLE PERMISSIONS
  //    - Owner     → SEMUA permission (110 total — 24 modul, 5 aksi, dedup prefix)
  //    - Role lain → permission yang di-assign oleh owner, sesuai kebutuhan
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔑  Seeding role permissions...');

  // Helper: ambil permission berdasarkan filter modul & aksi
  // Resolve module codes → permission prefixes → match by code prefix
  // (Handles shared prefixes like all RPT_* modules → reporting.report.*)
  const getPerms = (moduleCodes: string[], actions: string[]) => {
    const prefixes = new Set<string>();
    for (const code of moduleCodes) {
      const prefs = modulePermPrefixMap.get(code);
      if (prefs) prefs.forEach(p => prefixes.add(p));
    }
    return allPermissions.filter(p => {
      const permPrefix = p.code.split('.').slice(0, -1).join('.');
      return prefixes.has(permPrefix) && actions.includes(p.action);
    });
  };

  const allPermIds = allPermissions.map(p => p.id);

  // Konfigurasi permission per role per company
  // Format: [moduleCodes[], actions[]]
  // Ini adalah contoh konfigurasi yang "dibuat oleh owner" untuk company masing-masing

  type RolePermConfig = Record<string, [string[], string[]][]>;

  const rolePermConfigs: Record<string, RolePermConfig> = {
    // ── PT Maju Bersama Sejahtera (Manufacturing) ────────────────────────────
    [c1.id]: {
      'Administrator': [
        [['CORE_USERS','CORE_ROLES','CORE_CODECONFIGS'], ['view','create','edit','delete']],
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_PRODUCTS','DATA_ASSETS','DATA_LOCATIONS','DATA_EMPLOYEES'], ['view','create','edit','delete']],
        [['OPS_WAREHOUSE','OPS_PRODUCTION','OPS_TRANSACTIONS','OPS_PURCHASES'], ['view','create','edit','delete','approve']],
        [['SUP_DOCUMENTS','SUP_APPROVALS','SUP_AUDIT','SUP_NOTIFICATIONS'], ['view','create','edit']],
        [['RPT_FINANCE','RPT_INVENTORY','RPT_HR','RPT_SALES'], ['view']],
      ],
      'Manajer Pabrik': [
        [['DATA_PRODUCTS','DATA_ASSETS','DATA_LOCATIONS'], ['view','create','edit']],
        [['OPS_WAREHOUSE','OPS_PRODUCTION'], ['view','create','edit','approve']],
        [['OPS_PURCHASES'], ['view','create','edit']],
        [['DATA_EMPLOYEES'], ['view']],
        [['RPT_INVENTORY','RPT_SALES'], ['view']],
        [['SUP_DOCUMENTS','SUP_APPROVALS'], ['view','create']],
      ],
      'Finance': [
        [['OPS_TRANSACTIONS'], ['view','create','edit','approve']],
        [['OPS_PURCHASES'], ['view','approve']],
        [['DATA_VENDORS','DATA_CUSTOMERS'], ['view','create','edit']],
        [['RPT_FINANCE'], ['view','create']],
        [['RPT_SALES','RPT_INVENTORY'], ['view']],
        [['SUP_DOCUMENTS','SUP_APPROVALS'], ['view','create','edit']],
      ],
      'Gudang': [
        [['OPS_WAREHOUSE'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view','create','edit']],
        [['OPS_PURCHASES'], ['view']],
        [['RPT_INVENTORY'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Purchasing': [
        [['OPS_PURCHASES'], ['view','create','edit']],
        [['DATA_VENDORS'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view']],
        [['OPS_WAREHOUSE'], ['view']],
        [['SUP_DOCUMENTS','SUP_APPROVALS'], ['view','create']],
      ],
      'Produksi': [
        [['OPS_PRODUCTION'], ['view','create','edit']],
        [['OPS_WAREHOUSE'], ['view']],
        [['DATA_PRODUCTS'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Sales & Marketing': [
        [['DATA_CUSTOMERS'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view']],
        [['OPS_TRANSACTIONS'], ['view','create','edit']],
        [['OPS_OPERATIONS'], ['view','create','edit']],
        [['RPT_SALES'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'HRD': [
        [['DATA_EMPLOYEES'], ['view','create','edit']],
        [['CORE_USERS'], ['view']],
        [['RPT_HR'], ['view','create']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Viewer': [
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_PRODUCTS','DATA_ASSETS','DATA_EMPLOYEES'], ['view']],
        [['OPS_WAREHOUSE','OPS_PRODUCTION','OPS_TRANSACTIONS','OPS_PURCHASES'], ['view']],
        [['RPT_FINANCE','RPT_INVENTORY','RPT_HR','RPT_SALES'], ['view']],
      ],
    },

    // ── CV Karya Mandiri Digital (Trading & Retail) ──────────────────────────
    [c2.id]: {
      'Administrator': [
        [['CORE_USERS','CORE_ROLES','CORE_CODECONFIGS'], ['view','create','edit','delete']],
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_PRODUCTS','DATA_ASSETS','DATA_LOCATIONS','DATA_EMPLOYEES'], ['view','create','edit','delete']],
        [['OPS_WAREHOUSE','OPS_TRANSACTIONS','OPS_PURCHASES','OPS_OPERATIONS'], ['view','create','edit','delete','approve']],
        [['SUP_DOCUMENTS','SUP_APPROVALS','SUP_AUDIT','SUP_NOTIFICATIONS'], ['view','create','edit']],
        [['RPT_FINANCE','RPT_INVENTORY','RPT_SALES'], ['view','create']],
      ],
      'Kepala Toko': [
        [['DATA_CUSTOMERS','DATA_PRODUCTS'], ['view','create','edit']],
        [['OPS_TRANSACTIONS','OPS_OPERATIONS'], ['view','create','edit','approve']],
        [['OPS_WAREHOUSE'], ['view','create','edit']],
        [['DATA_EMPLOYEES'], ['view']],
        [['RPT_SALES','RPT_INVENTORY'], ['view']],
      ],
      'Kasir': [
        [['DATA_CUSTOMERS'], ['view','create']],
        [['DATA_PRODUCTS'], ['view']],
        [['OPS_TRANSACTIONS'], ['view','create']],
        [['OPS_OPERATIONS'], ['view','create']],
      ],
      'Stok & Gudang': [
        [['OPS_WAREHOUSE'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view','create','edit']],
        [['RPT_INVENTORY'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Purchasing': [
        [['OPS_PURCHASES'], ['view','create','edit']],
        [['DATA_VENDORS'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view']],
        [['OPS_WAREHOUSE'], ['view']],
        [['SUP_DOCUMENTS','SUP_APPROVALS'], ['view','create']],
      ],
      'Sales Online': [
        [['DATA_CUSTOMERS'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view']],
        [['OPS_TRANSACTIONS','OPS_OPERATIONS'], ['view','create','edit']],
        [['RPT_SALES'], ['view']],
      ],
      'Finance': [
        [['OPS_TRANSACTIONS'], ['view','create','edit','approve']],
        [['OPS_PURCHASES'], ['view','approve']],
        [['DATA_VENDORS','DATA_CUSTOMERS'], ['view','edit']],
        [['RPT_FINANCE','RPT_SALES'], ['view','create']],
        [['SUP_DOCUMENTS'], ['view','create','edit']],
      ],
      'Viewer': [
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_PRODUCTS'], ['view']],
        [['OPS_WAREHOUSE','OPS_TRANSACTIONS','OPS_PURCHASES'], ['view']],
        [['RPT_FINANCE','RPT_INVENTORY','RPT_SALES'], ['view']],
      ],
    },

    // ── PT Nusantara Property Group (Real Estate) ────────────────────────────
    [c3.id]: {
      'Direktur': [
        [['CORE_USERS','CORE_ROLES','CORE_CODECONFIGS'], ['view','create','edit']],
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_ASSETS','DATA_LOCATIONS','DATA_EMPLOYEES'], ['view','create','edit','delete']],
        [['OPS_TRANSACTIONS','OPS_PURCHASES','OPS_LEASES','OPS_OPERATIONS'], ['view','create','edit','approve']],
        [['RPT_FINANCE','RPT_SALES','RPT_HR'], ['view','create']],
        [['SUP_DOCUMENTS','SUP_APPROVALS','SUP_AUDIT'], ['view','create','edit']],
      ],
      'Finance & Akuntansi': [
        [['OPS_TRANSACTIONS'], ['view','create','edit','approve']],
        [['OPS_PURCHASES','OPS_LEASES'], ['view','approve']],
        [['DATA_CUSTOMERS','DATA_VENDORS'], ['view','create','edit']],
        [['RPT_FINANCE'], ['view','create']],
        [['RPT_SALES'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create','edit']],
      ],
      'Legal & Notaris': [
        [['OPS_LEASES'], ['view','create','edit','approve']],
        [['DATA_CUSTOMERS','DATA_ASSETS','DATA_LOCATIONS'], ['view','create','edit']],
        [['SUP_DOCUMENTS'], ['view','create','edit','delete']],
        [['SUP_APPROVALS'], ['view','create','edit']],
        [['OPS_TRANSACTIONS'], ['view']],
      ],
      'Agen Properti': [
        [['DATA_CUSTOMERS'], ['view','create','edit']],
        [['DATA_ASSETS','DATA_LOCATIONS'], ['view']],
        [['OPS_LEASES'], ['view','create','edit']],
        [['OPS_TRANSACTIONS'], ['view','create']],
        [['OPS_OPERATIONS'], ['view','create','edit']],
        [['RPT_SALES'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Marketing': [
        [['DATA_CUSTOMERS'], ['view','create','edit']],
        [['DATA_ASSETS','DATA_LOCATIONS'], ['view']],
        [['OPS_OPERATIONS'], ['view','create','edit']],
        [['RPT_SALES'], ['view']],
      ],
      'Property Manager': [
        [['OPS_LEASES'], ['view','create','edit']],
        [['DATA_CUSTOMERS','DATA_ASSETS','DATA_LOCATIONS'], ['view','create','edit']],
        [['OPS_TRANSACTIONS'], ['view','create']],
        [['SUP_DOCUMENTS'], ['view','create','edit']],
        [['RPT_INVENTORY'], ['view']],
      ],
      'Admin Umum': [
        [['DATA_CUSTOMERS','DATA_VENDORS'], ['view','create','edit']],
        [['OPS_PURCHASES'], ['view','create','edit']],
        [['SUP_DOCUMENTS','SUP_NOTIFICATIONS'], ['view','create','edit']],
        [['CORE_CODECONFIGS'], ['view','edit']],
      ],
      'Viewer': [
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_ASSETS','DATA_LOCATIONS'], ['view']],
        [['OPS_LEASES','OPS_TRANSACTIONS','OPS_PURCHASES'], ['view']],
        [['RPT_FINANCE','RPT_SALES'], ['view']],
      ],
    },

    // ── UD Sumber Rejeki Food (Food & Beverage) ──────────────────────────────
    [c4.id]: {
      'Manajer Operasional': [
        [['CORE_USERS','CORE_CODECONFIGS'], ['view','edit']],
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_PRODUCTS','DATA_ASSETS','DATA_LOCATIONS','DATA_EMPLOYEES'], ['view','create','edit']],
        [['OPS_WAREHOUSE','OPS_PRODUCTION','OPS_TRANSACTIONS','OPS_PURCHASES','OPS_OPERATIONS'], ['view','create','edit','approve']],
        [['RPT_FINANCE','RPT_INVENTORY','RPT_SALES','RPT_HR'], ['view','create']],
        [['SUP_DOCUMENTS','SUP_APPROVALS'], ['view','create','edit']],
      ],
      'Finance': [
        [['OPS_TRANSACTIONS'], ['view','create','edit','approve']],
        [['OPS_PURCHASES'], ['view','approve']],
        [['DATA_VENDORS','DATA_CUSTOMERS'], ['view','create','edit']],
        [['RPT_FINANCE'], ['view','create']],
        [['RPT_SALES','RPT_INVENTORY'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create','edit']],
      ],
      'Kepala Produksi': [
        [['OPS_PRODUCTION'], ['view','create','edit','approve']],
        [['OPS_WAREHOUSE'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view','create','edit']],
        [['DATA_VENDORS'], ['view']],
        [['RPT_INVENTORY'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Staf Produksi': [
        [['OPS_PRODUCTION'], ['view','create','edit']],
        [['OPS_WAREHOUSE'], ['view']],
        [['DATA_PRODUCTS'], ['view']],
      ],
      'Gudang & Logistik': [
        [['OPS_WAREHOUSE'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view','create','edit']],
        [['OPS_PURCHASES'], ['view']],
        [['RPT_INVENTORY'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'Sales & Outlet': [
        [['DATA_CUSTOMERS'], ['view','create','edit']],
        [['DATA_PRODUCTS'], ['view']],
        [['OPS_TRANSACTIONS','OPS_OPERATIONS'], ['view','create','edit']],
        [['RPT_SALES'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create']],
      ],
      'QC & BPOM': [
        [['OPS_PRODUCTION'], ['view','edit']],
        [['DATA_PRODUCTS'], ['view','edit']],
        [['OPS_WAREHOUSE'], ['view']],
        [['SUP_DOCUMENTS'], ['view','create','edit']],
        [['RPT_INVENTORY'], ['view']],
      ],
      'Viewer': [
        [['DATA_CUSTOMERS','DATA_VENDORS','DATA_PRODUCTS'], ['view']],
        [['OPS_WAREHOUSE','OPS_PRODUCTION','OPS_TRANSACTIONS','OPS_PURCHASES'], ['view']],
        [['RPT_FINANCE','RPT_INVENTORY','RPT_SALES'], ['view']],
      ],
    },
  };

  const rpSeen = new Set<string>();
  const rpRows: any[] = [];

  for (const co of companies) {
    const ownerRole = getRoleByName(co.id, 'Owner');

    // OWNER → semua permission tanpa terkecuali
    for (const permId of allPermIds) {
      const key = `${ownerRole.id}::${permId}`;
      if (!rpSeen.has(key)) {
        rpSeen.add(key);
        rpRows.push({ id: uuid(), roleId: ownerRole.id, permissionId: permId });
      }
    }

    // Role lain → sesuai konfigurasi owner
    const config = rolePermConfigs[co.id] ?? {};
    for (const [roleName, permMatrix] of Object.entries(config)) {
      const role = getRoleByName(co.id, roleName);
      if (!role) continue;

      for (const [moduleCodes, actions] of permMatrix) {
        const perms = getPerms(moduleCodes, actions);
        for (const perm of perms) {
          const key = `${role.id}::${perm.id}`;
          if (!rpSeen.has(key)) {
            rpSeen.add(key);
            rpRows.push({ id: uuid(), roleId: role.id, permissionId: perm.id });
          }
        }
      }
    }
  }

  await prisma.rolePermission.createMany({ data: rpRows });

  // Verifikasi
  const ownerPermCounts = await Promise.all(
    companies.map(async co => {
      const owner = getRoleByName(co.id, 'Owner');
      const count = await prisma.rolePermission.count({ where: { roleId: owner.id } });
      return { company: co.name, ownerPerms: count, totalPerms: allPermissions.length };
    })
  );
  console.log(`   ✓ ${rpRows.length} role-permissions total`);
  ownerPermCounts.forEach(v =>
    console.log(`     Owner ${v.company}: ${v.ownerPerms}/${v.totalPerms} permissions`)
  );

  // ───────────────────────────────────────────────────────────────────────────
  // 6. COMPANY USERS
  //    - Owner ditunjuk saat company dibuat
  //    - Admin & staff ditambahkan oleh owner setelahnya
  // ───────────────────────────────────────────────────────────────────────────
  console.log('👥  Seeding company users...');

  const cuRows: any[] = [
    // Owners
    { id: uuid(), userId: uOwnerMBS.id, companyId: c1.id, roleId: getRoleByName(c1.id, 'Owner').id, isActive: true },
    { id: uuid(), userId: uOwnerKMD.id, companyId: c2.id, roleId: getRoleByName(c2.id, 'Owner').id, isActive: true },
    { id: uuid(), userId: uOwnerNPG.id, companyId: c3.id, roleId: getRoleByName(c3.id, 'Owner').id, isActive: true },
    { id: uuid(), userId: uOwnerSRF.id, companyId: c4.id, roleId: getRoleByName(c4.id, 'Owner').id, isActive: true },
    // Admins (ditunjuk oleh owner)
    { id: uuid(), userId: uAdminMBS.id, companyId: c1.id, roleId: getRoleByName(c1.id, 'Administrator').id, isActive: true },
    { id: uuid(), userId: uAdminKMD.id, companyId: c2.id, roleId: getRoleByName(c2.id, 'Administrator').id, isActive: true },
    { id: uuid(), userId: uAdminNPG.id, companyId: c3.id, roleId: getRoleByName(c3.id, 'Direktur').id,       isActive: true },
    { id: uuid(), userId: uAdminSRF.id, companyId: c4.id, roleId: getRoleByName(c4.id, 'Manajer Operasional').id, isActive: true },
    // Kepala divisi
    { id: uuid(), userId: uHeadMBS.id, companyId: c1.id, roleId: getRoleByName(c1.id, 'Finance').id,          isActive: true },
    { id: uuid(), userId: uHeadKMD.id, companyId: c2.id, roleId: getRoleByName(c2.id, 'Kepala Toko').id,      isActive: true },
    { id: uuid(), userId: uHeadNPG.id, companyId: c3.id, roleId: getRoleByName(c3.id, 'Finance & Akuntansi').id, isActive: true },
    { id: uuid(), userId: uHeadSRF.id, companyId: c4.id, roleId: getRoleByName(c4.id, 'Kepala Produksi').id,  isActive: true },
  ];

  // Staff — 8 per company, role sesuai industry
  const staffRolesByComp: Record<string, string[]> = {
    [c1.id]: ['Gudang','Purchasing','Produksi','Sales & Marketing','HRD','Finance','Produksi','Gudang'],
    [c2.id]: ['Kasir','Stok & Gudang','Purchasing','Sales Online','Finance','Kasir','Stok & Gudang','Sales Online'],
    [c3.id]: ['Agen Properti','Marketing','Legal & Notaris','Property Manager','Admin Umum','Agen Properti','Marketing','Admin Umum'],
    [c4.id]: ['Staf Produksi','Gudang & Logistik','Sales & Outlet','QC & BPOM','Finance','Staf Produksi','Gudang & Logistik','Sales & Outlet'],
  };

  staffUsers.forEach((u, i) => {
    const coIdx    = Math.floor(i / 8);
    const co       = companies[coIdx] ?? randPick(companies);
    const rolePool = staffRolesByComp[co.id] ?? ['Viewer'];
    const roleName = rolePool[i % rolePool.length];
    const role     = getRoleByName(co.id, roleName) ?? getRoleByName(co.id, 'Viewer');
    cuRows.push({ id: uuid(), userId: u.id, companyId: co.id, roleId: role.id, isActive: true });
  });

  await prisma.companyUser.createMany({ data: cuRows });
  console.log(`   ✓ ${cuRows.length} company-user assignments`);

  // ───────────────────────────────────────────────────────────────────────────
  // 7. CODE CONFIGS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔢  Seeding code configs...');
  const ccDefs = [
    { entity: 'customer',            prefix: 'CUST',  digitCount: 5 },
    { entity: 'vendor',              prefix: 'VEND',  digitCount: 5 },
    { entity: 'product',             prefix: 'PROD',  digitCount: 5 },
    { entity: 'employee',            prefix: 'EMP',   digitCount: 4 },
    { entity: 'asset',               prefix: 'AST',   digitCount: 4 },
    { entity: 'warehouse',           prefix: 'WH',    digitCount: 3 },
    { entity: 'stock_in',            prefix: 'STIN',  digitCount: 6 },
    { entity: 'stock_out',           prefix: 'STOUT', digitCount: 6 },
    { entity: 'stock_adjustment',    prefix: 'STADJ', digitCount: 6 },
    { entity: 'production',          prefix: 'BATCH', digitCount: 6 },
    { entity: 'transaction_income',  prefix: 'INC',   digitCount: 6 },
    { entity: 'transaction_expense', prefix: 'EXP',   digitCount: 6 },
    { entity: 'purchase',            prefix: 'PO',    digitCount: 6 },
    { entity: 'lease',               prefix: 'LSE',   digitCount: 5 },
  ];
  await prisma.codeConfig.createMany({
    data: companies.flatMap(co =>
      ccDefs.map(d => ({ id: uuid(), companyId: co.id, ...d, lastNumber: randInt(100, 999), isActive: true }))
    ),
  });
  console.log(`   ✓ ${companies.length * ccDefs.length} code configs`);

  // ───────────────────────────────────────────────────────────────────────────
  // 8. LOCATIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📍  Seeding locations...');
  const locDefs: { companyId: string; createdBy: string; rows: any[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, rows: [
      { name: 'Kantor Pusat Jakarta Selatan',   type: 'office',    address: 'Jl. TB Simatupang No. 18, Jakarta Selatan 12430' },
      { name: 'Pabrik Utama Karawang',          type: 'warehouse', address: 'Kawasan Industri KIIC Blok AA-5, Karawang 41371' },
      { name: 'Gudang Distribusi Bekasi',       type: 'warehouse', address: 'Jl. Raya Bekasi KM 24, Bekasi Timur 17148' },
      { name: 'Kantor Cabang Surabaya',         type: 'branch',    address: 'Jl. Ahmad Yani No. 88, Surabaya 60231' },
      { name: 'Kantor Cabang Semarang',         type: 'branch',    address: 'Jl. Pandanaran No. 30, Semarang 50134' },
      { name: 'Showroom Bandung',               type: 'branch',    address: 'Jl. Asia Afrika No. 65, Bandung 40111' },
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, rows: [
      { name: 'Toko Pusat Yogyakarta',          type: 'office',    address: 'Jl. Malioboro No. 22, Yogyakarta 55213' },
      { name: 'Gudang Sentral Sleman',          type: 'warehouse', address: 'Jl. Magelang KM 9, Sleman 55284' },
      { name: 'Toko Cabang Solo',               type: 'branch',    address: 'Jl. Slamet Riyadi No. 155, Solo 57141' },
      { name: 'Toko Cabang Magelang',           type: 'branch',    address: 'Jl. Pemuda No. 45, Magelang 56117' },
      { name: 'Counter Ambarukmo Plaza',        type: 'branch',    address: 'Ambarukmo Plaza Lt. 2, Yogyakarta 55281' },
      { name: 'Counter Hartono Mall',           type: 'branch',    address: 'Hartono Mall Yogyakarta Lt. 1, Yogyakarta' },
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, rows: [
      { name: 'Kantor Marketing BSD City',      type: 'office',    address: 'Jl. Pahlawan Seribu, BSD City, Tangerang Selatan 15322' },
      { name: 'Properti Kemang Village',        type: 'branch',    address: 'Jl. Kemang Raya No. 1, Jakarta Selatan 12730' },
      { name: 'Ruko Kelapa Gading',             type: 'branch',    address: 'Jl. Boulevard Raya Blok A-12, Kelapa Gading 14240' },
      { name: 'Apartemen Alam Sutera',          type: 'branch',    address: 'Jl. Alam Sutera Boulevard, Tangerang 15143' },
      { name: 'Kavling Bintaro Jaya',           type: 'branch',    address: 'Jl. Boulevard Bintaro Sektor 9, Tangerang 15229' },
      { name: 'Galeri Properti Senayan',        type: 'branch',    address: 'Jl. Asia Afrika Senayan, Jakarta Pusat 10270' },
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, rows: [
      { name: 'Pabrik Dapur Produksi Depok',   type: 'warehouse', address: 'Jl. Raya Tapos No. 12, Depok 16456' },
      { name: 'Outlet Summarecon Bekasi',       type: 'branch',    address: 'Summarecon Mall Bekasi Lt. 1, Bekasi 17148' },
      { name: 'Outlet Grand Indonesia',         type: 'branch',    address: 'Grand Indonesia Shopping Town Lt. 3A, Jakarta 10310' },
      { name: 'Outlet Pondok Indah Mall',       type: 'branch',    address: 'Pondok Indah Mall 2 Lt. GF, Jakarta Selatan 12310' },
      { name: 'Outlet Lippo Mall Puri',         type: 'branch',    address: 'Lippo Mall Puri Lt. 1, Jakarta Barat 11610' },
      { name: 'Gudang Pendingin Cold Storage',  type: 'warehouse', address: 'Jl. Raya Tapos No. 14, Depok 16456' },
    ]},
  ];
  await prisma.location.createMany({
    data: locDefs.flatMap(({ companyId, createdBy, rows }) =>
      rows.map(r => ({ id: uuid(), companyId, createdBy, ...r, isActive: true }))
    ),
  });
  const allLocations = await prisma.location.findMany();
  console.log(`   ✓ ${allLocations.length} locations`);

  // ───────────────────────────────────────────────────────────────────────────
  // 9. ASSETS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🏗️   Seeding assets...');
  const assetDefs: { companyId: string; createdBy: string; rows: any[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, rows: [
      { name: 'Gedung Pabrik Utama Karawang',   code: 'AST-0001', type: 'building',  condition: 'good', purchaseDate: new Date('2016-05-10') },
      { name: 'Mesin CNC Milling DMG Mori #1',  code: 'AST-0002', type: 'equipment', condition: 'good', purchaseDate: new Date('2020-03-15') },
      { name: 'Mesin CNC Milling DMG Mori #2',  code: 'AST-0003', type: 'equipment', condition: 'good', purchaseDate: new Date('2020-03-15') },
      { name: 'Mesin Press Hidrolik 500 Ton',   code: 'AST-0004', type: 'equipment', condition: 'fair', purchaseDate: new Date('2018-07-20') },
      { name: 'Forklift Toyota FD30 #1',        code: 'AST-0005', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2021-01-10') },
      { name: 'Forklift Toyota FD30 #2',        code: 'AST-0006', type: 'vehicle',   condition: 'fair', purchaseDate: new Date('2019-06-05') },
      { name: 'Truck Colt Diesel FE 74HD',      code: 'AST-0007', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2022-08-12') },
      { name: 'Truck Hino Ranger 260JD',        code: 'AST-0008', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2023-02-18') },
      { name: 'Generator Caterpillar 250KVA',   code: 'AST-0009', type: 'equipment', condition: 'good', purchaseDate: new Date('2019-11-30') },
      { name: 'Kompresor Atlas Copco GA37',     code: 'AST-0010', type: 'equipment', condition: 'fair', purchaseDate: new Date('2017-04-22') },
      { name: 'Mobil Operasional Innova Zenix', code: 'AST-0011', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2023-12-01') },
      { name: 'Server Dell PowerEdge R750',     code: 'AST-0012', type: 'equipment', condition: 'good', purchaseDate: new Date('2022-03-10') },
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, rows: [
      { name: 'Ruko 3 Lantai Jl. Malioboro',   code: 'AST-0001', type: 'building',  condition: 'good', purchaseDate: new Date('2014-08-10') },
      { name: 'Ruko Jl. Slamet Riyadi Solo',   code: 'AST-0002', type: 'building',  condition: 'good', purchaseDate: new Date('2017-02-20') },
      { name: 'Mobil Box Pengiriman Hino 130', code: 'AST-0003', type: 'vehicle',   condition: 'fair', purchaseDate: new Date('2019-05-08') },
      { name: 'Motor Honda Vario 125 #1',      code: 'AST-0004', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2022-07-14') },
      { name: 'Motor Honda Vario 125 #2',      code: 'AST-0005', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2022-07-14') },
      { name: 'Rak Gudang Heavy Duty 50 set',  code: 'AST-0006', type: 'equipment', condition: 'good', purchaseDate: new Date('2021-10-05') },
      { name: 'CCTV System 32 Channel',        code: 'AST-0007', type: 'equipment', condition: 'good', purchaseDate: new Date('2023-01-15') },
      { name: 'Mesin Kasir POS Epson 10 unit', code: 'AST-0008', type: 'equipment', condition: 'good', purchaseDate: new Date('2022-11-20') },
      { name: 'AC Central Gedung Toko',        code: 'AST-0009', type: 'equipment', condition: 'fair', purchaseDate: new Date('2018-03-10') },
      { name: 'Laptop Operasional 20 unit',    code: 'AST-0010', type: 'equipment', condition: 'good', purchaseDate: new Date('2023-06-01') },
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, rows: [
      { name: 'Tanah Kavling BSD 1000m2',       code: 'AST-0001', type: 'building',  condition: 'good', purchaseDate: new Date('2015-01-15') },
      { name: 'Tanah Kavling Bintaro 800m2',    code: 'AST-0002', type: 'building',  condition: 'good', purchaseDate: new Date('2016-06-20') },
      { name: 'Apartemen Kemang Unit A-801',    code: 'AST-0003', type: 'building',  condition: 'good', purchaseDate: new Date('2018-11-10') },
      { name: 'Apartemen Kemang Unit A-802',    code: 'AST-0004', type: 'building',  condition: 'good', purchaseDate: new Date('2018-11-10') },
      { name: 'Ruko Kelapa Gading B-3',         code: 'AST-0005', type: 'building',  condition: 'good', purchaseDate: new Date('2019-08-01') },
      { name: 'Ruko Kelapa Gading B-4',         code: 'AST-0006', type: 'building',  condition: 'good', purchaseDate: new Date('2019-08-01') },
      { name: 'Toyota Fortuner VRZ',            code: 'AST-0007', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2022-04-15') },
      { name: 'Toyota Alphard SC',              code: 'AST-0008', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2023-08-20') },
      { name: 'Drone Survey DJI Matrice 300',   code: 'AST-0009', type: 'equipment', condition: 'good', purchaseDate: new Date('2023-03-05') },
      { name: 'Peralatan Kantor Lot 2021',      code: 'AST-0010', type: 'equipment', condition: 'good', purchaseDate: new Date('2021-07-20') },
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, rows: [
      { name: 'Pabrik Dapur 300m2',             code: 'AST-0001', type: 'building',  condition: 'good', purchaseDate: new Date('2017-03-10') },
      { name: 'Oven Industri Deck 4 Layer #1',  code: 'AST-0002', type: 'equipment', condition: 'good', purchaseDate: new Date('2021-05-15') },
      { name: 'Oven Industri Deck 4 Layer #2',  code: 'AST-0003', type: 'equipment', condition: 'good', purchaseDate: new Date('2021-05-15') },
      { name: 'Mesin Mixer 60 Liter #1',        code: 'AST-0004', type: 'equipment', condition: 'good', purchaseDate: new Date('2020-08-20') },
      { name: 'Mesin Mixer 60 Liter #2',        code: 'AST-0005', type: 'equipment', condition: 'fair', purchaseDate: new Date('2019-02-10') },
      { name: 'Cold Storage 15 Ton',            code: 'AST-0006', type: 'equipment', condition: 'good', purchaseDate: new Date('2022-01-15') },
      { name: 'Chiller Display 3 Pintu',        code: 'AST-0007', type: 'equipment', condition: 'good', purchaseDate: new Date('2022-06-10') },
      { name: 'Mobil Box Pendingin Toyota Dyna',code: 'AST-0008', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2023-04-20') },
      { name: 'Motor Pengiriman Yamaha Gear',   code: 'AST-0009', type: 'vehicle',   condition: 'good', purchaseDate: new Date('2023-07-01') },
      { name: 'Mesin Sealer Plastik Otomatis',  code: 'AST-0010', type: 'equipment', condition: 'fair', purchaseDate: new Date('2020-11-05') },
      { name: 'Timbangan Digital Industri',     code: 'AST-0011', type: 'equipment', condition: 'good', purchaseDate: new Date('2022-09-15') },
      { name: 'Generator Bensin Honda 5KVA',    code: 'AST-0012', type: 'equipment', condition: 'good', purchaseDate: new Date('2021-12-20') },
    ]},
  ];
  const locByComp = (coId: string) => allLocations.filter(l => l.companyId === coId);
  await prisma.asset.createMany({
    data: assetDefs.flatMap(({ companyId, createdBy, rows }) =>
      rows.map(r => ({
        id: uuid(), companyId, createdBy,
        locationId: randPick(locByComp(companyId)).id,
        description: `Aset perusahaan: ${r.name}`, isActive: true, ...r,
      }))
    ),
  });
  const allAssets = await prisma.asset.findMany();
  console.log(`   ✓ ${allAssets.length} assets`);

  // ───────────────────────────────────────────────────────────────────────────
  // 10. EMPLOYEES (20 per company = 80)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🧑‍💼  Seeding employees...');
  const empBase: [string, string][] = [
    ['Agus Purnomo','Produksi'],    ['Bambang Susilo','Gudang'],      ['Candra Wijaya','Keuangan'],
    ['Dewi Lestari','HRD'],         ['Eko Prasetyo','IT'],            ['Farida Hanum','Sales'],
    ['Gunawan Tri','Purchasing'],   ['Hani Pertiwi','Marketing'],     ['Irfan Hakim','Legal'],
    ['Joko Santoso','Operasional'], ['Kartika Sari','Keuangan'],      ['Luki Setiawan','Gudang'],
    ['Mira Oktavia','Sales'],       ['Nanda Prayoga','IT'],           ['Oka Sudirman','Produksi'],
    ['Putri Rahayu','HRD'],         ['Qori Ananda','Marketing'],      ['Rizal Mahendra','Purchasing'],
    ['Silvy Arinda','Keuangan'],    ['Teguh Santosa','Distribusi'],
  ];
  const positions   = ['Direktur','Manager','Supervisor','Koordinator','Senior Staff','Staff','Junior Staff'];
  const empStatuses = ['active','active','active','active','active','inactive','resigned'];
  const coSlugs     = ['mbs','kmd','npg','srf'];
  const coOwners    = [uOwnerMBS, uOwnerKMD, uOwnerNPG, uOwnerSRF];

  const empRows: any[] = [];
  let empSeq = 1;
  for (let ci = 0; ci < companies.length; ci++) {
    const co = companies[ci];
    for (const [name, dept] of empBase) {
      empRows.push({
        id: uuid(), companyId: co.id,
        name, code: `EMP-${pad(empSeq++, 4)}`,
        email:   `${name.toLowerCase().replace(/\s+/g,'.')}@${coSlugs[ci]}.co.id`,
        phone:   phone(), position: randPick(positions), department: dept,
        joinDate: randDate(Y2018, Y2024), salary: randDec(4000000, 30000000, 0),
        status: randPick(empStatuses), isActive: true, createdBy: coOwners[ci].id,
      });
    }
  }
  await prisma.employee.createMany({ data: empRows });
  console.log(`   ✓ ${empRows.length} employees`);

  // ───────────────────────────────────────────────────────────────────────────
  // 11. CUSTOMERS (25 per company = 100)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🤝  Seeding customers...');
  const custGroups: { companyId: string; createdBy: string; names: string[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, names: [
      'PT Aneka Distribusi Nusantara','CV Berkah Maju Bersama','PT Cahaya Raya Distributor',
      'UD Delta Teknik Indonesia','PT Elang Distribusi Jaya','CV Fajar Sentosa Trading',
      'PT Gemilang Putra Mandiri','UD Harapan Distribusi','PT Indah Karya Perkasa',
      'CV Jaya Abadi Makmur','PT Karya Agung Distributor','UD Lancar Jaya Sentosa',
      'PT Mitra Usaha Sejati','CV Nusantara Maju Bersama','PT Omega Distribusi Utama',
      'UD Prima Karya Lestari','PT Rejeki Berlimpah Tbk','CV Sentosa Niaga Prima',
      'PT Tunggal Ika Distribusi','UD Usaha Mandiri Jaya','PT Visi Maju Nusantara',
      'CV Warna Karya Abadi','PT Xtra Distribusi Sukses','UD Yakin Maju Sentosa',
      'PT Zamrud Distribusi',
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, names: [
      'Toko Elektronik Jaya','CV Reseller Gadget Murah','Toko Komputer Setia Kawan',
      'UD Maju Digital','Toko IT Solution Jogja','CV Sinar Abadi Tech',
      'Toko Laptop Murah Meriah','UD Prima Elektronik','CV Berkah Digital Store',
      'Toko Aksesoris HP Center','UD Cahaya Elektronik','CV Bintang Digital',
      'Toko Global Computer','UD Harapan Tech','CV Indo Gadget Shop',
      'Toko Jaya Komputer','UD Kilat Digital','CV Lestari Tech Store',
      'Toko Mulia Elektronik','UD Nusantara Computer','CV Online Shop Jogja',
      'Toko Pusat Gadget','UD Raya Digital','CV Sukses Teknologi',
      'Toko Utama Komputer',
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, names: [
      'Dr. Arief Budiman','Dr. Budi Setiawan','Ir. Candra Permana',
      'Drs. Dewi Ariani','Ir. Eko Santoso','Dr. Farhan Maulana',
      'Ny. Gita Rahayu','Tn. Hendra Kusuma','Dr. Intan Sari',
      'Tn. Johan Prasetya','Ny. Kartika Dewi','Ir. Luki Cahyono',
      'Dr. Maria Natalia','Tn. Niko Setiawan','Ny. Olivia Kusuma',
      'Ir. Pandu Wijaya','Dr. Qori Hartono','Tn. Rendi Pratama',
      'Ny. Sinta Dewi','Ir. Taufan Arief',
      'PT Investasi Prima Tbk','CV Dana Properti','PT Aset Nusantara',
      'UD Investasi Maju','PT Graha Makmur',
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, names: [
      'Hotel Santika Depok','Hotel Horison Ultima','Kafe Literasi Jakarta',
      'Restoran Rempah Nusantara','Hotel Grand Zuri','Kafe Teras Budaya',
      'Restoran Padang Sederhana','Hotel Amaris','Kafe Pintu Warung',
      'Katering Nusantara Catering','Hotel Best Western','Kafe Workshop Coffee',
      'Restoran Bakmi GM','Hotel Ibis Budget','Kafe Kopitiam',
      'Toko Roti Swiss Bakery','Supermarket Giant','Supermarket Hypermart',
      'Minimarket Indomaret','Minimarket Alfamart','Kafe Anomali Coffee',
      'Restoran Sate Khas Senayan','Hotel Favehotel','Kafe Janji Jiwa',
      'Restoran Warung Bu Kris',
    ]},
  ];
  const custRows: any[] = [];
  let custSeq = 1;
  for (const { companyId, createdBy, names } of custGroups) {
    for (const name of names) {
      custRows.push({
        id: uuid(), companyId, createdBy, name,
        code:    `CUST-${pad(custSeq++, 5)}`,
        email:   `contact@${name.replace(/[^a-zA-Z]/g,'').toLowerCase().slice(0,14)}.co.id`,
        phone:   phone(),
        address: `Jl. ${randPick(['Merdeka','Pahlawan','Sudirman','Gatot Subroto','Ahmad Yani','Diponegoro'])} No. ${randInt(1,200)}, ${randPick(['Jakarta','Bandung','Surabaya','Yogyakarta','Semarang','Malang'])}`,
        notes:   randPick(['Pelanggan setia','Pelanggan baru','VIP customer','Pelanggan korporat',null,null]),
        isActive: Math.random() > 0.08,
      });
    }
  }
  await prisma.customer.createMany({ data: custRows });
  const allCustomers = await prisma.customer.findMany();
  console.log(`   ✓ ${custRows.length} customers`);

  // ───────────────────────────────────────────────────────────────────────────
  // 12. VENDORS (15 per company = 60)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🏭  Seeding vendors...');
  const vendGroups: { companyId: string; createdBy: string; names: string[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, names: [
      'PT Krakatau Steel Tbk','CV Baja Nusantara Perkasa','PT Logam Mulia Industri',
      'UD Besi Baja Jaya','PT Chemco Prima Mandiri','CV Plastik Industri Sejati',
      'PT Oksigen Murni Indonesia','UD Kimia Jaya Abadi','PT Pelumas Industri Utama',
      'CV Karton Kemasan Prima','PT Abrasif Industri','UD Karet Industri Jaya',
      'PT Tembaga Aluminium Tbk','CV Mur Baut Industri','PT Teknik Industri Nusantara',
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, names: [
      'PT Samsung Electronics Indonesia','CV ASUS Distributor Resmi','PT Lenovo Indonesia',
      'UD HP Distributor','PT Epson Indonesia','CV Canon Marketing Indonesia',
      'PT Western Digital Indonesia','UD Kingston Distributor','PT Corsair Indonesia',
      'CV Logitech Distributor','PT Belkin Indonesia','UD Anker Distributor',
      'PT Xiaomi Indonesia','CV Realme Distributor','PT Oppo Indonesia',
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, names: [
      'PT Semen Indonesia Tbk','CV Bata Merah Prima','PT Besi Beton Nusantara',
      'UD Keramik Mulia','PT Cat Nippon Paint','CV Sanitasi Plumbing Jaya',
      'PT Listrik Instalasi Prima','UD Kayu Material Bangunan','PT Kaca Aluminium',
      'CV Kontraktor Interior Design','PT Properti Konsultan','UD Lanskap Taman',
      'PT Keamanan CCTV','CV Cleaning Service Pro','PT Elevator Eskalator',
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, names: [
      'PT Bogasari Indofood','CV Gula Murni Nusantara','PT Mentega Dairy Prima',
      'UD Telur Segar Farm','PT Coklat Ceres Indonesia','CV Buah Sayur Segar',
      'PT Kemasan Plastik Food Grade','UD Kertas Pembungkus','PT Gas LPG Distribusi',
      'CV Ragi Bahan Pengembang','PT Susu Frisian Flag','UD Keju Prochiz',
      'PT Minyak Goreng Bimoli','CV Vanili Essens Premium','PT Perisa Makanan',
    ]},
  ];
  const vendRows: any[] = [];
  let vendSeq = 1;
  for (const { companyId, createdBy, names } of vendGroups) {
    for (const name of names) {
      vendRows.push({
        id: uuid(), companyId, createdBy, name,
        code:    `VEND-${pad(vendSeq++, 5)}`,
        email:   `sales@${name.replace(/[^a-zA-Z]/g,'').toLowerCase().slice(0,14)}.co.id`,
        phone:   phone(),
        address: `Kawasan Industri ${randPick(['EJIP','GIIC','Karawang','Pulo Gadung','Cikarang','MM2100'])} Blok ${String.fromCharCode(65+randInt(0,25))}-${randInt(1,50)}`,
        notes:   randPick(['Vendor terverifikasi','Vendor prioritas','Vendor reguler',null,null]),
        isActive: Math.random() > 0.08,
      });
    }
  }
  await prisma.vendor.createMany({ data: vendRows });
  const allVendors = await prisma.vendor.findMany();
  console.log(`   ✓ ${vendRows.length} vendors`);

  // ───────────────────────────────────────────────────────────────────────────
  // 13. PRODUCTS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📦  Seeding products...');
  const prodDefs: { companyId: string; createdBy: string; rows: any[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, rows: [
      { code:'PROD-00001', name:'Besi Hollow 40x40x2mm',         type:'raw_material', category:'Logam',    unit:'batang', price:  95000, cost:  72000 },
      { code:'PROD-00002', name:'Besi Hollow 20x40x2mm',         type:'raw_material', category:'Logam',    unit:'batang', price:  65000, cost:  48000 },
      { code:'PROD-00003', name:'Plat Besi 3mm 1220x2440',       type:'raw_material', category:'Logam',    unit:'lembar', price: 195000, cost: 150000 },
      { code:'PROD-00004', name:'Plat Besi 5mm 1220x2440',       type:'raw_material', category:'Logam',    unit:'lembar', price: 285000, cost: 220000 },
      { code:'PROD-00005', name:'Besi Siku 40x40x4mm',           type:'raw_material', category:'Logam',    unit:'batang', price:  78000, cost:  60000 },
      { code:'PROD-00006', name:'Kawat Las E7018 3.2mm 5kg',     type:'raw_material', category:'Las',      unit:'pak',    price: 135000, cost: 105000 },
      { code:'PROD-00007', name:'Cat Epoxy Grey 4L',             type:'raw_material', category:'Kimia',    unit:'kaleng', price: 285000, cost: 210000 },
      { code:'PROD-00008', name:'Thinner Epoxy 1L',              type:'raw_material', category:'Kimia',    unit:'kaleng', price:  45000, cost:  32000 },
      { code:'PROD-00009', name:'Baut Mur M10x30 100pcs',        type:'raw_material', category:'Hardware', unit:'pak',    price:  65000, cost:  48000 },
      { code:'PROD-00010', name:'Baut Mur M12x40 100pcs',        type:'raw_material', category:'Hardware', unit:'pak',    price:  85000, cost:  62000 },
      { code:'PROD-00011', name:'Frame Rak Besi Semi-jadi',      type:'semi_finished',category:'Frame',    unit:'pcs',    price: 250000, cost: 180000 },
      { code:'PROD-00012', name:'Panel Besi Press Semi-jadi',    type:'semi_finished',category:'Panel',    unit:'pcs',    price: 185000, cost: 130000 },
      { code:'PROD-00013', name:'Rak Besi Industri 5 Tingkat',   type:'finished',     category:'Furnitur', unit:'unit',   price:1250000, cost: 850000 },
      { code:'PROD-00014', name:'Rak Besi Gudang 4 Tingkat',     type:'finished',     category:'Furnitur', unit:'unit',   price: 950000, cost: 650000 },
      { code:'PROD-00015', name:'Lemari Arsip Besi 4 Laci',      type:'finished',     category:'Furnitur', unit:'unit',   price:1850000, cost:1250000 },
      { code:'PROD-00016', name:'Meja Kerja Besi Industrial',    type:'finished',     category:'Furnitur', unit:'unit',   price: 875000, cost: 580000 },
      { code:'PROD-00017', name:'Pagar Panel Besi 2x1m',         type:'finished',     category:'Pagar',    unit:'panel',  price: 385000, cost: 255000 },
      { code:'PROD-00018', name:'Bracket Dinding Heavy Duty',    type:'finished',     category:'Hardware', unit:'set',    price:  85000, cost:  55000 },
      { code:'PROD-00019', name:'Tangga Besi 5 Anak Tangga',     type:'finished',     category:'Struktur', unit:'unit',   price:1500000, cost:1050000 },
      { code:'PROD-00020', name:'Container Sampah Industri',     type:'finished',     category:'Industri', unit:'unit',   price: 650000, cost: 420000 },
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, rows: [
      { code:'PROD-00001', name:'Laptop ASUS VivoBook 14 i5',    type:'trading', category:'Laptop',      unit:'unit', price: 9500000, cost: 8000000 },
      { code:'PROD-00002', name:'Laptop ASUS VivoBook 15 i7',    type:'trading', category:'Laptop',      unit:'unit', price:12500000, cost:10800000 },
      { code:'PROD-00003', name:'Laptop Lenovo IdeaPad 3',       type:'trading', category:'Laptop',      unit:'unit', price: 7800000, cost: 6600000 },
      { code:'PROD-00004', name:'Laptop HP 14s i3',              type:'trading', category:'Laptop',      unit:'unit', price: 6500000, cost: 5500000 },
      { code:'PROD-00005', name:'Monitor LG 24 IPS FHD',        type:'trading', category:'Monitor',     unit:'unit', price: 2350000, cost: 1950000 },
      { code:'PROD-00006', name:'Monitor Samsung 27 QHD',       type:'trading', category:'Monitor',     unit:'unit', price: 3850000, cost: 3200000 },
      { code:'PROD-00007', name:'Printer Epson L3150',           type:'trading', category:'Printer',     unit:'unit', price: 2750000, cost: 2300000 },
      { code:'PROD-00008', name:'Printer HP LaserJet M140w',     type:'trading', category:'Printer',     unit:'unit', price: 3200000, cost: 2700000 },
      { code:'PROD-00009', name:'Keyboard Mechanical Corsair K70',type:'trading',category:'Aksesori',   unit:'pcs',  price:  950000, cost:  750000 },
      { code:'PROD-00010', name:'Mouse Wireless Logitech MX',    type:'trading', category:'Aksesori',    unit:'pcs',  price:  450000, cost:  360000 },
      { code:'PROD-00011', name:'Headset Gaming Razer Kraken',   type:'trading', category:'Aksesori',    unit:'pcs',  price:  750000, cost:  600000 },
      { code:'PROD-00012', name:'Webcam Logitech C920',          type:'trading', category:'Aksesori',    unit:'pcs',  price: 1250000, cost: 1000000 },
      { code:'PROD-00013', name:'SSD Samsung 500GB NVMe',        type:'trading', category:'Komponen',    unit:'pcs',  price:  950000, cost:  780000 },
      { code:'PROD-00014', name:'RAM DDR4 8GB 3200MHz',          type:'trading', category:'Komponen',    unit:'pcs',  price:  485000, cost:  390000 },
      { code:'PROD-00015', name:'Flashdisk SanDisk 64GB USB3',   type:'trading', category:'Aksesori',    unit:'pcs',  price:  145000, cost:  105000 },
      { code:'PROD-00016', name:'Tinta Epson 003 Set 4 Warna',   type:'trading', category:'Habis Pakai', unit:'set',  price:  195000, cost:  148000 },
      { code:'PROD-00017', name:'Toner HP 85A',                  type:'trading', category:'Habis Pakai', unit:'pcs',  price:  395000, cost:  320000 },
      { code:'PROD-00018', name:'UPS APC Back-UPS 1000VA',       type:'trading', category:'Elektronik',  unit:'unit', price: 1450000, cost: 1200000 },
      { code:'PROD-00019', name:'Router TP-Link Archer AX55',    type:'trading', category:'Jaringan',    unit:'unit', price:  985000, cost:  800000 },
      { code:'PROD-00020', name:'Hub Switch TP-Link 8 Port',     type:'trading', category:'Jaringan',    unit:'unit', price:  285000, cost:  220000 },
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, rows: [
      { code:'PROD-00001', name:'Jasa Konsultasi Properti',          type:'service', category:'Konsultasi',  unit:'sesi',    price:    750000, cost:   150000 },
      { code:'PROD-00002', name:'Biaya Administrasi Sewa',           type:'service', category:'Admin',       unit:'txn',     price:    350000, cost:    75000 },
      { code:'PROD-00003', name:'Komisi Jual Properti 2persen',      type:'service', category:'Komisi',      unit:'txn',     price:   2500000, cost:   500000 },
      { code:'PROD-00004', name:'Biaya Pengelolaan Bulanan',         type:'service', category:'Pengelolaan', unit:'bulan',   price:   1200000, cost:   350000 },
      { code:'PROD-00005', name:'Biaya Pemasaran Digital 1 Bulan',   type:'service', category:'Marketing',   unit:'paket',   price:   4500000, cost:  2000000 },
      { code:'PROD-00006', name:'Sewa Ruko Komersial per Bulan',     type:'service', category:'Sewa',        unit:'bulan',   price:  12000000, cost:  2000000 },
      { code:'PROD-00007', name:'Sewa Apartemen Studio per Bulan',   type:'service', category:'Sewa',        unit:'bulan',   price:   5500000, cost:  1500000 },
      { code:'PROD-00008', name:'Sewa Apartemen 1BR per Bulan',      type:'service', category:'Sewa',        unit:'bulan',   price:   7500000, cost:  2000000 },
      { code:'PROD-00009', name:'Sewa Apartemen 2BR per Bulan',      type:'service', category:'Sewa',        unit:'bulan',   price:  11000000, cost:  3000000 },
      { code:'PROD-00010', name:'Kavling Siap Bangun BSD',           type:'service', category:'Penjualan',   unit:'kavling', price: 850000000, cost:500000000 },
      { code:'PROD-00011', name:'Kavling Siap Bangun Bintaro',       type:'service', category:'Penjualan',   unit:'kavling', price: 750000000, cost:420000000 },
      { code:'PROD-00012', name:'Biaya Notaris dan PPJB',            type:'service', category:'Legal',       unit:'txn',     price:   5000000, cost:  3000000 },
      { code:'PROD-00013', name:'Biaya Balik Nama Sertifikat',       type:'service', category:'Legal',       unit:'txn',     price:   3500000, cost:  2000000 },
      { code:'PROD-00014', name:'Jasa Desain Interior Konsultasi',   type:'service', category:'Konsultasi',  unit:'sesi',    price:   1500000, cost:   500000 },
      { code:'PROD-00015', name:'Biaya Pemeliharaan Gedung',         type:'service', category:'Maintenance', unit:'bulan',   price:   2500000, cost:  1200000 },
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, rows: [
      { code:'PROD-00001', name:'Tepung Terigu Cakra Kembar 25kg',  type:'raw_material', category:'Bahan Baku', unit:'sak',    price: 235000, cost: 195000 },
      { code:'PROD-00002', name:'Tepung Terigu Segitiga Biru 25kg', type:'raw_material', category:'Bahan Baku', unit:'sak',    price: 215000, cost: 175000 },
      { code:'PROD-00003', name:'Gula Pasir Lokal 50kg',            type:'raw_material', category:'Bahan Baku', unit:'karung', price: 480000, cost: 420000 },
      { code:'PROD-00004', name:'Mentega SCS 500gr',                type:'raw_material', category:'Bahan Baku', unit:'pcs',    price:  35000, cost:  27000 },
      { code:'PROD-00005', name:'Margarin Blue Band 1kg',           type:'raw_material', category:'Bahan Baku', unit:'pcs',    price:  28000, cost:  22000 },
      { code:'PROD-00006', name:'Susu Full Cream UHT 1L',          type:'raw_material', category:'Bahan Baku', unit:'liter',  price:  18000, cost:  14000 },
      { code:'PROD-00007', name:'Coklat Couverture Dark 1kg',      type:'raw_material', category:'Bahan Baku', unit:'kg',     price:  95000, cost:  76000 },
      { code:'PROD-00008', name:'Keju Prochiz Gold 1kg',           type:'raw_material', category:'Bahan Baku', unit:'kg',     price: 115000, cost:  92000 },
      { code:'PROD-00009', name:'Telur Ayam Segar Krat 30',        type:'raw_material', category:'Bahan Baku', unit:'krat',   price:  55000, cost:  43000 },
      { code:'PROD-00010', name:'Ragi Instant Fermipan 500gr',     type:'raw_material', category:'Bahan Baku', unit:'pcs',    price:  45000, cost:  34000 },
      { code:'PROD-00011', name:'Box Kue Premium 20x20x10',        type:'packaging',    category:'Kemasan',    unit:'pcs',    price:   6500, cost:   4500 },
      { code:'PROD-00012', name:'Box Roti Kraft Coklat',           type:'packaging',    category:'Kemasan',    unit:'pcs',    price:   3500, cost:   2500 },
      { code:'PROD-00013', name:'Plastik Sealer PP 30x40',         type:'packaging',    category:'Kemasan',    unit:'pak',    price:  35000, cost:  26000 },
      { code:'PROD-00014', name:'Roti Tawar Spesial 400gr',        type:'finished',     category:'Roti',       unit:'pcs',    price:  20000, cost:  12500 },
      { code:'PROD-00015', name:'Roti Tawar Gandum 400gr',         type:'finished',     category:'Roti',       unit:'pcs',    price:  22000, cost:  14000 },
      { code:'PROD-00016', name:'Donat Glazed Original',           type:'finished',     category:'Donat',      unit:'pcs',    price:  12000, cost:   7000 },
      { code:'PROD-00017', name:'Donat Coklat Premium',            type:'finished',     category:'Donat',      unit:'pcs',    price:  15000, cost:   8500 },
      { code:'PROD-00018', name:'Croissant Butter Premium',        type:'finished',     category:'Pastry',     unit:'pcs',    price:  18000, cost:  10000 },
      { code:'PROD-00019', name:'Bolu Kukus Pandan 18cm',         type:'finished',     category:'Kue',        unit:'pcs',    price:  45000, cost:  28000 },
      { code:'PROD-00020', name:'Kue Ulang Tahun 20cm Custom',    type:'finished',     category:'Kue',        unit:'pcs',    price: 250000, cost: 140000 },
      { code:'PROD-00021', name:'Brownies Amanda 20x9cm',         type:'finished',     category:'Kue',        unit:'kotak',  price:  75000, cost:  45000 },
      { code:'PROD-00022', name:'Muffin Blueberry 6pcs per box',  type:'finished',     category:'Kue',        unit:'box',    price:  65000, cost:  38000 },
      { code:'PROD-00023', name:'Hamper Lebaran Paket A',         type:'finished',     category:'Hamper',     unit:'paket',  price: 350000, cost: 195000 },
      { code:'PROD-00024', name:'Hamper Lebaran Paket B Premium', type:'finished',     category:'Hamper',     unit:'paket',  price: 550000, cost: 300000 },
    ]},
  ];
  await prisma.product.createMany({
    data: prodDefs.flatMap(({ companyId, createdBy, rows }) =>
      rows.map(r => ({ id: uuid(), companyId, createdBy, ...r, description: `Deskripsi: ${r.name}`, isActive: true }))
    ),
  });
  const allProducts = await prisma.product.findMany();
  console.log(`   ✓ ${allProducts.length} products`);

  // ───────────────────────────────────────────────────────────────────────────
  // 14. WAREHOUSES
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🏗️   Seeding warehouses...');
  const whDefs: { companyId: string; createdBy: string; rows: any[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, rows: [
      { name:'Gudang Bahan Baku Karawang',  code:'WH-001', address:'Kawasan Industri KIIC, Karawang' },
      { name:'Gudang WIP Karawang',         code:'WH-002', address:'Kawasan Industri KIIC, Karawang' },
      { name:'Gudang Produk Jadi Karawang', code:'WH-003', address:'Kawasan Industri KIIC, Karawang' },
      { name:'Gudang Distribusi Bekasi',    code:'WH-004', address:'Jl. Kalimalang No. 12, Bekasi' },
      { name:'Gudang Transit Surabaya',     code:'WH-005', address:'Jl. Rungkut Industri, Surabaya' },
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, rows: [
      { name:'Gudang Utama Sleman',         code:'WH-001', address:'Jl. Magelang KM 9, Sleman' },
      { name:'Gudang Display Yogyakarta',   code:'WH-002', address:'Jl. Malioboro, Yogyakarta' },
      { name:'Gudang Cabang Solo',          code:'WH-003', address:'Jl. Slamet Riyadi, Solo' },
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, rows: [
      { name:'Gudang Material BSD',         code:'WH-001', address:'Jl. Pahlawan Seribu, BSD City' },
      { name:'Gudang Peralatan Inventaris', code:'WH-002', address:'Jl. Pahlawan Seribu, BSD City' },
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, rows: [
      { name:'Cold Storage Depok',          code:'WH-001', address:'Jl. Raya Tapos, Depok' },
      { name:'Gudang Kering Dry Storage',   code:'WH-002', address:'Jl. Raya Tapos, Depok' },
      { name:'Gudang Kemasan Packaging',    code:'WH-003', address:'Jl. Raya Tapos, Depok' },
      { name:'Staging Area Pengiriman',     code:'WH-004', address:'Jl. Raya Tapos, Depok' },
    ]},
  ];
  await prisma.warehouse.createMany({
    data: whDefs.flatMap(({ companyId, createdBy, rows }) =>
      rows.map(r => ({ id: uuid(), companyId, createdBy, ...r, isActive: true }))
    ),
  });
  const allWarehouses = await prisma.warehouse.findMany();
  console.log(`   ✓ ${allWarehouses.length} warehouses`);

  // ───────────────────────────────────────────────────────────────────────────
  // 15. STOCKS + STOCK MOVEMENTS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📊  Seeding stocks & movements...');
  const stockSeen = new Set<string>();
  const stockRows: any[] = [];
  for (const wh of allWarehouses) {
    for (const prod of allProducts.filter(p => p.companyId === wh.companyId)) {
      const key = `${prod.id}::${wh.id}`;
      if (!stockSeen.has(key)) {
        stockSeen.add(key);
        stockRows.push({ id: uuid(), productId: prod.id, warehouseId: wh.id, quantity: randDec(0, 1000, 3) });
      }
    }
  }
  await prisma.stock.createMany({ data: stockRows });

  const smTypes = ['in','in','in','out','out','adjustment'];
  const smRows: any[] = [];
  for (let i = 1; i <= 200; i++) {
    const wh    = randPick(allWarehouses);
    const prods = allProducts.filter(p => p.companyId === wh.companyId);
    if (!prods.length) continue;
    const type = randPick(smTypes);
    const co   = companies.find(c => c.id === wh.companyId)!;
    const coUsers = allUsers.filter(u =>
      cuRows.some(cu => cu.userId === u.id && cu.companyId === co.id)
    );
    smRows.push({
      id: uuid(), productId: randPick(prods).id, warehouseId: wh.id, type,
      quantity: randDec(1, 200, 3),
      referenceNo: `${type === 'in' ? 'STIN' : type === 'out' ? 'STOUT' : 'STADJ'}-${pad(i, 6)}`,
      notes: `Mutasi stok ${type} #${i}`,
      createdBy: coUsers.length ? randPick(coUsers).id : ownerMap.get(co.id)!.id,
      createdAt: randDate(Y2023, NOW),
    });
  }
  await prisma.stockMovement.createMany({ data: smRows });
  console.log(`   ✓ ${stockRows.length} stocks, ${smRows.length} movements`);

  // ───────────────────────────────────────────────────────────────────────────
  // 16. PRODUCTIONS (c1 & c4, 50 total)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('⚙️   Seeding productions...');
  const batchStatuses = ['draft','in_progress','in_progress','completed','completed','completed','cancelled'];
  const batchRows: any[] = [];
  for (let i = 1; i <= 50; i++) {
    const co = i <= 25 ? c1 : c4;
    batchRows.push({
      id: uuid(), companyId: co.id,
      code:    `BATCH-${pad(i, 6)}`,
      batchNo: `B2024-${pad(randInt(1000,9999),4)}`,
      date:    randDate(Y2023, NOW),
      status:  randPick(batchStatuses),
      notes:   `Batch ke-${i} — ${randPick(['Reguler','Rush order','Ekspor','Stok cadangan'])}`,
      createdBy: i <= 25 ? uOwnerMBS.id : uOwnerSRF.id,
    });
  }
  await prisma.production.createMany({ data: batchRows });
  const allProds = await prisma.production.findMany();
  const piRows: any[] = [];
  for (const prod of allProds) {
    const prods = allProducts.filter(p => p.companyId === prod.companyId);
    if (!prods.length) continue;
    for (let j = 0; j < randInt(2,4); j++)
      piRows.push({ id: uuid(), productionId: prod.id, productId: randPick(prods).id, quantity: randDec(5,200,3), type: 'input',  notes: 'Bahan input produksi' });
    for (let j = 0; j < randInt(1,2); j++)
      piRows.push({ id: uuid(), productionId: prod.id, productId: randPick(prods).id, quantity: randDec(10,500,3), type: 'output', notes: 'Hasil produksi' });
  }
  await prisma.productionItem.createMany({ data: piRows });
  console.log(`   ✓ ${allProds.length} productions, ${piRows.length} items`);

  // ───────────────────────────────────────────────────────────────────────────
  // 17. TRANSACTIONS (63 per company = 252)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('💰  Seeding transactions...');
  const txCategories: Record<string, { income: string[]; expense: string[] }> = {
    [c1.id]: {
      income:  ['Penjualan Produk Jadi','Penjualan Ekspor','Penjualan Scrap','Pendapatan Sewa Alat','Penjualan Online B2B'],
      expense: ['Pembelian Bahan Baku','Gaji & THR Karyawan','Biaya Listrik Pabrik','Biaya Gas & BBM','Biaya Perawatan Mesin','Biaya Pengiriman','Biaya Sertifikasi ISO','Pajak PPh Badan'],
    },
    [c2.id]: {
      income:  ['Penjualan Laptop','Penjualan Printer & Aksesori','Penjualan Komponen IT','Pendapatan Service Center','Penjualan Online Marketplace'],
      expense: ['Pembelian Stok Barang','Gaji Karyawan','Biaya Sewa Toko','Biaya Listrik & Internet','Biaya Marketing Digital','Biaya Pengiriman'],
    },
    [c3.id]: {
      income:  ['Komisi Penjualan Properti','Pendapatan Sewa Ruko','Pendapatan Sewa Apartemen','Biaya Konsultasi','Pendapatan Pemasaran'],
      expense: ['Gaji Karyawan & Agen','Biaya Iklan Properti','Biaya Notaris & Legal','Biaya Pemeliharaan','Pajak Bumi Bangunan','Biaya Asuransi Properti'],
    },
    [c4.id]: {
      income:  ['Penjualan Roti & Kue Outlet','Penjualan B2B Hotel Kafe','Penjualan Online','Penjualan Hamper','Penjualan Katering Event'],
      expense: ['Pembelian Bahan Baku','Gaji Karyawan','Biaya Listrik Gas Dapur','Biaya Sewa Outlet','Biaya Kemasan','Biaya Pengiriman','Biaya Sertifikasi BPOM'],
    },
  };
  const txStatuses = ['draft','approved','approved','approved'];
  const txRows: any[] = [];
  let txI = 1, txE = 1;
  for (const co of companies) {
    const owner = ownerMap.get(co.id)!;
    const cats  = txCategories[co.id];
    for (let i = 0; i < 30; i++) {
      txRows.push({
        id: uuid(), companyId: co.id, code: `INC-${pad(txI++, 6)}`,
        type: 'income', category: randPick(cats.income),
        amount: randDec(500000, co.id === c3.id ? 200000000 : 80000000, 0),
        date: randDate(Y2023, NOW), status: randPick(txStatuses),
        description: `Pemasukan dari ${randPick(cats.income)}`, createdBy: owner.id,
      });
    }
    for (let i = 0; i < 33; i++) {
      txRows.push({
        id: uuid(), companyId: co.id, code: `EXP-${pad(txE++, 6)}`,
        type: 'expense', category: randPick(cats.expense),
        amount: randDec(250000, co.id === c3.id ? 50000000 : 30000000, 0),
        date: randDate(Y2023, NOW), status: randPick(txStatuses),
        description: `Pengeluaran ${randPick(cats.expense)}`, createdBy: owner.id,
      });
    }
  }
  await prisma.transaction.createMany({ data: txRows });
  const allTx = await prisma.transaction.findMany();
  console.log(`   ✓ ${txRows.length} transactions`);

  // ───────────────────────────────────────────────────────────────────────────
  // 18. PURCHASES (37 per company = 148)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🛒  Seeding purchases...');
  const poStatuses = ['draft','approved','approved','received','received'];
  const poRows: any[] = [];
  let poSeq = 1;
  for (const co of companies) {
    const owner   = ownerMap.get(co.id)!;
    const vendors = allVendors.filter(v => v.companyId === co.id);
    for (let i = 0; i < 37; i++) {
      poRows.push({
        id: uuid(), companyId: co.id, vendorId: randPick(vendors).id,
        code:  `PO-${pad(poSeq++, 6)}`,
        date:  randDate(Y2023, NOW),
        total: randDec(1000000, co.id === c1.id ? 500000000 : 100000000, 0),
        status: randPick(poStatuses),
        notes: `PO ${randPick(['reguler','urgent','blanket order','trial order'])} #${poSeq-1}`,
        createdBy: owner.id,
      });
    }
  }
  await prisma.purchase.createMany({ data: poRows });
  const allPurchases = await prisma.purchase.findMany();
  console.log(`   ✓ ${poRows.length} purchases`);

  // ───────────────────────────────────────────────────────────────────────────
  // 19. LEASES (40 — c3 Real Estate)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🏠  Seeding leases...');
  const unitPool  = [
    'Unit Ruko A-01','Unit Ruko A-02','Unit Ruko A-03','Unit Ruko B-01','Unit Ruko B-02',
    'Apartemen Studio 501','Apartemen Studio 502','Apartemen 1BR 601','Apartemen 1BR 602',
    'Apartemen 2BR 701','Kavling Blok C-01','Kavling Blok C-02','Office Space 3A',
    'Kios Modern 12','Kios Modern 13','Warehouse Unit W-01',
  ];
  const propLocs  = ['Kemang Village','Kelapa Gading','BSD City','Alam Sutera','Bintaro Jaya'];
  const c3Custs   = allCustomers.filter(c => c.companyId === c3.id);
  const leaseRows: any[] = [];
  for (let i = 0; i < 40; i++) {
    const startDate = randDate(Y2022, Y2025);
    const months    = randInt(6, 36);
    const endDate   = new Date(startDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    const unit      = randPick(unitPool);
    leaseRows.push({
      id: uuid(), companyId: c3.id, customerId: randPick(c3Custs).id,
      unitName:  `${unit} - ${randPick(propLocs)}`,
      startDate, endDate,
      amount:    unit.includes('Kavling') ? randDec(5000000, 20000000, 0) : randDec(2000000, 15000000, 0),
      status:    endDate < NOW ? randPick(['completed','cancelled']) : 'active',
      notes:     `Kontrak ${months} bulan — ${randPick(['Hunian','Komersial','Investasi'])}`,
      createdBy: uOwnerNPG.id,
    });
  }
  await prisma.lease.createMany({ data: leaseRows });
  console.log(`   ✓ ${leaseRows.length} leases`);

  // ───────────────────────────────────────────────────────────────────────────
  // 20. OPERATION POINTS & ACTIVITIES
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📌  Seeding operation points...');
  const opDefs: { companyId: string; createdBy: string; rows: any[] }[] = [
    { companyId: c1.id, createdBy: uOwnerMBS.id, rows: [
      { name:'Depo Jakarta Timur',         type:'branch', address:'Jl. Raya Bekasi KM 20, Jakarta Timur' },
      { name:'Depo Distribusi Surabaya',   type:'branch', address:'Jl. HR. Muhammad No. 75, Surabaya' },
      { name:'Depo Distribusi Semarang',   type:'branch', address:'Jl. Industri No. 15, Semarang' },
      { name:'Showroom Jakarta Selatan',   type:'outlet', address:'Jl. TB Simatupang No. 5, Jakarta Selatan' },
      { name:'Showroom Bandung',           type:'outlet', address:'Jl. Asia Afrika No. 65, Bandung' },
    ]},
    { companyId: c2.id, createdBy: uOwnerKMD.id, rows: [
      { name:'Toko Utama Malioboro',       type:'outlet', address:'Jl. Malioboro No. 22, Yogyakarta' },
      { name:'Counter Ambarukmo Plaza',    type:'pos',    address:'Ambarukmo Plaza Lt. 2, Yogyakarta' },
      { name:'Counter Hartono Mall',       type:'pos',    address:'Hartono Mall Lt. 1, Yogyakarta' },
      { name:'Toko Solo Paragon',          type:'outlet', address:'Solo Paragon Mall Lt. 1, Solo' },
      { name:'Toko Magelang Square',       type:'outlet', address:'Magelang Square Lt. 2, Magelang' },
      { name:'Online Store Tokopedia',     type:'pos',    address:'Online — Tokopedia Official Store' },
      { name:'Online Store Shopee',        type:'pos',    address:'Online — Shopee Official Store' },
    ]},
    { companyId: c3.id, createdBy: uOwnerNPG.id, rows: [
      { name:'Galeri Properti BSD City',   type:'branch', address:'Jl. Pahlawan Seribu, BSD City' },
      { name:'Galeri Properti Kemang',     type:'branch', address:'Jl. Kemang Raya, Jakarta Selatan' },
      { name:'Galeri Properti Senayan',    type:'outlet', address:'Senayan City Lt. LG, Jakarta' },
      { name:'Galeri Properti PIK',        type:'outlet', address:'Pantai Indah Kapuk, Jakarta Utara' },
    ]},
    { companyId: c4.id, createdBy: uOwnerSRF.id, rows: [
      { name:'Outlet Summarecon Bekasi',   type:'outlet', address:'Summarecon Mall Bekasi Lt. 1' },
      { name:'Outlet Grand Indonesia',     type:'outlet', address:'Grand Indonesia Shopping Town Lt. 3A' },
      { name:'Outlet Pondok Indah Mall',   type:'outlet', address:'Pondok Indah Mall 2 Lt. GF' },
      { name:'Outlet Lippo Mall Puri',     type:'outlet', address:'Lippo Mall Puri Lt. 1, Jakarta Barat' },
      { name:'Kios Pasar Santa',           type:'pos',    address:'Pasar Santa Lt. 2, Kebayoran Baru' },
      { name:'Kios Pasar Modern BSD',      type:'pos',    address:'Pasar Modern BSD City, Tangerang' },
      { name:'Online GoFood GrabFood',     type:'pos',    address:'Online — GoFood & GrabFood' },
      { name:'Online Tokopedia',           type:'pos',    address:'Online — Tokopedia Official Store' },
      { name:'Booth Event dan Pameran',    type:'pos',    address:'Mobile / Event-based' },
    ]},
  ];
  await prisma.operationPoint.createMany({
    data: opDefs.flatMap(({ companyId, createdBy, rows }) =>
      rows.map(r => ({ id: uuid(), companyId, createdBy, ...r, isActive: Math.random() > 0.1 }))
    ),
  });
  const allOpPoints = await prisma.operationPoint.findMany();
  const oaRows: any[] = [];
  for (let i = 0; i < 150; i++) {
    const op    = randPick(allOpPoints);
    const prods = allProducts.filter(p => p.companyId === op.companyId);
    const owner = ownerMap.get(op.companyId)!;
    oaRows.push({
      id: uuid(), operationPointId: op.id,
      productId: prods.length ? randPick(prods).id : null,
      date: randDate(Y2023, NOW), quantity: randDec(1, 100, 3),
      notes: randPick(['Penjualan harian','Demo produk','Event promosi','Pengecekan stok','Retur pelanggan',null]),
      createdBy: owner.id,
    });
  }
  await prisma.operationActivity.createMany({ data: oaRows });
  console.log(`   ✓ ${allOpPoints.length} operation points, ${oaRows.length} activities`);

  // ───────────────────────────────────────────────────────────────────────────
  // 21. DOCUMENTS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📄  Seeding documents...');
  const dtypes = [
    { ext:'pdf',  mime:'application/pdf' },
    { ext:'pdf',  mime:'application/pdf' },
    { ext:'docx', mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { ext:'xlsx', mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { ext:'jpg',  mime:'image/jpeg' },
  ];
  const allLeases = await prisma.lease.findMany({ take: 30 });
  const docGroups = [
    { type:'transaction', entities: allTx.slice(0, 80) },
    { type:'purchase',    entities: allPurchases.slice(0, 50) },
    { type:'lease',       entities: allLeases },
  ];
  const docRows: any[] = [];
  for (const { type, entities } of docGroups) {
    for (const e of entities) {
      const dt = randPick(dtypes);
      const co = companies.find(c => c.id === (e as any).companyId)!;
      const owner = ownerMap.get(co?.id ?? c1.id)!;
      docRows.push({
        id: uuid(), entityType: type, entityId: e.id,
        fileName:   `${type}-${((e as any).code ?? e.id.slice(0,8))}.${dt.ext}`,
        filePath:   `/uploads/${type}s/${e.id}/document.${dt.ext}`,
        fileSize:   randInt(50000, 8000000), mimeType: dt.mime,
        uploadedBy: owner.id,
      });
    }
  }
  await prisma.document.createMany({ data: docRows });
  console.log(`   ✓ ${docRows.length} documents`);

  // ───────────────────────────────────────────────────────────────────────────
  // 22. APPROVALS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('✅  Seeding approvals...');
  const apStatuses = ['pending','pending','approved','approved','approved','rejected'];
  const apGroups   = [
    { type:'transaction', items: allTx.slice(0, 60) },
    { type:'purchase',    items: allPurchases.slice(0, 40) },
    { type:'production',  items: allProds.slice(0, 20) },
    { type:'lease',       items: allLeases.slice(0, 20) },
  ];
  const apRows: any[] = [];
  for (const { type, items } of apGroups) {
    for (const item of items) {
      const co     = companies.find(c => c.id === (item as any).companyId)!;
      const owner  = ownerMap.get(co?.id ?? c1.id)!;
      for (let lvl = 1; lvl <= randInt(1, 2); lvl++) {
        const status = randPick(apStatuses);
        apRows.push({
          id: uuid(), entityType: type, entityId: item.id,
          approverId: owner.id, status, level: lvl,
          notes: status === 'approved' ? 'Disetujui oleh owner' : status === 'rejected' ? 'Ditolak — perlu revisi' : null,
        });
      }
    }
  }
  await prisma.approval.createMany({ data: apRows });
  console.log(`   ✓ ${apRows.length} approvals`);

  // ───────────────────────────────────────────────────────────────────────────
  // 23. NOTIFICATIONS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔔  Seeding notifications...');
  const notifPool = [
    { type:'reminder', titles:['Kontrak sewa hampir jatuh tempo','Stok produk menipis','Jadwal perawatan aset','Tagihan jatuh tempo'] },
    { type:'alert',    titles:['Transaksi besar terdeteksi','Stok habis segera reorder','Login perangkat baru','Anomali transaksi'] },
    { type:'approval', titles:['PO menunggu persetujuan Anda','Transaksi perlu disetujui','Pengajuan cuti karyawan','Kontrak baru perlu ditandatangani'] },
  ];
  const notifRows: any[] = [];
  for (let i = 0; i < 120; i++) {
    const pool  = randPick(notifPool);
    const titl  = randPick(pool.titles);
    const read  = Math.random() > 0.45;
    // Notifikasi hanya dikirim ke user yang terdaftar di suatu company
    const cuUser = randPick(cuRows);
    notifRows.push({
      id: uuid(), userId: cuUser.userId, type: pool.type, title: titl,
      message: `${titl}. Harap segera tindak lanjuti.`,
      isRead: read, readAt: read ? randDate(Y2024, NOW) : null,
      createdAt: randDate(Y2023, NOW),
    });
  }
  await prisma.notification.createMany({ data: notifRows });
  console.log(`   ✓ ${notifRows.length} notifications`);

  // ───────────────────────────────────────────────────────────────────────────
  // 24. TAGS & TAGGABLES
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🏷️   Seeding tags...');
  const tagDefs = [
    { name:'VIP',            color:'#f59e0b' }, { name:'Prioritas',      color:'#ef4444' },
    { name:'Pelanggan Baru', color:'#3b82f6' }, { name:'Blacklist',      color:'#111827' },
    { name:'Menunggu',       color:'#8b5cf6' }, { name:'Selesai',        color:'#10b981' },
    { name:'Bermasalah',     color:'#f97316' }, { name:'Promo',          color:'#ec4899' },
    { name:'Ekspor',         color:'#06b6d4' }, { name:'B2B',            color:'#6366f1' },
    { name:'B2C',            color:'#84cc16' }, { name:'Loyal',          color:'#a855f7' },
    { name:'Potensial',      color:'#0ea5e9' }, { name:'Diskon Khusus',  color:'#f43f5e' },
    { name:'KOL Reseller',   color:'#14b8a6' },
  ];
  await prisma.tag.createMany({ data: tagDefs.map(d => ({ id: uuid(), ...d })) });
  const allTags = await prisma.tag.findMany();
  const tgSeen  = new Set<string>();
  const tgRows: any[] = [];
  for (let i = 0; i < 120; i++) {
    const type  = randPick(['customer','vendor','product']);
    let entityId: string;
    if (type === 'customer')      entityId = randPick(allCustomers).id;
    else if (type === 'vendor')   entityId = randPick(allVendors).id;
    else                          entityId = randPick(allProducts).id;
    const tag = randPick(allTags);
    const key = `${tag.id}::${type}::${entityId}`;
    if (!tgSeen.has(key)) {
      tgSeen.add(key);
      tgRows.push({ id: uuid(), tagId: tag.id, entityType: type, entityId });
    }
  }
  await prisma.taggable.createMany({ data: tgRows });
  console.log(`   ✓ ${allTags.length} tags, ${tgRows.length} taggables`);

  // ───────────────────────────────────────────────────────────────────────────
  // 25. AUDIT LOGS (200)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('📝  Seeding audit logs...');
  const alActions  = ['create','update','update','delete'];
  const alMods     = ['customers','vendors','products','transactions','purchases','employees','warehouses','productions'];
  const alEntities = ['customer','vendor','product','transaction','purchase','employee','warehouse','production'];
  const alRows: any[] = [];
  for (let i = 0; i < 200; i++) {
    const co    = randPick(companies);
    const owner = ownerMap.get(co.id)!;
    const act   = randPick(alActions);
    alRows.push({
      id: uuid(), companyId: co.id, userId: owner.id,
      createdBy:  Math.random() > 0.4 ? owner.id : null,
      module:     randPick(alMods), action: act,
      entityType: randPick(alEntities), entityId: uuid(),
      oldData:    act !== 'create' ? JSON.stringify({ status:'draft' }) : null,
      newData:    act !== 'delete' ? JSON.stringify({ status: randPick(['approved','completed','active']) }) : null,
      ipAddress:  `${randInt(1,254)}.${randInt(1,254)}.${randInt(1,254)}.${randInt(1,254)}`,
      userAgent:  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt:  randDate(Y2023, NOW),
    });
  }
  await prisma.auditLog.createMany({ data: alRows });
  console.log(`   ✓ ${alRows.length} audit logs`);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const counts = await Promise.all([
    prisma.user.count(), prisma.company.count(), prisma.module.count(),
    prisma.role.count(), prisma.permission.count(), prisma.rolePermission.count(),
    prisma.companyUser.count(), prisma.codeConfig.count(), prisma.location.count(),
    prisma.asset.count(), prisma.employee.count(), prisma.customer.count(),
    prisma.vendor.count(), prisma.product.count(), prisma.warehouse.count(),
    prisma.stock.count(), prisma.stockMovement.count(), prisma.production.count(),
    prisma.productionItem.count(), prisma.transaction.count(), prisma.purchase.count(),
    prisma.lease.count(), prisma.operationPoint.count(), prisma.operationActivity.count(),
    prisma.document.count(), prisma.approval.count(), prisma.notification.count(),
    prisma.tag.count(), prisma.taggable.count(), prisma.auditLog.count(),
  ]);
  const labels = [
    'Users','Companies','Modules','Roles','Permissions','Role-Permissions',
    'Company Users','Code Configs','Locations','Assets','Employees','Customers',
    'Vendors','Products','Warehouses','Stocks','Stock Movements','Productions',
    'Production Items','Transactions','Purchases','Leases','Operation Points',
    'Op. Activities','Documents','Approvals','Notifications','Tags','Taggables','Audit Logs',
  ];
  console.log('\n' + '═'.repeat(50));
  console.log('✅  SEED COMPLETED — Multi-Tenant ERP');
  console.log('═'.repeat(50));
  labels.forEach((l, i) => console.log(`   ${l.padEnd(24)}: ${String(counts[i]).padStart(5)}`));
  console.log('═'.repeat(50));
  console.log('\n📋  Struktur Role & Permission:');
  console.log('   Owner          → SEMUA permission (110/110)');
  console.log('   Role lain      → Permission sesuai konfigurasi per company');
  console.log('\n🔐  Login Credentials — Password: Password123!');
  console.log('─'.repeat(50));
  console.log('   PT Maju Bersama Sejahtera (Manufacturing)');
  console.log('   budi.hartono@nexora.id        → Owner');
  console.log('   andi.prasetyo@nexora.id       → Administrator');
  console.log('   hendra.wijaya@nexora.id       → Finance');
  console.log('');
  console.log('   CV Karya Mandiri Digital (Trading)');
  console.log('   sari.dewi@nexora.id           → Owner');
  console.log('   nina.kurniawati@nexora.id     → Administrator');
  console.log('   ratna.sari@nexora.id          → Kepala Toko');
  console.log('');
  console.log('   PT Nusantara Property Group (Real Estate)');
  console.log('   agus.wibowo@nexora.id         → Owner');
  console.log('   deni.setiawan@nexora.id       → Direktur');
  console.log('   fajar.nugroho@nexora.id       → Finance & Akuntansi');
  console.log('');
  console.log('   UD Sumber Rejeki Food (F&B)');
  console.log('   rina.marlina@nexora.id        → Owner');
  console.log('   maya.fitriani@nexora.id       → Manajer Operasional');
  console.log('   wulan.permatasari@nexora.id   → Kepala Produksi\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
