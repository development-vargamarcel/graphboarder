<script>
	export let columns = [];
	export let rows = [];
	console.log(columns);
	console.log(rows);
	if (!rows?.length) {
		rows = [rows];
	}
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
