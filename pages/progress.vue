<template>
  <div>
    <Header />
    <div class="pt-16">
      <main class="p-4 sm:p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-white">进展跟踪 - {{ title }}</h2>
          <button @click="router.push('/')" class="btn-secondary px-6 py-2 rounded-md font-medium">
            返回列表
          </button>
        </div>

        <div class="bg-[#1E293B] rounded-lg p-6 shadow-md mb-6">
          <h3 class="text-lg font-semibold text-white mb-4">添加进展</h3>
          <form @submit.prevent="handleAddProgress" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">标题</label>
              <input v-model="newProgress.title" type="text" placeholder="请输入进展标题" class="input-field w-full px-3 py-2 rounded-md" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <div class="border border-[#475569] rounded-md overflow-hidden">
                <div class="bg-[#334155] px-3 py-2 flex flex-wrap gap-1">
                  <button type="button" @click="editor?.chain().focus().toggleBold().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('bold') }" title="粗体">B</button>
                  <button type="button" @click="editor?.chain().focus().toggleItalic().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('italic') }" title="斜体">I</button>
                  <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('underline') }" title="下划线">U</button>
                  <button type="button" @click="editor?.chain().focus().toggleStrike().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('strike') }" title="删除线">S</button>
                  <span class="text-gray-600 mx-1">|</span>
                  <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('heading', { level: 2 }) }" title="标题">H2</button>
                  <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('heading', { level: 3 }) }" title="标题">H3</button>
                  <span class="text-gray-600 mx-1">|</span>
                  <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('bulletList') }" title="无序列表">· 列表</button>
                  <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('orderedList') }" title="有序列表">1. 列表</button>
                  <span class="text-gray-600 mx-1">|</span>
                  <button type="button" @click="editor?.chain().focus().setTextAlign('left').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive({ textAlign: 'left' }) }" title="左对齐">左</button>
                  <button type="button" @click="editor?.chain().focus().setTextAlign('center').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive({ textAlign: 'center' }) }" title="居中">中</button>
                  <button type="button" @click="editor?.chain().focus().setTextAlign('right').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive({ textAlign: 'right' }) }" title="右对齐">右</button>
                  <span class="text-gray-600 mx-1">|</span>
                  <button type="button" @click="triggerImageUpload()" class="p-1 rounded hover:bg-[#475569] text-gray-300" title="插入图片">图片</button>
                </div>
                <EditorContent v-if="!editingItem" :editor="editor" class="editor-content" />
                <input v-if="!editingItem" ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="handleImageInsert" />
              </div>
            </div>
            <div class="flex justify-end">
              <button type="submit" class="btn-primary px-6 py-2 rounded-md font-medium disabled:opacity-50" :disabled="submitting">
                {{ submitting ? '添加中...' : '添加进展' }}
              </button>
            </div>
          </form>
        </div>

        <div class="space-y-4">
          <div v-if="loading" class="text-center py-10 text-gray-300">加载中...</div>
          <div v-else-if="progressList.length === 0" class="text-center py-10 text-gray-400">暂无进展记录</div>
          <div v-for="item in progressList" :key="item.id" class="bg-[#1E293B] rounded-lg p-4 shadow-md">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-lg font-semibold text-white">{{ item.title }}</h4>
                <p class="text-sm text-gray-400 mt-1">{{ formatDate(item.createdAt) }}</p>
              </div>
              <div class="flex space-x-2">
                <button @click="handleEdit(item)" class="text-sm text-green-400 hover:text-green-300">编辑</button>
                <button @click="handleDelete(item.id)" class="text-sm text-red-400 hover:text-red-300">删除</button>
              </div>
            </div>
            <div class="rich-text-content mt-3" v-html="item.description || ''"></div>
          </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="cancelEdit()">
          <div class="bg-[#1E293B] rounded-lg w-full max-w-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">编辑进展</h3>
            <form @submit.prevent="handleUpdate" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">标题</label>
                <input v-model="editingItem.title" type="text" class="input-field w-full px-3 py-2 rounded-md" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">描述</label>
                <div class="border border-[#475569] rounded-md overflow-hidden">
                  <div class="bg-[#334155] px-3 py-2 flex flex-wrap gap-1">
                    <button type="button" @click="editor?.chain().focus().toggleBold().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('bold') }" title="粗体">B</button>
                    <button type="button" @click="editor?.chain().focus().toggleItalic().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('italic') }" title="斜体">I</button>
                    <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('underline') }" title="下划线">U</button>
                    <button type="button" @click="editor?.chain().focus().toggleStrike().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('strike') }" title="删除线">S</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('heading', { level: 2 }) }" title="标题">H2</button>
                    <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('heading', { level: 3 }) }" title="标题">H3</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('bulletList') }" title="无序列表">· 列表</button>
                    <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive('orderedList') }" title="有序列表">1. 列表</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="editor?.chain().focus().setTextAlign('left').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive({ textAlign: 'left' }) }" title="左对齐">左</button>
                    <button type="button" @click="editor?.chain().focus().setTextAlign('center').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive({ textAlign: 'center' }) }" title="居中">中</button>
                    <button type="button" @click="editor?.chain().focus().setTextAlign('right').run()" class="p-1 rounded hover:bg-[#475569] text-gray-300" :class="{ 'bg-[#475569]': editor?.isActive({ textAlign: 'right' }) }" title="右对齐">右</button>
                    <span class="text-gray-600 mx-1">|</span>
                    <button type="button" @click="triggerImageUpload()" class="p-1 rounded hover:bg-[#475569] text-gray-300" title="插入图片">图片</button>
                  </div>
                  <EditorContent :editor="editor" class="editor-content" />
                  <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="handleImageInsert" />
                </div>
              </div>
              <div class="flex justify-end space-x-4">
                <button type="button" @click="cancelEdit()" class="px-6 py-2 bg-[#334155] text-gray-300 rounded-md font-medium hover:bg-[#475569]">取消</button>
                <button type="submit" class="btn-primary px-6 py-2 rounded-md font-medium disabled:opacity-50" :disabled="submitting">保存</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';

