<script lang="ts">
	import { getContext } from 'svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { Logger } from '$lib/utils/logger';
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

	interface Props {
		language?: string;
		rawValue?: string;
		value?: string;
		displayInterface: string;
		onChanged?: (detail: { chd_rawValue: string }) => void;
	}

	let {
		language = 'javascript',
		rawValue = '{}',
		value = $bindable(''),
		displayInterface,
		onChanged
	}: Props = $props();

	const mutationVersion = getContext('mutationVersion');
	let divEl: HTMLDivElement = $state(null);
	let editor: monaco.editor.IStandaloneCodeEditor = $state();
	let Monaco: any;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
			// Debounce the change event to avoid excessive updates
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(() => {
				const editorValue = editor.getValue();
				const firstCurlyBraces = editorValue.indexOf('{');
				const lastCurlyBraces = editorValue.lastIndexOf('}');
				const editorValueCleaned = editorValue.substring(firstCurlyBraces, lastCurlyBraces + 1);
				onChanged?.({
					chd_rawValue: chosenConfig?.language == 'typescript' ? editorValueCleaned : editorValue
				});
			}, 500); // 500ms debounce delay
		});

		prettify();

		return () => {
			editor.dispose();
		};
	};

	$effect(() => {
		const cleanup = initializeEditor();
		return cleanup;
	});


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
			Logger.info('callback not defined');
		}
	};

	let mainContainerEl: HTMLDivElement = $state();

	document.addEventListener('fullscreenchange', function (e) {
		if (document.fullscreenElement) {
			// Full-screen mode entered
			//Logger.debug('Entered full-screen mode');
		} else {
			if (e.target.id == id) {
				editor.dispose();
				setTimeout(initializeEditor, 500);
			}
			// Full-screen mode exited
			//Logger.debug('Exited full-screen mode', e);
		}
	});
	const generateId: () => string = () => {
		return (
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		);
	};
	const id = generateId();
	$effect(() => {
		editor?.setValue(language === 'javascript' ? `const data = ${rawValue || '{}'}` : rawValue);
		prettify();
	});
</script>

<div
	class="flex flex-col max-h-[30vh] pt-2 px-2 bg-base-300 h-max min-h-[180px] aspect-video mx-auto rounded-box"
	{id}
	bind:this={mainContainerEl}
>
	<div class="h-full rounded-box overflow-auto">
		<div bind:this={divEl} class="h-full "></div>
	</div>
	<div class="flex flex-row-reverse w-full overflow-x-auto overflow-y-hidden px-10 pb-4 pt-2">
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			onclick={() => {
				const editorValue = editor.getValue();
				const firstCurlyBraces = editorValue.indexOf('{');
				const lastCurlyBraces = editorValue.lastIndexOf('}');
				const editorValueCleaned = editorValue.substring(firstCurlyBraces, lastCurlyBraces + 1);
				onChanged?.({
					chd_rawValue: chosenConfig?.language == 'typescript' ? editorValueCleaned : editorValue
				});
			}}
		>
			Save
		</button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			onclick={() => {
				editor.setValue(`const data = ${configurationAsString}`);
			}}
		>
			Load Demo Data
		</button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			onclick={() => {
				document.exitFullscreen();
			}}
		>
			Exit Fullscreen
		</button>
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			onclick={() => {
				mainContainerEl.requestFullscreen();
				editor.dispose();
				setTimeout(initializeEditor, 500);
			}}
		>
			Full Screen
		</button>
		<button class="btn btn-xs btn-primary" onclick={prettify}>Format</button>
	</div>
</div>
