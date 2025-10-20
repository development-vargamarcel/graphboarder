<script lang="ts">
	import {
		generateArgData,
		generateContainerData
	} from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher, getContext } from 'svelte';
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";

	const dispatch = createEventDispatcher();
	console.log({ type });

	let {
		expand,
		showExpand,
		index,
		type,
		template,
		stepsOfFields = $bindable(),
		predefinedFirstSteps,
		groupName
	} = $props();

	if (stepsOfFields.length == 0 && predefinedFirstSteps) {
		stepsOfFields = [...predefinedFirstSteps];
	}

	let {
		dd_kindsArray,
		dd_namesArray,
		dd_rootName,
		dd_displayName,
		dd_kindList,
		dd_kindEl,
		dd_NON_NULL,
		dd_canExpand,
		dd_shouldExpand,
		dd_filterOperators
	} = type;

	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;

	const addFilter = () => {
		dispatch('argAddRequest', generateArgData(stepsOfFields, type, schemaData));
	};

	const addContainer = () => {
		dispatch('containerAddRequest', generateContainerData(stepsOfFields, type));
	};
</script>

{#if template == 'default'}
	<div class="flex items-center gap-2">
		<div class="flex items-center gap-2 w-1/3">
			{#if dd_canExpand}
				<Button size="sm" variant="outline" class="h-8 w-8 p-0" onclick={expand}>
					{showExpand ? '-' : '+'}
				</Button>
			{:else}
				<Button size="sm" variant="outline" class="h-8 w-8 p-0" disabled onclick={expand}>
					+
				</Button>
			{/if}

			<Badge variant="secondary">{index + 1}</Badge>

			<Button
				size="sm"
				variant="secondary"
				class="font-normal"
				onclick={() => {
					console.log(type);
				}}
			>
				{dd_displayName}
			</Button>
		</div>

		<div class="w-1/2">
			<div class="flex items-center gap-2">
				<Badge variant="secondary" class="text-xs">
					{dd_kindsArray.join(' of ')}
				</Badge>

				{#if !dd_canExpand}
					<Button
						size="sm"
						variant="ghost"
						class="h-8 text-xs"
						onclick={() => {
							console.log(getRootType(null, dd_rootName, schemaData));
						}}
					>
						{#if dd_displayName == dd_namesArray[dd_namesArray.length - 1]}
							{''}
						{:else}
							{dd_namesArray[dd_namesArray.length - 1]}
						{/if}
					</Button>
				{/if}

				{#if dd_canExpand}
					<Button
						size="sm"
						variant="ghost"
						class="h-8 text-xs"
						onclick={() => {
							console.log(getRootType(null, dd_rootName, schemaData));
						}}
					>
						{#if dd_namesArray[0] !== dd_displayName}
							({dd_namesArray[0]})
						{:else if dd_namesArray[1] && dd_namesArray[1] !== dd_displayName}
							({dd_namesArray[1]})
						{:else}
							{'same'}
						{/if}
					</Button>
				{/if}
			</div>
		</div>
	</div>
{:else if template == 'changeArguments'}
	<!-- Interactive list item for argument selection -->
	<button
		class="cursor-pointer hover:bg-accent hover:text-accent-foreground px-3 py-2.5 rounded-md flex items-center justify-between w-full transition-colors duration-100 select-none text-left border border-transparent hover:border-border"
		onclick={() => {
			if (dd_kindEl == 'INPUT_OBJECT') {
				addContainer();
			} else {
				addFilter();
			}
		}}
	>
		<div class="flex-1 pr-4 {dd_NON_NULL ? 'underline underline-offset-2 font-medium' : ''}">
			<span class="text-sm">{dd_displayName}</span>
			{#if dd_NON_NULL}
				<Badge variant="destructive" class="ml-2 text-xs h-5">Required</Badge>
			{/if}
		</div>

		<div class="flex items-center gap-2 min-w-fit">
			{#if dd_kindEl == 'INPUT_OBJECT'}
				{#if dd_kindList}
					<!-- List icon -->
					<div class="flex items-center gap-1">
						<Badge variant="outline" class="text-xs">List</Badge>
						<i class="bi bi-card-list text-muted-foreground"></i>
					</div>
				{:else}
					<!-- Object icon -->
					<div class="flex items-center gap-1">
						<Badge variant="outline" class="text-xs">Object</Badge>
						<i class="bi bi-box text-muted-foreground"></i>
					</div>
				{/if}
			{/if}

			{#if showExpand}
				<i class="bi bi-chevron-down text-muted-foreground"></i>
			{:else}
				<i class="bi bi-chevron-right text-muted-foreground"></i>
			{/if}
		</div>
	</button>
{/if}
