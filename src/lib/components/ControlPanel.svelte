<script>
	import AddColumn from './AddColumn.svelte';
	///
	//1.Select type using Type or AddColumn
	//2.Create QMSWraperCtx if not existent
	//3.Select node from QMSWraperCtx.ActiveArgumentsDataGrouped_Store (show list of nodes Object.values(nodes) <show stepsOfFields>)
	//4.Add a way to create nested nodes fast,just by needidng to choose
	///
	import Type from './Type.svelte';
	export let type;

	export let column_stepsOfFields;
	export let addColumnFromInput;
	export let dd_relatedRoot;
	export let QMSName;
	export let currentQMS_info;
</script>

<!-- <AddColumn
	bind:column_stepsOfFields
	{addColumnFromInput}
	{dd_relatedRoot}
	{QMSName}
	QMS_info={currentQMS_info}
	on:newColumnAddRequest
/> -->

{#if false}
	<div class="card w-full ">
		<div class="card-body  m-2">
			<div class="dropdown grow ">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<label tabindex="0" class="btn btn-xs bi bi-list-nested text-lg p-1  w-min" />
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					tabindex="0"
					class="dropdown-content menu p-2  bg-base-100 rounded-box ==w-max max-w-screen text-sm shadow-2xl z-[9999] "
				>
					<div
						class="max-h-[70vh] sm:max-h-[80vh] md:max-h-[80vh] overflow-auto overscroll-contain max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
					>
						<!-- <Type template="columnAddDisplay" isOnMainList={true} {type} /> -->
					</div>
				</div>
			</div>
		</div>
	</div>{/if}
