<script lang="ts">
	import { page } from '$app/state';
	import logo from './svelte-logo.svg';
	import github from './github.svg';
	import ThemeToggle from '$lib/components/UI/ThemeToggle.svelte';
	import LogViewer from '$lib/components/UI/LogViewer.svelte';

	let showLogs = $state(false);
</script>

<div class="navbar bg-base-100 shadow-sm">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/></svg
				>
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li><a href="/" class:active={page.url.pathname === '/'}>Home</a></li>
				<li>
					<a href="/endpoints" class:active={page.url.pathname.startsWith('/endpoints')}
						>Endpoints</a
					>
				</li>
			</ul>
		</div>
		<a href="/" class="btn btn-ghost text-xl">
			<img src={logo} alt="SvelteKit" class="h-8 w-8 mr-2" />
			GraphBoarder
		</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="/" class:active={page.url.pathname === '/'}>Home</a></li>
			<li>
				<a href="/endpoints" class:active={page.url.pathname.startsWith('/endpoints')}>Endpoints</a>
			</li>
		</ul>
	</div>
	<div class="navbar-end">
		<button
			class="btn btn-ghost btn-circle"
			onclick={() => (showLogs = true)}
			title="System Logs"
			aria-label="System Logs"
		>
			<i class="bi bi-terminal text-lg"></i>
		</button>
		<ThemeToggle />
		<a
			href="https://github.com/development-vargamarcel/graphboarder"
			target="_blank"
			class="btn btn-ghost btn-circle"
		>
			<img src={github} alt="GitHub" class="h-6 w-6" />
		</a>
	</div>
</div>

{#if showLogs}
	<LogViewer onClose={() => (showLogs = false)} />
{/if}
