<script lang="ts">
	import { onMount, createEventDispatcher, getContext } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { javascript } from '@codemirror/lang-javascript';
	import { graphql } from 'cm6-graphql';
	import * as prettier from 'prettier/standalone';
	import prettierPluginTypescript from 'prettier/parser-typescript';
	import prettierPluginGraphql from 'prettier/parser-graphql';
	import prettierPluginEstree from 'prettier/parser-babel';
	import type monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	export let language: string = 'javascript';
	export let rawValue: string = '{}';
	export let value: string = '';
	export let displayInterface: string;

	const dispatch = createEventDispatcher();
	const mutationVersion = getContext('mutationVersion');
	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco: any;

	const initializeEditor = async () => {
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(divEl, {
			value: language === 'javascript' ? `const data = ${rawValue || '{}'}` : rawValue,
			language: language,
			lineNumbers: 'off',
			roundedSelection: false,
			scrollBeyondLastLine: false,
			readOnly: false,
			theme: 'vs-dark',
			tabSize: 2,
			formatOnType: true,
			formatOnPaste: true,
			minimap: { enabled: false },
			folding: true
		});

		editor.onDidChangeModelContent(() => {
			// Handle model content change
		});

		prettify();

		return () => {
			editor.dispose();
		};
	};

	onMount(initializeEditor);

	$: {
		editor?.setValue(language === 'javascript' ? `const data = ${rawValue || '{}'}` : rawValue);
		prettify();
	}

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
		return (
			config.language === language ||
			(language === 'javascript' && config.language === 'typescript')
		);
	});

	const prettify = async () => {
		if (!editor) {
			return;
		}
		const editorValue = editor.getValue();

		value = await prettier.format(editorValue, {
			parser: chosenConfig?.language,
			plugins: chosenConfig?.plugins
		});
		editor.setValue(value);
	};
	const prettifyString = async (string, callback) => {
		const value = await prettier.format(string, {
			parser: chosenConfig?.language,
			plugins: chosenConfig?.plugins
		});
		if (callback) {
			callback(value);
		} else {
			console.info('callback not defined');
		}
	};

	let mainContainerEl: HTMLDivElement;

	document.addEventListener('fullscreenchange', function (e) {
		if (document.fullscreenElement) {
			// Full-screen mode entered
			//console.log('Entered full-screen mode');
		} else {
			if (e.target.id == id) {
				editor.dispose();
				setTimeout(initializeEditor, 500);
			}
			// Full-screen mode exited
			//console.log('Exited full-screen mode', e);
		}
	});
	const generateId: () => string = () => {
		return (
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		);
	};
	const id = generateId();
</script>

<div
	class="flex flex-col max-h-[30vh] pt-2 px-2 bg-base-300 h-max min-h-[180px] aspect-video mx-auto rounded-box"
	{id}
	bind:this={mainContainerEl}
>
	<div class="h-full rounded-box overflow-auto">
		<div bind:this={divEl} class="h-full " />
	</div>
	<div class="flex flex-row-reverse w-full overflow-x-auto overflow-y-hidden px-10 pb-4 pt-2">
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				const editorValue = editor.getValue();
				const firstCurlyBraces = editorValue.indexOf('{');
				const lastCurlyBraces = editorValue.lastIndexOf('}');
				const editorValueCleaned = editorValue.substring(firstCurlyBraces, lastCurlyBraces + 1);
				dispatch('changed', {
					chd_rawValue: chosenConfig?.language == 'typescript' ? editorValueCleaned : editorValue
				});
			}}
		>
			Save
		</button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				editor.setValue(`const data = ${configurationAsString}`);
			}}
		>
			Load Demo Data
		</button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				document.exitFullscreen();
			}}
		>
			Exit Fullscreen
		</button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				mainContainerEl.requestFullscreen();
				editor.dispose();
				setTimeout(initializeEditor, 500);
			}}
		>
			Full Screen
		</button>
		<button class="btn btn-xs btn-primary" on:click={prettify}>Format</button>
	</div>
</div>
