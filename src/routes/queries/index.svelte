<script>
	let auth_token = '';
	const store_auth_token = () => {
		console.log(auth_token);
		if (auth_token == '') {
			localStorage.removeItem('auth_token');
		} else {
			localStorage.setItem('auth_token', auth_token);
		}
	};
</script>

<div class="w-full mx-auto my-4">
	<div class="flex w-1/2 mx-auto space-x-2">
		<input type="text" class="input input-sm " placeholder="jwt token" bind:value={auth_token} />
		<button class="btn bg-primary btn-sm normal-case" on:click={store_auth_token}
			>store auth_token</button
		>
	</div>
</div>
