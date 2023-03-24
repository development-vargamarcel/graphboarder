<script>
	import CodeEditor from './../../lib/components/fields/CodeEditor.svelte';
	import { parseAll } from '$lib/stores/testData/testEndpoints';

	let text = '{ "a": 1, "b": 2 }';

	let testObject = {};
	let sourceCode = '';
	$: {
		console.log(text, parseAll(text));
		testObject = parseAll(text);
		console.log(testObject);
		console.log(objectToSourceCode(testObject));
		sourceCode = objectToSourceCode(testObject);
	}

	function objectToSourceCode(obj) {
		// Check if the input is an object
		if (typeof obj !== 'object' || obj === null) {
			throw new Error('Input must be an object');
		}

		// Helper function to convert functions to strings
		function functionToString(fn) {
			return fn.toString();
		}

		// Recursively convert the object to source code
		function convertObjectToSourceCode(obj) {
			if (typeof obj === 'function') {
				return functionToString(obj);
			}

			if (Array.isArray(obj)) {
				return '[' + obj.map(convertObjectToSourceCode).join(', ') + ']';
			}

			if (typeof obj === 'object') {
				return (
					'{' +
					Object.entries(obj)
						.map(([key, value]) => `${key}: ${convertObjectToSourceCode(value)}`)
						.join(', ') +
					'}'
				);
			}

			// All other types are converted to string literals
			return JSON.stringify(obj);
		}

		return convertObjectToSourceCode(obj);
	}
</script>

<div class="px-4 pt-4">
	<textarea class="textarea w-full h-80" type="text" bind:value={text} />

	<CodeEditor bind:rawValue={sourceCode} />
	<div>
		{sourceCode}
	</div>
</div>
