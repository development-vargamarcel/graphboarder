<script lang="ts">
	import { setValueAtPath } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import type { QMSWraperContext } from '$lib/types/index';

	interface Props {
		prefix?: string;
		QMSWraperCtxDataCurrent: any;
	}

	let { prefix = '', QMSWraperCtxDataCurrent }: Props = $props();

	/////////////////
	let finalGqlArgObj_Store = $derived(QMSWraperCtxDataCurrent?.finalGqlArgObj_Store);
	let stepsOfFields = $derived(QMSWraperCtxDataCurrent?.stepsOfFields);
	let paginationState_derived = $derived(QMSWraperCtxDataCurrent?.paginationState_derived);

	const OutermostQMSWraperContext = getContext<QMSWraperContext>(`${prefix}OutermostQMSWraperContext`);
	const mergedChildren_finalGqlArgObj_Store = OutermostQMSWraperContext?.mergedChildren_finalGqlArgObj_Store;
	/////////////////
	let QMSarguments = $state();
	/////////////////
	$effect(() => {
		if ($finalGqlArgObj_Store && $finalGqlArgObj_Store.final_canRunQuery) {
			QMSarguments = { ...$finalGqlArgObj_Store.finalGqlArgObj, ...$paginationState_derived };
		}
	});

	$effect(() => {
		if (QMSarguments || $paginationState_derived) {
			mergedChildren_finalGqlArgObj_Store.update((value: any) => {
				return setValueAtPath(value, [...stepsOfFields, 'QMSarguments'], QMSarguments);
			});
		}
	});
</script>
