<template>
	<div class="w-full">
		<label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
			{{ label }}
		</label>

		<div
			class="relative flex flex-col items-center justify-center w-full px-6 py-5 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150"
			:class="[
				isDragging
					? 'border-emerald-500 bg-emerald-500/10'
					: 'border-obsidian-700 hover:border-obsidian-500 bg-obsidian-900/50'
			]"
			@dragover.prevent="isDragging = true"
			@dragleave.prevent="isDragging = false"
			@drop.prevent="handleDrop"
			@click="triggerFileInput"
		>
		<input
			ref="fileInputRef"
			type="file"
			class="hidden"
			:accept="acceptedTypes"
			:multiple="multiple"
			@change="handleFileInput"
		/>

		<svg
			class="w-8 h-8 mb-2 text-obsidian-400"
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

		<p class="text-sm text-obsidian-200">
			<span class="font-medium text-emerald-400 hover:underline">Haz clic para subir</span>
			o arrastra y suelta
		</p>
		<p class="text-xs text-obsidian-400 mt-1 font-mono">
			PDF, PNG, JPG, WEBP, GIF
		</p>
		</div>

		<ul v-if="selectedFiles.length > 0" class="mt-3 space-y-2">
		<li
			v-for="(file, index) in selectedFiles"
			:key="`${file.name}-${index}`"
			class="flex items-center justify-between px-3 py-2 text-xs font-mono bg-obsidian-800/60 border border-obsidian-700/60 rounded-md"
		>
			<div class="flex items-center truncate pr-2">
				<span class="text-obsidian-400 mr-2">📄</span>
				<span class="text-obsidian-200 truncate">{{ file.name }}</span>
				<span class="text-obsidian-500 ml-2 shrink-0">({{ formatBytes(file.size) }})</span>
			</div>

			<button
				type="button"
				class="text-obsidian-400 hover:text-red-400 transition-colors shrink-0"
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

defineExpose({
  clear
})

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>