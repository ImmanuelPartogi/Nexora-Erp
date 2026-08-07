// src/modules/operations/lease/lease.types.ts

export interface CreateLeaseRequest {
  customerId: string;
  unitName: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  status?: 'active' | 'completed' | 'cancelled'; // ✅ TAMBAH INI
  notes?: string;
}

export interface UpdateLeaseRequest {
  customerId?: string;
  unitName?: string;
  startDate?: Date;
  endDate?: Date;
  amount?: number;
  status?: 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface LeaseResponse {
  id: string;
  companyId: string;
  customerId: string;
  unitName: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy?: string;
  customer?: {
    id: string;
    name: string;
  };
}