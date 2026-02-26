'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRequirements } from '../lib/useRequirements';
import { Requirement, FilterState, SortState } from '../types/requirement';
import { RequirementDetailModal } from '../components/RequirementDetailModal';

const defaultFilterState: FilterState = {
  status: '',
  priority: '',
  searchQuery: ''
};

const defaultSortState: SortState = {
  field: 'createdAt',
  direction: 'desc'
};

export default function RequirementList() {
  const { loading, deleteRequirement, updateRequirementStatus, filterAndSortRequirements } = useRequirements();
  
  const [filter, setFilter] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortState>(defaultSortState);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  // 处理筛选条件变化
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  }, []);

  // 处理排序变化
  const handleSort = useCallback((field: keyof Requirement) => {
    setSort(prev => ({
      field,
      direction: prev.field === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  }, []);

  // 处理查看需求详情
  const handleViewRequirement = useCallback((requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowDetailModal(true);
  }, []);

  // 处理关闭模态框
  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedRequirement(null);
  }, []);

  // 处理删除需求
  const handleDeleteRequirement = useCallback((id: string) => {
    if (confirm('确定要删除这个需求吗？')) {
      deleteRequirement(id);
    }
  }, [deleteRequirement]);

  // 获取筛选和排序后的需求列表
  const filteredRequirements = filterAndSortRequirements(
    filter.status,
    filter.priority,
    filter.searchQuery,
    sort.field,
    sort.direction
  );

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">需求列表</h2>
        <Link 
          href="/create" 
          className="btn-primary px-6 py-2 rounded-md font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
          </svg>
          新建需求
        </Link>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-[#1E293B] rounded-lg p-4 mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">状态</label>
            <select 
              className="input-field w-full px-3 py-2 rounded-md"
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">全部</option>
              <option value="pending">待评审</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">优先级</label>
            <select 
              className="input-field w-full px-3 py-2 rounded-md"
              value={filter.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">全部</option>
              <option value="1-3">高 (1-3)</option>
              <option value="4-7">中 (4-7)</option>
              <option value="8-10">低 (8-10)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">搜索</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索需求..." 
                className="input-field w-full px-3 py-2 rounded-md pl-10"
                value={filter.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 需求表格 */}
      <div className="bg-[#1E293B] rounded-lg overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-[#4F46E5]">
          <thead className="bg-[#334155]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                类型
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('title')}
                >
                  标题
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('priority')}
                >
                  优先级
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">交付日期</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('createdAt')}
                >
                  提出时间
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-[#1E293B] divide-y divide-[#334155]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-300">
                  加载中...
                </td>
              </tr>
            ) : filteredRequirements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-300">
                  没有找到匹配的需求
                </td>
              </tr>
            ) : (
              filteredRequirements.map((requirement) => (
                <tr key={requirement.id} className={`hover:bg-[#334155] ${requirement.type === 'US' ? 'bg-[#2D3748]' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${requirement.type === 'SR' ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'}`}>
                      {requirement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium text-white ${requirement.type === 'US' ? 'pl-4 border-l-2 border-blue-500' : ''}`}>
                      {requirement.title}
                      {requirement.type === 'US' && requirement.parentId && (
                        <span className="ml-2 text-xs text-gray-400">
                          (来自 SR: {filteredRequirements.find(r => r.id === requirement.parentId)?.title})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`priority-badge ${requirement.priority <= 3 ? 'priority-high' : requirement.priority <= 7 ? 'priority-medium' : 'priority-low'}`}
                    >
                      {requirement.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`badge ${requirement.status === 'pending' ? 'badge-pending' : requirement.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}
                    >
                      {requirement.status === 'pending' ? '待评审' : requirement.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{requirement.deliveryDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{formatDate(requirement.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleViewRequirement(requirement)} 
                      className="text-indigo-400 hover:text-indigo-300 mr-4"
                    >
                      查看
                    </button>
                    <Link 
                      href={`/create?edit=${requirement.id}`} 
                      className="text-green-400 hover:text-green-300 mr-4"
                    >
                      编辑
                    </Link>
                    {requirement.type === 'SR' && (
                      <Link 
                        href={`/create?parentId=${requirement.id}&type=US`} 
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        分解
                      </Link>
                    )}
                    <button 
                      onClick={() => handleDeleteRequirement(requirement.id)} 
                      className="text-red-400 hover:text-red-300"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 需求详情模态框 */}
      {selectedRequirement && (
        <RequirementDetailModal
          requirement={selectedRequirement}
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          onStatusChange={updateRequirementStatus}
        />
      )}
    </div>
  );
}
