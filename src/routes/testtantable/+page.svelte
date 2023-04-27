<script>
	// Import TensorFlow.js
	import * as tf from '@tensorflow/tfjs';
	import { onMount } from 'svelte';
	onMount(() => {
		async function run() {
			// Define the training data
			const trainingData = [
				{ text: 'This is a sentence containing the keyword apple', keyword: 'apple' },
				{ text: 'The keyword is banana in this sentence', keyword: 'banana' },
				{ text: 'The word orange is the keyword in this text', keyword: 'orange' },
				{ text: 'The keyword is pear in this sentence', keyword: 'pear' },
				{ text: 'The word mango is the keyword in this text', keyword: 'mango' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is strawberry in this text', keyword: 'strawberry' },
				{ text: 'The word cherry is the keyword in this sentence', keyword: 'cherry' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is lemon in this sentence', keyword: 'lemon' },
				{ text: 'The word lime is the keyword in this text', keyword: 'lime' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is grape in this sentence', keyword: 'grape' },
				{ text: 'The word blueberry is the keyword in this text', keyword: 'blueberry' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is raspberry in this sentence', keyword: 'raspberry' },
				{ text: 'The word kiwi is the keyword in this text', keyword: 'kiwi' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is watermelon in this sentence', keyword: 'watermelon' },
				{ text: 'The word cantaloupe is the keyword in this text', keyword: 'cantaloupe' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is honeydew in this sentence', keyword: 'honeydew' },
				{ text: 'The word pineapple is the keyword in this text', keyword: 'pineapple' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is plum in this sentence', keyword: 'plum' },
				{ text: 'The word apricot is the keyword in this text', keyword: 'apricot' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is peach in this sentence', keyword: 'peach' },
				{ text: 'The word nectarine is the keyword in this text', keyword: 'nectarine' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is tomato in this sentence', keyword: 'tomato' },
				{ text: 'The word cucumber is the keyword in this text', keyword: 'cucumber' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is carrot in this sentence', keyword: 'carrot' },
				{ text: 'The word broccoli is the keyword in this text', keyword: 'broccoli' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is potato in this sentence', keyword: 'potato' },
				{ text: 'The word sweet potato is the keyword in this text', keyword: 'sweet potato' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is onion in this sentence', keyword: 'onion' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is corn in this sentence', keyword: 'corn' },
				{ text: 'The word peas is the keyword in this text', keyword: 'peas' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is spinach in this sentence', keyword: 'spinach' },
				{ text: 'The word lettuce is the keyword in this text', keyword: 'lettuce' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is mushroom in this sentence', keyword: 'mushroom' },
				{ text: 'The word eggplant is the keyword in this text', keyword: 'eggplant' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is zucchini in this sentence', keyword: 'zucchini' },
				{ text: 'The word squash is the keyword in this text', keyword: 'squash' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is cucumber in this sentence', keyword: 'cucumber' },
				{ text: 'The word tomato is the keyword in this text', keyword: 'tomato' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is broccoli in this sentence', keyword: 'broccoli' },
				{ text: 'The word cauliflower is the keyword in this text', keyword: 'cauliflower' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is pumpkin in this sentence', keyword: 'pumpkin' },
				{
					text: 'The word butternut squash is the keyword in this text',
					keyword: 'butternut squash'
				},
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is asparagus in this sentence', keyword: 'asparagus' },
				{ text: 'The word green beans is the keyword in this text', keyword: 'green beans' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is bell pepper in this sentence', keyword: 'bell pepper' },
				{ text: 'The word jalapeno is the keyword in this text', keyword: 'jalapeno' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is beet in this sentence', keyword: 'beet' },
				{ text: 'The word radish is the keyword in this text', keyword: 'radish' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' },
				{ text: 'The keyword is celery in this sentence', keyword: 'celery' },
				{ text: 'The word fennel is the keyword in this text', keyword: 'fennel' },
				{ text: 'This text does not have any keyword in it', keyword: 'none' },
				{ text: 'The keyword is onion in this sentence', keyword: 'onion' },
				{ text: 'The word shallot is the keyword in this text', keyword: 'shallot' },
				{ text: 'This sentence does not contain any keyword', keyword: 'none' }
			];

			// Define the model architecture
			const model = tf.sequential();
			model.add(tf.layers.dense({ inputShape: [20], units: 10, activation: 'relu' }));
			model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

			// Compile the model
			model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

			// Convert the training data into tensors
			const xs = trainingData.map((d) => d.text);
			const ys = trainingData.map((d) => d.keyword);

			const xsTensor = tf.tensor2d(xs, [xs.length, 20]);
			const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

			// Train the model
			await model.fit(xsTensor, ysTensor, {
				epochs: 100,
				shuffle: true,
				validationSplit: 0.1
			});

			// Save the model as a JSON file
			const modelJSON = model.toJSON();
			const modelBlob = new Blob([JSON.stringify(modelJSON)], { type: 'application/json' });
			const modelURL = URL.createObjectURL(modelBlob);

			// Load the model in the browser
			const loadedModel = await tf.loadLayersModel(modelURL);

			// Use the model to predict the keyword in a new sentence
			const inputSentence = 'This sentence contains the word apple';
			const inputTensor = tf.tensor2d([inputSentence], [1, 20]);

			const prediction = loadedModel.predict(inputTensor);

			console.log(`The predicted keyword is: ${prediction.dataSync()[0]}`);
		}
		run();
	});
</script>

s
