export type RequirementType = 'SR' | 'US';
export type RequirementStatus = 'pending' | 'approved' | 'rejected';
export type RequirementStage = '提议' | '计划' | '开发' | '测试' | '上线';

export interface Requirement {
  id: string;
  requirementNumber: string;
  type: RequirementType;
  title: string;
  description: string;
  source: string;
  valueDescription: string;
  status: RequirementStatus;
  deliveryDate: string;
  priority: number;
  parentId?: string;
  overallOwner?: string;
  stage?: RequirementStage;
  workloadEstimate?: string;
  marketOwner?: string;
  designOwner?: string;
  developmentOwner?: string;
  testOwner?: string;
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
  overallOwner?: string;
  stage?: RequirementStage;
  workloadEstimate?: string;
  marketOwner?: string;
  designOwner?: string;
  developmentOwner?: string;
  testOwner?: string;
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
