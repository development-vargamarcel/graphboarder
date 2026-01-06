<script lang="ts">
	import ENUMInterface from './ENUMInterface.svelte';

	import Input from '$lib/components/fields/Input.svelte';
	import Map from '$lib/components/fields/Map.svelte';
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import CodeEditor from '$lib/components/fields/CodeEditor.svelte';
	import { getContext } from 'svelte';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	import InterfacePicker from './InterfacePicker.svelte';
	const choosenDisplayInterface = getContext('choosenDisplayInterface');

	let typeExtraData = $state(endpointInfo.get_typeExtraData(typeInfo));
	interface Props {
		prefix?: string;
		typeInfo: any;
		alwaysOn_interfacePicker?: boolean;
		dispatchValue: any;
		rawValue?: any;
		onChanged?: (detail: any) => void;
	}

	let {
		prefix = '',
		typeInfo = $bindable(),
		alwaysOn_interfacePicker = false,
		dispatchValue = $bindable(),
		rawValue = $bindable(typeExtraData?.defaultValue),
		onChanged
	}: Props = $props();

	$effect(() => {
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
	let componentToRender = $derived.by(() => {
		if (['text', 'number', 'date', 'datetime-local'].includes($choosenDisplayInterface)) {
			return Input;
		}
		if (['geo'].includes($choosenDisplayInterface)) {
			return Map;
		}
		if (['boolean'].includes($choosenDisplayInterface)) {
			return Toggle;
		}
		if (['ENUM'].includes($choosenDisplayInterface)) {
			return ENUMInterface;
		}
		if (['codeeditor'].includes($choosenDisplayInterface)) {
			return CodeEditor;
		}
		return null;
	});
	const onChangeHandler = (detail) => {
		if (detail.chd_rawValue != undefined) {
			detail.chd_dispatchValue = typeExtraData.use_transformer(detail.chd_rawValue);
		}
		onChanged?.(detail);
	};
</script>

{#if alwaysOn_interfacePicker || !componentToRender}
	<InterfacePicker
		{typeInfo}
		chosen={$choosenDisplayInterface}
		onInterfaceChosen={(detail) => {
			$choosenDisplayInterface = detail.chosen;
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
		onChanged={onChangeHandler}
	/>
{/if}
