<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-[#1E293B] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <div class="flex items-center justify-between p-4 border-b border-[#334155]">
        <h3 class="text-lg font-semibold text-white">{{ requirement.title }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-400">需求编号</label>
            <div class="text-white">{{ requirement.requirementNumber }}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400">类型</label>
            <div class="text-white">{{ requirement.type }}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400">状态</label>
            <div><span :class="['badge', badgeClass(requirement.status)]">{{ statusLabel(requirement.status) }}</span></div>
          </div>
          <div>
            <label class="text-sm text-gray-400">优先级</label>
            <div><span :class="['priority-badge', priorityClass(requirement.priority)]">{{ requirement.priority }}</span></div>
          </div>
          <div>
            <label class="text-sm text-gray-400">整体负责人</label>
            <div class="text-white">{{ requirement.overallOwnerName || requirement.overallOwner || '-' }}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400">工作量评估</label>
            <div class="text-white">{{ requirement.workloadEstimate || '-' }}</div>
          </div>
        </div>
        <div>
          <label class="text-sm text-gray-400">描述</label>
          <div class="text-white mt-1 whitespace-pre-wrap">{{ requirement.description || '无描述' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  requirement: {
    title: string;
    requirementNumber: string;
    type: string;
    status: string;
    priority: number;
    overallOwnerName: string;
    overallOwner: string;
    workloadEstimate: string;
    description: string;
  };
}>();

defineEmits(['close']);

function badgeClass(s: string) {
  return s === 'pending' ? 'badge-pending' : s === 'approved' ? 'badge-approved' : 'badge-rejected';
}
function statusLabel(s: string) {
  return s === 'pending' ? '待评审' : s === 'approved' ? '已通过' : '已拒绝';
}
function priorityClass(p: number) {
  return p <= 3 ? 'priority-high' : p <= 7 ? 'priority-medium' : 'priority-low';
}
</script>
