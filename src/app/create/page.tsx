'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRequirements } from '../../lib/useRequirements';
import { RequirementFormData } from '../../types/requirement';

const defaultFormData: RequirementFormData = {
  type: 'SR',
  title: '',
  description: '',
  source: '',
  valueDescription: '',
  status: 'pending',
  deliveryDate: '',
  priority: 5,
  parentId: undefined
};

export default function CreateRequirement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { requirements, createRequirement, updateRequirement } = useRequirements();
  
  // 检查是否是编辑模式
  const editId = searchParams.get('edit');
  
  // 使用 useMemo 计算要编辑的需求
  const requirementToEdit = useMemo(() => {
    return editId ? requirements.find(r => r.id === editId) : null;
  }, [editId, requirements]);
  
  // 从URL获取初始的parentId和type
  const initialType = searchParams.get('type') as 'SR' | 'US' | null;
  const initialParentId = searchParams.get('parentId');

  // 初始化表单数据，直接使用 requirementToEdit 计算
  const [formData, setFormData] = useState<RequirementFormData>(() => {
    if (requirementToEdit) {
      return {
        type: requirementToEdit.type,
        title: requirementToEdit.title,
        description: requirementToEdit.description,
        source: requirementToEdit.source,
        valueDescription: requirementToEdit.valueDescription,
        status: requirementToEdit.status,
        deliveryDate: requirementToEdit.deliveryDate,
        priority: requirementToEdit.priority,
        parentId: requirementToEdit.parentId
      };
    }
    // 如果有初始参数，使用初始参数值
    const initialData = { ...defaultFormData };
    if (initialType) {
      initialData.type = initialType;
    }
    if (initialParentId) {
      initialData.parentId = initialParentId;
    }
    return initialData;
  });
  
  // 处理表单字段变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 5 : value
    }));
  }, []);
  
  // 处理表单提交
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (requirementToEdit) {
      // 编辑现有需求
      updateRequirement(requirementToEdit.id, formData);
    } else {
      // 创建新需求
      createRequirement(formData);
    }
    
    // 返回需求列表页面
    router.push('/');
  }, [requirementToEdit, formData, createRequirement, updateRequirement, router]);
  
  // 处理取消按钮
  const handleCancel = useCallback(() => {
    router.push('/');
  }, [router]);
  
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求类型</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input-field w-full px-3 py-2 rounded-md"
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
          </div>
          <div className="mb-6">
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
          <div className="mb-6">
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
          <div className="mb-6">
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
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="px-6 py-2 bg-[#334155] text-gray-300 rounded-md font-medium hover:bg-[#475569]"
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn-primary px-6 py-2 rounded-md font-medium"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
