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
	let typeExtraData = endpointInfo.get_typeExtraData(typeInfo);
	export let dispatchValue;
	export let rawValue = typeExtraData?.defaultValue;
	let displayInterface = typeExtraData.displayInterface;

	$: if (choosenDisplayInteface) {
		typeExtraData = endpointInfo.get_typeExtraData(typeInfo, choosenDisplayInteface);
		typeInfo.choosenDisplayInteface = choosenDisplayInteface;
		typeInfo.dd_displayInterface = choosenDisplayInteface;
		typeExtraData = endpointInfo.get_typeExtraData(typeInfo);
		if (typeof rawValue == undefined) {
			rawValue = typeExtraData.defaultValue;
		}
		displayInterface = choosenDisplayInteface;
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
			componentToRender = null;
		}
	}
	const onChangeHandler = (e) => {
		let { detail } = e;
		if (detail.chd_rawValue != undefined) {
			detail.chd_dispatchValue = typeExtraData.use_transformer(detail.chd_rawValue);
		}
		detail.choosenDisplayInteface = choosenDisplayInteface;
		dispatch('changed', detail);
	};
</script>

{#if alwaysOn_interfacePicker || !componentToRender}
	<InterfacePicker
		on:interfaceChosen={(e) => {
			choosenDisplayInteface = e.detail.chosen;
		}}
	/>
{/if}

{#if componentToRender}
	<svelte:component
		this={componentToRender}
		{typeInfo}
		{rawValue}
		{dispatchValue}
		displayInterface={typeExtraData.displayInterface}
		on:changed={(e) => {
			onChangeHandler(e);
		}}
	/>
{/if}
