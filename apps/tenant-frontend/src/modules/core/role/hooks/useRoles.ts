// ============================================
// FILE: frontend/src/modules/core/role/hooks/useRoles.ts
// FIX: Explicit types, better error handling, prevent double call
// ============================================

import { useState, useEffect, useRef } from 'react';
import { roleApi } from '@/shared/api/role.api';
import { Role, PermissionGroup, PaginatedResponse } from '@/shared/types';

// ============================================
// Hook for roles list with pagination
// ============================================
export const useRoles = () => {
  const [data, setData] = useState<PaginatedResponse<Role> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRoles = async () => {
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      setError(null);
      
      const response = await roleApi.list();
      
      // ✅ Response sudah dalam format { data: Role[], pagination: {...} }
      setData(response);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Failed to load roles:', err);
        setError(err.message || 'Failed to load roles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, isLoading, error, refetch: fetchRoles };
};

// ============================================
// Hook for available permissions grouped by module
// ============================================
export const usePermissions = () => {
  const [data, setData] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        setIsLoading(true);
        setError(null);
        
        const response = await roleApi.getPermissions();
        
        // ✅ Response langsung array PermissionGroup[]
        // Backend return: [{ module: "customers", moduleName: "Customers", permissions: ["customers.view", ...] }]
        console.log('✅ Permissions loaded:', response);
        
        // ✅ Validate response is array
        if (!Array.isArray(response)) {
          throw new Error('Invalid data format: Expected array, received object');
        }
        
        setData(response);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to load permissions:', err);
          setError(err.message || 'Failed to load permissions');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPermissions();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, isLoading, error };
};