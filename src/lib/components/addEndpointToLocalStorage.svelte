<script>
	import { stringToJs } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';
	import CodeEditor from './fields/CodeEditor.svelte';
	const handleCodeChanged = (e) => {
		const newConfigurationString = e.detail.chd_rawValue;
		console.log(newConfigurationString);
		const newConfigurationJs = stringToJs(newConfigurationString);
		let localStorageEndpoints = stringToJs(localStorage.getItem('endpoints') || null);
		let indexOfNewEndpointIdInLocalStorage;
		if (localStorageEndpoints?.length > 0) {
			indexOfNewEndpointIdInLocalStorage = localStorageEndpoints.indexOf(
				(endpoint) => endpoint.id == newConfigurationJs.id
			);
		}

		if (indexOfNewEndpointIdInLocalStorage > -1) {
			localStorageEndpoints[indexOfNewEndpointIdInLocalStorage] = newConfigurationJs;
		} else {
			localStorageEndpoints = [newConfigurationJs];
		}
		localStorage.setItem('endpoints', JSON.stringify(localStorageEndpoints));
	};
	const dispatch = createEventDispatcher();
</script>

<div class="w-full p-2 max-h-[80vh] overflow-y-auto">
	<div class="card w-full  glass mx-auto md:max-w-4xl">
		<div class="card-body">
			<h2 class="card-title">Add new Endpoint</h2>
			<p>To Local Storage</p>
			<div>
				<CodeEditor
					language="javascript"
					on:changed={handleCodeChanged}
					rawValue={`data = {
		id: 'directus',
		url: 'https://directus-production-654456.up.railway.app/graphql',
		headers: {
			authorization: 'Bearer S4YM_Cd7Uo6laJhQV594l59EGZASSkJs'
		},
	}`}
				/>
			</div>

			<div class="card-actions justify-end">
				<button
					class="btn btn-error"
					on:click={() => {
						dispatch('hide');
					}}>hide</button
				>
			</div>
		</div>
	</div>
</div>
