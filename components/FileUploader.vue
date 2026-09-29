<template>
	<div class="uploader-container w-full">
		<label
			v-if="label"
			class="block text-xs font-mono uppercase tracking-wider mb-1.5 transition-colors"
			:class="isDark ? 'text-obsidian-400' : 'text-[#506872]'"
		>
			{{ label }}
		</label>

		<div
			class="uploader-dropzone relative flex flex-col items-center justify-center w-full px-6 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 outline-none"
			:class="[
				isDragging
					? (isDark ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-600 bg-emerald-500/10')
					: (isDark
						? 'border-obsidian-700 hover:border-obsidian-500 bg-obsidian-900/50 hover:bg-obsidian-900/70'
						: 'border-[#005571]/25 hover:border-[#005571]/50 bg-white hover:bg-[#005571]/[0.02] shadow-sm')
			]"
			tabindex="0"
			role="button"
			aria-label="Subir archivos"
			@dragover.prevent="isDragging = true"
			@dragleave.prevent="isDragging = false"
			@drop.prevent="handleDrop"
			@click="triggerFileInput"
			@keydown.enter.prevent="triggerFileInput"
			@keydown.space.prevent="triggerFileInput"
		>
			<input
				ref="fileInputRef"
				type="file"
				class="hidden"
				:accept="acceptedTypes"
				:multiple="multiple"
				@change="handleFileInput"
			/>

			<div class="mb-2 transition-transform duration-200" :class="{ 'scale-110': isDragging }">
				<svg
					class="w-8 h-8 transition-colors"
					:class="isDark
						? (isDragging ? 'text-emerald-400' : 'text-obsidian-400')
						: (isDragging ? 'text-emerald-600' : 'text-[#60737c]')"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
			</div>

			<p class="text-sm text-center">
				<span
					class="font-semibold hover:underline"
					:class="isDark ? 'text-emerald-400' : 'text-[#005571]'"
				>
					Haz clic para subir
				</span>
				<span :class="isDark ? 'text-obsidian-200' : 'text-[#10232c]'">
					o arrastra y suelta
				</span>
			</p>
			<p
				class="text-xs mt-1 font-mono text-center"
				:class="isDark ? 'text-obsidian-400' : 'text-[#60737c]'"
			>
				PDF, PNG, JPG, WEBP, GIF
			</p>
		</div>

		<ul v-if="selectedFiles.length > 0" class="mt-3 space-y-2">
			<li
				v-for="(file, index) in selectedFiles"
				:key="`${file.name}-${index}`"
				class="uploader-file-item flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg transition-colors border"
				:class="isDark
					? 'bg-obsidian-800/60 border-obsidian-700/60 text-obsidian-200'
					: 'bg-[#eef4f6] border-[#005571]/20 text-[#10232c]'"
			>
				<div class="flex items-center truncate pr-2">
					<span class="mr-2 shrink-0 text-sm">
						{{ getFileEmoji(file) }}
					</span>
					<span class="truncate font-medium">{{ file.name }}</span>
					<span
						class="ml-2 shrink-0 font-normal"
						:class="isDark ? 'text-obsidian-500' : 'text-[#60737c]'"
					>
						({{ formatBytes(file.size) }})
					</span>
				</div>

				<button
					type="button"
					class="w-6 h-6 flex items-center justify-center rounded transition-colors shrink-0"
					:class="isDark
						? 'text-obsidian-400 hover:text-red-400 hover:bg-white/5'
						: 'text-[#60737c] hover:text-red-500 hover:bg-red-50'"
					title="Eliminar archivo"
					aria-label="Eliminar archivo"
					@click.stop="removeFile(index)"
				>
					✕
				</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { isDark } = useTheme()

const props = defineProps({
  label: {
    type: String,
    default: 'Archivos'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  acceptedTypes: {
    type: String,
    default: '.pdf,image/jpeg,image/png,image/webp,image/gif'
  }
})

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const files = Array.from(target?.files || [])
  appendFiles(files)
  if (target) {
    target.value = ''
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  appendFiles(files)
}

const appendFiles = (incomingFiles: File[]) => {
  if (!incomingFiles.length) return

  if (props.multiple) {
    selectedFiles.value = [...selectedFiles.value, ...incomingFiles]
  } else {
    selectedFiles.value = [incomingFiles[0]]
  }

  emit('files-selected', selectedFiles.value)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  emit('files-selected', selectedFiles.value)
}

const clear = () => {
  selectedFiles.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const getFileEmoji = (file: File) => {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return '📕'
  if (name.match(/\.(png|jpe?g|webp|gif|svg)$/) || file.type?.startsWith('image/')) return '🖼️'
  return '📄'
}

defineExpose({
  clear,
  selectedFiles
})

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>

<style scoped>
.uploader-dropzone:focus-visible {
	outline: none;
	box-shadow: 0 0 0 2px rgba(0, 85, 113, 0.4);
}
</style>