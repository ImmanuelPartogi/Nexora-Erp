// src/modules/operations/lease/lease.service.ts
import { prisma } from '../../../shared/db/prisma';
import { CreateLeaseRequest } from './lease.types';
import { NotFoundError, BadRequestError } from '../../../shared/errors/AppError';

export class LeaseService {
  // ✅ FIX: Transform response + flatten customerName
  async list(companyId: string) {
    const leases = await prisma.lease.findMany({
      where: { companyId, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    // ✅ Transform: customer.name → customerName (sesuai frontend type)
    return leases.map(lease => ({
      id: lease.id,
      companyId: lease.companyId,
      customerId: lease.customerId,
      customerName: lease.customer?.name || 'Unknown', // ✅ Flatten
      unitName: lease.unitName,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      amount: Number(lease.amount), // ✅ Decimal to number
      status: lease.status,
      notes: lease.notes,
      createdAt: lease.createdAt.toISOString(),
      updatedAt: lease.updatedAt.toISOString(),
    }));
  }

  // ✅ FIX: getById juga perlu transform
  async getById(id: string, companyId: string) {
    const lease = await prisma.lease.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    if (!lease) throw new NotFoundError('Lease not found');

    // ✅ Transform sama seperti list
    return {
      id: lease.id,
      companyId: lease.companyId,
      customerId: lease.customerId,
      customerName: lease.customer?.name || 'Unknown',
      unitName: lease.unitName,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      amount: Number(lease.amount),
      status: lease.status,
      notes: lease.notes,
      createdAt: lease.createdAt.toISOString(),
      updatedAt: lease.updatedAt.toISOString(),
    };
  }

  async create(data: CreateLeaseRequest, companyId: string, userId: string) {
    // ✅ Validasi customer exists
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, companyId, deletedAt: null },
    });
    if (!customer) throw new NotFoundError('Customer not found');

    // ✅ Validasi date logic
    if (data.startDate >= data.endDate) {
      throw new NotFoundError('End date must be after start date');
    }

    // ✅ Create lease dengan status
    const lease = await prisma.lease.create({
      data: {
        companyId,
        customerId: data.customerId,
        unitName: data.unitName,
        startDate: data.startDate,
        endDate: data.endDate,
        amount: data.amount,
        status: data.status || 'active',
        notes: data.notes,
        createdBy: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    // ✅ Transform response
    return {
      id: lease.id,
      companyId: lease.companyId,
      customerId: lease.customerId,
      customerName: lease.customer?.name || 'Unknown',
      unitName: lease.unitName,
      startDate: lease.startDate.toISOString(),
      endDate: lease.endDate.toISOString(),
      amount: Number(lease.amount),
      status: lease.status,
      notes: lease.notes,
      createdAt: lease.createdAt.toISOString(),
      updatedAt: lease.updatedAt.toISOString(),
    };
  }

  // ✅ TAMBAH: Complete lease
  async complete(id: string, companyId: string, userId: string) {
    // Validasi lease exists
    const lease = await prisma.lease.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!lease) throw new NotFoundError('Lease not found');

    // Validasi status transition
    if (lease.status === 'completed') {
      throw new BadRequestError('Lease is already completed');
    }
    if (lease.status === 'cancelled') {
      throw new BadRequestError('Cannot complete a cancelled lease');
    }

    // Update status ke completed
    const updated = await prisma.lease.update({
      where: { id },
      data: {
        status: 'completed',
        updatedBy: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    // Transform response
    return {
      id: updated.id,
      companyId: updated.companyId,
      customerId: updated.customerId,
      customerName: updated.customer?.name || 'Unknown',
      unitName: updated.unitName,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      amount: Number(updated.amount),
      status: updated.status,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // ✅ TAMBAH: Cancel lease
  async cancel(id: string, companyId: string, userId: string) {
    // Validasi lease exists
    const lease = await prisma.lease.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!lease) throw new NotFoundError('Lease not found');

    // Validasi status transition
    if (lease.status === 'cancelled') {
      throw new BadRequestError('Lease is already cancelled');
    }
    if (lease.status === 'completed') {
      throw new BadRequestError('Cannot cancel a completed lease');
    }

    // Update status ke cancelled
    const updated = await prisma.lease.update({
      where: { id },
      data: {
        status: 'cancelled',
        updatedBy: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    // Transform response
    return {
      id: updated.id,
      companyId: updated.companyId,
      customerId: updated.customerId,
      customerName: updated.customer?.name || 'Unknown',
      unitName: updated.unitName,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      amount: Number(updated.amount),
      status: updated.status,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}