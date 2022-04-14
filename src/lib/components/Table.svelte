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
			<table class="table table-compact w-full rounded-none	">
				<thead class="sticky top-0 z-20">
					<tr class="sticky top-0 z-20">
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<th>#</th>
						{#each columns as column}
							<th class="normal-case">{column}</th>
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
		<div class="drawer-side  w-full flex-none ">
			<label for="my-drawer-4" class="drawer-overlay" />
			<div class="menu   bg-primary/0   text-base-content w-full ">
				<div class="flex h-full  overflow-auto">
					<label for="my-drawer-4" class="sm:w-20 ">
						<div class="bg-primary/0" />
					</label>
					<div class="  bg-base-100 w-full p-2  pb-80">
						<div class="flex space-x-2">
							<label for="my-drawer-4" class="drawer-button btn btn-primary w-min rounded-full"
								>X</label
							>
							<div class="btn btn-success mb-40">ok</div>
						</div>

						<div class="mb-60">s</div>

						<label for="my-drawer-4" class="drawer-button btn btn-primary w-min rounded-full"
							>X</label
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
