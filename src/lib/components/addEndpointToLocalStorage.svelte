<script>
	import { stringToJs } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import CodeEditor from './fields/CodeEditor.svelte';
	import { getSortedAndOrderedEndpoints } from '$lib/utils/usefulFunctions';
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";

	let { onHide } = $props();

	let localStorageEndpoints = getContext('localStorageEndpoints');
	const handleCodeChanged = (detail) => {
		const newConfigurationString = detail.chd_rawValue;
		console.log(newConfigurationString);
		const newConfigurationJs = stringToJs(newConfigurationString);
		let indexOfNewEndpointIdInLocalStorage;
		if ($localStorageEndpoints?.length > 0) {
			indexOfNewEndpointIdInLocalStorage = $localStorageEndpoints.findIndex(
				(endpoint) => endpoint.id == newConfigurationJs.id
			);
		}
		console.log({
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
		console.log({ $localStorageEndpoints, indexOfNewEndpointIdInLocalStorage });
	};
</script>

<div class="w-full p-2 max-h-[80vh] overflow-y-auto">
	<Card.Root class="w-full mx-auto md:max-w-4xl border-2">
		<Card.Header>
			<Card.Title>Add New Endpoint</Card.Title>
			<Card.Description>Configure and save a new GraphQL endpoint to local storage</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<CodeEditor
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
		</Card.Content>
		<Card.Footer class="justify-end">
			<Button
				variant="destructive"
				onclick={() => {
					onHide?.();
				}}
			>
				Close
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
