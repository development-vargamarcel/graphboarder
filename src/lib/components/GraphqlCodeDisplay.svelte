<script lang="ts">
	import CodeEditor from './fields/CodeEditor.svelte';
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
    import graphql from 'highlight.js/lib/languages/graphql';
	import { getContext, untrack } from 'svelte';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import { Logger } from '$lib/utils/logger';
	import { getPreciseType } from '$lib/utils/usefulFunctions';
	import { updateStoresFromAST } from '$lib/utils/astToUIState';
	import { generateCurlCommand } from '$lib/utils/curlUtils';
	import { parseCurlCommand } from '$lib/utils/curlParser';
	import { get } from 'svelte/store';
	import { parse, print, type ASTNode } from 'graphql';
	import JSON5 from 'json5';
	import QueryHistory from '$lib/components/QueryHistory.svelte';
	import type { HistoryItem } from '$lib/stores/queryHistory';
	import { generateMockData } from '$lib/utils/mockGenerator';
	import { generatePostmanCollectionForQuery } from '$lib/utils/postmanUtils';
	import Modal from '$lib/components/Modal.svelte';

	interface Props {
		/**
		 * Whether to show the raw, non-prettified query body.
		 */
		showNonPrettifiedQMSBody: any;
		/**
		 * The GraphQL query string to display.
		 */
		value: any;
		/**
		 * Whether to enable syncing changes in the editor back to the UI stores.
		 * Default: true
		 */
		enableSyncToUI?: boolean;
		/**
		 * Prefix for context keys.
		 */
		prefix?: string;
	}

	let {
		showNonPrettifiedQMSBody = $bindable(),
		value,
		enableSyncToUI = true,
		prefix = ''
	}: Props = $props();

	let valueModifiedManually = $state();
	let lastSyncedValue = $state(untrack(() => value));

	// Try to get context if available
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';
	let qmsWraperCtx = $state<QMSWraperContext>();
	let mainWraperCtx = $state<QMSMainWraperContext>();
	let currentQMS_info;

	try {
		qmsWraperCtx = getContext<QMSWraperContext>(`${untrack(() => prefix)}QMSWraperContext`);
		mainWraperCtx = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	} catch (e) {
		Logger.debug('GraphqlCodeDisplay: Context not available', e);
	}


    // Ensure language is registered
    try {
        if (typeof hljs !== 'undefined' && hljs.registerLanguage) {
            // Some environments might not have getLanguage or might throw
             try {
                if (!hljs.getLanguage('graphql')) {
                    hljs.registerLanguage('graphql', graphql);
                }
             } catch(e) {
                // If getLanguage fails, attempt registration anyway to be safe
                try { hljs.registerLanguage('graphql', graphql); } catch(e2) {}
             }
        }
    } catch(e) {
        // ignore
    }

	$effect(() => {
		try {
			if (typeof hljs !== 'undefined' && hljs.highlightAll) {
				hljs.highlightAll();
			}
		} catch (e) {
			Logger.warn('GraphqlCodeDisplay: Highlight init failed', e);
		}
	});

	const safeHighlight = (code: string) => {
		try {
			const formatted = format(code);
            if (typeof hljs !== 'undefined' && hljs.highlight) {
                // Explicitly use graphql language if possible
			    return hljs.highlight(formatted, { language: 'graphql' }).value;
            }
            return formatted;
		} catch (e) {
			try {
				return format(code);
			} catch (e2) {
				return code;
			}
		}
	};

	let astAsString = $state('');
	let astAsString2 = '';
	let ast = $state();
	let astPrinted = $state();
	let isCopied = $state(false);
	let isCurlCopied = $state(false);
	let isMarkdownCopied = $state(false);
	let showHistory = $state(false);
	let showImportModal = $state(false);
	let importCurlValue = $state('');
	let mockDataResult = $state('');
	let showMockData = $state(false);

	const restoreQuery = (item: HistoryItem) => {
		valueModifiedManually = item.query;
		showHistory = false;
	};

	const handleGenerateMockData = () => {
		if (!mainWraperCtx?.schemaData) {
			Logger.warn('Cannot generate mock data: schemaData not available');
			return;
		}
		try {
			Logger.info('Generating mock data...');
			const result = generateMockData(value, mainWraperCtx.schemaData);
			mockDataResult = JSON.stringify(result, null, 2);
			showMockData = true;
		} catch (e) {
			Logger.error('Error generating mock data', e);
			mockDataResult = JSON.stringify({ error: (e as Error).message }, null, 2);
			showMockData = true;
		}
	};

	const handleImportCurl = () => {
		if (!importCurlValue.trim()) return;

		try {
			Logger.info('Importing cURL command...');
			const parsed = parseCurlCommand(importCurlValue);

			if (parsed.query) {
				valueModifiedManually = parsed.query;

				// Handle headers
				let headerMessage = '';
				if (Object.keys(parsed.headers).length > 0 && mainWraperCtx?.endpointInfo) {
					const info = get(mainWraperCtx.endpointInfo);
					const storageKey = info.id ? `headers_${info.id}` : 'headers';

					// Merge with existing headers
					let existingHeaders = {};
					const stored = localStorage.getItem(storageKey);
					if (stored) {
						try {
							existingHeaders = JSON.parse(stored);
						} catch (e) {}
					}

					const newHeaders = { ...existingHeaders, ...parsed.headers };
					localStorage.setItem(storageKey, JSON.stringify(newHeaders));
					Logger.info('Updated headers from cURL import', { headers: parsed.headers });
					headerMessage = '\nHeaders have been updated.';
				}

				Logger.info('Query imported from cURL');
				alert(`Query imported successfully.${headerMessage}`);
				showImportModal = false;
				importCurlValue = '';
			} else {
				alert('No valid GraphQL query found in the cURL command.');
			}
		} catch (e) {
			Logger.error('Failed to import cURL', e);
			alert('Failed to parse cURL command.');
		}
	};

	const syncQueryToUI = (ast) => {
		try {
			if (!qmsWraperCtx || !mainWraperCtx) {
				Logger.warn('GraphqlCodeDisplay: Cannot sync to UI - context not available');
				return;
			}

			const {
				activeArgumentsDataGrouped_Store,
				tableColsData_Store,
				paginationState,
				QMSName
			} = qmsWraperCtx;

			const { endpointInfo, schemaData } = mainWraperCtx;

			// Get the current QMS info
			const qmsInfo = schemaData.get_QMS_Field(QMSName, 'query', schemaData);

			if (!qmsInfo) {
				Logger.warn('GraphqlCodeDisplay: QMS info not found');
				return;
			}

			Logger.debug('GraphqlCodeDisplay: Syncing query to UI', { ast, qmsInfo });

			// Update stores from AST
			updateStoresFromAST(
				ast,
				qmsInfo,
				schemaData,
				endpointInfo,
				activeArgumentsDataGrouped_Store,
				tableColsData_Store,
				paginationState
			);
		} catch (e) {
			Logger.error('GraphqlCodeDisplay: Error syncing query to UI:', e);
		}
	};
	///
	$effect(() => {
		ast = parse(value);
	});
	$effect(() => {
		if (valueModifiedManually && valueModifiedManually !== lastSyncedValue) {
			try {
				ast = parse(valueModifiedManually as string);

				// Sync to UI if enabled and context is available
				if (enableSyncToUI && qmsWraperCtx && mainWraperCtx) {
					syncQueryToUI(ast);
					lastSyncedValue = valueModifiedManually;
				}
			} catch (e) {
				Logger.error('Error parsing manually modified query:', e);
			}
		}
	});
	$effect(() => {
		if (ast) {
			astPrinted = print(ast as ASTNode);
		}
	});
	$effect(() => {
		if (getPreciseType(ast) == 'object') {
			astAsString = JSON5.stringify(ast);
		}
	});
