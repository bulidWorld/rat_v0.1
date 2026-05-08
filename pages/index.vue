<template>
  <div>
    <Header />
    <div class="pt-16">
      <main class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-baseline gap-4">
            <h2 class="text-2xl font-bold text-white">需求列表</h2>
            <span class="text-sm text-gray-400 bg-[#334155] px-3 py-1 rounded-full">
              总工作量：<span class="text-white font-medium">{{ totalWorkload.toFixed(1) }}</span> 人月
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-if="requirements.length === 0 && !loading"
              @click="handleInitSampleData"
              class="btn-secondary px-4 py-2 rounded-md font-medium text-sm"
            >
              初始化示例数据
            </button>
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx,.xls"
              @change="handleImport"
              class="hidden"
            />
            <button
              @click="fileInputRef?.click()"
              :disabled="importing"
              class="btn-secondary px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
            >
              {{ importing ? '导入中...' : '导入Excel' }}
            </button>
            <button
              @click="handleExport"
              class="btn-secondary px-4 py-2 rounded-md font-medium text-sm"
            >
              导出Excel
            </button>
            <NuxtLink to="/create" class="btn-primary px-4 py-2 rounded-md font-medium text-sm flex items-center">
              <svg class="w-4 h-4 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              新建需求
            </NuxtLink>
          </div>
        </div>

        <div class="bg-[#1E293B] rounded-lg p-4 mb-6 shadow-md">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">整体负责人</label>
              <select
                v-model="filter.overallOwner"
                class="input-field w-full px-3 py-2 rounded-md"
              >
                <option value="">全部</option>
                <option v-if="currentUser" :value="currentUser.username">我的需求 ({{ currentUser.displayName }})</option>
                <option v-for="u in otherUsers" :key="u.username" :value="u.username">
                  {{ u.displayName }} ({{ u.username }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">状态</label>
              <select v-model="filter.status" class="input-field w-full px-3 py-2 rounded-md">
                <option value="">全部</option>
                <option value="pending">待评审</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">优先级</label>
              <select v-model="filter.priority" class="input-field w-full px-3 py-2 rounded-md">
                <option value="">全部</option>
                <option value="1-3">高 (1-3)</option>
                <option value="4-7">中 (4-7)</option>
                <option value="8-10">低 (8-10)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">搜索</label>
              <div class="relative">
                <input
                  v-model="filter.searchQuery"
                  type="text"
                  placeholder="搜索需求..."
                  class="input-field w-full px-3 py-2 rounded-md pl-10"
                />
                <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[#1E293B] rounded-lg overflow-x-auto shadow-md">
          <table class="w-full divide-y divide-[#4F46E5]">
            <thead class="bg-[#334155]">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap" style="width: 80px">类型</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">需求编号</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3">
                  <div class="flex items-center cursor-pointer" @click="handleSort('title')">
                    标题
                    <svg class="w-4 h-4 ml-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">工作量</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">阶段</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap hidden lg:table-cell">整体负责人</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">
                  <div class="flex items-center cursor-pointer" @click="handleSort('priority')">优先级</div>
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">状态</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap hidden sm:table-cell">交付日期</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap hidden lg:table-cell">提出时间</th>
                <th class="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-4 sm:py-3 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody class="bg-[#1E293B] divide-y divide-[#334155]">
              <tr v-if="loading">
                <td colspan="11" class="px-3 py-4 text-center text-gray-300 sm:px-6">加载中...</td>
              </tr>
              <tr v-else-if="srRequirements.length === 0">
                <td colspan="11" class="px-3 py-4 text-center text-gray-300 sm:px-6">没有找到匹配的需求</td>
              </tr>
              <template v-else>
                <template v-for="req in srRequirements" :key="req.id">
                  <tr class="hover:bg-[#334155]">
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3" style="width: 80px">
                      <div class="flex items-center">
                        <button
                          v-if="getUSForSR(req.id).length > 0"
                          @click="toggleSR(req.id)"
                          class="mr-2 text-gray-400 hover:text-white transition-transform"
                        >
                          <svg
                            :class="['w-4 h-4 flex-shrink-0 transition-transform', expandedSRs.has(req.id) ? 'rotate-90' : '']"
                            fill="currentColor" viewBox="0 0 20 20"
                          >
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                          </svg>
                        </button>
                        <span class="ml-auto mr-[10px] inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-500 text-white">{{ req.type }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <div class="text-xs sm:text-sm font-medium text-gray-300 truncate max-w-[80px] sm:max-w-none">{{ req.requirementNumber }}</div>
                    </td>
                    <td class="px-3 py-2 sm:px-4 sm:py-3 max-w-[120px] sm:max-w-none">
                      <div class="text-xs sm:text-sm font-medium text-white truncate" :title="req.title">{{ req.title }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ req.workloadEstimate || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ req.stage || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 hidden lg:table-cell">
                      <div class="text-xs sm:text-sm text-gray-300 truncate max-w-[100px]">{{ req.overallOwnerName || req.overallOwner || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <span :class="['priority-badge', priorityClass(req.priority)]">{{ req.priority }}</span>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <span :class="['badge', badgeClass(req.status)]">{{ statusLabel(req.status) }}</span>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 hidden sm:table-cell">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ formatDate(req.createdAt) }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 hidden lg:table-cell">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ formatDate(req.deliveryDate) }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 text-right">
                      <div class="flex flex-wrap justify-end gap-1 sm:gap-2">
                        <button @click="handleViewRequirement(req)" class="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 whitespace-nowrap" :disabled="actionLoading === req.id">查看</button>
                        <NuxtLink :to="`/progress?requirementId=${req.id}&title=${encodeURIComponent(req.title)}`" class="text-xs sm:text-sm text-purple-400 hover:text-purple-300 whitespace-nowrap">进展</NuxtLink>
                        <NuxtLink :to="`/create?edit=${req.id}`" class="text-xs sm:text-sm text-green-400 hover:text-green-300 whitespace-nowrap">编辑</NuxtLink>
                        <NuxtLink :to="`/create?parentId=${req.id}&type=US`" class="text-xs sm:text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap">分解</NuxtLink>
                        <button @click="handleDeleteRequirement(req.id)" class="text-xs sm:text-sm text-red-400 hover:text-red-300 disabled:opacity-50 whitespace-nowrap" :disabled="actionLoading === req.id">{{ actionLoading === req.id ? '删除中...' : '删除' }}</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-for="us in getUSForSR(req.id)" v-show="expandedSRs.has(req.id)" :key="us.id" class="bg-[#2D3748] hover:bg-[#3D4758]">
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 pl-8 sm:pl-10" style="width: 80px">
                      <div class="flex items-center justify-between">
                        <div class="w-4"></div>
                        <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">{{ us.type }}</span>
                      </div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <div class="text-xs sm:text-sm font-medium text-gray-300 pl-4 sm:pl-6 truncate max-w-[80px] sm:max-w-none">{{ us.requirementNumber }}</div>
                    </td>
                    <td class="px-3 py-2 sm:px-4 sm:py-3 pl-4 sm:pl-6 max-w-[120px] sm:max-w-none">
                      <div class="text-xs sm:text-sm font-medium text-white truncate border-l-2 border-blue-500" :title="us.title">{{ us.title }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ us.workloadEstimate || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ us.stage || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 hidden lg:table-cell">
                      <div class="text-xs sm:text-sm text-gray-300 truncate max-w-[100px] pl-4 sm:pl-6">{{ us.overallOwnerName || us.overallOwner || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <span :class="['priority-badge', priorityClass(us.priority)]">{{ us.priority }}</span>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3">
                      <span :class="['badge', badgeClass(us.status)]">{{ statusLabel(us.status) }}</span>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 hidden sm:table-cell">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ us.deliveryDate || '-' }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 hidden lg:table-cell">
                      <div class="text-xs sm:text-sm text-gray-300 whitespace-nowrap">{{ formatDate(us.createdAt) }}</div>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap sm:px-4 sm:py-3 text-right">
                      <div class="flex flex-wrap justify-end gap-1 sm:gap-2">
                        <button @click="handleViewRequirement(us)" class="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 whitespace-nowrap">查看</button>
                        <NuxtLink :to="`/progress?requirementId=${us.id}&title=${encodeURIComponent(us.title)}`" class="text-xs sm:text-sm text-purple-400 hover:text-purple-300 whitespace-nowrap">进展</NuxtLink>
                        <NuxtLink :to="`/create?edit=${us.id}`" class="text-xs sm:text-sm text-green-400 hover:text-green-300 whitespace-nowrap">编辑</NuxtLink>
                        <button @click="handleDeleteRequirement(us.id)" class="text-xs sm:text-sm text-red-400 hover:text-red-300 whitespace-nowrap">删除</button>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="bg-[#1E293B] rounded-lg p-4 mt-4 shadow-md">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-300">每页显示</span>
              <select v-model.number="pageSize" class="input-field px-3 py-1 rounded-md text-sm">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
              <span class="text-sm text-gray-300">条</span>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <span class="text-sm text-gray-300">
                共 {{ pagination.total }} 条记录，第 {{ currentPage }} / {{ pagination.totalPages }} 页
              </span>
              <div class="flex flex-wrap items-center gap-2 justify-center">
                <button @click="currentPage = 1" :disabled="currentPage === 1" class="px-3 py-1 rounded-md text-sm bg-[#334155] text-gray-300 hover:bg-[#475569] disabled:opacity-50">首页</button>
                <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1 rounded-md text-sm bg-[#334155] text-gray-300 hover:bg-[#475569] disabled:opacity-50">上一页</button>
                <button v-for="p in visiblePages" :key="p" @click="currentPage = p" :class="['px-3 py-1 rounded-md text-sm', currentPage === p ? 'bg-[#3B82F6] text-white' : 'bg-[#334155] text-gray-300 hover:bg-[#475569]']">{{ p }}</button>
                <button @click="currentPage++" :disabled="currentPage === pagination.totalPages" class="px-3 py-1 rounded-md text-sm bg-[#334155] text-gray-300 hover:bg-[#475569] disabled:opacity-50">下一页</button>
                <button @click="currentPage = pagination.totalPages" :disabled="currentPage === pagination.totalPages" class="px-3 py-1 rounded-md text-sm bg-[#334155] text-gray-300 hover:bg-[#475569] disabled:opacity-50">末页</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Modal -->
        <RequirementDetailModal
          v-if="selectedRequirement && showDetailModal"
          :requirement="selectedRequirement"
          @close="showDetailModal = false"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Requirement {
  id: string;
  requirementNumber: string;
  type: string;
  title: string;
  description: string;
  source: string;
  valueDescription: string;
  status: string;
  deliveryDate: string;
  priority: number;
  parentId: string | null;
  overallOwner: string;
  overallOwnerName: string;
  stage: string;
  workloadEstimate: string;
  marketOwner: string;
  designOwner: string;
  developmentOwner: string;
  testOwner: string;
  createdAt: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();

const requirements = ref<Requirement[]>([]);
const loading = ref(false);
const actionLoading = ref<string | null>(null);
const importing = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const showDetailModal = ref(false);
const selectedRequirement = ref<Requirement | null>(null);
const expandedSRs = ref<Set<string>>(new Set());
const currentUser = ref<{ username: string; displayName: string } | null>(null);
const users = ref<{ username: string; displayName: string }[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);

const filter = ref({
  status: '',
  priority: '',
  searchQuery: '',
  overallOwner: ''
});

const sort = ref({ field: 'createdAt' as string, direction: 'desc' });

const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

const otherUsers = computed(() => users.value.filter(u => u.username !== currentUser.value?.username));

const filteredRequirements = computed(() => {
  let filtered = [...requirements.value];

  if (filter.value.status) {
    filtered = filtered.filter(r => r.status === filter.value.status);
  }

  if (filter.value.priority) {
    const [min, max] = filter.value.priority.split('-').map(Number);
    filtered = filtered.filter(r => r.priority >= min && r.priority <= max);
  }

  if (filter.value.searchQuery) {
    const query = filter.value.searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.title?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.source?.toLowerCase().includes(query)
    );
  }

  // Sort
  const field = sort.value.field;
  const dir = sort.value.direction === 'asc' ? 1 : -1;
  filtered.sort((a, b) => {
    const aVal = a[field as keyof Requirement] || '';
    const bVal = b[field as keyof Requirement] || '';
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  return filtered;
});

const srRequirements = computed(() => filteredRequirements.value.filter(r => r.type === 'SR'));

const totalWorkload = computed(() => {
  return filteredRequirements.value.reduce((sum, r) => {
    if (r.workloadEstimate) {
      const match = r.workloadEstimate.match(/(\d+(?:\.\d+)?)/);
      if (match) return sum + parseFloat(match[1]);
    }
    return sum;
  }, 0);
});

const visiblePages = computed(() => {
  const total = pagination.value.totalPages;
  const current = currentPage.value;
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
});

const getUSForSR = (srId: string) => requirements.value.filter(r => r.type === 'US' && r.parentId === srId);

function toggleSR(srId: string) {
  if (expandedSRs.value.has(srId)) {
    expandedSRs.value.delete(srId);
  } else {
    expandedSRs.value.add(srId);
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
}

function priorityClass(p: number) {
  return p <= 3 ? 'priority-high' : p <= 7 ? 'priority-medium' : 'priority-low';
}

function badgeClass(s: string) {
  return s === 'pending' ? 'badge-pending' : s === 'approved' ? 'badge-approved' : 'badge-rejected';
}

function statusLabel(s: string) {
  return s === 'pending' ? '待评审' : s === 'approved' ? '已通过' : '已拒绝';
}

function handleSort(field: string) {
  if (sort.value.field === field) {
    sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sort.value.field = field;
    sort.value.direction = 'asc';
  }
}

function handleViewRequirement(req: Requirement) {
  selectedRequirement.value = req;
  showDetailModal.value = true;
}

async function handleDeleteRequirement(id: string) {
  if (!confirm('确定要删除这个需求吗？删除 SR 时会同时删除其下的所有 US。')) return;
  actionLoading.value = id;
  try {
    await fetch(`/api/requirements/${id}`, { method: 'DELETE' });
    await fetchRequirements();
  } catch {
    alert('删除失败，请重试');
  } finally {
    actionLoading.value = null;
  }
}

async function handleExport() {
  const response = await fetch('/api/requirements/export');
  if (!response.ok) { alert('导出失败，请重试'); return; }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `需求列表_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

async function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  importing.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/requirements/import', { method: 'POST', body: formData });
    const data = await response.json();
    if (response.ok) {
      alert(`导入完成！\n总计: ${data.results.total} 条\n新增: ${data.results.created} 条\n更新: ${data.results.updated} 条\n${data.results.errors.length > 0 ? '错误:\n' + data.results.errors.join('\n') : ''}`);
      await fetchRequirements();
    } else {
      alert('导入失败: ' + data.error);
    }
  } catch {
    alert('导入失败，请重试');
  } finally {
    importing.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

async function handleInitSampleData() {
  if (!confirm('是否初始化示例数据？')) return;
  try {
    await fetch('/api/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'SR', title: '示例需求', status: 'pending', priority: 5, overallOwner: '', source: '系统', deliveryDate: null, description: '' })
    });
    await fetchRequirements();
  } catch {
    alert('初始化失败，请重试');
  }
}

async function fetchRequirements() {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      status: filter.value.status || '',
      priority: filter.value.priority || '',
      search: filter.value.searchQuery || '',
      overallOwner: filter.value.overallOwner || '',
      type: 'SR',
      sortField: 'created_at',
      sortDirection: 'desc',
      page: String(currentPage.value),
      pageSize: String(pageSize.value),
    });
    const response = await fetch(`/api/requirements?${params}`);
    const data = await response.json();
    requirements.value = data.requirements;
    pagination.value = data.pagination;
  } catch (error) {
    console.error('Failed to fetch requirements:', error);
  } finally {
    loading.value = false;
  }
}

// Watch filter/pagination changes
watch([filter, sort, currentPage, pageSize], () => {
  fetchRequirements();
}, { deep: true });

onMounted(async () => {
  // Get current user
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        currentUser.value = { username: data.user.username, displayName: data.user.displayName };
        filter.value.overallOwner = data.user.username;
      }
    }
  } catch {}

  // Get users
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      users.value = data.users || [];
    }
  } catch {}

  await fetchRequirements();
});
</script>
