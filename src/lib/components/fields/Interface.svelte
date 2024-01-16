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
	const choosenDisplayInteface = getContext('choosenDisplayInteface');

	let typeExtraData = endpointInfo.get_typeExtraData(typeInfo);
	export let dispatchValue;
	export let rawValue = typeExtraData?.defaultValue;
	export let displayInterface = typeExtraData.displayInterface;

	$: if ($choosenDisplayInteface) {
		typeExtraData = endpointInfo.get_typeExtraData(typeInfo, $choosenDisplayInteface);
		displayInterface = $choosenDisplayInteface;
		if (typeof rawValue == undefined) {
			rawValue = typeExtraData.defaultValue;
		}
		if (typeof dispatchValue == undefined) {
			dispatchValue = typeExtraData.use_transformer(typeExtraData.defaultValue);
		}
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
		dispatch('changed', detail);
	};
</script>

{#if alwaysOn_interfacePicker || !componentToRender}
	<InterfacePicker
		chosen={$choosenDisplayInteface}
		on:interfaceChosen={(e) => {
			$choosenDisplayInteface = e.detail.chosen;
		}}
	/>
{/if}

{#if componentToRender}
	<svelte:component
		this={componentToRender}
		{typeInfo}
		{rawValue}
		{dispatchValue}
		{displayInterface}
		on:changed={(e) => {
			onChangeHandler(e);
		}}
	/>
{/if}
