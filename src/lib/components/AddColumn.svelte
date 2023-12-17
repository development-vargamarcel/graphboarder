<script>
	import _ from 'lodash';

	import TypeList from '$lib/components/TypeList.svelte';
	import { stepsOfFieldsToQueryFragmentObject } from '$lib/utils/usefulFunctions';
	import { setContext, getContext } from 'svelte';
	import { writable } from 'svelte/store';
	export let prefix = '';
	export let column_stepsOfFields;
	export let addColumnFromInput;
	export let dd_relatedRoot;
	export let QMSName;
	setContext(`${prefix}StepsOfFieldsSelected`, writable(new Set([])));
	const StepsOfFieldsSelected = getContext(`${prefix}StepsOfFieldsSelected`);
	StepsOfFieldsSelected.subscribe((value) => {
		console.log('StepsOfFieldsSelected', value);
	});
</script>

<div class="dropdown grow ">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<label tabindex="0" class="btn btn-xs bi bi-node-plus-fill text-lg p-1  w-full" />
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<div
		tabindex="0"
		class="dropdown-content menu p-2  bg-base-100 rounded-box ==w-max max-w-screen text-sm shadow-2xl z-[9999] "
	>
		<div
			class="max-h-[70vh] sm:max-h-[80vh] md:max-h-[80vh] overflow-auto overscroll-contain max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
		>
			<div
				class="flex flex-col overflow-x-auto text-sm font-normal normal-case min-w-max  w-full  space-y-2"
			>
				<!-- <input
					type="text"
					class="input input-sm input-bordered input-accent m-2"
					placeholder="(> or .) producer>films>title "
					bind:value={column_stepsOfFields}
					on:keypress={addColumnFromInput}
				/> -->
				<button
					class="btn btn-xs btn-primary "
					on:click={() => {
						//stepsOfFieldsToQueryFragmentObject
						let StepsOfFieldsSelectedObjects = [...$StepsOfFieldsSelected].map((value) => {
							return stepsOfFieldsToQueryFragmentObject(JSON.parse(value));
						});
						console.log({ StepsOfFieldsSelectedObjects });
						const merged = _.merge({}, ...StepsOfFieldsSelectedObjects);
						console.log('StepsOfFieldsSelectedObjects merged', { merged });
						$StepsOfFieldsSelected.clear();
						$StepsOfFieldsSelected = $StepsOfFieldsSelected;
					}}
				>
					add
				</button>
				{#if dd_relatedRoot?.fields}
					<TypeList
						types={dd_relatedRoot.fields}
						template="columnAddDisplay"
						stepsOfFields={[QMSName]}
						depth={0}
					/>
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
