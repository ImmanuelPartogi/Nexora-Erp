// src/modules/data/location/location.service.ts
import { LocationRepository } from './location.repository';
import { NotFoundError } from '../../../shared/errors/AppError';
import { CreateLocationDTO, UpdateLocationDTO, LocationListQuery } from './location.types';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async list(companyId: string, query: LocationListQuery) {
    return this.locationRepository.findAll(companyId, query);
  }

  async getById(id: string, companyId: string) {
    const location = await this.locationRepository.findById(id, companyId);
    
    if (!location) {
      throw new NotFoundError('Location not found');
    }

    return location;
  }

  async create(data: CreateLocationDTO) {
    return this.locationRepository.create(data);
  }

  async update(id: string, companyId: string, data: UpdateLocationDTO) {
    const location = await this.getById(id, companyId);
    return this.locationRepository.update(location.id, data);
  }

  async delete(id: string, companyId: string) {
    const location = await this.getById(id, companyId);
    return this.locationRepository.softDelete(location.id);
  }
}