<script lang="ts">
	import EndpointPicker from '$lib/components/endpointPicker.svelte';
	import '../app.postcss';
	import { endpointInfo } from '$lib/stores/endpointHandling/endpointInfo';
	const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	console.log('qqq', QMSMainWraperContext);
	import { getContext, setContext } from 'svelte';
	import MainWraper from '$lib/components/MainWraper.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	setContext('endpointInfo', endpointInfo);
	let forceVisibleSidebar = false;
	import { testEndpoints_Store } from '$lib/stores/testData/testEndpoints';
	//endpointInfo.smartSet($testEndpoints_Store[1]);
</script>

<header />

<slot />
<footer />

<style>
</style>
