<script>
	import { setValueAtPath } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	export let prefix = '';
	export let QMSWraperCtxDataCurrent;
	/////////////////
	const { finalGqlArgObj_Store, stepsOfFields, paginationState_derived } = QMSWraperCtxDataCurrent;
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_finalGqlArgObj_Store } = OutermostQMSWraperContext;
	/////////////////
	let QMSarguments;
	/////////////////
	$: if ($finalGqlArgObj_Store && $finalGqlArgObj_Store.final_canRunQuery) {
		QMSarguments = { ...$finalGqlArgObj_Store.finalGqlArgObj, ...$paginationState_derived };
	}

	$: if (QMSarguments || $paginationState_derived) {
		mergedChildren_finalGqlArgObj_Store.update((value) => {
			return setValueAtPath(value, [...stepsOfFields, 'QMSarguments'], QMSarguments);
		});
	}
</script>
