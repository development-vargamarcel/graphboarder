<script lang="ts">
	import { run } from 'svelte/legacy';

	import ENUMInterface from './ENUMInterface.svelte';
	//TODO: !!!
	//When choosenDisplayInterface =="ENUM",nothing happens.Handle enum like all other interfaces to solve this.

	import Input from '$lib/components/fields/Input.svelte';
	import Map from '$lib/components/fields/Map.svelte';
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import CodeEditor from '$lib/components/fields/CodeEditor.svelte';
	import { createEventDispatcher, getContext } from 'svelte';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	import InterfacePicker from './InterfacePicker.svelte';
	const dispatch = createEventDispatcher();
	const choosenDisplayInterface = getContext('choosenDisplayInterface');

	let typeExtraData = $state(endpointInfo.get_typeExtraData(typeInfo));
	interface Props {
		prefix?: string;
		typeInfo: any;
		alwaysOn_interfacePicker?: boolean;
		dispatchValue: any;
		rawValue?: any;
	}

	let {
		prefix = '',
		typeInfo = $bindable(),
		alwaysOn_interfacePicker = false,
		dispatchValue = $bindable(),
		rawValue = $bindable(typeExtraData?.defaultValue)
	}: Props = $props();

	run(() => {
		if ($choosenDisplayInterface) {
			typeExtraData = endpointInfo.get_typeExtraData(typeInfo, $choosenDisplayInterface);
			typeInfo.chosenDisplayInterface = $choosenDisplayInterface;
			if (typeof rawValue == undefined) {
				rawValue = typeExtraData.defaultValue;
			}
			if (typeof dispatchValue == undefined) {
				dispatchValue = typeExtraData.use_transformer(typeExtraData.defaultValue);
			}
		}
	});
	let componentToRender = $state(Input);
	run(() => {
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
	});
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
		{typeInfo}
		chosen={$choosenDisplayInterface}
		on:interfaceChosen={(e) => {
			$choosenDisplayInterface = e.detail.chosen;
		}}
	/>
{/if}

{#if componentToRender}
	{@const SvelteComponent = componentToRender}
	<SvelteComponent
		{typeInfo}
		{rawValue}
		{dispatchValue}
		displayInterface={$choosenDisplayInterface}
		on:changed={(e) => {
			onChangeHandler(e);
		}}
	/>
{/if}
