<template>
  <div>
    <Header />
    <div class="pt-16">
      <main class="p-4 sm:p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">
            {{ editId ? '编辑需求' : '新建需求' }}
          </h2>
          <button @click="handleCancel" class="btn-secondary px-6 py-2 rounded-md font-medium">
            返回列表
          </button>
        </div>

        <div class="bg-[#1E293B] rounded-lg p-6 shadow-md">
          <form @submit.prevent="handleSubmit">
            <!-- 基本信息 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">基本信息</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">需求类型</label>
                  <select v-model="formData.type" class="input-field w-full px-3 py-2 rounded-md" :disabled="!!editId">
                    <option value="SR">SR (顶级需求)</option>
                    <option value="US">US (拆分需求)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">
                    {{ formData.type === 'US' ? '父需求 SR' : '优先级 (1-10，1级最高)' }}
                  </label>
                  <select v-if="formData.type === 'US'" v-model="formData.parentId" class="input-field w-full px-3 py-2 rounded-md" required>
                    <option value="">请选择父需求 SR</option>
                    <option v-for="sr in srList" :key="sr.id" :value="sr.id">{{ sr.title }}</option>
                  </select>
                  <input v-else v-model.number="formData.priority" type="number" min="1" max="10" placeholder="请输入优先级" class="input-field w-full px-3 py-2 rounded-md" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">需求标题</label>
                  <input v-model="formData.title" type="text" placeholder="请输入需求标题" class="input-field w-full px-3 py-2 rounded-md" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">需求来源</label>
                  <input v-model="formData.source" type="text" placeholder="请输入需求来源" class="input-field w-full px-3 py-2 rounded-md" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">交付日期</label>
                  <input v-model="formData.deliveryDate" type="date" class="input-field w-full px-3 py-2 rounded-md" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">评审状态</label>
                  <select v-model="formData.status" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="pending">待评审</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已拒绝</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">阶段</label>
                  <select v-model="formData.stage" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="">请选择阶段</option>
                    <option v-for="stage in stageOptions" :key="stage" :value="stage">{{ stage }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">工作量评估</label>
                  <input v-model="formData.workloadEstimate" type="text" placeholder="例如：5人天" class="input-field w-full px-3 py-2 rounded-md" />
                </div>
              </div>
            </div>

            <!-- 需求描述 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">需求描述</h3>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-300 mb-1">需求描述</label>
                <div class="border border-[#475569] rounded-md overflow-hidden">
                  <div class="bg-[#334155] px-3 py-2 flex flex-wrap gap-1">
                    <button type="button" @click="descEditor?.chain().focus().toggleBold().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('bold') }" title="粗体">B</button>
                    <button type="button" @click="descEditor?.chain().focus().toggleItalic().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('italic') }" title="斜体">I</button>
                    <button type="button" @click="descEditor?.chain().focus().toggleUnderline().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('underline') }" title="下划线">U</button>
                    <button type="button" @click="descEditor?.chain().focus().toggleStrike().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('strike') }" title="删除线">S</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="descEditor?.chain().focus().toggleHeading({ level: 2 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('heading', { level: 2 }) }" title="标题">H2</button>
                    <button type="button" @click="descEditor?.chain().focus().toggleHeading({ level: 3 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('heading', { level: 3 }) }" title="标题">H3</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="descEditor?.chain().focus().toggleBulletList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('bulletList') }" title="无序列表">· 列表</button>
                    <button type="button" @click="descEditor?.chain().focus().toggleOrderedList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive('orderedList') }" title="有序列表">1. 列表</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="descEditor?.chain().focus().setTextAlign('left').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive({ textAlign: 'left' }) }" title="左对齐">左</button>
                    <button type="button" @click="descEditor?.chain().focus().setTextAlign('center').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive({ textAlign: 'center' }) }" title="居中">中</button>
                    <button type="button" @click="descEditor?.chain().focus().setTextAlign('right').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': descEditor?.isActive({ textAlign: 'right' }) }" title="右对齐">右</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="triggerImageUpload(descImageInputRef)" class="p-1 rounded hover:bg-[#475569] text-gray-300" title="插入图片">图片</button>
                  </div>
                  <ClientOnly>
                    <EditorContent :editor="descEditor" class="editor-content" />
                    <input ref="descImageInputRef" type="file" accept="image/*" class="hidden" @change="(e: Event) => handleImageInsert(e, descEditor)" />
                  </ClientOnly>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">需求价值描述</label>
                <div class="border border-[#475569] rounded-md overflow-hidden">
                  <div class="bg-[#334155] px-3 py-2 flex flex-wrap gap-1">
                    <button type="button" @click="valueEditor?.chain().focus().toggleBold().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('bold') }" title="粗体">B</button>
                    <button type="button" @click="valueEditor?.chain().focus().toggleItalic().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('italic') }" title="斜体">I</button>
                    <button type="button" @click="valueEditor?.chain().focus().toggleUnderline().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('underline') }" title="下划线">U</button>
                    <button type="button" @click="valueEditor?.chain().focus().toggleStrike().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('strike') }" title="删除线">S</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="valueEditor?.chain().focus().toggleHeading({ level: 2 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('heading', { level: 2 }) }" title="标题">H2</button>
                    <button type="button" @click="valueEditor?.chain().focus().toggleHeading({ level: 3 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('heading', { level: 3 }) }" title="标题">H3</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="valueEditor?.chain().focus().toggleBulletList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('bulletList') }" title="无序列表">· 列表</button>
                    <button type="button" @click="valueEditor?.chain().focus().toggleOrderedList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive('orderedList') }" title="有序列表">1. 列表</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="valueEditor?.chain().focus().setTextAlign('left').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive({ textAlign: 'left' }) }" title="左对齐">左</button>
                    <button type="button" @click="valueEditor?.chain().focus().setTextAlign('center').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive({ textAlign: 'center' }) }" title="居中">中</button>
                    <button type="button" @click="valueEditor?.chain().focus().setTextAlign('right').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': valueEditor?.isActive({ textAlign: 'right' }) }" title="右对齐">右</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="triggerImageUpload(valueImageInputRef)" class="p-1 rounded hover:bg-[#475569] text-gray-300" title="插入图片">图片</button>
                  </div>
                  <ClientOnly>
                    <EditorContent :editor="valueEditor" class="editor-content" />
                    <input ref="valueImageInputRef" type="file" accept="image/*" class="hidden" @change="(e: Event) => handleImageInsert(e, valueEditor)" />
                  </ClientOnly>
                </div>
              </div>
            </div>

            <!-- 负责人信息 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-white mb-4 border-b border-gray-600 pb-2">负责人信息</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">整体负责人</label>
                  <select v-model="formData.overallOwner" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="">请选择</option>
                    <option v-for="u in users" :key="u.username" :value="u.username">{{ u.displayName }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">市场负责人</label>
                  <select v-model="formData.marketOwner" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="">请选择</option>
                    <option v-for="u in users" :key="u.username" :value="u.username">{{ u.displayName }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">设计负责人</label>
                  <select v-model="formData.designOwner" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="">请选择</option>
                    <option v-for="u in users" :key="u.username" :value="u.username">{{ u.displayName }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">开发负责人</label>
                  <select v-model="formData.developmentOwner" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="">请选择</option>
                    <option v-for="u in users" :key="u.username" :value="u.username">{{ u.displayName }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">测试负责人</label>
                  <select v-model="formData.testOwner" class="input-field w-full px-3 py-2 rounded-md">
                    <option value="">请选择</option>
                    <option v-for="u in users" :key="u.username" :value="u.username">{{ u.displayName }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="flex justify-end space-x-4">
              <button type="button" @click="handleCancel" class="px-6 py-2 bg-[#334155] text-gray-300 rounded-md font-medium hover:bg-[#475569]" :disabled="isSubmitting">
                取消
              </button>
              <button type="submit" class="btn-primary px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';

const stageOptions = ['提议', '计划', '开发', '测试', '上线'];

interface SRItem {
  id: string;
  title: string;
}

const route = useRoute();
const router = useRouter();

const editId = ref(route.query.edit as string || '');
const initialType = (route.query.type as string) || null;
const initialParentId = route.query.parentId as string || '';

const formData = ref({
  type: 'SR',
  title: '',
  description: '',
  source: '',
  valueDescription: '',
  status: 'pending',
  deliveryDate: '',
  priority: 5,
  parentId: '',
  overallOwner: '',
  stage: '',
  workloadEstimate: '',
  marketOwner: '',
  designOwner: '',
  developmentOwner: '',
  testOwner: ''
});

const srList = ref<SRItem[]>([]);
const users = ref<{ username: string; displayName: string }[]>([]);
const isSubmitting = ref(false);
const loading = ref(true);

const descImageInputRef = ref<HTMLInputElement | null>(null);
const valueImageInputRef = ref<HTMLInputElement | null>(null);

const descEditor = useEditor({
  extensions: [StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }), Color, TextStyle, Image],
  content: '',
  editorProps: {
    handlePaste: (view, event) => {
      const items = event.clipboardData?.items;
      if (!items) return false;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target?.result as string;
            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src })));
          };
          reader.readAsDataURL(file);
          return true;
        }
      }
      return false;
    },
  },
  onUpdate: ({ editor: e }) => {
    formData.value.description = e.getHTML();
  },
});

