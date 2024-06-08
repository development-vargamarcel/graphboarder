<script>
	import { stringify } from 'postcss';
	import CodeEditor from './fields/CodeEditor.svelte';
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import { onMount } from 'svelte';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import { getPreciseType, objectToSourceCode } from '$lib/utils/usefulFunctions';
	export let showNonPrettifiedQMSBody;
	export let value;
	let valueModifiedManually;
	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
	import { parse, print, visit } from 'graphql';
	import JSON5 from 'json5';
	import CodeMirrorCustom from './fields/CodeMirrorCustom.svelte';
	let astAsString = '';
	let astAsString2 = '';
	let ast;
	let astPrinted;
	$: ast = parse(value);
	$: if (ast) {
		// Extract operation type and name
		//const operationType = ast.definitions[0]?.operation;
		//const operationName = ast.definitions[0]?.name?.value;

		astPrinted = print(ast);
	}
	$: {
		if (valueModifiedManually) {
			ast = parse(valueModifiedManually);
		}
	}

	$: if (getPreciseType(ast) == 'object') {
		//console.log('qqqwww', value, ast, astAsString);
		astAsString = JSON5.stringify(ast);
		//astAsString2 = objectToSourceCode(ast);
		//console.log('qqqwww2', value, ast, astAsString);
	}

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
		});
	};
	///
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
					on:changed={(e) => {
						valueModifiedManually = e.detail.chd_rawValue;
					}}
				/>
			</div>
			<div class="mx-4 mt-2 ">
				<!-- <CodeMirrorCustom value={`const ast:${astAsString}`} language="typescript" /> -->

				<CodeEditor rawValue={astAsString} language="javascript" />
				<button class="btn btn-xs btn-primary" on:click={visitAst}> visit ast </button>
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
		on:click={() => {
			showNonPrettifiedQMSBody = !showNonPrettifiedQMSBody;
		}}
	>
		{showNonPrettifiedQMSBody ? ' show prettified ' : ' show non-prettified '}</button
	>
</div>
