<script>
	import * as mapboxglOriginal from 'mapbox-gl';
	import { onMount } from 'svelte';
    let mapboxgl=mapboxglOriginal
	onMount(() => {
		mapboxgl.accessToken ='pk.eyJ1IjoiZGV2ZWxvcG1lbnQtdmFyZ2FtYXJjZWwiLCJhIjoiY2wwZTQ1bno0MDEzZjNvb2I3MHZydTR4dyJ9.EyYgnR9m4Efkd3T-NyrFjA';
		const map = new mapboxgl.Map({
			container: 'map', // container ID
			style: 'mapbox://styles/mapbox/streets-v11', // style URL
			center: [-74.5, 40], // starting position [lng, lat]
			zoom: 9 // starting zoom
		});
	});
	let large = false;
</script>

<div class="flex flex-col">
	<button on:click="">large/small</button>
	<div class="bg-black  w-20 h-20">
		<div id="map" class="h-20 w-20 absolute" />
	</div>
</div>

<style>
</style>
