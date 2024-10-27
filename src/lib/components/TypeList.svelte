<script>
	import Type from '$lib/components/Type.svelte';
	import { setContext, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	/** @type {{prefix?: string, types: any, template: any, depth: any, stepsOfFields: any}} */
	let {
		prefix = '',
		types,
		template,
		depth,
		stepsOfFields
	} = $props();
</script>

{#each types as type, index (index)}
	<Type
		{index}
		{prefix}
		{type}
		{template}
		{depth}
		{stepsOfFields}
		isOnMainList={true}
		on:colAddRequest
	/>
{/each}
