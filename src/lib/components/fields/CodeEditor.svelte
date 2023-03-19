<script lang="ts">
	import type monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;

	onMount(async () => {
		// @ts-ignore
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
			value: `{
    "url": "https://vgqkcskomrpikolllkix.nhost.run/v1beta1/relay",
    "isMantained": true,
    "description": "edgeBased pagination,no rowCount avalable",
    "headers": {
        "x-hasura-admin-secret": "3f3e46f190464c7a8dfe19e6c94ced84"
    },
    "pageInfoFieldsLocation": [
        "pageInfo"
    ],
    "rowsLocationPossibilities": [
        {
            "get_Val": "/Function((QMS_info) => {\n          return [\"edges\",\"results\"];\n        })/",
            "check": "/Function((QMS_info) => {\n          return true;\n        })/"
        }
    ],
    "namings": {
        "hasNextPage": "hasNextPage",
        "hasPreviousPage": "hasPreviousPage",
        "startCursor": "startCursor",
        "endCursor": "endCursor",
        "cursor": "cursor"
    }
}`,
			language: 'javascript',
			lineNumbers: 'off',
			roundedSelection: false,
			scrollBeyondLastLine: false,
			readOnly: false,
			theme: 'vs-dark'
		});
		editor.onDidChangeModelContent(function (e) {
			console.log('changed');
		});

		return () => {
			editor.dispose();
		};
	});
</script>

<div class="flex flex-col">
	<div class="overflow-hidden rounded-box">
		<div bind:this={divEl} class="h-max min-h-[180px]   aspect-video rounded-box" />
	</div>
	<div class="flex flex-row-reverse mt-2">
		<button class="btn btn-primary btn-xs normal-case">done</button>
	</div>
</div>