const valueEditor = useEditor({
  extensions: [StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }), Color, TextStyle, Image],
  content: '',
  editorProps: {
    handlePaste: (view, event) => {
      const items = event.clipboardData?.items;
      if (!items) return false;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target?.result as string;
            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src })));
          };
          reader.readAsDataURL(file);
          return true;
        }
      }
      return false;
    },
  },
  onUpdate: ({ editor: e }) => {
    formData.value.valueDescription = e.getHTML();
  },
});

function triggerImageUpload(inputRef: HTMLInputElement | null) {
  inputRef?.click();
}

function handleImageInsert(event: Event, editor: ReturnType<typeof useEditor>) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    editor?.chain().focus().setImage({ src }).run();
  };
  reader.readAsDataURL(file);
  const target = event.target as HTMLInputElement;
  if (target) target.value = '';
}

onMounted(async () => {
  // Load users
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      users.value = data.users || [];
    }
  } catch {}

  // Load SR list for parent selector
  try {
    const res = await fetch('/api/requirements?type=SR&pageSize=100');
    const data = await res.json();
    srList.value = data.requirements?.map((r: any) => ({ id: r.id, title: r.title })) || [];
  } catch {}

  // If editing, load existing requirement
  if (editId.value) {
    try {
      const res = await fetch(`/api/requirements/${editId.value}`);
      const data = await res.json();
      const r = data.requirement;
      if (r) {
        const deliveryDateFormatted = r.deliveryDate
          ? new Date(r.deliveryDate).toISOString().split('T')[0]
          : '';
        formData.value = {
          type: r.type,
          title: r.title,
          description: r.description,
          source: r.source,
          valueDescription: r.valueDescription,
          status: r.status,
          deliveryDate: deliveryDateFormatted,
          priority: r.priority,
          parentId: r.parentId || '',
          overallOwner: r.overallOwner || '',
          stage: r.stage || '',
          workloadEstimate: r.workloadEstimate || '',
          marketOwner: r.marketOwner || '',
          designOwner: r.designOwner || '',
          developmentOwner: r.developmentOwner || '',
          testOwner: r.testOwner || ''
        };
        // Populate editors with existing content
        descEditor.value?.commands.setContent(r.description || '');
        valueEditor.value?.commands.setContent(r.valueDescription || '');
      }
    } catch {
      alert('加载需求失败');
    }
  } else {
    // New requirement - set initial values
    if (initialType) formData.value.type = initialType;
    if (initialParentId) formData.value.parentId = initialParentId;
  }

  loading.value = false;
});

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    const body = {
      ...formData.value,
      parentId: formData.value.parentId || null,
      stage: formData.value.stage || null,
    };

    if (editId.value) {
      await fetch(`/api/requirements/${editId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    router.push('/');
  } catch {
    alert('保存失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancel() {
  router.push('/');
}
</script>

<style scoped>
.editor-content :deep(.tiptap) {
  background: #0F172A;
  color: #e2e8f0;
  min-height: 120px;
  padding: 0.5rem 0.75rem;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 120px;
}

.editor-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
