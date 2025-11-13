/**
 * Utility functions for drag-and-drop operations
 */

/**
 * Creates shadow element dimensions and styling
 * @param labelEl - Label element to clone
 * @returns Object with height and width
 */
export function getShadowDimensions(labelEl: HTMLElement | null): { height: number; width: number } {
	if (!labelEl) {
		return { height: 20, width: 20 };
	}

	return {
		height: labelEl.clientHeight,
		width: labelEl.clientWidth
	};
}

/**
 * Updates shadow element with cloned label
 * @param shadowEl - Shadow element to update
 * @param labelEl - Label element to clone
 * @param shadowHeight - Height for shadow element
 * @param shadowWidth - Width for shadow element
 * @returns Cloned element or null
 */
export function updateShadowElement(
	shadowEl: HTMLElement | null,
	labelEl: HTMLElement | null,
	shadowHeight: number,
	shadowWidth: number
): HTMLElement | null {
	if (!shadowEl || !labelEl) {
		return null;
	}

	// Only run once per grab
	if (shadowEl.style.height != '0' && shadowEl.style.height != '') {
		return null;
	}

	shadowEl.style.height = `${shadowHeight + 18}px`;
	shadowEl.style.width = `${shadowWidth}px`;

	const labelElClone = labelEl.cloneNode(true) as HTMLElement;
	labelElClone.classList.remove('dnd-item');
	labelElClone.classList.add('border-2', 'border-accent');

	shadowEl.appendChild(labelElClone);

	return labelElClone;
}

/**
 * Handles drag start event
 * @param event - Mouse or touch event
 * @returns Always returns false (dragDisabled = false)
 */
export function handleDragStart(event?: Event): boolean {
	// Event is optional for preventing default on touch devices
	return false; // Return false to enable dragging
}

/**
 * Handles key down event for drag initiation
 * @param event - Keyboard event
 * @param dragDisabled - Current drag disabled state
 * @returns New drag disabled state
 */
export function handleDragKeyDown(event: KeyboardEvent, dragDisabled: boolean): boolean {
	if ((event.key === 'Enter' || event.key === ' ') && dragDisabled) {
		return false; // Enable dragging
	}
	return dragDisabled; // Keep current state
}

/**
 * Transforms dragged element appearance
 * @param draggedEl - Element being dragged
 * @param accentClasses - Array of accent classes to add
 */
export function transformDraggedElement(
	draggedEl: HTMLElement | null,
	accentClasses: string[] = ['bg-accent/25', 'border-2', 'border-accent']
): void {
	if (!draggedEl) {
		return;
	}

	draggedEl.classList.add(...accentClasses);

	const dndItem = draggedEl.querySelector('.dnd-item');
	if (dndItem) {
		dndItem.classList.add(...accentClasses);
	}
}

/**
 * Handles DnD consider event (during drag)
 * @param items - Updated items array
 * @returns Object to merge into component state
 */
export function handleDndConsider(items: any[]): { items: any[]; dragDisabled: boolean } {
	return {
		items,
		dragDisabled: true
	};
}

/**
 * Handles DnD finalize event (after drop)
 * @param items - Updated items array
 * @param onChanged - Callback to trigger after finalize
 * @returns Object to merge into component state
 */
export function handleDndFinalize(
	items: any[],
	onChanged?: () => void
): { items: any[]; dragDisabled: boolean } {
	if (onChanged) {
		onChanged();
	}

	return {
		items,
		dragDisabled: true
	};
}

/**
 * Handles item deletion from DnD list
 * @param items - Current items array
 * @param itemIdToDelete - ID of item to delete
 * @param onChanged - Callback to trigger after deletion
 * @returns Updated items array
 */
export function handleDeleteItem(
	items: any[],
	itemIdToDelete: string,
	onChanged?: () => void
): any[] {
	const updatedItems = items.filter((item) => item.id !== itemIdToDelete);

	if (onChanged) {
		onChanged();
	}

	return updatedItems;
}
