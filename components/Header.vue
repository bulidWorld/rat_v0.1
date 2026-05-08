<template>
  <nav class="bg-[#1E293B] shadow-lg fixed top-0 left-0 right-0 z-50">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#334155] focus:outline-none"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div class="flex-1 flex items-center justify-center md:flex-none">
          <NuxtLink to="/" class="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">需求管理系统</NuxtLink>
        </div>

        <div class="hidden md:flex items-center justify-end gap-4">
          <template v-if="user">
            <NuxtLink to="/" class="text-gray-300 hover:text-white text-sm">需求列表</NuxtLink>
            <NuxtLink to="/create" class="text-gray-300 hover:text-white text-sm">新建需求</NuxtLink>
            <span class="text-gray-300 text-sm">{{ user.displayName || user.username }}</span>
            <img
              class="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              alt="用户头像"
            />
            <button @click="handleLogout" class="text-gray-300 hover:text-white text-sm">退出</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="text-gray-300 hover:text-white text-sm">登录</NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden border-t border-[#334155] bg-[#1E293B]">
      <div class="px-4 py-3">
        <template v-if="user">
          <NuxtLink to="/" class="text-gray-300 hover:text-white block py-2">需求列表</NuxtLink>
          <NuxtLink to="/create" class="text-gray-300 hover:text-white block py-2">新建需求</NuxtLink>
          <div class="flex items-center border-t border-[#334155] pt-3 mt-2">
            <img
              class="h-10 w-10 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              alt="用户头像"
            />
            <div class="ml-3">
              <div class="text-base font-medium text-white">{{ user.displayName || user.username }}</div>
            </div>
          </div>
          <button @click="handleLogout" class="text-gray-300 hover:text-white block py-2 w-full text-left">退出</button>
        </template>
        <NuxtLink v-else to="/login" class="text-gray-300 hover:text-white block py-2">登录</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const mobileMenuOpen = ref(false);
const user = ref<{ username: string; displayName: string } | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      user.value = data.user;
    }
  } catch {
    user.value = null;
  }
});

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}
</script>
