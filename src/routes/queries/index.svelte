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

<input type="text" class="input input-sm" bind:value={auth_token} />
<button class="btn bg-primary btn-sm normal-case" on:click={store_auth_token}
	>store auth_token</button
>
