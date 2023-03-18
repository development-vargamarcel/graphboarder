<script>
	// Through the options literal, the behaviour of the editor can be easily customized.
	// Here are a few examples of config options that can be passed to the editor.
	// You can also call editor.updateOptions at any time to change the options.
	import * as monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	self.MonacoEnvironment = {
		getWorker: function (workerId, label) {
			const getWorkerModule = (moduleUrl, label) => {
				return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
					name: label,
					type: 'module'
				});
			};

			switch (label) {
				case 'json':
					return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
				case 'css':
				case 'scss':
				case 'less':
					return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
				case 'html':
				case 'handlebars':
				case 'razor':
					return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
				case 'typescript':
				case 'javascript':
					return getWorkerModule(
						'/monaco-editor/esm/vs/language/typescript/ts.worker?worker',
						label
					);
				default:
					return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
			}
		}
	};
	onMount(() => {
		var editor = monaco.editor.create(document.getElementById('container'), {
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
		setTimeout(function () {
			editor.updateOptions({
				lineNumbers: 'on'
			});
		}, 2000);
	});
</script>

<div class="overflow-hidden rounded-box">
	<div id="container" class="h-60 aspect-video" />
</div>
