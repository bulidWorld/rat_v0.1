export interface Progress {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  attachments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressFormData {
  title: string;
  description: string;
  attachments?: string;
}
