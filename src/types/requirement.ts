export type RequirementType = 'SR' | 'US';
export type RequirementStatus = 'pending' | 'approved' | 'rejected';

export interface Requirement {
  id: string;
  type: RequirementType;
  title: string;
  description: string;
  source: string;
  valueDescription: string;
  status: RequirementStatus;
  deliveryDate: string;
  priority: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementFormData {
  type: RequirementType;
  title: string;
  description: string;
  source: string;
  valueDescription: string;
  status: RequirementStatus;
  deliveryDate: string;
  priority: number;
  parentId?: string;
}

export interface FilterState {
  status: string;
  priority: string;
  searchQuery: string;
}

export interface SortState {
  field: keyof Requirement;
  direction: 'asc' | 'desc';
}
