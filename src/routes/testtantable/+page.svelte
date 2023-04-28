<script>
	import * as tf from '@tensorflow/tfjs';
	import { onMount } from 'svelte';

	let inputStrings = ['hello world', 'foo bar', 'hello foo'];
	let substrings = [];

	onMount(async () => {
		// Preprocess input strings by splitting them into characters and creating one-hot encoding
		const maxLen = Math.max(...inputStrings.map((str) => str.length));
		const charSet = new Set(inputStrings.join(''));
		const charMap = [...charSet].reduce((acc, char, i) => {
			acc[char] = i;
			return acc;
		}, {});

		const inputTensors = inputStrings.map((str) => {
			const chars = str.split('');
			const oneHot = tf.oneHot(
				chars.map((char) => charMap[char]),
				charSet.size
			);
			return tf
				.pad(
					oneHot,
					[
						[0, maxLen - chars.length],
						[0, 0]
					],
					0.0
				)
				.expandDims();
		});

		// Train model
		const model = tf.sequential();
		model.add(
			tf.layers.lstm({
				units: 32,
				inputShape: [maxLen, charSet.size]
			})
		);
		model.add(tf.layers.dense({ units: charSet.size, activation: 'softmax' }));
		model.compile({ optimizer: tf.train.adam(), loss: 'categoricalCrossentropy' });

		const xs = tf.concat(inputTensors);
		const ys = xs.clone();
		await model.fit(xs, ys, { epochs: 10 });

		// Get top substrings by frequency
		const counts = {};
		inputStrings.forEach((str) => {
			for (let i = 0; i < str.length; i++) {
				for (let j = i; j < str.length; j++) {
					const substr = str.slice(i, j + 1);
					if (!counts[substr]) counts[substr] = 0;
					counts[substr]++;
				}
			}
		});
		substrings = Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([substr, count]) => substr);
	});
</script>

<h1>Substrings Sorted by Frequency</h1>

{#if substrings.length}
	<ol>
		{#each substrings as substr}
			<li>{substr}</li>
		{/each}
	</ol>
{:else}
	<p>Loading...</p>
{/if}
