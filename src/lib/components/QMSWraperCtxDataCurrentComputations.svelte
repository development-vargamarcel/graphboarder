<script lang="ts">
	import { run } from 'svelte/legacy';

	import { setValueAtPath } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	interface Props {
		prefix?: string;
		QMSWraperCtxDataCurrent: any;
	}

	let { prefix = '', QMSWraperCtxDataCurrent }: Props = $props();
	/////////////////
	const { finalGqlArgObj_Store, stepsOfFields, paginationState_derived } = QMSWraperCtxDataCurrent;
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_finalGqlArgObj_Store } = OutermostQMSWraperContext;
	/////////////////
	let QMSarguments = $state();
	/////////////////
	run(() => {
		if ($finalGqlArgObj_Store && $finalGqlArgObj_Store.final_canRunQuery) {
			QMSarguments = { ...$finalGqlArgObj_Store.finalGqlArgObj, ...$paginationState_derived };
		}
	});

	run(() => {
		if (QMSarguments || $paginationState_derived) {
			mergedChildren_finalGqlArgObj_Store.update((value) => {
				return setValueAtPath(value, [...stepsOfFields, 'QMSarguments'], QMSarguments);
			});
		}
	});
</script>
