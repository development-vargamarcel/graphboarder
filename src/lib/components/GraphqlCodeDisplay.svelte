<script lang="ts">
	/**
	 * GraphqlCodeDisplay Component
	 *
	 * Displays a GraphQL query with syntax highlighting, editing capabilities,
	 * and a toolbar for executing, formatting, and managing the query.
	 */
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
	import { parse, print, stripIgnoredCharacters, type ASTNode } from 'graphql';
	import JSON5 from 'json5';
	import QueryHistory from '$lib/components/QueryHistory.svelte';
	import { addToHistory, type HistoryItem } from '$lib/stores/queryHistory';
	import { generateMockData } from '$lib/utils/mockGenerator';
	import { generatePostmanCollectionForQuery } from '$lib/utils/postmanUtils';
	import Modal from '$lib/components/Modal.svelte';
	import { toast } from '$lib/stores/toastStore';
	import LoadingSpinner from '$lib/components/UI/LoadingSpinner.svelte';
	import { generateSnippet, SUPPORTED_LANGUAGES } from '$lib/utils/snippetGenerator';
	import { compressQuery, decompressQuery } from '$lib/utils/shareUtils';
	import { extractVariables } from '$lib/utils/variableExtractor';
	import {
		calculateComplexity,
		calculateResponseSize,
		formatBytes,
		type QueryComplexity
	} from '$lib/utils/queryAnalyzer';
	import { getActiveEnvironment } from '$lib/stores/environmentStore';
	import { substituteVariables } from '$lib/utils/variableSubstitutor';

	interface Props {
		/**
		 * Whether to show the raw, non-prettified query body.
		 */
		showNonPrettifiedQMSBody?: any;
		/**
		 * The GraphQL query string to display.
		 */
		value: any;
		/**
		 * The variables JSON string.
		 */
		variablesString?: any;
		/**
		 * Whether to enable syncing changes in the editor back to the UI stores.
		 * Default: true
		 */
		enableSyncToUI?: boolean;
		/**
		 * Prefix for context keys.
		 */
		prefix?: string;
		/**
		 * Whether to enable sharing the query via URL.
		 */
		enableShareUrl?: boolean;
	}

	let {
		showNonPrettifiedQMSBody = $bindable(false),
		value = $bindable(),
		variablesString = $bindable('{}'),
		enableSyncToUI = true,
		prefix = '',
		enableShareUrl = false
	}: Props = $props();

	let valueModifiedManually = $state();
	let lastSyncedValue = $state(untrack(() => value));
	let showVariables = $state(false);

	// Try to get context if available
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';
	let qmsWraperCtx = $state<QMSWraperContext>();
	let mainWraperCtx = $state<QMSMainWraperContext>();
	let currentQMS_info;

	try {
		qmsWraperCtx = getContext<QMSWraperContext>(`${untrack(() => prefix)}QMSWraperContext`);
		mainWraperCtx = getContext<QMSMainWraperContext>(
			`${untrack(() => prefix)}QMSMainWraperContext`
		);
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
			} catch (e) {
				// If getLanguage fails, attempt registration anyway to be safe
				try {
					hljs.registerLanguage('graphql', graphql);
				} catch (e2) {}
			}
		}
	} catch (e) {
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

	const handleMinify = () => {
		try {
			Logger.info('Minifying query...');
			const minified = stripIgnoredCharacters(value);
			value = minified;
			valueModifiedManually = minified;
			toast.success('Query minified');
		} catch (e) {
			Logger.warn('Minify failed', e);
			toast.error('Failed to minify query');
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
	let isExecuting = $state(false);
	let executionResult = $state('');
	let showExecutionResult = $state(false);
	let executionTime = $state(0);
	let responseSize = $state(0);
	let queryComplexity = $state<QueryComplexity>({ depth: 0, fieldCount: 0 });
	let showSnippetsModal = $state(false);
	let selectedSnippetLanguage = $state('javascript-fetch');
	let snippetEditorLanguage = $derived(
		selectedSnippetLanguage.startsWith('python') ? 'python' : 'javascript'
	);

	let codeEditorInstance = $state<any>();

	/**
	 * Formats the query using the CodeEditor's prettify function or a fallback.
	 */
	const handlePrettify = async () => {
		if (codeEditorInstance) {
			try {
				Logger.info('Formatting query...');
				await codeEditorInstance.prettify();
				toast.success('Query formatted');
			} catch (e) {
				Logger.warn('Prettify failed', e);
				toast.error('Failed to format query');
			}
		} else {
			try {
				const formatted = format(value);
				value = formatted;
				valueModifiedManually = formatted;
				toast.success('Query formatted');
			} catch (e) {
				Logger.warn('Prettify failed', e);
				toast.error('Failed to format query');
			}
		}
	};

	const getParsedVariables = () => {
		try {
			return JSON.parse(variablesString || '{}');
		} catch (e) {
			Logger.warn('Failed to parse variables', e);
			return {};
		}
	};

	const handleExtractVariables = () => {
		try {
			Logger.info('Extracting variables from query...');
			const extracted = extractVariables(value);
			const currentVariables = getParsedVariables();

			// Merge: Keep existing values if keys match, otherwise use default from extracted.
			// Discard variables that are no longer in the query.
			const finalVariables: Record<string, any> = {};
			for (const key in extracted) {
				if (Object.prototype.hasOwnProperty.call(currentVariables, key)) {
					finalVariables[key] = currentVariables[key];
				} else {
					finalVariables[key] = extracted[key];
				}
			}

			variablesString = JSON.stringify(finalVariables, null, 2);
			showVariables = true;
			toast.success('Variables extracted and updated');
		} catch (e) {
			Logger.error('Failed to extract variables', e);
			toast.error('Failed to extract variables');
		}
	};

	let generatedSnippet = $derived.by(() => {
		if (showSnippetsModal && mainWraperCtx?.endpointInfo) {
			const info = get(mainWraperCtx.endpointInfo);
			let headers = info.headers || {};
			const env = getActiveEnvironment();
			if (Object.keys(env.variables).length > 0) {
				const substituted: Record<string, string> = {};
				for (const [k, v] of Object.entries(headers)) {
					substituted[k] = substituteVariables(v, env.variables);
				}
				headers = substituted;
			}
			return generateSnippet(
				selectedSnippetLanguage,
				info.url,
				value,
				getParsedVariables(),
				headers
			);
		}
		return '';
	});

	let isShareCopied = $state(false);

	const handleShare = () => {
		try {
			const vars = getParsedVariables();
			const compressed = compressQuery(value, vars);
			const url = new URL(window.location.href);
			url.searchParams.set('q', compressed);
			window.history.pushState({}, '', url.toString());
			navigator.clipboard.writeText(url.toString());
			isShareCopied = true;
			toast.success('Share URL copied to clipboard');
			Logger.info('Query Share URL copied', { hasVariables: Object.keys(vars).length > 0 });
			setTimeout(() => (isShareCopied = false), 2000);
		} catch (e) {
			Logger.error('Failed to share query', e);
			toast.error('Failed to create share URL');
		}
	};

	$effect(() => {
		if (enableShareUrl) {
			try {
				const params = new URLSearchParams(window.location.search);
				const q = params.get('q');
				if (q) {
					Logger.info('Found query in URL, restoring...');
					const restored = decompressQuery(q);
					if (restored) {
						valueModifiedManually = restored.query;
						if (restored.variables) {
							variablesString = JSON.stringify(restored.variables, null, 2);
							showVariables = true;
						}
						toast.success('Query loaded from URL');
						// Remove q from URL to clean up? Or keep it?
						// Keeping it allows reload to persist.
					}
				}
			} catch (e) {
				Logger.error('Failed to restore query from URL', e);
			}
		}
	});

	const restoreQuery = (item: HistoryItem) => {
		valueModifiedManually = item.query;
		if (item.variables) {
			variablesString = JSON.stringify(item.variables, null, 2);
			showVariables = true;
		} else {
			variablesString = '{}';
		}
		showHistory = false;
	};

	/**
	 * Executes the current query using the URQL client.
	 */
	const handleExecuteQuery = async () => {
		if (!mainWraperCtx?.urqlCoreClient) {
			toast.error('GraphQL Client not available');
			return;
		}

		const client = get(mainWraperCtx.urqlCoreClient) as any;
		if (!client) {
			toast.error('GraphQL Client not initialized');
			return;
		}

		let variables = {};
		try {
			variables = JSON.parse(variablesString || '{}');
		} catch (e) {
			toast.error('Invalid Variables JSON');
			Logger.warn('Invalid Variables JSON on execute', e);
			// We can choose to return here or proceed with empty variables.
			// Usually invalid JSON means user error, so we should stop.
			return;
		}

		// Save to history
		try {
			const info = get(mainWraperCtx.endpointInfo);
			addToHistory({
				query: value,
				variables: variables,
				endpointId: info.id || 'unknown',
				operationName: qmsWraperCtx?.QMSName || 'Query',
				rowsCount: undefined // will update if successful?
			});
		} catch (e) {
			Logger.error('Failed to save to history', e);
		}

		isExecuting = true;
		showExecutionResult = true;
		executionResult = 'Loading...';
		executionTime = 0;
		responseSize = 0;
		const startTime = performance.now();

		try {
			// Determine if it's a mutation or query
			const isMutation = value.trim().startsWith('mutation');

			let result;
			const opOptions = {
				fetchOptions: () => {
					// Ensure headers are up to date
					const info = get(mainWraperCtx!.endpointInfo);
					let headers = info.headers || {};
					// Merge with local storage headers if any logic requires it,
					// but MainWraper client already handles this via fetchOptions callback.
					return {};
				}
			};

			Logger.info(`Executing ${isMutation ? 'mutation' : 'query'}...`, { variables });

			if (isMutation) {
				result = await client.mutation(value, variables).toPromise();
			} else {
				result = await client.query(value, variables).toPromise();
			}

			const endTime = performance.now();
			executionTime = Math.round(endTime - startTime);

			if (result.error) {
				Logger.error('Execution failed', result.error);
				executionResult = JSON.stringify(result.error, null, 2);
				toast.error('Query execution failed');
				responseSize = 0;
			} else {
				Logger.info('Execution successful', { executionTime });
				executionResult = JSON.stringify(result.data, null, 2);
				responseSize = calculateResponseSize(result.data);
				toast.success(`Query executed in ${executionTime}ms`);
			}
		} catch (e) {
			Logger.error('Execution error', e);
			executionResult = JSON.stringify({ error: (e as Error).message }, null, 2);
			toast.error('An error occurred during execution');
		} finally {
			isExecuting = false;
		}
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
				if (parsed.variables && Object.keys(parsed.variables).length > 0) {
					variablesString = JSON.stringify(parsed.variables, null, 2);
					showVariables = true;
				}

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
				toast.success(`Query imported successfully.${headerMessage}`);
				showImportModal = false;
				importCurlValue = '';
			} else {
				toast.error('No valid GraphQL query found in the cURL command.');
			}
		} catch (e) {
			Logger.error('Failed to import cURL', e);
			toast.error('Failed to parse cURL command.');
		}
	};

	const syncQueryToUI = (ast) => {
		try {
			if (!qmsWraperCtx || !mainWraperCtx) {
				Logger.warn('GraphqlCodeDisplay: Cannot sync to UI - context not available');
				return;
			}

			const { activeArgumentsDataGrouped_Store, tableColsData_Store, paginationState, QMSName } =
				qmsWraperCtx;

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
		// Calculate complexity when query changes
		if (value) {
			queryComplexity = calculateComplexity(value);
		}
	});
	$effect(() => {
		if (getPreciseType(ast) == 'object') {
			astAsString = JSON5.stringify(ast);
		}
	});
</script>

<div class="mockup-code bg-base text-content my-1 mx-2 px-2 relative group">
	<div class="absolute top-3 right-40 flex space-x-2 items-center">
		<div
			class="badge badge-sm badge-ghost gap-1 mr-2 hidden xl:inline-flex cursor-help"
			title="Query Complexity: Depth / Fields"
		>
			<i class="bi bi-diagram-2"></i>
			{queryComplexity.depth}/{queryComplexity.fieldCount}
		</div>
		<button
			class="btn btn-xs btn-ghost text-primary font-bold transition-opacity"
			aria-label="Execute Query"
			title="Execute Query"
			onclick={handleExecuteQuery}
			disabled={isExecuting}
		>
			{#if isExecuting}
				<span class="loading loading-spinner loading-xs"></span> Running...
			{:else}
				<i class="bi bi-play-fill"></i> Execute
			{/if}
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="History"
			title="View Query History"
			onclick={() => (showHistory = true)}
		>
			<i class="bi bi-clock-history"></i> History
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity {showVariables
				? 'text-primary font-bold'
				: ''}"
			aria-label="Variables"
			title="Toggle Variables Editor"
			onclick={() => (showVariables = !showVariables)}
		>
			<i class="bi bi-braces"></i> Variables
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Extract Variables"
			title="Extract Variables from Query"
			onclick={handleExtractVariables}
		>
			<i class="bi bi-file-earmark-code"></i> Extract Vars
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Prettify Query"
			title="Format Query (Prettify)"
			onclick={handlePrettify}
		>
			<i class="bi bi-magic"></i> Prettify
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Minify Query"
			title="Minify Query (Remove Whitespace)"
			onclick={handleMinify}
		>
			<i class="bi bi-arrows-collapse"></i> Minify
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Copy to Clipboard"
			title="Copy Query to Clipboard"
			onclick={() => {
				Logger.info('Copied query to clipboard');
				navigator.clipboard.writeText(value);
				isCopied = true;
				toast.success('Query copied to clipboard');
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
					let headers = info.headers || {};
					const env = getActiveEnvironment();
					if (Object.keys(env.variables).length > 0) {
						const substituted: Record<string, string> = {};
						for (const [k, v] of Object.entries(headers)) {
							substituted[k] = substituteVariables(v, env.variables);
						}
						headers = substituted;
					}

					const curl = generateCurlCommand(info.url, value, getParsedVariables(), headers);
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
			aria-label="Code Snippets"
			title="Generate Code Snippets"
			onclick={() => {
				showSnippetsModal = true;
				Logger.info('Opened code snippets modal');
			}}
		>
			<i class="bi bi-code-square"></i> Snippets
		</button>
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Export to Postman"
			title="Export as Postman Collection"
			onclick={() => {
				if (mainWraperCtx?.endpointInfo) {
					Logger.info('Exporting to Postman');
					const info = get(mainWraperCtx.endpointInfo);
					let headers = info.headers || {};
					const env = getActiveEnvironment();
					if (Object.keys(env.variables).length > 0) {
						const substituted: Record<string, string> = {};
						for (const [k, v] of Object.entries(headers)) {
							substituted[k] = substituteVariables(v, env.variables);
						}
						headers = substituted;
					}

					const json = generatePostmanCollectionForQuery(
						qmsWraperCtx?.QMSName || 'Query',
						info.url,
						value,
						headers,
						getParsedVariables()
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
		<button
			class="btn btn-xs btn-ghost transition-opacity"
			aria-label="Share URL"
			title="Share Query via URL"
			onclick={handleShare}
		>
			{#if isShareCopied}
				<i class="bi bi-check"></i> Copied Link!
			{:else}
				<i class="bi bi-share"></i> Share
			{/if}
		</button>
	</div>
	<div class="max-h-[50vh] overflow-y-auto">
		{#if showExecutionResult}
			<div class="p-2">
				<div class="flex flex-wrap justify-between items-center mb-2 gap-2">
					<div class="flex items-center gap-2">
						<h3 class="font-bold text-success">
							<i class="bi bi-play-circle"></i> Execution Result
						</h3>
						{#if executionTime > 0}
							<div class="badge badge-secondary badge-outline gap-1" title="Execution Time">
								<i class="bi bi-stopwatch"></i>
								{executionTime}ms
							</div>
						{/if}
						{#if responseSize > 0}
							<div class="badge badge-info badge-outline gap-1" title="Response Size">
								<i class="bi bi-hdd-network"></i>
								{formatBytes(responseSize)}
							</div>
						{/if}
					</div>
					<div class="flex gap-2">
						<button
							class="btn btn-xs btn-ghost"
							onclick={() => {
								navigator.clipboard.writeText(executionResult);
								toast.success('Result copied to clipboard');
							}}
						>
							<i class="bi bi-clipboard"></i> Copy
						</button>
						<button class="btn btn-xs btn-ghost" onclick={() => (showExecutionResult = false)}
							>✕ Close</button
						>
					</div>
				</div>
				<CodeEditor rawValue={executionResult} language="json" readOnly={true} />
			</div>
		{:else if showMockData}
			<div class="p-2">
				<div class="flex justify-between items-center mb-2">
					<h3 class="font-bold">Mock Data Result</h3>
					<button class="btn btn-xs btn-ghost" onclick={() => (showMockData = false)}
						>✕ Close</button
					>
				</div>
				<CodeEditor rawValue={mockDataResult} language="json" readOnly={true} />
			</div>
		{:else if showNonPrettifiedQMSBody}
			<code class="px-10">{value}</code>
			<div class="mt-4">
				<code class="px-10">{astAsString}</code>
			</div>
		{:else}
			<code class="language-graphql">{@html safeHighlight(value)}</code>
			<div class="mx-4 mt-2">
				<CodeEditor
					bind:this={codeEditorInstance}
					rawValue={value}
					language="graphql"
					onChanged={(detail) => {
						valueModifiedManually = detail.chd_rawValue;
						value = detail.chd_rawValue;
					}}
				/>
			</div>
			{#if showVariables}
				<div class="border-t border-base-200 mt-2 pt-2 mx-4">
					<div class="flex justify-between items-center mb-1">
						<span class="text-xs font-bold text-gray-500 uppercase">Query Variables (JSON)</span>
						<button
							class="btn btn-xs btn-ghost text-xs"
							onclick={() => {
								try {
									const parsed = JSON.parse(variablesString || '{}');
									variablesString = JSON.stringify(parsed, null, 2);
								} catch (e) {
									toast.error('Invalid JSON');
								}
							}}
						>
							Prettify
						</button>
					</div>
					<CodeEditor
						rawValue={variablesString}
						language="json"
						onChanged={(detail) => {
							variablesString = detail.chd_rawValue;
						}}
					/>
				</div>
			{/if}
			{#if astPrinted}
				<div class="mx-4 mt-2">
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

{#if showSnippetsModal}
	<Modal
		modalIdetifier="code-snippets-modal"
		showApplyBtn={false}
		onCancel={() => (showSnippetsModal = false)}
	>
		<div class="p-4">
			<h3 class="text-lg font-bold mb-4">Generate Code Snippets</h3>

			<div class="form-control w-full max-w-xs mb-4">
				<label class="label" for="snippet-language-select">
					<span class="label-text">Select Language/Client</span>
				</label>
				<select
					id="snippet-language-select"
					class="select select-bordered"
					bind:value={selectedSnippetLanguage}
				>
					{#each SUPPORTED_LANGUAGES as lang}
						<option value={lang.value}>{lang.label}</option>
					{/each}
				</select>
			</div>

			<div class="relative">
				<CodeEditor rawValue={generatedSnippet} language={snippetEditorLanguage} readOnly={true} />
				<button
					class="btn btn-xs btn-outline absolute top-2 right-2"
					onclick={() => {
						navigator.clipboard.writeText(generatedSnippet);
						toast.success('Snippet copied to clipboard');
						Logger.info('Copied code snippet', { language: selectedSnippetLanguage });
					}}
				>
					<i class="bi bi-clipboard"></i> Copy
				</button>
			</div>
		</div>
	</Modal>
{/if}
