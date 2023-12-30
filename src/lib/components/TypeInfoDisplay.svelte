<script>
	import {
		deleteValueAtPath,
		generateTitleFromStepsOfFields,
		getPreciseType,
		getRootType,
		getValueAtPath,
		setValueAtPath,
		stepsOfFieldsToQueryFragmentObject
	} from '$lib/utils/usefulFunctions';
	import _ from 'lodash';

	import { stringify } from 'postcss';
	import { createEventDispatcher, getContext } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { get } from 'svelte/store';
	import { get_store_value } from 'svelte/internal';

	const dispatch = createEventDispatcher();
	export let canExpand;
	export let expand;
	export let type;
	export let index;
	export let showExpand;
	export let template = 'default';
	export let stepsOfFields;
	let { dd_kindsArray, dd_namesArray, dd_displayName, dd_rootName, args } = type;
	export let prefix = '';
	let isSubset = (parentArray, subsetArray) => {
		return subsetArray.every((el, index) => {
			return parentArray[index] === el;
		});
	};

	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const tableColsData_Store = QMSWraperContext?.tableColsData_Store;
	const StepsOfFieldsSelected = getContext(`${prefix}StepsOfFieldsSelected`);
	const stepsOfFieldsOBJ = getContext(`${prefix}stepsOfFieldsOBJ`);
	const stepsOfFieldsOBJFull = getContext(`${prefix}stepsOfFieldsOBJFull`);

	const stepsOFieldsAsQueryFragmentObject = stepsOfFieldsToQueryFragmentObject(
		stepsOfFields,
		false
	);
	//getValueAtPath
	let isSelected;
	let hasSelected;
	if ($stepsOfFieldsOBJ) {
		stepsOfFieldsOBJ.subscribe((value) => {
			const valueAtPath = getValueAtPath(value, stepsOfFields);
			const typeAtPath = getPreciseType(valueAtPath);
			if (typeAtPath == 'undefined') {
				hasSelected = false;
				isSelected = false;
				return null;
			} else if (typeAtPath == 'string') {
				hasSelected = true;
				isSelected = true;
			} else if (typeAtPath == 'object') {
				//add "&& canExpand" ?
				isSelected = false;
				hasSelected = true;
			}
		});
	}
	///////
	let isUsedInSomeColumn = false;
	let hasQMSarguments = false;
	if ($stepsOfFieldsOBJFull) {
		stepsOfFieldsOBJFull.subscribe((value) => {
			const valueAtPath = getValueAtPath(value, stepsOfFields);
			hasQMSarguments = valueAtPath?.QMSarguments;
			const typeAtPath = getPreciseType(valueAtPath);
			isUsedInSomeColumn = typeAtPath != 'undefined';
		});
	}

	///
	// if ($StepsOfFieldsSelected) {
	// 	StepsOfFieldsSelected.subscribe((value) => {
	// 		console.log({ stepsOfFields });
	// 		isSelected = value.has(JSON.stringify(stepsOfFields));
	// 		hasSelected =
	// 			[...value]?.find((item) => {
	// 				return isSubset(JSON.parse(item), stepsOfFields);
	// 			}) && canExpand;
	// 	});
	// }
	let showModal = false;
	let finalGqlArgObj_Store;
	let finalGqlArgObj_StoreValue;
	let finalGqlArgObjValue;
	let activeArgumentsQMSWraperContext;
	let argumentsOBJ;
	let QMSarguments;
	const mergedChildren_finalGqlArgObj_Store = getContext(
		`${prefix}QMSWraperContext`
	).mergedChildren_finalGqlArgObj_Store;

	let activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);
	$: if (finalGqlArgObj_StoreValue && finalGqlArgObj_StoreValue.final_canRunQuery) {
		finalGqlArgObjValue = finalGqlArgObj_StoreValue.finalGqlArgObj;
		argumentsOBJ = stepsOfFieldsToQueryFragmentObject(stepsOfFields, false, {
			QMSarguments: finalGqlArgObjValue
		});
		QMSarguments = finalGqlArgObjValue;
		//$stepsOfFieldsOBJ = _.merge({}, argumentsOBJ, $stepsOfFieldsOBJ);
	}

	$: if (argumentsOBJ) {
		mergedChildren_finalGqlArgObj_Store.update((value) => {
			return setValueAtPath(value, [...stepsOfFields, 'QMSarguments'], QMSarguments);
			return _.merge(value, argumentsOBJ);
		});
	}
	$: if (activeArgumentsQMSWraperContext) {
		$activeArgumentsDataGrouped_Store = get_store_value(
			activeArgumentsQMSWraperContext.activeArgumentsDataGrouped_Store
		);

		finalGqlArgObj_Store = activeArgumentsQMSWraperContext.finalGqlArgObj_Store;
		finalGqlArgObj_StoreValue = $finalGqlArgObj_Store;
		console.log({ finalGqlArgObj_Store }, $finalGqlArgObj_Store);
		finalGqlArgObj_Store.subscribe((value) => {
			console.log('finalGqlArgObj_Store', value);
		});
		console.log({ activeArgumentsQMSWraperContext });
	}
</script>

