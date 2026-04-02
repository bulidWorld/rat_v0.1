'use client';

import { useCallback, useState } from 'react';
import { Requirement } from '../types/requirement';

interface RequirementDetailModalProps {
  requirement: Requirement;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: Requirement['status']) => Promise<void>;
}

export function RequirementDetailModal({
  requirement,
  isOpen,
  onClose,
  onStatusChange
}: RequirementDetailModalProps) {
  const [statusUpdating, setStatusUpdating] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = useCallback(async (status: Requirement['status']) => {
    setStatusUpdating(true);
    try {
      await onStatusChange(requirement.id, status);
      onClose();
    } catch (error) {
      alert('状态更新失败，请重试');
    } finally {
      setStatusUpdating(false);
    }
  }, [requirement.id, onStatusChange, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="bg-[#1E293B] border-b border-[#334155] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={onClose}
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                  disabled={statusUpdating}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">返回列表</span>
                </button>
                <div className="h-6 w-px bg-gray-600"></div>
                <h2 className="text-xl font-bold text-white">需求详情</h2>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full ${requirement.type === 'SR' ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {requirement.type}
                </span>
                <span className="text-gray-300 font-mono text-sm">{requirement.requirementNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-[#1E293B] rounded-lg shadow-xl">
            <div className="p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-600">基本信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">需求编号</label>
                      <p className="text-white font-mono text-lg">{requirement.requirementNumber}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">需求类型</label>
                      <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full ${requirement.type === 'SR' ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {requirement.type}
                      </span>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">状态</label>
                      <span 
                        className={`badge text-base ${requirement.status === 'pending' ? 'badge-pending' : requirement.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}
                      >
                        {requirement.status === 'pending' ? '待评审' : requirement.status === 'approved' ? '已通过' : '已拒绝'}
                      </span>
                    </div>
                    <div className="md:col-span-3 bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">需求标题</label>
                      <p className="text-white text-xl font-semibold">{requirement.title}</p>
                    </div>
                    {requirement.type === 'US' && requirement.parentId && (
                      <div className="bg-[#334155] rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">父需求 SR</label>
                        <p className="text-gray-300">{requirement.parentId}</p>
                      </div>
                    )}
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">需求来源</label>
                      <p className="text-gray-300">{requirement.source}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">优先级</label>
                      <span 
                        className={`priority-badge text-base ${requirement.priority <= 3 ? 'priority-high' : requirement.priority <= 7 ? 'priority-medium' : 'priority-low'}`}
                      >
                        {requirement.priority}
                      </span>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">阶段</label>
                      <p className="text-gray-300">{requirement.stage || '-'}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">交付日期</label>
                      <p className="text-gray-300">{requirement.deliveryDate}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">工作量评估</label>
                      <p className="text-gray-300">{requirement.workloadEstimate || '-'}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">提出时间</label>
                      <p className="text-gray-300">{formatDate(requirement.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-600">需求描述</h3>
                  <div className="space-y-6">
                    <div className="bg-[#334155] rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-400 mb-3">需求描述</label>
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{requirement.description}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-400 mb-3">需求价值描述</label>
                      <p className="text-gray-200 leading-relaxed">{requirement.valueDescription}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-600">负责人信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">整体负责人</label>
                      <p className="text-gray-300">{requirement.overallOwner || '-'}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">市场负责人</label>
                      <p className="text-gray-300">{requirement.marketOwner || '-'}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">设计负责人</label>
                      <p className="text-gray-300">{requirement.designOwner || '-'}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">开发负责人</label>
                      <p className="text-gray-300">{requirement.developmentOwner || '-'}</p>
                    </div>
                    <div className="bg-[#334155] rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">测试负责人</label>
                      <p className="text-gray-300">{requirement.testOwner || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-6">
                  <h3 className="text-2xl font-bold text-white mb-6">评审操作</h3>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleStatusUpdate('approved')} 
                      className="btn-primary px-6 py-3 rounded-md font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={statusUpdating}
                    >
                      ✓ 通过
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('rejected')} 
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={statusUpdating}
                    >
                      ✗ 拒绝
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('pending')} 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={statusUpdating}
                    >
                      ⏱ 设为待评审
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}