<script>
	import ENUMInterface from './ENUMInterface.svelte';
	//TODO: !!!
	//When choosenDisplayInteface =="ENUM",nothing happens.Handle enum like all other interfaces to solve this.

	import Input from '$lib/components/fields/Input.svelte';
	import Map from '$lib/components/fields/Map.svelte';
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import CodeEditor from '$lib/components/fields/CodeEditor.svelte';
	import { createEventDispatcher, getContext } from 'svelte';
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	import InterfacePicker from './InterfacePicker.svelte';
	const dispatch = createEventDispatcher();
	export let typeInfo;
	export let alwaysOn_interfacePicker = false;
	let choosenDisplayInteface = typeInfo?.choosenDisplayInteface || null;
	let { displayInterface, get_convertedValue, defaultValue } =
		endpointInfo.get_typeExtraData(typeInfo);
	export let rawValue = defaultValue;

	$: if (choosenDisplayInteface) {
		displayInterface = choosenDisplayInteface;
		get_convertedValue = $endpointInfo.typesExtraDataPossibilities
			.find((possibility) => {
				return possibility.get_Val().displayInterface == choosenDisplayInteface;
			})
			.get_Val().get_convertedValue;
		typeInfo.choosenDisplayInteface = choosenDisplayInteface;
	}
	let componentToRender = Input;
	$: {
		if (['text', 'number', 'date', 'datetime-local'].includes(displayInterface)) {
			componentToRender = Input;
		}
		if (['geo'].includes(displayInterface)) {
			componentToRender = Map;
		}
		if (['boolean'].includes(displayInterface)) {
			componentToRender = Toggle;
		}
		if (['ENUM'].includes(displayInterface)) {
			componentToRender = ENUMInterface;
		}
		if (['codeeditor'].includes(displayInterface)) {
			componentToRender = CodeEditor;
		}
		if (!displayInterface) {
			componentToRender = InterfacePicker;
		}
	}
</script>

{#if alwaysOn_interfacePicker}
	<svelte:component
		this={InterfacePicker}
		{typeInfo}
		on:interfaceChosen={(e) => {
			choosenDisplayInteface = e.detail.chosen;
		}}
		{displayInterface}
		{rawValue}
		on:changed={(e) => {
			let { detail } = e;
			detail.chd_dispatchValue = get_convertedValue(detail.chd_rawValue);
			detail.choosenDisplayInteface = choosenDisplayInteface;
			dispatch('changed', detail);
		}}
	/>{/if}
<svelte:component
	this={componentToRender}
	{typeInfo}
	on:interfaceChosen={(e) => {
		choosenDisplayInteface = e.detail.chosen;
	}}
	{displayInterface}
	{rawValue}
	on:changed={(e) => {
		let { detail } = e;
		detail.chd_dispatchValue = get_convertedValue(detail.chd_rawValue);
		detail.choosenDisplayInteface = choosenDisplayInteface;
		dispatch('changed', detail);
	}}
/>
