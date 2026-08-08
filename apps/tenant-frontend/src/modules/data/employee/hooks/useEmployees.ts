import { useCallback } from 'react';
import { employeeApi } from '@/shared/api/employee.api';
import { Employee, ListQueryParams } from '@/shared/types';
import { useResource, useResourceById } from '@/shared/hooks/useResource';

type EmployeeParams = ListQueryParams & { status?: string; department?: string };

export const useEmployees = (params?: EmployeeParams) => {
  const fetchFn = useCallback((p?: EmployeeParams) => employeeApi.list(p), []);
  return useResource<Employee, EmployeeParams>({ fetchFn, params });
};

export const useEmployee = (id: string) => {
  const fetchFn = useCallback((targetId: string) => employeeApi.getById(targetId), []);
  return useResourceById<Employee>({ fetchFn, id });
};