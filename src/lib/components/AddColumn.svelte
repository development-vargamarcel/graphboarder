<script lang="ts">
	import _ from 'lodash';

	import TypeList from '$lib/components/TypeList.svelte';
	import {
		generateTitleFromStepsOfFields,
		stepsOfFieldsToQueryFragmentObject
	} from '$lib/utils/usefulFunctions';
	import { setContext, getContext } from 'svelte';
	import { get, writable } from 'svelte/store';
	import Type from './Type.svelte';
	interface Props {
		prefix?: string;
		column_stepsOfFields: any;
		addColumnFromInput: any;
		dd_relatedRoot: any;
		QMSName: any;
		QMS_info: any;
		onNewColumnAddRequest?: (detail: any) => void;
	}

	let {
		prefix = '',
		column_stepsOfFields,
		addColumnFromInput,
		dd_relatedRoot,
		QMSName,
		QMS_info,
		onNewColumnAddRequest
	}: Props = $props();
	//stepsOfFieldsOBJ
	setContext(`${prefix}stepsOfFieldsOBJ`, writable({}));
	const stepsOfFieldsOBJ = getContext(`${prefix}stepsOfFieldsOBJ`);
	stepsOfFieldsOBJ.subscribe((value) => {
		console.log('stepsOfFieldsOBJ', value);
	});
	setContext(`${prefix}stepsOfFieldsOBJFull`, writable({}));
	const stepsOfFieldsOBJFull = getContext(`${prefix}stepsOfFieldsOBJFull`);
	//activeArgumentsDataGrouped_Store
	setContext(`${prefix}activeArgumentsDataGrouped_Store`, writable({}));
	const activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);
	activeArgumentsDataGrouped_Store.subscribe((value) => {
		console.log('activeArgumentsDataGrouped_Store', value);
	});

	const tableColsData_Store = getContext(`${prefix}QMSWraperContext`).tableColsData_Store;
	tableColsData_Store.subscribe((cols) => {
		$stepsOfFieldsOBJFull = _.merge(
			{},
			...cols.map((col) => {
				return col.stepsOfFieldsOBJ;
			})
		);
	});
	stepsOfFieldsOBJFull.subscribe((stepsOfFieldsOBJFull) => {
		console.log({ stepsOfFieldsOBJFull });
	});
	setContext(`${prefix}StepsOfFieldsSelected`, writable(new Set([])));
	const StepsOfFieldsSelected = getContext(`${prefix}StepsOfFieldsSelected`);
	StepsOfFieldsSelected.subscribe((value) => {
		console.log('StepsOfFieldsSelected', value);
	});
</script>

<div class="dropdown grow ">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<label tabindex="0" class="btn btn-xs bi bi-node-plus-fill text-lg p-1  w-full"></label>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		tabindex="0"
		class="dropdown-content menu p-2  bg-base-100 rounded-box ==w-max max-w-screen text-sm shadow-2xl z-[9999] "
	>
		<div
			class="max-h-[70vh] sm:max-h-[80vh] md:max-h-[80vh] overflow-auto overscroll-contain max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
		>
			<div
				class="flex flex-col overflow-x-auto text-sm font-normal normal-case min-w-max  w-full  space-y-1"
			>
				<!-- <input
					type="text"
					class="input input-sm input-bordered input-accent m-2"
					placeholder="(> or .) producer>films>title "
					bind:value={column_stepsOfFields}
					on:keypress={addColumnFromInput}
				/> -->
				<div class="text-center sticky left-0  bg-black= mx-auto ">
					<button
						class="btn btn-xs btn-primary w-min "
						onclick={() => {
							let stepsOfFields = [];
							let tableColData = {
								title: `col-${Math.floor(Math.random() * 200)},${generateTitleFromStepsOfFields(
									stepsOfFields
								)},stepsOfFieldsOBJ `,
								stepsOfFields: stepsOfFields,
								stepsOfFieldsOBJ: $stepsOfFieldsOBJ,
								activeArgumentsDataGrouped: $activeArgumentsDataGrouped_Store
							};
							onNewColumnAddRequest?.(tableColData);
							$stepsOfFieldsOBJ = {};
						}}
					>
						add
					</button>
				</div>

				{#if dd_relatedRoot?.fields}
					<Type type={QMS_info} template="columnAddDisplay" depth={0} isOnMainList={true} />
					<!-- <TypeList
						types={dd_relatedRoot.fields}
						template="columnAddDisplay"
						stepsOfFields={[QMSName]}
						depth={0}
					/> -->
					<!-- {#each dd_relatedRoot.fields as type, index (index)}
							<Type
								{index}
								{type}
								template="columnAddDisplay"
								stepsOfFields={[QMSName]}
								depth={0}
							/>
						{/each} -->
				{/if}
			</div>
		</div>
	</div>
</div>
