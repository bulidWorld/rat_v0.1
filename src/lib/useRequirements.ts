import { useState, useEffect, useCallback } from 'react';
import { Requirement, RequirementFormData } from '../types/requirement';

export function useRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 加载需求数据
  const loadRequirements = useCallback(() => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('requirements');
      if (saved) {
        setRequirements(JSON.parse(saved));
      } else {
        // 添加一些示例数据
        const sampleRequirements: Requirement[] = [
          {
            id: 'REQ-001',
            type: 'SR',
            title: '优化用户登录流程',
            description: '当前登录流程过于复杂，需要简化步骤，提高用户体验。',
            source: '用户反馈',
            valueDescription: '简化登录流程可以提高用户留存率和转化率。',
            status: 'pending',
            deliveryDate: '2024-03-15',
            priority: 1,
            createdAt: new Date('2024-02-20T10:00:00').toISOString(),
            updatedAt: new Date('2024-02-20T10:00:00').toISOString()
          },
          {
            id: 'REQ-002',
            type: 'US',
            title: '简化登录表单字段',
            description: '移除不必要的登录表单字段，只保留用户名和密码。',
            source: '产品需求',
            valueDescription: '减少用户填写时间，提高登录成功率。',
            status: 'approved',
            deliveryDate: '2024-03-20',
            priority: 1,
            parentId: 'REQ-001',
            createdAt: new Date('2024-02-20T11:00:00').toISOString(),
            updatedAt: new Date('2024-02-20T11:00:00').toISOString()
          },
          {
            id: 'REQ-003',
            type: 'US',
            title: '添加记住密码功能',
            description: '允许用户选择记住密码，下次登录自动填充。',
            source: '产品需求',
            valueDescription: '提高用户登录便捷性，减少重复输入。',
            status: 'pending',
            deliveryDate: '2024-03-25',
            priority: 2,
            parentId: 'REQ-001',
            createdAt: new Date('2024-02-20T12:00:00').toISOString(),
            updatedAt: new Date('2024-02-20T12:00:00').toISOString()
          },
          {
            id: 'REQ-004',
            type: 'SR',
            title: '添加数据导出功能',
            description: '允许用户导出报表数据，支持Excel和PDF格式。',
            source: '产品需求',
            valueDescription: '数据导出功能可以满足企业用户的数据分析需求。',
            status: 'approved',
            deliveryDate: '2024-04-01',
            priority: 3,
            createdAt: new Date('2024-02-19T14:30:00').toISOString(),
            updatedAt: new Date('2024-02-20T11:00:00').toISOString()
          },
          {
            id: 'REQ-005',
            type: 'US',
            title: '实现Excel导出功能',
            description: '开发Excel格式的数据导出功能，支持所有报表。',
            source: '产品需求',
            valueDescription: '满足用户基本的数据导出需求。',
            status: 'approved',
            deliveryDate: '2024-03-28',
            priority: 3,
            parentId: 'REQ-004',
            createdAt: new Date('2024-02-19T15:00:00').toISOString(),
            updatedAt: new Date('2024-02-20T11:00:00').toISOString()
          }
        ];
        setRequirements(sampleRequirements);
        localStorage.setItem('requirements', JSON.stringify(sampleRequirements));
      }
    } catch (error) {
      console.error('加载需求数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存需求数据到localStorage
  const saveRequirements = useCallback((data: Requirement[]) => {
    try {
      localStorage.setItem('requirements', JSON.stringify(data));
    } catch (error) {
      console.error('保存需求数据失败:', error);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  // 创建新需求
  const createRequirement = useCallback((formData: RequirementFormData) => {
    const newRequirement: Requirement = {
      id: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedRequirements = [...requirements, newRequirement];
    setRequirements(updatedRequirements);
    saveRequirements(updatedRequirements);
    
    return newRequirement;
  }, [requirements, saveRequirements]);

  // 更新需求
  const updateRequirement = useCallback((id: string, formData: RequirementFormData) => {
    const index = requirements.findIndex(r => r.id === id);
    if (index !== -1) {
      const updatedRequirement = {
        ...requirements[index],
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedRequirements = [...requirements];
      updatedRequirements[index] = updatedRequirement;
      
      setRequirements(updatedRequirements);
      saveRequirements(updatedRequirements);
      
      return updatedRequirement;
    }
    return null;
  }, [requirements, saveRequirements]);

  // 删除需求
  const deleteRequirement = useCallback((id: string) => {
    // 删除需求及其所有子需求（如果是SR的话）
    const updatedRequirements = requirements.filter(r => r.id !== id && r.parentId !== id);
    setRequirements(updatedRequirements);
    saveRequirements(updatedRequirements);
  }, [requirements, saveRequirements]);

  // 更新需求状态
  const updateRequirementStatus = useCallback((id: string, status: Requirement['status']) => {
    const index = requirements.findIndex(r => r.id === id);
    if (index !== -1) {
      const updatedRequirement = {
        ...requirements[index],
        status,
        updatedAt: new Date().toISOString()
      };
      
      const updatedRequirements = [...requirements];
      updatedRequirements[index] = updatedRequirement;
      
      setRequirements(updatedRequirements);
      saveRequirements(updatedRequirements);
      
      return updatedRequirement;
    }
    return null;
  }, [requirements, saveRequirements]);

  // 筛选和排序需求
  const filterAndSortRequirements = useCallback((
    statusFilter: string,
    priorityFilter: string,
    searchQuery: string,
    sortField: keyof Requirement,
    sortDirection: 'asc' | 'desc'
  ) => {
    let filtered = [...requirements];

    // 状态筛选
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // 优先级筛选
    if (priorityFilter) {
      const [min, max] = priorityFilter.split('-').map(Number);
      filtered = filtered.filter(r => r.priority >= min && r.priority <= max);
    }

    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.source.toLowerCase().includes(query)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      // 首先按层级排序：SR在前，US在后，并且US紧跟其对应的SR
      if (a.type === 'SR' && b.type === 'US') {
        if (b.parentId === a.id) return -1;
      }
      if (a.type === 'US' && b.type === 'SR') {
        if (a.parentId === b.id) return 1;
      }
      // 同一SR下的US应该排在一起
      if (a.parentId && b.parentId && a.parentId === b.parentId) {
        // 同一父SR下的US按优先级排序
        return a.priority - b.priority;
      }

      // 其他排序逻辑 - 明确处理所有可能的字段类型
      let comparison = 0;
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        // 日期字段比较
        const aDate = new Date(a[sortField]).getTime();
        const bDate = new Date(b[sortField]).getTime();
        comparison = aDate - bDate;
      } else if (sortField === 'priority') {
        // 数字字段比较
        comparison = a.priority - b.priority;
      } else {
        // 字符串字段比较
        const aStr = String(a[sortField]);
        const bStr = String(b[sortField]);
        comparison = aStr.localeCompare(bStr);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requirements]);

  return {
    requirements,
    loading,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    updateRequirementStatus,
    filterAndSortRequirements,
    refreshRequirements: loadRequirements
  };
}
