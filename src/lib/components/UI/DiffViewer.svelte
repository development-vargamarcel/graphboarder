<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { Logger } from '$lib/utils/logger';

	/**
	 * Props for DiffViewer component
	 */
	interface Props {
		/** The original content (left side) */
		original: string;
		/** The modified content (right side) */
		modified: string;
		/** The language for syntax highlighting */
		language?: string;
		/** Callback to close the viewer */
		onClose: () => void;
	}

	let { original, modified, language = 'graphql', onClose }: Props = $props();

	let divEl: HTMLDivElement | undefined = $state();
	let diffEditor: monaco.editor.IStandaloneDiffEditor | undefined = $state();
	let Monaco: any;

	onMount(async () => {
		// Ensure Monaco environment is set up
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		try {
			Monaco = await import('monaco-editor');

			if (divEl) {
				const originalModel = Monaco.editor.createModel(original, language);
				const modifiedModel = Monaco.editor.createModel(modified, language);

				diffEditor = Monaco.editor.createDiffEditor(divEl, {
					originalEditable: false,
					readOnly: true, // Right side is read-only too for now
					theme: 'vs-dark',
					automaticLayout: true,
					minimap: { enabled: false }
				});

				diffEditor.setModel({
					original: originalModel,
					modified: modifiedModel
				});
				Logger.debug('DiffViewer initialized');
			}
		} catch (e) {
			Logger.error('Failed to initialize Monaco Diff Editor', e);
		}
	});

	onDestroy(() => {
		if (diffEditor) {
			const model = diffEditor.getModel();
			if (model) {
				model.original.dispose();
				model.modified.dispose();
			}
			diffEditor.dispose();
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onclick={onClose}
>
	<div
		class="bg-base-100 w-full max-w-6xl h-[90vh] rounded-box flex flex-col shadow-xl overflow-hidden"
		onclick={(e) => e.stopPropagation()}
		role="document"
	>
		<div class="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
			<div class="flex items-center gap-4">
				<h3 class="text-xl font-bold">Compare with History</h3>
				<div class="text-sm breadcrumbs hidden sm:block">
					<ul>
						<li><span class="badge badge-neutral">Original (History)</span></li>
						<li><span class="badge badge-primary">Current (Editor)</span></li>
					</ul>
				</div>
			</div>
			<button class="btn btn-sm btn-ghost" onclick={onClose} aria-label="Close">✕</button>
		</div>
		<div class="flex-1 relative bg-[#1e1e1e]">
			<div bind:this={divEl} class="absolute inset-0"></div>
		</div>
	</div>
</div>
