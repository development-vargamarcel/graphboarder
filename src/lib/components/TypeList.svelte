<script>
	import Type from '$lib/components/Type.svelte';
	import { setContext, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	export let prefix = '';
	export let types;
	export let template;
	export let depth;
	export let stepsOfFields;
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
