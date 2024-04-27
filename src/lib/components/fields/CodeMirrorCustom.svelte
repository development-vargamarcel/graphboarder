<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { javascript } from '@codemirror/lang-javascript';
	import { graphql } from 'cm6-graphql';
	import * as prettier from 'https://unpkg.com/prettier@3.2.5/standalone.mjs';
	import prettierPluginTypescript from 'https://unpkg.com/prettier@3.2.5/plugins/typescript.mjs';
	import prettierPluginGraphql from 'https://unpkg.com/prettier@3.2.5/plugins/graphql.mjs';
	import prettierPluginEstree from 'https://unpkg.com/prettier@3.2.5/plugins/estree.mjs';
	export let language = 'typescript';
	export let value = '';
	const configurations = [
		{
			language: 'graphql',
			codemirrorLanguage: graphql(),
			plugins: [prettierPluginGraphql]
		},
		{
			language: 'typescript',
			codemirrorLanguage: javascript({ typescript: true }),
			plugins: [prettierPluginTypescript, prettierPluginEstree]
		}
	];
	let chosenConfig = configurations.find((config) => {
		return config.language == language;
	});
	const prettify = async () => {
		value = await prettier.format(value, {
			parser: chosenConfig?.language,
			plugins: chosenConfig?.plugins
		});
	};

	const handlechange = () => {
		console.log('changed');
		console.log(value);
		prettify();
		console.log(value);
	};
	let mainContainerEl;
</script>

<div class="bg-base-300 relative max-h-[90vh] overflow-auto" bind:this={mainContainerEl}>
	<CodeMirror bind:value lang={chosenConfig.codemirrorLanguage} />
	<div class="sticky top-1 right-1">
		<button class="btn btn-xs btn-primary" on:click={handlechange}> format </button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				mainContainerEl.requestFullscreen();
				setTimeout(initializeEditor, 500);
				//initializeEditor();
			}}>fullscreen</button
		>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				document.exitFullscreen();
				setTimeout(initializeEditor, 500);
				//initializeEditor();
			}}>exit fullscreen</button
		>
	</div>
</div>
