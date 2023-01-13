<script lang="ts">
	//testing

	//testing

	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';

	import '../app.postcss';
	import { introspectionResult } from '$lib/stores/introspectionResult';

	//!!!important:  rowsLocationPossibilities is important for other things too in edgeBased pagination
	const get_rowsLocation = (rowsLocationPossibilities) => {
		let rowsLocationPossibilitiy = rowsLocationPossibilities.find((rowsLocationPossibilitiy) => {
			return rowsLocationPossibilitiy.check(QMS_info);
		});
		if (rowsLocationPossibilitiy) {
			return rowsLocationPossibilitiy.rowsLocation;
		}
		return null;
	};
	let testEndpoints = $testEndpoints_Store;

	////////////////////

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	let showEdit = false;
	let graphqlEndpointURL = '';
	let headersValue = '';
	let editText = 'edit';

	const store_headers = () => {
		if (headersValue == '' || headersValue == undefined) {
			localStorage.removeItem('headers');
		} else {
			let headersOneObj = {};
			let headers = headersValue?.split('\n').forEach((el) => {
				let currHeader = el.split(':');
				if (currHeader[0] && currHeader[1]) {
					headersOneObj[currHeader[0]] = currHeader[1];
				}
			});

			localStorage.setItem('headers', JSON.stringify(headersOneObj));
		}
	};

	if (browser && localStorage.getItem('graphqlEndpointURL')) {
		graphqlEndpointURL = localStorage.getItem('graphqlEndpointURL');
	}
	if (browser && localStorage.getItem('headers')) {
		let localStorage_headersValue = JSON.parse(localStorage.getItem('headers'));
		let localStorage_headersValue_Entries = Object.entries(localStorage_headersValue);
		headersValue = localStorage_headersValue_Entries
			.map((el) => {
				return el[0] + ':' + el[1];
			})
			.join('\n');
	}

	const store_graphqlEndpointURL = () => {
		if (graphqlEndpointURL == '') {
			localStorage.removeItem('graphqlEndpointURL');
		} else {
			localStorage.setItem('graphqlEndpointURL', graphqlEndpointURL);
		}
	};

	const storeAll = () => {
		store_headers();
		store_graphqlEndpointURL();
		editButtonClick();
	};
	const deleteAll = () => {
		graphqlEndpointURL = '';

		localStorage.removeItem('headers');
		localStorage.removeItem('graphqlEndpointURL');
	};
	const editButtonClick = () => {
		if (editText == 'edit') {
			if (browser) {
				goto('/queries');
			}
			editText = 'done';
		} else {
			editText = 'edit';
		}

		showEdit = !showEdit;
	};
	if (!graphqlEndpointURL) {
		editButtonClick();
	}

	const handleEndpointClick = (endpoint) => {
		let headers = endpoint?.headers;
		if (headers) {
			let headersKeys = Object.keys(headers);
			let headersNames = headersKeys.map((key) => {
				return `${key}:${headers[key]}`;
			});
			headersValue = headersNames.join('\n');
		} else {
			headersValue = '';
		}

		graphqlEndpointURL = endpoint?.url;
	};
	let forceVisibleSidebar = false;
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { endpointInfo } from '$lib/stores/endpointInfo/endpointInfo';
	import { setContext } from 'svelte';
	import { testEndpoints_Store } from '$lib/stores/testData/testEndpoints';
	import MainWraper from '$lib/components/MainWraper.svelte';
	setContext('endpointInfo', endpointInfo);
	$: if (graphqlEndpointURL) {
		if ($endpointInfo?.url != graphqlEndpointURL) {
			let testEndpoint = testEndpoints.find((endpoint) => {
				return endpoint.url == graphqlEndpointURL;
			});
			let endpointInfoToSet = testEndpoint
				? testEndpoint
				: {
						url: graphqlEndpointURL,
						rowsLocationPossibilities: [
							{
								rowsLocation: [],
								check: (QMS_info) => {
									return true;
								}
							}
						]
				  };
			endpointInfo.smartSet(endpointInfoToSet);
		}
	}
</script>

<header />
{#if $endpointInfo}
	<MainWraper>
		<main class="bg-base-300  flex w-[100vw] overflow-hidden">
			<div class="  md:max-w-[300px]">
				{#if $endpointInfo}
					<Sidebar bind:forceVisibleSidebar />
				{/if}
			</div>
			<div class="flex flex-col w-full md:w-[65vw]   grow h-screen">
				<div class=" bg-base-100 min-h-[50px] flex">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<label
						class="btn btn-square btn-ghost  md:hidden"
						on:click={() => {
							forceVisibleSidebar = true;
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-6 h-6 stroke-current "
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/></svg
						>
					</label>
					<div />
				</div>
				{#if $endpointInfo}
					<slot />
				{/if}
			</div>
		</main>
	</MainWraper>
{/if}

{#if showEdit}
	<div
		class="fixed bottom-0 bg-base-200 w-screen h-screen overscroll-none overflow-y-auto pb-4 px-4 mx-auto"
	>
		<div class="form-control w-full max-w-xs md:max-w-md lg:max-w-lg mt-32 mx-auto">
			<ul class="space-y-2 max-h-60 md:max-h-80   overflow-y-auto pr-1 overscroll-contain">
				{#each testEndpoints as endpoint}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<li
						class="cursor-pointer bg-accent/5 p-2 rounded overflow-x-auto break-all flex {endpoint.url ==
						graphqlEndpointURL
							? 'bg-accent/50'
							: ''}"
						on:click={() => {
							handleEndpointClick(endpoint);
						}}
					>
						<div class="rounded p-[1px] mr-1 {endpoint.isMantained ? 'bg-success' : 'bg-error'}" />
						<div>
							{endpoint.url}
							<div class="text-xs">{endpoint.description ? endpoint.description : ''}</div>
						</div>
					</li>
				{/each}
			</ul>
			<div class="divider">or</div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">graphqlEndpointURL</span>
			</label>
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered input-sm w-full max-w-xs md:max-w-md lg:max-w-lg"
				bind:value={graphqlEndpointURL}
			/>

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">headers</span>
			</label>

			<textarea
				type="textarea"
				cols="40"
				placeholder="header:value"
				class="textarea textarea-bordered textarea-sm overflow-x-auto w-full max-w-xs md:max-w-md lg:max-w-lg"
				bind:value={headersValue}
			/>

			<button class="btn bg-primary btn-sm normal-case w-content-min mt-2" on:click={storeAll}
				>apply</button
			>
			<button class="btn bg-warning btn-sm normal-case w-content-min mt-10" on:click={deleteAll}
				>delete all</button
			>
		</div>
	</div>
{/if}

<div class="fixed bottom-14 right-2 pr-1">
	<button class="btn btn-sm " on:click={editButtonClick}>{editText}</button>
</div>
<footer />

<style>
</style>
