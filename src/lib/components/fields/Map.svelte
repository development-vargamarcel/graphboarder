<script>
	import * as mapboxglOriginal from 'mapbox-gl';
	import { onMount } from 'svelte';
	let mapboxgl = mapboxglOriginal;
	export let containerEl;
	let map;
	let mapContainer;
	onMount(() => {
		if (containerEl) {
			console.log('containerEl', containerEl);
			mapContainer.style.width = `${containerEl.clientWidth - 60}px`;
			mapContainer.style.height = `${containerEl.clientHeight - 60}px`;
			console.log('mapContainer', mapContainer.style);
		} else {
			mapContainer.classList.add(
				'w-60',
				'h-60',
				'md:w-[700px]',
				'md:h-80',
				'lg:w-[900]',
				'lg:h-96'
			);
		}
		mapboxgl.accessToken =
			'pk.eyJ1IjoiZGV2ZWxvcG1lbnQtdmFyZ2FtYXJjZWwiLCJhIjoiY2wwZTQ1bno0MDEzZjNvb2I3MHZydTR4dyJ9.EyYgnR9m4Efkd3T-NyrFjA';
		map = new mapboxgl.Map({
			container: 'map', // container ID
			style: 'mapbox://styles/mapbox/streets-v11', // style URL
			center: [-74.5, 40], // starting position [lng, lat]
			zoom: 9 // starting zoom
		});
		map.resize();
	});
	let showMap = true;
</script>

<div class="flex justify-center container" on:click|preventDefault={() => {}}>
	<div class="">
		<div
			id="map"
			bind:this={mapContainer}
			class=" w-60
h-60 "
		/>
	</div>
</div>

<style>
</style>
