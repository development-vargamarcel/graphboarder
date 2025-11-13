<script lang="ts">
	import { run } from 'svelte/legacy';

	import { stringify } from 'postcss';
	import CodeEditor from './fields/CodeEditor.svelte';
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import { onMount, getContext } from 'svelte';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import { getPreciseType, objectToSourceCode } from '$lib/utils/usefulFunctions';
	import { updateStoresFromAST } from '$lib/utils/astToUIState';
	import { parse, print, visit } from 'graphql';
	import JSON5 from 'json5';
	import CodeMirrorCustom from './fields/CodeMirrorCustom.svelte';

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
	let lastSyncedValue = $state(value);

	// Try to get context if available
	let QMSWraperContext = $state();
	let QMSMainWraperContext = $state();
	let currentQMS_info;

	try {
		QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
		QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	} catch (e) {
		console.log('GraphqlCodeDisplay: Context not available', e);
	}

	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});

	let astAsString = $state('');
	let astAsString2 = '';
	let ast = $state();
	let astPrinted = $state();




	///
	const visitAst = () => {
		const editedAST = visit(ast, {
			enter(node, key, parent, path, ancestors) {
				console.log(JSON.parse(JSON.stringify({ node, key, parent, path, ancestors })));
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
			if (!QMSWraperContext || !QMSMainWraperContext) {
				console.warn('GraphqlCodeDisplay: Cannot sync to UI - context not available');
				return;
			}

			const {
				activeArgumentsDataGrouped_Store,
				tableColsData_Store,
				paginationState,
				QMSName
			} = QMSWraperContext;

			const { endpointInfo, schemaData } = QMSMainWraperContext;

			// Get the current QMS info
			const qmsInfo = schemaData.get_QMS_Field(QMSName, 'query', schemaData);

			if (!qmsInfo) {
				console.warn('GraphqlCodeDisplay: QMS info not found');
				return;
			}

			console.log('GraphqlCodeDisplay: Syncing query to UI', { ast, qmsInfo });

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
			console.error('GraphqlCodeDisplay: Error syncing query to UI:', e);
		}
	};
	///
	run(() => {
		ast = parse(value);
	});
	run(() => {
		if (valueModifiedManually && valueModifiedManually !== lastSyncedValue) {
			try {
				ast = parse(valueModifiedManually);

				// Sync to UI if enabled and context is available
				if (enableSyncToUI && QMSWraperContext && QMSMainWraperContext) {
					syncQueryToUI(ast);
					lastSyncedValue = valueModifiedManually;
				}
			} catch (e) {
				console.error('Error parsing manually modified query:', e);
			}
		}
	});
	run(() => {
		if (ast) {
			// Extract operation type and name
			//const operationType = ast.definitions[0]?.operation;
			//const operationName = ast.definitions[0]?.name?.value;

			astPrinted = print(ast);
		}
	});
	run(() => {
		if (getPreciseType(ast) == 'object') {
			//console.log('qqqwww', value, ast, astAsString);
			astAsString = JSON5.stringify(ast);
			//astAsString2 = objectToSourceCode(ast);
			//console.log('qqqwww2', value, ast, astAsString);
		}
	});
</script>

<div class="mockup-code bg-base text-content my-1 mx-2 px-2 ">
	<div class="max-h-[50vh] overflow-y-auto">
		{#if showNonPrettifiedQMSBody}
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
					<CodeEditor rawValue={astPrinted} language="graphql" />
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
