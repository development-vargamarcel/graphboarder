<script>
	import { createEventDispatcher } from 'svelte';
	export let colsData = [];
	export let columns = [];
	export let rows = [];

	const pathToData = (queryFragment) => {
		let pathStepsArray = [];

		if (typeof queryFragment !== 'string') {
			if (queryFragment.length > 2) {
				pathStepsArray.push(false);
			} else {
				queryFragment.forEach((el) => {
					if (typeof el == 'string') {
						pathStepsArray.push(el);
					} else {
						pathStepsArray.push(...pathToData(el));
					}
				});
			}
		} else {
			pathStepsArray.push(queryFragment);
		}

		return pathStepsArray;
	};

	const getDataUsing_pathToData = (pathToData, data) => {
		if (pathToData[pathToData.length - 1] == false) {
			//or includes false maybe is better....
			pathToData = [pathToData[0]];
		}

		pathToData.forEach((el) => {
			if (data?.length) {
				if (data.length > 0) {
					data = data.map((dataEl) => {
						return dataEl[el];
					});
				} else {
					data = data;
				}
			} else if (data?.[el] !== undefined) {
				data = data[el];
			} else {
				data = data;
			}
		});
		return data;
	};
	const getData = (row, colData, index) => {
		let data;
		if (row[index]) {
			data = row[index];
		} else {
			data = getDataUsing_pathToData(pathToData(colData.queryFragment), row);
		}
		return data;
	};
	console.log('columns', columns);
	console.log('rows', rows);
	const formatData = (data = '', length, alwaysStringyfy = true) => {
		let string = '';
		let resultingString = '';

		if (alwaysStringyfy) {
			string = JSON.stringify(data);
		} else {
			typeof data === 'string' ? (string = data) : (string = JSON.stringify(data));
		}

		if (string.length >= length) {
			resultingString = `${string.substring(0, length / 2)} ... ${string.substring(
				string.length - length / 2
			)}`;
		} else {
			resultingString = string;
		}

		return resultingString;
	};

	const dispatch = createEventDispatcher();
</script>

<div class="  ">
	<div class="drawer drawer-end 	">
		<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content overscroll-contain pb-60">
			<table class="table table-compact w-full rounded-none	">
				<thead class="sticky top-0 z-20">
					<tr class="sticky top-0 z-20">
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<th>#</th>
						{#each columns as column, index}
							{@const isLast = index == columns.length - 1}
							<th class="normal-case">
								<div class="dropdown dropdown-end  ">
									<label tabindex="0" class="cursor-pointer ">
										<div class="flex space-x-2 hover:text-primary rounded-box">
											<div>{column}</div>
											<div class="bi bi-chevron-down " />
										</div>
									</label>
									<div
										tabindex="0"
										class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl"
									>
										<div
											class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2"
										>
											<div class="w-full cursor-pointer  hover:text-primary p-2 rounded-box flex">
												<div
													class="w-full pr-2"
													on:click={() => {
														dispatch('hideColumn', { column: column, index: index });
													}}
												>
													hide field
												</div>
											</div>
										</div>
									</div>
								</div>
							</th>
						{/each}
						<th>
							<div class="dropdown dropdown-end">
								<label
									tabindex="0"
									class="btn btn-sm bi bi-node-plus-fill text-lg p-1"
									on:click={() => {
										dispatch('addColumnDropdown');
									}}
								/>
								<div
									tabindex="0"
									class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl"
								>
									<slot name="addColumnDisplay" />
								</div>
							</div>

							<div class="dropdown dropdown-end">
								<label
									tabindex="0"
									class="btn btn-sm bi bi-sliders text-lg p-1"
									on:click={() => {
										dispatch('changeArgumentsDropdown');
									}}
								/>
								<div
									tabindex="0"
									class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl"
								>
									<slot name="changeArguments" />
								</div>
							</div>
						</th>
					</tr>
				</thead>
				<tbody class="z-0">
					{#each rows as row, index}
						<tr
							class="bg-base-100 hover:bg-base-300 cursor-pointer hover z-0"
							on:click={() => {
								document.getElementById('my-drawer-4').click();
							}}
						>
							<th class="z-0" on:click|stopPropagation={() => {}}>
								<label>
									<input type="checkbox" class="checkbox" />
								</label>
							</th>
							<th class="z-0">{index + 1}</th>
							{#each colsData as colData, index}
								<td class="z-0">
									{formatData(getData(row, colData, index), 40, true)}
								</td>{/each}
							<td class="z-0" />
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="drawer-side  w-full flex-none h-full overscroll-contain">
			<label for="my-drawer-4" class="drawer-overlay h-full" />
			<div class="menu   bg-primary/0   text-base-content w-full ">
				<div class="flex h-full  ">
					<label for="my-drawer-4" class="sm:w-20 ">
						<div class="bg-primary/0" />
					</label>
					<div class="  bg-base-100 w-full ">
						<div class="flex space-x-2 sticky top-0 bg-base-100 shadow-md p-2">
							<div class="flex-none w-14 h-14 ...">
								<label for="my-drawer-4" class="drawer-button btn btn-primary w-min rounded-full"
									>X</label
								>
							</div>
							<div class="grow h-14 ..." />
							<div class="flex-none w-14 h-14 ...">
								<div class="btn btn-success mb-40">ok</div>
							</div>
						</div>
						<div class="px-2 mt-4 pb-40">content here</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
