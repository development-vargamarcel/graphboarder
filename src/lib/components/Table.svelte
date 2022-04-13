<script>
	export let columns = [];
	export let rows = [];
	console.log(columns);
	console.log(rows);
	const truncateText = (text = '', length) => {
		if (typeof text === 'string') {
			if (text == text.substr(0, length)) {
				return text;
			}
			return `${text.substr(0, length)}...`;
		} else {
			return text;
		}
	};
</script>

<div class="overflow-x-auto h-full">
	<div class="drawer drawer-end h-full">
		<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<table class="table table-compact w-full ">
				<thead class="sticky top-0 ">
					<tr>
						<th /><th />
						{#each columns as column}
							<th>{column}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row, index}
						<tr
							class="bg-base-100hover:bg-base-300"
							on:click={() => {
								document.getElementById('my-drawer-4').click();
							}}
						>
							<td class="cursor-pointer">edit</td>
							<td>{index}</td>
							{#each columns as column}
								<td>
									{truncateText(row[column], 40)}
								</td>{/each}
						</tr>
					{/each}
				</tbody>
				<tfoot class="sticky bottom-0">
					<tr>
						<th />
						{#each columns as column}
							<th>{column}</th>
						{/each}
					</tr>
				</tfoot>
			</table>
		</div>
		<div class="drawer-side overflow-x-none w-full flex-none">
			<label for="my-drawer-4" class="drawer-overlay" />
			<div class="menu  overflow-y-auto bg-primary/0  text-base-content w-full">
				<div class="flex h-full ">
					<label for="my-drawer-4" class="w-20 ">
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
