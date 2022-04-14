<script>
	export let columns = [];
	export let rows = [];
	console.log(columns);
	console.log(rows);
	const truncateText = (data = '', length, alwaysStringyfy = true) => {
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
</script>

<div class="overflow-x-auto  ">
	<div class="drawer drawer-end 	">
		<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content overscroll-y-contain pb-60">
			<table class="table table-compact w-full rounded-none">
				<thead class="sticky top-0 z-20">
					<tr class="sticky top-0 ">
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<th>#</th>
						{#each columns as column}
							<th>{column}</th>
						{/each}
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
							{#each columns as column}
								<td class="z-0">
									{truncateText(row[column], 20, true)}
								</td>{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="drawer-side overflow-x-none w-full flex-none">
			<label for="my-drawer-4" class="drawer-overlay" />
			<div class="menu  overflow-y-auto bg-primary/0  text-base-content w-full">
				<div class="flex h-full ">
					<label for="my-drawer-4" class="sm:w-20 ">
						<div class="bg-primary/0" />
					</label>
					<div class="flex space-x-2 bg-base-100 w-full">
						<label for="my-drawer-4" class="drawer-button btn btn-primary w-min rounded-full"
							>X</label
						>
						<div class="btn btn-success">ok</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
