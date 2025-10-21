/**
 * Dispatch event on click outside of node
 */
export function clickOutside(node: HTMLElement): { destroy: () => void } {
	const handleClick = (event: MouseEvent): void => {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside'));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy(): void {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
