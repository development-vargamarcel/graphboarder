<script>
	import CodeEditor from './fields/CodeEditor.svelte';
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import { onMount } from 'svelte';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import { getPreciseType, objectToSourceCode } from '$lib/utils/usefulFunctions';
	export let showNonPrettifiedQMSBody;
	export let value;

	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
	import { parse, print } from 'graphql';
	import JSON5 from 'json5';
	import CodeMirrorCustom from './fields/CodeMirrorCustom.svelte';
	let astAsString = '';
	let astAsString2 = '';

	$: ast = parse(value);
	$: if (getPreciseType(ast) == 'object') {
		console.log('qqqwww', value, ast, astAsString);
		astAsString = JSON5.stringify(ast);
		//astAsString2 = objectToSourceCode(ast);
		console.log('qqqwww2', value, ast, astAsString);
	}
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
				<CodeMirrorCustom {value} language="graphql" />
				<!-- <CodeEditor rawValue={value} language="graphql" /> -->
			</div>
			<div class="mx-4 mt-2 ">
				<CodeMirrorCustom value={`const ast:${astAsString}`} language="typescript" />

				<!-- <CodeEditor rawValue={astAsString} language="javascript" /> -->
			</div>
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
