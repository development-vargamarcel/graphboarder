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

<div class="flex flex-col">
	<div class="">
		<div id="map" class="w-32 h-32  " />
	</div>
</div>

<style>
</style>
