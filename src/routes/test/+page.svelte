<script>
	import CodeEditor from './../../lib/components/fields/CodeEditor.svelte';
	import { parseAll } from '$lib/stores/testData/testEndpoints';
	import { objectToSourceCode } from '$lib/utils/usefulFunctions';
	import CrazyNesting from '$lib/components/testing/CrazyNesting.svelte';

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
</script>

<div class="px-4 pt-4">
	<textarea class="textarea w-full h-80" type="text" bind:value={text} />

	<CodeEditor bind:rawValue={sourceCode} />
	<div>
		{sourceCode}
	</div>
</div>

<CrazyNesting></CrazyNesting>
