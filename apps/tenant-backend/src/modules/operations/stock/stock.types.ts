  // ============================================
  // FILE: src/modules/operations/stock/stock.types.ts
  // ✅ FIX: Tambah referenceNo
  // ============================================

  export interface StockMovementRequest {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    referenceNo?: string; // ✅ FIX: Tambah field ini (sesuai dengan service)
    notes?: string;
  }

  export interface StockListQuery {
    page?: string | number;
    limit?: string | number;
    warehouseId?: string;
    productId?: string;
    search?: string;
  }