<script>
	import { testEndpoints_Store } from '$lib/stores/testData/testEndpoints';

	export let graphqlEndpointURL;
	const testEndpoints = $testEndpoints_Store;
</script>

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
