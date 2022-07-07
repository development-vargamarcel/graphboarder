<script>
	import * as mapboxglOriginal from 'mapbox-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	let mapboxgl = mapboxglOriginal;
	export let containerEl;
	export let rawValue;
	console.log('rawValue from outside', rawValue);
	export let dispatchValue;
	let map;
	let mapContainer;
	let dispatch = createEventDispatcher();
	let draw;
	onMount(() => {
		if (containerEl) {
			console.log('containerEl', containerEl);
			mapContainer.style.width = `${containerEl.clientWidth - 60}px`;
			mapContainer.style.height = `${containerEl.clientHeight - 60}px`;
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
		map.addControl(new mapboxgl.FullscreenControl());
		map.addControl(
			new mapboxgl.GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true
				},
				// When active the map will receive updates to the device's location as it changes.
				trackUserLocation: true,
				// Draw an arrow next to the location dot to indicate which direction the device is heading.
				showUserHeading: true
			})
		);
		draw = new MapboxDraw({
			displayControlsDefault: false,
			// Select which mapbox-gl-draw control buttons to add to the map.
			controls: {
				polygon: true,
				trash: true,
				point: true
			}
			// Set mapbox-gl-draw to draw by default.
			// The user does not have to click the polygon control button first.
			// defaultMode: 'draw_polygon'
		});
		map.addControl(draw);

		map.on('draw.create', updateArea);
		map.on('draw.delete', updateArea);
		map.on('draw.update', updateArea);

		function updateArea(e) {
			const data = draw.getAll();
			console.log('data', data);
			let dataCopy = JSON.parse(JSON.stringify(data));
			let dispatchValue = data.features.map((feature) => {
				let geometry = feature.geometry;
				geometry.type = `'${geometry.type}'`;
				return geometry;
			});

			if (data.features.length == 1) {
				//rawValue = JSON.parse(JSON.stringify(data));
				// dispatchValue = data.features[0].geometry;
				// dispatchValue.type = `'${dispatchValue.type}'`;
				dispatch('changed', {
					chd_chosen: undefined,
					chd_dispatchValue: dispatchValue[0],
					chd_needsValue: true,
					chd_needsChosen: false,
					chd_rawValue: dataCopy
				});
			} else {
				dispatch('changed', {
					chd_chosen: undefined,
					chd_dispatchValue: dispatchValue,
					chd_needsValue: true,
					chd_needsChosen: false,
					chd_rawValue: dataCopy
				});
			}

			console.log('map', map);
			console.log('draw', draw);
		}
	});
	let mapOnLoadHandler_set = false;
	$: if (map && !mapOnLoadHandler_set) {
		mapOnLoadHandler_set = true;
		map.on('load', () => {
			if (rawValue) {
				console.log('rawValue', rawValue);
				if (draw) {
					rawValue.features.forEach((feature) => {
						console.log('feature added');
						draw.add(feature);
					});
				}
			}
		});
	}
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
