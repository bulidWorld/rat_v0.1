import { useState, useEffect, useCallback } from 'react';
import { Requirement, RequirementFormData } from '../types/requirement';

export function useRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/requirements');
      const data = await response.json();
      
      if (response.ok) {
        setRequirements(data.requirements);
      } else {
        console.error('Failed to load requirements:', data.error);
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  const createRequirement = useCallback(async (formData: RequirementFormData) => {
    try {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await loadRequirements();
        return data.requirement;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error creating requirement:', error);
      throw error;
    }
  }, [loadRequirements]);

  const updateRequirement = useCallback(async (id: string, formData: RequirementFormData) => {
    try {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await loadRequirements();
        return data.requirement;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
      throw error;
    }
  }, [loadRequirements]);

  const deleteRequirement = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await loadRequirements();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting requirement:', error);
      throw error;
    }
  }, [loadRequirements]);

  const updateRequirementStatus = useCallback(async (id: string, status: Requirement['status']) => {
    try {
      const response = await fetch(`/api/requirements/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await loadRequirements();
        return data.requirement;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating requirement status:', error);
      throw error;
    }
  }, [loadRequirements]);

  const filterAndSortRequirements = useCallback((
    statusFilter: string,
    priorityFilter: string,
    searchQuery: string,
    sortField: keyof Requirement,
    sortDirection: 'asc' | 'desc'
  ) => {
    let filtered = [...requirements];

    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (priorityFilter) {
      const [min, max] = priorityFilter.split('-').map(Number);
      filtered = filtered.filter(r => r.priority >= min && r.priority <= max);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.source.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      if (a.type === 'SR' && b.type === 'US') {
        if (b.parentId === a.id) return -1;
      }
      if (a.type === 'US' && b.type === 'SR') {
        if (a.parentId === b.id) return 1;
      }
      if (a.parentId && b.parentId && a.parentId === b.parentId) {
        return a.priority - b.priority;
      }

      let comparison = 0;
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        const aDate = new Date(a[sortField]).getTime();
        const bDate = new Date(b[sortField]).getTime();
        comparison = aDate - bDate;
      } else if (sortField === 'priority') {
        comparison = a.priority - b.priority;
      } else {
        const aStr = String(a[sortField]);
        const bStr = String(b[sortField]);
        comparison = aStr.localeCompare(bStr);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requirements]);

  const initializeSampleData = useCallback(async () => {
    try {
      const response = await fetch('/api/init', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await loadRequirements();
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }, [loadRequirements]);

  return {
    requirements,
    loading,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    updateRequirementStatus,
    filterAndSortRequirements,
    refreshRequirements: loadRequirements,
    initializeSampleData
  };
}