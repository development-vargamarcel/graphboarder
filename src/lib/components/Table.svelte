<script>
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';

	import { formatData, getColResultData, getData } from '$lib/utils/usefulFunctions';

	import { createEventDispatcher } from 'svelte';
	import ColumnInfo from './ColumnInfo.svelte';
	export let colsData = [];
	export let columns = [];
	export let rows = [];
	//console.log('rows---------------', rows);
	const pathToData = (queryFragment) => {
		let pathStepsArray = [];

		if (typeof queryFragment !== 'string') {
			if (queryFragment.length > 2) {
				pathStepsArray.push(false);
			} else {
				queryFragment.forEach((el, index) => {
					if (typeof el == 'string' || queryFragment.length - 1 == index) {
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
		//console.log('-------------------------------------');
		//console.log('pathToData', pathToData);
		if (pathToData[pathToData.length - 1] == false) {
			//console.log('********************');
			//or includes false maybe is better....
			pathToData = [pathToData[0]];
		}

		pathToData.forEach((el) => {
			if (typeof el !== 'string') {
				//console.log('hellllllloooooo=====', el, el[0], data);
			} else {
				//console.log('getDataUsing_pathToData_data', data);
				if (data?.length) {
					if (data.length > 0) {
						//console.log('0.0***********');

						data = data.map((dataEl) => {
							//console.log('0.0insideMap***********', dataEl);
							if (dataEl.length) {
								return dataEl.map((dataEl_El) => {
									return dataEl_El?.[el];
								});
							} else {
								return dataEl[el];
							}
						});
					} else {
						//console.log('0.1***********');

						data = data;
					}
				} else if (data?.[el] !== undefined) {
					//console.log('1***********', el, data[el]);
					data = data[el];
				} else {
					//console.log('2***********');

					data = undefined; //might cause problems
				}
			}
		});
		//console.log('FINAL-getDataUsing_pathToData_data', data);

		//console.log('-------------------------------------');
		return data;
	};

	//console.log('columns', columns);
	//console.log('rows', rows);

	const dispatch = createEventDispatcher();
</script>

<div class=" h-[90vh] overscroll-contain	 overflow-y-auto rounded-box">
	<table class="table table-compact w-full rounded-none  mb-32 ">
		<thead class="sticky top-0 z-20">
			<tr class="sticky top-0 z-20 ">
				<th>
					<label>
						<input type="checkbox" class="checkbox" />
					</label>
				</th>
				<!-- <th>edit</th> -->
				<th>#</th>
				{#each columns as column, index}
					{@const isLast = index == columns.length - 1}
					<th class="normal-case">
						<div class="dropdown dropdown-end  ">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<label tabindex="0" class="cursor-pointer ">
								<div class="flex space-x-2 hover:text-primary rounded-box">
									<div>{column}</div>
									<div class="bi bi-chevron-down " />
								</div>
							</label>
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<div
								tabindex="0"
								class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl"
							>
								<div
									class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2"
								>
									<div class="w-full   p-2 rounded-box flex flex-col space-y-2">
										<div
											class="w-full pr-2 hover:text-primary cursor-pointer max-w-xs  md:max-w-sm overflow-x-auto"
										>
											<ColumnInfo stepsOfFields={colsData[index].stepsOfFields} />
											<!-- {colsData[index].stepsOfFields.join(' > ')} -->
										</div>
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<div
											class="w-full pr-2 hover:text-primary cursor-pointer "
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
				<th class="sticky right-0 z-0 w-2" />
			</tr>
		</thead>
		<tbody class="z-0">
			{#each rows as row, index}
				<tr
					class="bg-base-100 hover:bg-base-300 cursor-pointer hover z-0"
					on:click={() => {
						goto(`${$page.url.origin}/queries/${$page.params.queryName}/${row.id}`);
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
					<td class="sticky right-0 z-0 w-2" />
				</tr>
			{/each}
		</tbody>
	</table>

	<slot name="itemDisplay" />
</div>
