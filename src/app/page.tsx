'use client';

import { useState, useCallback, Fragment, useEffect, useRef } from 'react';
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
  const { loading, deleteRequirement, updateRequirementStatus, filterAndSortRequirements, initializeSampleData, requirements, refreshRequirements } = useRequirements();
  
  const [filter, setFilter] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortState>(defaultSortState);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [expandedSRs, setExpandedSRs] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSort = useCallback((field: keyof Requirement) => {
    setSort(prev => ({
      field,
      direction: prev.field === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  }, []);

  const handleViewRequirement = useCallback((requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowDetailModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedRequirement(null);
  }, []);

  const handleDeleteRequirement = useCallback(async (id: string) => {
    if (confirm('确定要删除这个需求吗？删除 SR 时会同时删除其下的所有 US。')) {
      setActionLoading(id);
      try {
        await deleteRequirement(id);
      } catch (error) {
        alert('删除失败，请重试');
      } finally {
        setActionLoading(null);
      }
    }
  }, [deleteRequirement]);

  const toggleSR = useCallback((srId: string) => {
    setExpandedSRs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(srId)) {
        newSet.delete(srId);
      } else {
        newSet.add(srId);
      }
      return newSet;
    });
  }, []);

  const handleInitSampleData = useCallback(async () => {
    if (confirm('是否初始化示例数据？')) {
      try {
        await initializeSampleData();
      } catch (error) {
        alert('初始化失败，请重试');
      }
    }
  }, [initializeSampleData]);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch('/api/requirements/export');
      if (!response.ok) throw new Error('导出失败');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `需求列表_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('导出失败，请重试');
    }
  }, []);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/requirements/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`导入完成！\n总计: ${data.results.total} 条\n新增: ${data.results.created} 条\n更新: ${data.results.updated} 条\n${data.results.errors.length > 0 ? '错误:\n' + data.results.errors.join('\n') : ''}`);
        await refreshRequirements();
      } else {
        alert('导入失败: ' + data.error);
      }
    } catch (error) {
      alert('导入失败，请重试');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [refreshRequirements]);

  const filteredRequirements = filterAndSortRequirements(
    filter.status,
    filter.priority,
    filter.searchQuery,
    sort.field,
    sort.direction
  );

  const srRequirements = filteredRequirements.filter(r => r.type === 'SR');
  const getUSForSR = (srId: string) => filteredRequirements.filter(r => r.type === 'US' && r.parentId === srId);

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

  if (!mounted) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-300">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">需求列表</h2>
        <div className="flex space-x-2">
          {requirements.length === 0 && !loading && (
            <button
              onClick={handleInitSampleData}
              className="btn-secondary px-6 py-2 rounded-md font-medium"
            >
              初始化示例数据
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn-secondary px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {importing ? '导入中...' : '导入Excel'}
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary px-6 py-2 rounded-md font-medium"
          >
            导出Excel
          </button>
          <Link 
            href="/create" 
            className="btn-primary px-6 py-2 rounded-md font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
            </svg>
            新建需求
          </Link>
        </div>
      </div>

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
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-lg overflow-hidden shadow-md">
        <table className="min-w-full divide-y divide-[#4F46E5]">
          <thead className="bg-[#334155]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                类型
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                需求编号
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('title')}
                >
                  标题
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                整体负责人
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => handleSort('priority')}
                >
                  优先级
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
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
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-[#1E293B] divide-y divide-[#334155]">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-300">
                  加载中...
                </td>
              </tr>
            ) : srRequirements.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-300">
                  没有找到匹配的需求
                </td>
              </tr>
            ) : (
              srRequirements.map((requirement) => {
                const childUS = getUSForSR(requirement.id);
                const isExpanded = expandedSRs.has(requirement.id);
                
                return (
                  <Fragment key={requirement.id}>
                    <tr className="hover:bg-[#334155]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {childUS.length > 0 && (
                            <button
                              onClick={() => toggleSR(requirement.id)}
                              className="mr-2 text-gray-400 hover:text-white transition-transform"
                            >
                              <svg 
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-500 text-white">
                            {requirement.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-300">
                          {requirement.requirementNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {requirement.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {requirement.overallOwner || '-'}
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
                          disabled={actionLoading === requirement.id}
                        >
                          查看
                        </button>
                        <Link 
                          href={`/create?edit=${requirement.id}`} 
                          className="text-green-400 hover:text-green-300 mr-4"
                        >
                          编辑
                        </Link>
                        <Link 
                          href={`/create?parentId=${requirement.id}&type=US`} 
                          className="text-blue-400 hover:text-blue-300 mr-4"
                        >
                          分解
                        </Link>
                        <button 
                          onClick={() => handleDeleteRequirement(requirement.id)} 
                          className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          disabled={actionLoading === requirement.id}
                        >
                          {actionLoading === requirement.id ? '删除中...' : '删除'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && childUS.map((us) => (
                      <tr key={us.id} className="bg-[#2D3748] hover:bg-[#3D4758]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center pl-6">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
                              {us.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-300 pl-6">
                            {us.requirementNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white pl-6 border-l-2 border-blue-500">
                            {us.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300 pl-6">
                            {us.overallOwner || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`priority-badge ${us.priority <= 3 ? 'priority-high' : us.priority <= 7 ? 'priority-medium' : 'priority-low'}`}
                          >
                            {us.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`badge ${us.status === 'pending' ? 'badge-pending' : us.status === 'approved' ? 'badge-approved' : 'badge-rejected'}`}
                          >
                            {us.status === 'pending' ? '待评审' : us.status === 'approved' ? '已通过' : '已拒绝'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{us.deliveryDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{formatDate(us.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleViewRequirement(us)} 
                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                            disabled={actionLoading === us.id}
                          >
                            查看
                          </button>
                          <Link 
                            href={`/create?edit=${us.id}`} 
                            className="text-green-400 hover:text-green-300 mr-4"
                          >
                            编辑
                          </Link>
                          <button 
                            onClick={() => handleDeleteRequirement(us.id)} 
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                            disabled={actionLoading === us.id}
                          >
                            {actionLoading === us.id ? '删除中...' : '删除'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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