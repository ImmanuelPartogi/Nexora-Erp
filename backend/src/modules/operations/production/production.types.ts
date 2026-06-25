// ============================================
// FILE: src/modules/operations/production/production.types.ts
// ✅ FIX: Sesuaikan dengan request frontend
// ============================================

export interface CreateProductionRequest {
  batchNo?: string;       // ✅ TAMBAH: Frontend kirim ini
  productId: string;      // ✅ TAMBAH: Output product
  quantity: number;       // ✅ TAMBAH: Output quantity
  date: Date | string;    // ✅ UBAH: Accept string juga
  notes?: string;
  inputs: Array<{         // ✅ UBAH: Dari "items" jadi "inputs"
    productId: string;
    quantity: number;
  }>;
}