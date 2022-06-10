<script>
	import * as mapboxglOriginal from 'mapbox-gl';
	import { onMount } from 'svelte';
	let mapboxgl = mapboxglOriginal;
	let map;
	onMount(() => {
		mapboxgl.accessToken =
			'pk.eyJ1IjoiZGV2ZWxvcG1lbnQtdmFyZ2FtYXJjZWwiLCJhIjoiY2wwZTQ1bno0MDEzZjNvb2I3MHZydTR4dyJ9.EyYgnR9m4Efkd3T-NyrFjA';
		map = new mapboxgl.Map({
			container: 'map', // container ID
			style: 'mapbox://styles/mapbox/streets-v11', // style URL
			center: [-74.5, 40], // starting position [lng, lat]
			zoom: 9 // starting zoom
		});
	});
	let showMap = true;
</script>

<div class="flex justify-center container">
	<div class="">
		<div id="map" class="w-60 h-60 md:w-80  md:h-80 lg:w-96  lg:h-96 " />
	</div>
</div>

<style>
</style>
