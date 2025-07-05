<script>
	import Type from '$lib/components/Type.svelte';
	import { setContext, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	/**
	 * @typedef {Object} Props
	 * @property {string} [prefix]
	 * @property {any} types
	 * @property {any} template
	 * @property {any} depth
	 * @property {any} stepsOfFields
	 */

	/** @type {Props} */
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
