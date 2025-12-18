<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { apiClient } from '#lib/services/api-client.js';
	import * as m from '#lib/paraglide/messages.js';

	interface UploadProgress {
		task_id: string;
		user_id: number;
		progress: number;
		status: string;
		message?: string;
	}

	let fileName = $state('avatar.png');
	let isUploading = $state(false);
	let uploadProgress = $state<UploadProgress | null>(null);
	let errorMessage = $state('');
	let successMessage = $state('');
	let ws = $state<WebSocket | null>(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

	onDestroy(() => {
		if (ws) {
			ws.close();
		}
	});

	async function handleUpload() {
		if (!fileName.trim()) {
			errorMessage = m['avatar_upload.error_file_name_required']({});
			return;
		}

		errorMessage = '';
		successMessage = '';
		isUploading = true;
		uploadProgress = null;

		try {
			console.log('[Upload] Starting upload...', { fileName });

			// Step 1: Initiate upload using apiClient (auto handles token refresh)
			const response = await apiClient.post('/api/v1/user/upload-avatar/', {
				body: JSON.stringify({
					file_name: fileName
				})
			});

			console.log('[Upload] Response status:', response.status);

			if (!response.ok) {
				const error = await response.json();
				console.error('[Upload] Error response:', error);
				throw new Error(error.message || 'Upload failed');
			}

			const result = await response.json();
			console.log('[Upload] Success response:', result);

			const taskId = result.data?.task_id || result.task_id;

			if (!taskId) {
				console.error('[Upload] No task ID in response:', result);
				throw new Error('No task ID returned from server');
			}

			console.log('[Upload] Got task ID:', taskId);

			// Step 2: Connect to WebSocket for progress updates
			// For WebSocket, we need to get token from a separate endpoint or use query param
			// Since cookies don't work with WebSocket easily, we'll need task_id only
			connectWebSocket(taskId);
		} catch (err) {
			console.error('[Upload] Exception:', err);
			errorMessage = err instanceof Error ? err.message : 'Upload failed';
			isUploading = false;
		}
	}

	function connectWebSocket(taskId: string) {
		try {
			// WebSocket will use task_id for auth, or backend should handle cookie auth
			const wsUrl = `${WS_BASE_URL}/ws/v1/task/${taskId}/?lang=${encodeURIComponent(getLocale())}`;

			ws = new WebSocket(wsUrl);

			ws.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);

					if (message.event_type === 'avatar_upload_progress' && message.data) {
						uploadProgress = message.data;

						// Stop uploading state when progress reaches 100% or status is completed/error
						if (message.data.status === 'completed' || message.data.progress >= 100) {
							successMessage = message.data.message || 'Upload completed successfully!';
							isUploading = false;
							if (ws) {
								ws.close();
								ws = null;
							}
						} else if (message.data.status === 'error') {
							errorMessage = message.data.message || 'Upload failed';
							isUploading = false;
							if (ws) {
								ws.close();
								ws = null;
							}
						}
					} else {
						console.log('[WebSocket] Unknown message type or format:', message);
					}
				} catch (err) {
					console.error('[WebSocket] Failed to parse message:', err, 'Raw data:', event.data);
				}
			};

			ws.onerror = () => {
				errorMessage = 'WebSocket connection error';
				isUploading = false;
			};

			ws.onclose = () => {
				if (isUploading) {
					isUploading = false;
				}
			};
		} catch {
			errorMessage = 'Failed to connect to WebSocket';
			isUploading = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-12">
	<Card>
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">{m['avatar_upload.title']({})}</CardTitle>
			<CardDescription>
				{m['avatar_upload.description']({})}
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-6 px-6 pb-6">
			{#if errorMessage}
				<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
					<p class="font-medium">{m['avatar_upload.error_title']({})}</p>
					<p class="mt-1">{errorMessage}</p>
				</div>
			{/if}

			{#if successMessage}
				<div class="rounded-lg bg-green-50 p-4 text-sm text-green-800">
					<p class="font-medium">{m['avatar_upload.success_title']({})}</p>
					<p class="mt-1">{successMessage}</p>
				</div>
			{/if}

			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="fileName">{m['avatar_upload.file_name_label']({})}</Label>
					<Input
						id="fileName"
						type="text"
						placeholder={m['avatar_upload.file_name_placeholder']({})}
						bind:value={fileName}
						disabled={isUploading}
					/>
					<p class="text-xs text-muted-foreground">{m['avatar_upload.file_name_hint']({})}</p>
				</div>
			</div>

			{#if uploadProgress}
				<div class="space-y-3 rounded-lg border bg-muted/50 p-4">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">{m['avatar_upload.progress_label']({})}</span>
						<span class="text-muted-foreground">{uploadProgress.progress}%</span>
					</div>

					<div class="h-2 w-full overflow-hidden rounded-full bg-background">
						<div
							class="h-full bg-primary transition-all duration-300 ease-out"
							style="width: {uploadProgress.progress}%"
						></div>
					</div>

					<div class="flex items-center justify-between text-xs text-muted-foreground">
						<div class="flex items-center space-x-2">
							<span>{m['avatar_upload.status_label']({})}</span>
							<span
								class="rounded-full px-2 py-0.5"
								class:bg-blue-100={uploadProgress.status === 'pending'}
								class:text-blue-800={uploadProgress.status === 'pending'}
								class:bg-green-100={uploadProgress.status === 'completed'}
								class:text-green-800={uploadProgress.status === 'completed'}
								class:bg-red-100={uploadProgress.status === 'error'}
								class:text-red-800={uploadProgress.status === 'error'}
							>
								{uploadProgress.status}
							</span>
						</div>
						<span
							>{m['avatar_upload.task_label']({})} {uploadProgress.task_id.substring(0, 8)}...</span
						>
					</div>

					{#if uploadProgress.message}
						<p class="text-sm">{uploadProgress.message}</p>
					{/if}
				</div>
			{/if}

			<Button class="w-full" onclick={handleUpload} disabled={isUploading || !fileName.trim()}>
				{isUploading
					? m['avatar_upload.button_uploading']({})
					: m['avatar_upload.button_upload']({})}
			</Button>

			<div class="rounded-lg border bg-muted/30 p-4">
				<h3 class="mb-2 text-sm font-medium">{m['avatar_upload.how_it_works_title']({})}</h3>
				<ol class="space-y-1 text-xs text-muted-foreground">
					<li>{m['avatar_upload.how_it_works_step1']({})}</li>
					<li>{m['avatar_upload.how_it_works_step2']({})}</li>
					<li>{m['avatar_upload.how_it_works_step3']({})}</li>
					<li>{m['avatar_upload.how_it_works_step4']({})}</li>
					<li>{m['avatar_upload.how_it_works_step5']({})}</li>
				</ol>
			</div>
		</CardContent>
	</Card>
</div>