</script>

<div class="mockup-code bg-base text-content my-1 mx-2 px-2 relative group">
	<div class="absolute top-3 right-40 flex space-x-2">
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="History"
			title="View Query History"
			onclick={() => (showHistory = true)}
		>
			<i class="bi bi-clock-history"></i> History
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Copy to Clipboard"
			title="Copy Query to Clipboard"
			onclick={() => {
				Logger.info('Copied query to clipboard');
				navigator.clipboard.writeText(value);
				isCopied = true;
				setTimeout(() => (isCopied = false), 2000);
			}}
		>
			{#if isCopied}
				<i class="bi bi-check"></i> Copied!
			{:else}
				<i class="bi bi-clipboard"></i> Copy
			{/if}
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Copy as cURL"
			title="Copy as cURL Command"
			onclick={() => {
				if (mainWraperCtx?.endpointInfo) {
					Logger.info('Copied query as cURL to clipboard');
					const info = get(mainWraperCtx.endpointInfo);
					const curl = generateCurlCommand(info.url, value, {}, info.headers || {});
					navigator.clipboard.writeText(curl);
					isCurlCopied = true;
					setTimeout(() => (isCurlCopied = false), 2000);
				}
			}}
		>
			{#if isCurlCopied}
				<i class="bi bi-check"></i> cURL Copied!
			{:else}
				<i class="bi bi-terminal"></i> Copy as cURL
			{/if}
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Import cURL"
			title="Import Query from cURL Command"
			onclick={() => (showImportModal = true)}
		>
			<i class="bi bi-box-arrow-in-down"></i> Import cURL
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Generate Mock Data"
			title="Generate Mock Response Data"
			onclick={handleGenerateMockData}
		>
			<i class="bi bi-code-slash"></i> Mock Data
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Export to Postman"
			title="Export as Postman Collection"
			onclick={() => {
				if (mainWraperCtx?.endpointInfo) {
					Logger.info('Exporting to Postman');
					const info = get(mainWraperCtx.endpointInfo);
					const json = generatePostmanCollectionForQuery(
						qmsWraperCtx?.QMSName || 'Query',
						info.url,
						value,
						info.headers || {}
					);
					const blob = new Blob([json], { type: 'application/json' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = `${qmsWraperCtx?.QMSName || 'query'}.postman_collection.json`;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}
			}}
		>
			<i class="bi bi-collection"></i> Postman
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Copy as Markdown"
			title="Copy Query as Markdown"
			onclick={() => {
				Logger.info('Copied query as Markdown to clipboard');
				const markdown = `\`\`\`graphql\n${value}\n\`\`\``;
				navigator.clipboard.writeText(markdown);
				isMarkdownCopied = true;
				setTimeout(() => (isMarkdownCopied = false), 2000);
			}}
		>
			{#if isMarkdownCopied}
				<i class="bi bi-check"></i> Copied MD!
			{:else}
				<i class="bi bi-markdown"></i> Copy MD
			{/if}
		</button>
	</div>
	<div class="max-h-[50vh] overflow-y-auto">
		{#if showMockData}
			<div class="p-2">
				<div class="flex justify-between items-center mb-2">
					<h3 class="font-bold">Mock Data Result</h3>
					<button class="btn btn-xs btn-ghost" onclick={() => (showMockData = false)}>✕ Close</button>
				</div>
				<CodeEditor rawValue={mockDataResult} language="json" />
			</div>
		{:else if showNonPrettifiedQMSBody}
			<code class="px-10">{value}</code>
			<div class="mt-4">
				<code class="px-10 ">{astAsString}</code>
			</div>
		{:else}
			<code class="language-graphql ">{@html safeHighlight(value)}</code>
			<div class="mx-4 mt-2 ">
				<CodeEditor
					rawValue={value}
					language="graphql"
					onChanged={(detail) => {
						valueModifiedManually = detail.chd_rawValue;
					}}
				/>
			</div>
			{#if astPrinted}
				<div class="mx-4 mt-2 ">
					<!-- <CodeEditor rawValue={astPrinted as string} language="graphql" /> -->
				</div>
			{/if}
		{/if}
	</div>
	<button
		class="btn btn-xs btn-accent mx-atuo absolute top-3 right-4 normal-case"
		onclick={() => {
			showNonPrettifiedQMSBody = !showNonPrettifiedQMSBody;
		}}
	>
		{showNonPrettifiedQMSBody ? ' show prettified ' : ' show non-prettified '}</button
	>
</div>

{#if showHistory}
	<QueryHistory onRestore={restoreQuery} onClose={() => (showHistory = false)} />
{/if}

{#if showImportModal}
	<Modal
		modalIdetifier="import-curl-modal"
		onCancel={() => (showImportModal = false)}
		onApply={handleImportCurl}
	>
		<div class="p-4">
			<h3 class="text-lg font-bold mb-2">Import cURL</h3>
			<p class="mb-4 text-sm text-gray-500">
				Paste a cURL command below to import the GraphQL query and headers.
			</p>
			<textarea
				class="textarea textarea-bordered w-full h-64 font-mono text-sm"
				placeholder="curl 'https://...'"
				bind:value={importCurlValue}
			></textarea>
		</div>
	</Modal>
{/if}
