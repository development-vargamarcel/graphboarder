/**
 * Utility functions for filter choice state management
 */

/**
 * Synchronizes choice order between selected items and all choices
 * @param choisesWithId - Array of choices with IDs
 * @param chosenInternal - Currently selected choices
 * @returns Object with updated chosenNew and choisesNew arrays
 */
export function syncChoiceOrder(
	choisesWithId: Array<{ id: string; title: string }>,
	chosenInternal: string[]
): { chosenNew: string[]; choisesNew: string[] } {
	const chosenNew: string[] = [];
	const choisesNew: string[] = [];

	choisesWithId.forEach((choice) => {
		if (chosenInternal?.includes(choice.title)) {
			chosenNew.push(choice.title);
		}
		choisesNew.push(choice.title);
	});

	return { chosenNew, choisesNew };
}

/**
 * Determines button styling classes based on filter state
 * @param chosen - Currently selected choices
 * @param chosenDefault - Default choices
 * @param defaultMeansNoChange - Whether default state means no change
 * @param isToggle - Whether this is a toggle filter
 * @returns Object with button and info extra classes
 */
export function getFilterButtonClasses(
	chosen: string | string[],
	chosenDefault: string | string[],
	defaultMeansNoChange: boolean,
	isToggle: boolean
): { btnExtraClass: string; extraInfoExtraClass: string } {
	const hasSelection = Array.isArray(chosen) ? chosen.length > 0 : !!chosen;
	const isDefault = JSON.stringify(chosenDefault) == JSON.stringify(chosen);

	if (hasSelection && defaultMeansNoChange && isDefault) {
		return {
			btnExtraClass:
				'btn-outline btn-neutral bg-primary/10 hover:bg-primary/10 hover:text-base-content',
			extraInfoExtraClass: 'border-base-content text-base-content'
		};
	} else if (hasSelection) {
		return {
			btnExtraClass: 'btn-primary',
			extraInfoExtraClass: 'border-primary-content text-primary-content'
		};
	} else if (!hasSelection && defaultMeansNoChange && !isDefault) {
		return {
			btnExtraClass: 'btn-primary',
			extraInfoExtraClass: 'border-primary-content text-primary-content'
		};
	}

	return {
		btnExtraClass:
			'btn-outline btn-neutral bg-primary/10 hover:bg-primary/10 hover:text-base-content',
		extraInfoExtraClass: ''
	};
}

/**
 * Gets the display title and extra info based on filter type and selection
 * @param type - Filter type ('radio', 'checkbox', 'toggle')
 * @param chosen - Currently selected choices
 * @param titlePreChange - Original title before changes
 * @param isToggle - Whether this is a toggle filter
 * @returns Object with title and extraInfo
 */
export function getFilterDisplayInfo(
	type: string,
	chosen: string | string[],
	titlePreChange: string,
	isToggle: boolean
): { title: string; extraInfo: string } {
	const hasSelection = Array.isArray(chosen) ? chosen.length > 0 : !!chosen;

	if (isToggle && hasSelection) {
		return { title: Array.isArray(chosen) ? chosen[0] : chosen, extraInfo: '' };
	}

	if (type == 'toggle') {
		return { title: Array.isArray(chosen) ? chosen[0] : chosen, extraInfo: '' };
	}

	if (type == 'radio') {
		return {
			title: hasSelection ? (Array.isArray(chosen) ? chosen[0] : chosen) : titlePreChange,
			extraInfo: ''
		};
	}

	// checkbox type
	if (hasSelection) {
		return { title: titlePreChange, extraInfo: `${Array.isArray(chosen) ? chosen.length : 1}` };
	}

	return { title: titlePreChange, extraInfo: '' };
}

/**
 * Toggles a choice in a filter
 * @param type - Filter type ('radio' or 'checkbox')
 * @param choises - Available choices
 * @param currentChosen - Current selection
 * @returns New chosen value
 */
export function toggleFilterChoice(
	type: string,
	choises: string[],
	currentChosen: string | string[] | undefined
): string | string[] | undefined {
	if (type == 'radio') {
		const hasSelection =
			currentChosen && (Array.isArray(currentChosen) ? currentChosen.length > 0 : true);
		return hasSelection ? undefined : choises[0];
	}

	// checkbox type
	const hasSelection = currentChosen && Array.isArray(currentChosen) && currentChosen.length > 0;
	return hasSelection ? undefined : choises;
}

/**
 * Creates choices with IDs from plain choice array
 * @param choises - Array of choice strings
 * @returns Array of choices with id and title properties
 */
export function createChoisesWithId(choises: string[]): Array<{ id: string; title: string }> {
	return choises.map((choise) => ({
		id: choise,
		title: choise
	}));
}