const route = useRoute();
const router = useRouter();

const title = ref(route.query.title as string || '');
const requirementId = ref(route.query.requirementId as string || '');

const progressList = ref<any[]>([]);
const loading = ref(true);
const submitting = ref(false);

const newProgress = ref({ title: '', description: '' });
const editingItem = ref<any>(null);

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      html: false, // 关闭自带的HTML过滤，这是罪魁祸首！
    }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Color,
    TextStyle,
    Image.configure({
      inline: true,           // 是否内联显示
      allowBase64: true,      // 是否允许 base64 图片
      HTMLAttributes: {
        class: 'custom-image',
      },
    }),
  ],
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
            view.dispatch(view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({ src })
            ));
          };
          reader.readAsDataURL(file);
          return true;
        }
      }
      return false;
    },
  },
  onUpdate: ({ editor: e }) => {
    if (editingItem.value) {
      editingItem.value.description = e.getHTML();
    } else {
      newProgress.value.description = e.getHTML();
    }
  },
});

const editorMode = ref<'create' | 'edit'>('create');

function setEditorContent(html: string) {
  if (editor.value) {
    editor.value.commands.setContent(html || '');
  }
}

async function handleEdit(item: any) {
  editingItem.value = { ...item };
  editorMode.value = 'edit';
  // 等待模态框 DOM 渲染完成，确保 EditorContent 已挂载
  await nextTick();
  await new Promise(r => setTimeout(r, 100));
  if (editor.value) {
    editor.value.commands.setContent(item.description || '');
  }
}

watch(editingItem, async (item) => {
  if (item && editorMode.value === 'create') {
    // 仅在 create 模式下由 watch 设置内容，edit 模式由 handleEdit 处理
    await new Promise(r => setTimeout(r, 200));
    if (editor.value) {
      editor.value.commands.setContent(item.description || '');
    }
  }
});

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function fetchProgress() {
  loading.value = true;
  try {
    const res = await fetch(`/api/progress?requirementId=${requirementId.value}`);
    const data = await res.json();
    progressList.value = data.progress || [];
  } catch {
    alert('加载进展失败');
  } finally {
    loading.value = false;
  }
}

async function handleAddProgress() {
  submitting.value = true;
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requirementId: requirementId.value,
        title: newProgress.value.title,
        description: newProgress.value.description,
      }),
    });
    newProgress.value = { title: '', description: '' };
    setEditorContent('');
    await fetchProgress();
  } catch {
    alert('添加进展失败');
  } finally {
    submitting.value = false;
  }
}


async function handleUpdate() {
  submitting.value = true;
  try {
    await fetch(`/api/progress/${editingItem.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingItem.value),
    });
    editingItem.value = null;
    editorMode.value = 'create';
    setEditorContent('');
    await fetchProgress();
  } catch {
    alert('更新进展失败');
  } finally {
    submitting.value = false;
  }
}

function cancelEdit() {
  editingItem.value = null;
  editorMode.value = 'create';
  setEditorContent('');
}

const imageInputRef = ref<HTMLInputElement | null>(null);

function triggerImageUpload() {
  imageInputRef.value?.click();
}

function handleImageInsert(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    editor?.chain().focus().setImage({ src }).run();
  };
  reader.readAsDataURL(file);
  if (imageInputRef.value) imageInputRef.value.value = '';
}

async function handleDelete(id: string) {
  if (!confirm('确定要删除这条进展记录吗？')) return;
  try {
    await fetch(`/api/progress/${id}`, { method: 'DELETE' });
    await fetchProgress();
  } catch {
    alert('删除进展失败');
  }
}


onMounted(async () => {
  await fetchProgress();
});
</script>

<style scoped>
.rich-text-content :deep(h2) { font-size: 1.25em; font-weight: bold; margin: 0.5em 0; }
.rich-text-content :deep(h3) { font-size: 1.1em; font-weight: bold; margin: 0.5em 0; }
.rich-text-content :deep(ul) { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
.rich-text-content :deep(ol) { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
.rich-text-content :deep(p) { margin: 0.25em 0; }
.rich-text-content :deep(strong) { font-weight: bold; }
.rich-text-content :deep(em) { font-style: italic; }
.rich-text-content :deep(u) { text-decoration: underline; }
.rich-text-content :deep(s) { text-decoration: line-through; }

.editor-content :deep(.tiptap) {
  background: #0F172A;
  color: #e2e8f0;
  min-height: 200px;
  padding: 0.5rem 0.75rem;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
}

.rich-text-content :deep(img),
.editor-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
