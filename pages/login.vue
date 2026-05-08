<template>
  <div class="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-[#1E293B] rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">需求管理系统</h1>
          <p class="text-gray-400">请使用 LDAP 账号登录</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
            {{ error }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">用户名</label>
            <input
              v-model="username"
              type="text"
              class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              placeholder="请输入用户名"
              required
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">密码</label>
            <input
              v-model="password"
              type="password"
              class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              placeholder="请输入密码"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>

      <p class="text-center text-gray-500 text-sm mt-6">
        使用公司 LDAP 账号进行认证
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = '/';
    } else {
      error.value = data.error || '登录失败，请重试';
    }
  } catch {
    error.value = '登录失败，请重试';
  } finally {
    loading.value = false;
  }
}
</script>
