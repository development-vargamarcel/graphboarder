<!-- App.svelte -->
<script>
	import { onMount } from 'svelte';
	import * as ml5 from 'ml5';

	let model;
	let generatedText = '';
	let temperature = 0.5;

	onMount(() => {
		// Load the model
		model = ml5.charRNN('$lib/models/shakespeare', () => {
			console.log('Model loaded!');
		});
	});

	function generateText() {
		// Set the length of the generated text
		const length = 100;

		// Generate text using the model
		model.generate(
			length,
			(err, results) => {
				if (err) {
					console.error(err);
					return;
				}

				generatedText = results.sample;
			},
			{ temperature }
		);
	}
</script>

<main>
	<h1>CharRNN Text Generation</h1>

	<p>Generated Text: {generatedText}</p>

	<label>
		Temperature: {temperature}
		<input type="range" min="0" max="1" step="0.1" bind:value={temperature} />
	</label>

	<button on:click={generateText}>Generate Text</button>
</main>
