<script>
	import CodeEditor from './fields/CodeEditor.svelte';
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import { onMount } from 'svelte';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	export let showNonPrettifiedQMSBody;
	export let value;

	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
</script>

<div class="mockup-code bg-base text-content my-1 mx-2 px-2 ">
	<div class="max-h-32 overflow-y-auto">
		{#if showNonPrettifiedQMSBody}
			<code class="px-10">{value}</code>
		{:else}
			<code class="language-graphql "
				>{@html hljs.highlight(format(value), { language: 'graphql' }).value.trim()}</code
			>
			<div class="mx-4 mt-2">
				<CodeEditor rawValue={value} language="graphql" />
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
