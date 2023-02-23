<script>
	import * as mapboxglOriginal from 'mapbox-gl';
	import { createEventDispatcher, onMount } from 'svelte';
	let mapboxgl = mapboxglOriginal;
	export let containerEl;
	export let rawValue;
	//console.log('rawValue from outside', rawValue);
	export let dispatchValue;
	const generateUniqueId = () => {
		return (
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
		);
	};
	const mapContainerId = generateUniqueId();
	//s
	let map;
	let mapContainer;
	let dispatch = createEventDispatcher();
	let draw;
	let location;
	onMount(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((e) => {
				location = [e.coords.longitude, e.coords.latitude];
				map.flyTo({
					center: location,
					speed: 20
					//essential: true // this animation is considered essential with respect to prefers-reduced-motion
				});
			});
		}
		if (location) {
		}

		if (containerEl) {
			//console.log('containerEl', containerEl);
			// mapContainer.style.width = `${containerEl.clientWidth - 60}px`;
			// mapContainer.style.height = `${containerEl.clientHeight - 60}px`;
		} else {
			mapContainer.classList.add(
				'w-full',
				'h-full',
				'rounded-box',
				'my-1',
				'mr-1'
				// 'w-[100px]',
				// 'h-[100px]',
				// 'md:w-[200px]',
				// 'md:h-[200px]',
				// 'lg:w-[200px]',
				// 'lg:h-[200px]'
			);
		}
		mapboxgl.accessToken =
			'pk.eyJ1IjoiZGV2ZWxvcG1lbnQtdmFyZ2FtYXJjZWwiLCJhIjoiY2wwZTQ1bno0MDEzZjNvb2I3MHZydTR4dyJ9.EyYgnR9m4Efkd3T-NyrFjA';
		map = new mapboxgl.Map({
			container: mapContainerId, // container ID
			style: 'mapbox://styles/mapbox/streets-v11', // style URL
			center: [-74.5, 40], // starting position [lng, lat]
			zoom: 9, // starting zoom
			attributionControl: false
			//cooperativeGestures: true
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
			let dataCopy = JSON.parse(JSON.stringify(data));
			dispatch('changed', {
				chd_chosen: undefined,
				chd_needsValue: true,
				chd_needsChosen: false,
				chd_rawValue: dataCopy
			});
		}
	});
	let mapOnLoadHandler_set = false;
	$: if (map && !mapOnLoadHandler_set) {
		mapOnLoadHandler_set = true;
		map.on('load', () => {
			if (rawValue) {
				//console.log('rawValue', rawValue);
				if (draw) {
					rawValue.features.forEach((feature) => {
						//console.log('feature added');
						draw.add(feature);
					});
				}
			}
		});
	}
	let showMap = true;
</script>

<div class="flex justify-center container bg-black" on:click|preventDefault={() => {}}>
	<div id={mapContainerId} bind:this={mapContainer} class=" w-full min-w-[20vw] h-60 " />
</div>

<style>
</style>
