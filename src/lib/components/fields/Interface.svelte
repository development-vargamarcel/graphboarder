<script>
	import ENUMInterface from './ENUMInterface.svelte';
	//TODO: !!!
	//When choosenDisplayInterface =="ENUM",nothing happens.Handle enum like all other interfaces to solve this.

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
	const choosenDisplayInterface = getContext('choosenDisplayInterface');

	let typeExtraData = endpointInfo.get_typeExtraData(typeInfo);
	export let dispatchValue;
	export let rawValue = typeExtraData?.defaultValue;

	$: if ($choosenDisplayInterface) {
		typeExtraData = endpointInfo.get_typeExtraData(typeInfo, $choosenDisplayInterface);
		typeInfo.chosenDisplayInterface = $choosenDisplayInterface;
		if (typeof rawValue == undefined) {
			rawValue = typeExtraData.defaultValue;
		}
		if (typeof dispatchValue == undefined) {
			dispatchValue = typeExtraData.use_transformer(typeExtraData.defaultValue);
		}
	}
	let componentToRender = Input;
	$: {
		if (['text', 'number', 'date', 'datetime-local'].includes($choosenDisplayInterface)) {
			componentToRender = Input;
		}
		if (['geo'].includes($choosenDisplayInterface)) {
			componentToRender = Map;
		}
		if (['boolean'].includes($choosenDisplayInterface)) {
			componentToRender = Toggle;
		}
		if (['ENUM'].includes($choosenDisplayInterface)) {
			componentToRender = ENUMInterface;
		}
		if (['codeeditor'].includes($choosenDisplayInterface)) {
			componentToRender = CodeEditor;
		}
		if (!$choosenDisplayInterface) {
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
		chosen={$choosenDisplayInterface}
		on:interfaceChosen={(e) => {
			$choosenDisplayInterface = e.detail.chosen;
		}}
	/>
{/if}

{#if componentToRender}
	<svelte:component
		this={componentToRender}
		{typeInfo}
		{rawValue}
		{dispatchValue}
		displayInterface={$choosenDisplayInterface}
		on:changed={(e) => {
			onChangeHandler(e);
		}}
	/>
{/if}
