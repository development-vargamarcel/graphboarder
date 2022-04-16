<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import Types from './Types.svelte';

	export let index;
	export let type;
	let names = [];
	//!!!!!
	//let name = type?.type?.ofType?.name || type?.type?.name || type?.name; //!!! can be more levels deep,like bellow:
	let exampleOfDeeperObject = {
		name: 'distinct',
		description: null,
		args: [
			{
				name: 'field',
				description: null,
				type: {
					kind: 'NON_NULL',
					name: null,
					ofType: {
						kind: 'ENUM',
						name: 'DirectoryFieldsEnum',
						ofType: null
					}
				},
				defaultValue: null
			}
		],
		type: {
			kind: 'NON_NULL',
			name: null,
			ofType: {
				kind: 'LIST',
				name: null,
				ofType: {
					kind: 'NON_NULL',
					name: null,
					ofType: {
						kind: 'SCALAR',
						name: 'String',
						ofType: null
					}
				}
			}
		},
		isDeprecated: false,
		deprecationReason: null
	};
	//will try this then...
	let name =
		type?.type?.ofType?.ofType?.ofType?.name ||
		type?.type?.ofType?.ofType?.name ||
		type?.type?.ofType?.name ||
		type?.type?.name ||
		type?.name; //will likely always give a name unlike the above one but can be more useful the above,will give scalar most likely
	//!!!!!

	let nameToDisplay = type?.name || type?.type?.name || type?.type?.ofType?.name;
	let kinds = [];

	if (type?.name) {
		names.push(type?.name);
	}
	if (type?.type?.name) {
		names.push(type?.type?.name);
	}
	if (type?.ofType?.name) {
		names.push(type?.ofType?.name);
	}
	if (type?.type?.ofType?.name) {
		names.push(type?.type?.ofType?.name);
	}

	if (type?.kind) {
		kinds.push(type?.kind);
	}
	if (type?.type?.kind) {
		kinds.push(type?.type?.kind);
	}
	if (type?.ofType?.kind) {
		kinds.push(type?.ofType?.kind);
	}
	if (type?.type?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.kind);
	}
	if (type?.ofType?.ofType?.kind) {
		kinds.push(type?.ofType?.ofType?.kind);
	}
	if (type?.type?.ofType?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.ofType?.kind);
	}
	if (type?.ofType?.ofType?.ofType?.kind) {
		kinds.push(type?.ofType?.ofType?.ofType?.kind);
	}
	if (type?.type?.ofType?.ofType?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.ofType?.ofType?.kind);
	}

	const rootTypeByName = (name) => {
		return $introspectionResult.rootTypes.filter((item) => {
			return item.name == name;
		})[0];
	};
	const queryFieldByName = (name) => {
		return $introspectionResult.queryFields.filter((item) => {
			return item.name == name;
		})[0];
	};
	const mutationFieldByName = (name) => {
		return $introspectionResult.mutationFields.filter((item) => {
			return item.name == name;
		})[0];
	};
	let showExpand = false;
	let expandData = {};
	let canExpand = false;
	if (!kinds.includes('SCALAR')) {
		canExpand = true;
	}
	const expand = () => {
		console.log('name', name);
		expandData = rootTypeByName(name);

		if (expandData) {
			showExpand = !showExpand;
		}

		console.log('expandData', expandData);
	};
</script>
 
<li 
	class="my-4 border-b-2 pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs {showExpand
		? 'mb-2 '
		: ''}"
>
	<div class="flex space-x-2">
		<div class="flex space-x-2 w-1/3">
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
					on:click ={() => {
						console.log(type);
						console.log(names);
					}}
				>
					{nameToDisplay}
				</div> 

			</div>

		<div class="w-1/2 ">
			<div class="flex">
				<div class="bg-secondary p-1 rounded ">{kinds.join(' of ')}</div>
		
				{#if !canExpand}
					{#if nameToDisplay == names[names.length - 1]}
						{''}
					{:else}
						<div class="bg-base-200 p-1 rounded">
							{names[names.length - 1]}
						</div>
					{/if}
				{/if}
{#if canExpand}
					<div class="bg-base-200  rounded px-2 py-1">
						{#if names[0] !== nameToDisplay}
							({names[0]})
						{:else if names[1] && names[1] !== nameToDisplay}
							({names[1]})
						{:else}
							{'same'}
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex">
				
			</div>
		</div>
		<div class="w-1/8 text-center text-xs" />
	</div>

	{#if showExpand}
<div class="mb-2 text-center text-xs" />
		<Types whatToShow={expandData.fields} whatIsShown="" />
	{/if}
</li>