{#if template == 'default'}
	<div class="flex space-x-2 min-w-max  w-full">
		<div class="flex space-x-2 w-1/3 min-w-max  w-full">
			{#if canExpand}
				<div class="btn btn-xs  p-1 rounded normal-case" on:click={expand}>
					{showExpand ? '-' : '+'}
				</div>
			{:else}
				<div class="btn btn-xs  p-1 rounded normal-case btn-disabled" on:click={expand}>+</div>
			{/if}
			<div class="bg-secondary p-1 rounded">{index + 1}</div>
			<div
				class="btn btn-xs btn-info normal-case font-light "
				on:click={() => {
					console.log(type);
					//console.log(dd_namesArray);
				}}
			>
				{dd_displayName}
			</div>
		</div>
		{#if !canExpand}
			<div
				class="btn btn-xs bg-base-200 p-1 rounded"
				on:click={() => {
					console.log(getRootType(null, dd_rootName, schemaData));
				}}
			>
				{#if dd_displayName == dd_namesArray[dd_namesArray.length - 1]}
					{''}
				{:else}
					{dd_namesArray[dd_namesArray.length - 1]}
				{/if}
			</div>
		{/if}
		{#if canExpand}
			<div
				class="btn btn-xs  btn-accent normal-case  rounded px-2 py-1"
				on:click={() => {
					console.log(getRootType(null, dd_rootName, schemaData));
				}}
			>
				{#if dd_namesArray?.[1] && dd_namesArray?.[1] !== dd_displayName}
					{dd_namesArray?.[1]}
				{:else}
					{dd_namesArray?.[0]}
				{/if}
			</div>
		{/if}
		<div class="w-1/2 ">
			<div class="flex">
				<div class="bg-secondary p-1 rounded ">{dd_kindsArray?.join(' of ')}</div>
			</div>

			<div class="flex" />
		</div>
		<div class="w-1/8 text-center text-xs" />
	</div>
{:else if template == 'columnAddDisplay'}
	<div
		class="min-w-max  w-full  cursor-pointer    rounded-box flex text-base select-none hover:text-primary"
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->

		{#if canExpand}
			<div class="overflow-visible grid  grid-col gap-[-10px] h-2 w-6 ">
				<div
					class="w-10   duration-100   mx-auto w-min pl-1 {hasSelected
						? 'text-secondary'
						: ''} {showExpand ? 'bi-arrow-90deg-down mt-2 ' : 'bi-chevron-expand'}"
					on:click={expand}
				/>
			</div>
		{/if}
		{#if !canExpand}
			<!-- {$StepsOfFieldsSelected.has(JSON.stringify(stepsOfFields))}
			{isSelected} -->
			<input
				type="checkbox"
				class=" checkbox-xs checkbox input-accent  mr-1 self-center ml-1"
				bind:checked={isSelected}
				on:change={() => {
					if (isSelected) {
						$stepsOfFieldsOBJ = _.merge($stepsOfFieldsOBJ, stepsOFieldsAsQueryFragmentObject);
						///
						//	$StepsOfFieldsSelected.add(JSON.stringify(stepsOfFields));
						//	$StepsOfFieldsSelected = $StepsOfFieldsSelected;
					} else {
						$stepsOfFieldsOBJ = deleteValueAtPath($stepsOfFieldsOBJ, stepsOfFields);

						///
						//	$StepsOfFieldsSelected.delete(JSON.stringify(stepsOfFields));
						//$StepsOfFieldsSelected = $StepsOfFieldsSelected;
					}
				}}
				name=""
				id=""
			/>
			<!-- <p class="badge badge-xs badge-accent">
				{JSON.stringify(stepsOfFields)}
			</p> -->
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="min-w-max  w-full  pr-2 text-md   duration-100==  "
			on:click={() => {
				if (canExpand) {
					expand();
				} else {
					let tableColData = {
						title: `col-${Math.floor(Math.random() * 200)},${generateTitleFromStepsOfFields(
							stepsOfFields
						)} `,
						stepsOfFields: stepsOfFields,
						stepsOfFieldsOBJ: stepsOfFieldsToQueryFragmentObject(stepsOfFields, false)
					};
					tableColsData_Store.addColumn(tableColData);
				}
			}}
		>
			{dd_displayName}
			{#if isUsedInSomeColumn}
				<sup class="text-xs text-accent">
					<i class="bi bi-check" />
				</sup>
			{/if}

			{#if canExpand && args?.length > 0 && isUsedInSomeColumn}
				<button
					class="btn btn-xs btn-ghost normal-case  rounded px-2 {hasQMSarguments
						? 'text-success'
						: ''} "
					on:click|stopPropagation={() => {
						showModal = true;
					}}
				>
					<icon class="bi-funnel " />

					<QMSWraper
						bind:QMSWraperContext={activeArgumentsQMSWraperContext}
						QMSName={type.dd_displayName}
						QMSType="query"
					>
						{#if showModal}
							<Modal
								modalIdetifier={'activeArgumentsDataModal'}
								showApplyBtn={false}
								on:cancel={(e) => {
									let { detail } = e;
									if (detail.modalIdetifier == 'activeArgumentsDataModal') {
										showModal = false;
									}
								}}
								><div class="  w-full  ">
									<div class="mx-auto mt-2  w-full   space-y-2   pb-2  ">
										<div class="w-2" />

										<ActiveArguments
											QMSarguments={getValueAtPath($mergedChildren_finalGqlArgObj_Store, [
												...stepsOfFields,
												'QMSarguments'
											])}
										/>

										<div class="w-2" />
									</div>
								</div>
							</Modal>
						{/if}
					</QMSWraper>
				</button>
			{/if}
		</div>
		<!-- {#if canExpand && args?.length > 0}
			<button class="btn btn-xs btn-ghost normal-case  rounded px-2 py-1">
				<icon class="bi-funnel" />
			</button>
		{/if} -->
	</div>
{/if}
