'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequirements } from '../../lib/useRequirements';
import { RequirementFormData, RequirementStage } from '../../types/requirement';

const defaultFormData: RequirementFormData = {
  type: 'SR',
  title: '',
  description: '',
  source: '',
  valueDescription: '',
  status: 'pending',
  deliveryDate: '',
  priority: 5,
  parentId: undefined,
  overallOwner: '',
  stage: undefined,
  workloadEstimate: '',
  marketOwner: '',
  designOwner: '',
  developmentOwner: '',
  testOwner: ''
};

const stageOptions: RequirementStage[] = ['提议', '计划', '开发', '测试', '上线'];

export default function CreateRequirement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requirements, createRequirement, updateRequirement, loading } = useRequirements();
  
  const editId = searchParams.get('edit');
  const initialType = searchParams.get('type') as 'SR' | 'US' | null;
  const initialParentId = searchParams.get('parentId');

  const [formData, setFormData] = useState<RequirementFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (editId && requirements.length > 0) {
      const requirementToEdit = requirements.find(r => r.id === editId);
      if (requirementToEdit) {
        const deliveryDateFormatted = requirementToEdit.deliveryDate 
          ? new Date(requirementToEdit.deliveryDate).toISOString().split('T')[0]
          : '';
        
        setFormData({
          type: requirementToEdit.type,
          title: requirementToEdit.title,
          description: requirementToEdit.description,
          source: requirementToEdit.source,
          valueDescription: requirementToEdit.valueDescription,
          status: requirementToEdit.status,
          deliveryDate: deliveryDateFormatted,
          priority: requirementToEdit.priority,
          parentId: requirementToEdit.parentId,
          overallOwner: requirementToEdit.overallOwner || '',
          stage: requirementToEdit.stage,
          workloadEstimate: requirementToEdit.workloadEstimate || '',
          marketOwner: requirementToEdit.marketOwner || '',
          designOwner: requirementToEdit.designOwner || '',
          developmentOwner: requirementToEdit.developmentOwner || '',
          testOwner: requirementToEdit.testOwner || ''
        });
      }
    } else if (!editId) {
      const initialData = { ...defaultFormData };
      if (initialType) {
        initialData.type = initialType;
      }
      if (initialParentId) {
        initialData.parentId = initialParentId;
      }
      setFormData(initialData);
    }
  }, [editId, requirements, initialType, initialParentId, mounted]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 5 : value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editId) {
        await updateRequirement(editId, formData);
      } else {
        await createRequirement(formData);
      }
      router.push('/');
    } catch (error) {
      console.error('Failed to save requirement:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }, [editId, formData, createRequirement, updateRequirement, router]);

  const handleCancel = useCallback(() => {
    router.push('/');
  }, [router]);

  const requirementToEdit = editId ? requirements.find(r => r.id === editId) : null;

  if (!mounted || loading) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-300">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {requirementToEdit ? '编辑需求' : '新建需求'}
        </h2>
        <button 
          onClick={handleCancel} 
          className="btn-secondary px-6 py-2 rounded-md font-medium"
        >
          返回列表
        </button>
      </div>

      <div className="bg-[#1E293B] rounded-lg p-6 shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">需求类型</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field w-full px-3 py-2 rounded-md"
                  disabled={!!editId}
                >
                  <option value="SR">SR (顶级需求)</option>
                  <option value="US">US (拆分需求)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{formData.type === 'US' ? '父需求 SR' : '优先级 (1-10，1级最高)'}</label>
                {formData.type === 'US' ? (
                  <select 
                    name="parentId"
                    value={formData.parentId || ''}
                    onChange={handleInputChange}
                    className="input-field w-full px-3 py-2 rounded-md"
                    required
                  >
                    <option value="">请选择父需求 SR</option>
                    {requirements
                      .filter(r => r.type === 'SR')
                      .map(sr => (
                        <option key={sr.id} value={sr.id}>{sr.title}</option>
                      ))}
                  </select>
                ) : (
                  <input 
                    type="number" 
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="1" 
                    max="10" 
                    placeholder="请输入优先级" 
                    className="input-field w-full px-3 py-2 rounded-md" 
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">需求标题</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="请输入需求标题" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">需求来源</label>
                <input 
                  type="text" 
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="请输入需求来源" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">交付日期</label>
                <input 
                  type="date" 
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="input-field w-full px-3 py-2 rounded-md" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">评审状态</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field w-full px-3 py-2 rounded-md"
                >
                  <option value="pending">待评审</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">阶段</label>
                <select 
                  name="stage"
                  value={formData.stage || ''}
                  onChange={handleInputChange}
                  className="input-field w-full px-3 py-2 rounded-md"
                >
                  <option value="">请选择阶段</option>
                  {stageOptions.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">工作量评估</label>
                <input 
                  type="text" 
                  name="workloadEstimate"
                  value={formData.workloadEstimate}
                  onChange={handleInputChange}
                  placeholder="例如：5人天" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">需求描述</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">需求描述</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4} 
                placeholder="请输入需求详细描述" 
                className="input-field w-full px-3 py-2 rounded-md" 
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求价值描述</label>
              <textarea 
                name="valueDescription"
                value={formData.valueDescription}
                onChange={handleInputChange}
                rows={3} 
                placeholder="请输入需求价值描述" 
                className="input-field w-full px-3 py-2 rounded-md" 
                required
              ></textarea>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">负责人信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">整体负责人</label>
                <input 
                  type="text" 
                  name="overallOwner"
                  value={formData.overallOwner}
                  onChange={handleInputChange}
                  placeholder="请输入整体负责人" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">市场负责人</label>
                <input 
                  type="text" 
                  name="marketOwner"
                  value={formData.marketOwner}
                  onChange={handleInputChange}
                  placeholder="请输入市场负责人" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">设计负责人</label>
                <input 
                  type="text" 
                  name="designOwner"
                  value={formData.designOwner}
                  onChange={handleInputChange}
                  placeholder="请输入设计负责人" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">开发负责人</label>
                <input 
                  type="text" 
                  name="developmentOwner"
                  value={formData.developmentOwner}
                  onChange={handleInputChange}
                  placeholder="请输入开发负责人" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">测试负责人</label>
                <input 
                  type="text" 
                  name="testOwner"
                  value={formData.testOwner}
                  onChange={handleInputChange}
                  placeholder="请输入测试负责人" 
                  className="input-field w-full px-3 py-2 rounded-md" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="px-6 py-2 bg-[#334155] text-gray-300 rounded-md font-medium hover:bg-[#475569]"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn-primary px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}