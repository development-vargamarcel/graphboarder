<script lang="ts">
	import { stringToJs } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import CodeEditor from './fields/CodeEditor.svelte';
	import { getSortedAndOrderedEndpoints } from '$lib/utils/usefulFunctions';
	import { Logger } from '$lib/utils/logger';
	import type { Writable } from 'svelte/store';

	interface Props {
		onHide?: () => void;
	}

	let { onHide }: Props = $props();

	let localStorageEndpoints = getContext('localStorageEndpoints') as Writable<any[]>;
	const handleCodeChanged = (e) => {
		const newConfigurationString = e.detail.chd_rawValue;
		Logger.debug(newConfigurationString);
		const newConfigurationJs = stringToJs(newConfigurationString);
		let indexOfNewEndpointIdInLocalStorage;
		if ($localStorageEndpoints?.length > 0) {
			indexOfNewEndpointIdInLocalStorage = $localStorageEndpoints.findIndex(
				(endpoint) => endpoint.id == newConfigurationJs.id
			);
		}
		Logger.debug({
			newConfigurationString,
			newConfigurationJs,
			$localStorageEndpoints,
			indexOfNewEndpointIdInLocalStorage
		});
		if (indexOfNewEndpointIdInLocalStorage > -1) {
			$localStorageEndpoints[indexOfNewEndpointIdInLocalStorage] = newConfigurationJs;
		} else {
			$localStorageEndpoints.push(newConfigurationJs);
		}
		localStorageEndpoints.set(getSortedAndOrderedEndpoints($localStorageEndpoints));
		Logger.debug({ $localStorageEndpoints, indexOfNewEndpointIdInLocalStorage });
	};
</script>

<div class="w-full p-2 max-h-[80vh] overflow-y-auto">
	<div class="card w-full  glass mx-auto md:max-w-4xl">
		<div class="card-body">
			<h2 class="card-title">Add new Endpoint</h2>
			<p>To Local Storage</p>
			<div>
				<CodeEditor
					displayInterface="codeeditor"
					language="javascript"
					onChanged={handleCodeChanged}
					rawValue={`{
		id: 'directus',
		url: 'https://directus-production-c2de.up.railway.app/graphql',
		headers: {
			authorization: 'Bearer S4YM_Cd7Uo6laJhQV594l59EGZASSmBw'
		},
	}`}
				/>
			</div>

			<div class="card-actions justify-end">
				<button
					class="btn btn-error"
					onclick={() => {
						onHide?.();
					}}>hide</button
				>
			</div>
		</div>
	</div>
</div>
