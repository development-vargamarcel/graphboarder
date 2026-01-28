<script lang="ts">
	import { stringify } from 'postcss';
	import CodeEditor from './fields/CodeEditor.svelte';
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import { getContext, untrack } from 'svelte';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import { Logger } from '$lib/utils/logger';
	import { getPreciseType, objectToSourceCode } from '$lib/utils/usefulFunctions';
	import { updateStoresFromAST } from '$lib/utils/astToUIState';
	import { generateCurlCommand } from '$lib/utils/curlUtils';
	import { get } from 'svelte/store';
	import { parse, print, visit, type ASTNode } from 'graphql';
	import JSON5 from 'json5';
	import CodeMirrorCustom from './fields/CodeMirrorCustom.svelte';
	import QueryHistory from '$lib/components/QueryHistory.svelte';
	import type { HistoryItem } from '$lib/stores/queryHistory';
	import { generateMockData } from '$lib/utils/mockGenerator';

	interface Props {
		showNonPrettifiedQMSBody: any;
		value: any;
		enableSyncToUI?: boolean;
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
		// Suppress duplicate identifier if getContext was already imported and used previously in this scope (which it was, up top)
		// But here we are assigning to vars.
		qmsWraperCtx = getContext<QMSWraperContext>(`${untrack(() => prefix)}QMSWraperContext`);
		mainWraperCtx = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	} catch (e) {
		Logger.debug('GraphqlCodeDisplay: Context not available', e);
	}

	$effect(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});

	let astAsString = $state('');
	let astAsString2 = '';
	let ast = $state();
	let astPrinted = $state();
	let isCopied = $state(false);
	let isCurlCopied = $state(false);
	let showHistory = $state(false);
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

	///
	const visitAst = () => {
		const editedAST = visit(ast as ASTNode, {
			enter(node, key, parent, path, ancestors) {
				Logger.debug(JSON.parse(JSON.stringify({ node, key, parent, path, ancestors })));
				// @return
				//   undefined: no action
				//   false: skip visiting this node
				//   visitor.BREAK: stop visiting altogether
				//   null: delete this node
				//   any value: replace this node with the returned value
			}
			// leave(node, key, parent, path, ancestors) {
			//   // @return
			//   //   undefined: no action
			//   //   false: no action
			//   //   visitor.BREAK: stop visiting altogether
			//   //   null: delete this node
			//   //   any value: replace this node with the returned value
			// }
		},);
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
			// Extract operation type and name
			//const operationType = ast.definitions[0]?.operation;
			//const operationName = ast.definitions[0]?.name?.value;

			astPrinted = print(ast as ASTNode);
		}
	});
	$effect(() => {
		if (getPreciseType(ast) == 'object') {
			//Logger.debug('qqqwww', value, ast, astAsString);
			astAsString = JSON5.stringify(ast);
			//astAsString2 = objectToSourceCode(ast);
			//Logger.debug('qqqwww2', value, ast, astAsString);
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
			aria-label="Generate Mock Data"
			title="Generate Mock Response Data"
			onclick={handleGenerateMockData}
		>
			<i class="bi bi-code-slash"></i> Mock Data
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
			<code class="language-graphql "
				>{@html hljs.highlight(format(value), { language: 'graphql' }).value.trim()}</code
			>
			<div class="mx-4 mt-2 ">
				<!-- <CodeMirrorCustom {value} language="graphql" /> -->
				<CodeEditor
					rawValue={value}
					language="graphql"
					onChanged={(detail) => {
						valueModifiedManually = detail.chd_rawValue;
					}}
				/>
			</div>
			<div class="mx-4 mt-2 ">
				<!-- <CodeMirrorCustom value={`const ast:${astAsString}`} language="typescript" /> -->

				<CodeEditor rawValue={astAsString} language="javascript" />
				<button class="btn btn-xs btn-primary" onclick={visitAst}> visit ast </button>
			</div>
			{#if astPrinted}
				<div class="mx-4 mt-2 ">
					<!-- <CodeMirrorCustom {value} language="graphql" /> -->
					<CodeEditor rawValue={astPrinted as string} language="graphql" />
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
