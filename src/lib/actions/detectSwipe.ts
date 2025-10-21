type SwipeEventName = 'swipeleft' | 'swiperight' | 'swipeup' | 'swipedown';

interface SwipeEventDetail {}

/**
 * Detect swipe gestures on a node
 */
export function detectSwipe(node: HTMLElement): { destroy: () => void } {
	// Swipe Up / Down / Left / Right
	let initialX: number | null = null;
	let initialY: number | null = null;
	let initialTime: number | null = null;

	let finalTime: number | null = null;

	let diffX: number | null = null;
	let diffY: number | null = null;
	let duration: number = 0;
	let speedX: number = 0;
	let speedY: number = 0;

	const minSpeed: number = 0.1;

	function touchstart(e: TouchEvent): void {
		initialTime = e.timeStamp;
		initialX = e.touches[0].clientX;
		initialY = e.touches[0].clientY;
	}

	function touchend(e: TouchEvent): void {
		if (diffX === null || diffY === null) {
			return;
		}

		finalTime = e.timeStamp;
		duration = finalTime - (initialTime || 0);

		speedX = Math.abs(diffX / duration);
		speedY = Math.abs(diffY / duration);

		if (Math.abs(diffX) > Math.abs(diffY) && speedX > minSpeed) {
			// sliding horizontally
			if (diffX > 0) {
				// swiped left
				node.dispatchEvent(
					new CustomEvent<SwipeEventDetail>('swipeleft', {
						bubbles: false
					})
				);
			} else {
				// swiped right
				node.dispatchEvent(
					new CustomEvent<SwipeEventDetail>('swiperight', {
						bubbles: false
					})
				);
			}
		} else if (speedY > minSpeed) {
			// sliding vertically
			if (diffY > 0) {
				// swiped up
				node.dispatchEvent(
					new CustomEvent<SwipeEventDetail>('swipeup', {
						bubbles: false
					})
				);
			} else {
				// swiped down
				node.dispatchEvent(
					new CustomEvent<SwipeEventDetail>('swipedown', {
						bubbles: false
					})
				);
			}
		}

		diffX = null;
		diffY = null;
	}

	function touchmove(e: TouchEvent): void {
		if (initialX === null || initialY === null) {
			return;
		}

		const currentX: number = e.touches[0].clientX;
		const currentY: number = e.touches[0].clientY;

		diffX = initialX - currentX;
		diffY = initialY - currentY;

		initialX = null;
		initialY = null;
	}

	document.addEventListener('touchmove', touchmove, { capture: true });
	document.addEventListener('touchend', touchend, { capture: true });
	document.addEventListener('touchstart', touchstart, { capture: true });

	return {
		destroy(): void {
			document.removeEventListener('touchmove', touchmove, { capture: true });
			document.removeEventListener('touchend', touchend, { capture: true });
			document.removeEventListener('touchstart', touchstart, { capture: true });
		}
	};
}
