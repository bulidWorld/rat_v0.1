'use client';

import { useCallback } from 'react';
import { Requirement } from '../types/requirement';

interface RequirementDetailModalProps {
  requirement: Requirement;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Requirement['status']) => void;
}

export function RequirementDetailModal({
  requirement,
  isOpen,
  onClose,
  onStatusChange
}: RequirementDetailModalProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理状态更新
  const handleStatusUpdate = useCallback((status: Requirement['status']) => {
    onStatusChange(requirement.id, status);
  }, [requirement.id, onStatusChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E293B] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">需求详情</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求标题</label>
              <p className="text-white">{requirement.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求类型</label>
              <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${requirement.type === 'SR' ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'}`}>
                {requirement.type}
              </span>
            </div>
            {requirement.type === 'US' && requirement.parentId && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">父需求 SR</label>
                <p className="text-gray-300">{requirement.parentId}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求描述</label>
              <p className="text-gray-300 whitespace-pre-wrap">{requirement.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求来源</label>
              <p className="text-gray-300">{requirement.source}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">需求价值描述</label>
              <p className="text-gray-300">{requirement.valueDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">优先级</label>
                <span 
                  className={`priority-badge ${requirement.priority <= 3 ? 'priority-high' : requirement.priority <= 7 ? 'priority-medium' : 'priority-low'}`}
                >
                  {requirement.priority}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
                <span 
                  className={`badge ${requirement.status === 'pending' ? 'badge-pending' : requirement.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}
                >
                  {requirement.status === 'pending' ? '待评审' : requirement.status === 'approved' ? '已通过' : '已拒绝'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">交付日期</label>
                <p className="text-gray-300">{requirement.deliveryDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">提出时间</label>
                <p className="text-gray-300">{formatDate(requirement.createdAt)}</p>
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">评审操作</h4>
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleStatusUpdate('approved')} 
                  className="btn-primary px-4 py-2 rounded-md font-medium text-sm"
                >
                  通过
                </button>
                <button 
                  onClick={() => handleStatusUpdate('rejected')} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                >
                  拒绝
                </button>
                <button 
                  onClick={() => handleStatusUpdate('pending')} 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                >
                  设为待评审
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
