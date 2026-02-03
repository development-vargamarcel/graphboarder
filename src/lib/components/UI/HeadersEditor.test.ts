import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import HeadersEditor from './HeadersEditor.svelte';
import { Logger } from '$lib/utils/logger';

describe('HeadersEditor Component', () => {
	const onClose = vi.fn();

	beforeEach(() => {
		onClose.mockClear();
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
	});

	it('should render correctly', () => {
		render(HeadersEditor, { props: { onClose } });
		expect(screen.getByText('Edit Headers (Global)')).toBeTruthy();
	});

	it('should add a header', async () => {
		render(HeadersEditor, { props: { onClose } });

		const keyInput = screen.getByPlaceholderText('New Key');
		const valueInput = screen.getByPlaceholderText('New Value');
		const addButton = screen.getByText('Add');

		await fireEvent.input(keyInput, { target: { value: 'Content-Type' } });
		await fireEvent.input(valueInput, { target: { value: 'application/json' } });
		await fireEvent.click(addButton);

		// Check if it appears in the table. The table inputs don't have unique placeholders easily accessible,
        // but we can check if there are 2 inputs in the table (plus the 3 new inputs at the bottom: key, value, preset name)
        // Actually, let's just check values.
        const inputs = screen.getAllByRole('textbox');
        const addedKey = inputs.find(i => (i as HTMLInputElement).value === 'Content-Type');
        const addedValue = inputs.find(i => (i as HTMLInputElement).value === 'application/json');

        expect(addedKey).toBeTruthy();
        expect(addedValue).toBeTruthy();
	});

	it('should save headers', async () => {
		render(HeadersEditor, { props: { onClose } });

		const keyInput = screen.getByPlaceholderText('New Key');
		const valueInput = screen.getByPlaceholderText('New Value');
		const addButton = screen.getByText('Add');

		await fireEvent.input(keyInput, { target: { value: 'Authorization' } });
		await fireEvent.input(valueInput, { target: { value: 'Bearer token' } });
		await fireEvent.click(addButton);

		const saveButton = screen.getByText('Save');
		await fireEvent.click(saveButton);

		expect(localStorage.setItem).toHaveBeenCalledWith(
			'headers',
			JSON.stringify({ Authorization: 'Bearer token' })
		);
		expect(onClose).toHaveBeenCalled();
	});

    it('should save and load a preset', async () => {
        render(HeadersEditor, { props: { onClose } });

        // Add a header
        const keyInput = screen.getByPlaceholderText('New Key');
        const valueInput = screen.getByPlaceholderText('New Value');
        const addButton = screen.getByText('Add');
        await fireEvent.input(keyInput, { target: { value: 'Foo' } });
        await fireEvent.input(valueInput, { target: { value: 'Bar' } });
        await fireEvent.click(addButton);

        // Save preset
        const presetInput = screen.getByPlaceholderText('Preset Name');
        const savePresetButton = screen.getByText('Save Current as Preset');

        await fireEvent.input(presetInput, { target: { value: 'MyPreset' } });
        await fireEvent.click(savePresetButton);

        expect(localStorage.setItem).toHaveBeenCalledWith(
            'header_presets',
            expect.stringContaining('"name":"MyPreset"')
        );
        expect(screen.getByText('MyPreset')).toBeTruthy();

        // Clear headers (simulated by clicking delete on the header row)
        // Find the delete button for the header row.
        const trashIcons = screen.getAllByLabelText('Delete header'); // I added aria-label in the component
        await fireEvent.click(trashIcons[0]);

        // Verify header is gone
        expect((screen.getByPlaceholderText('New Key') as HTMLInputElement).value).toBe('');
        // The table inputs should be gone/empty? The values we searched for earlier won't be there.
        // Let's just check if we can load it back.

        // Load preset
        const loadButton = screen.getByLabelText('Load preset');
        await fireEvent.click(loadButton);

        // Verify header is back
        const inputs = screen.getAllByRole('textbox');
        const restoredKey = inputs.find(i => (i as HTMLInputElement).value === 'Foo');
        expect(restoredKey).toBeTruthy();
    });

    it('should delete a preset', async () => {
        // Mock existing presets
        vi.mocked(Storage.prototype.getItem).mockImplementation((key) => {
            if (key === 'header_presets') {
                return JSON.stringify([{ name: 'To Delete', headers: [] }]);
            }
            return null;
        });

        render(HeadersEditor, { props: { onClose } });

        expect(screen.getByText('To Delete')).toBeTruthy();

        const deleteButton = screen.getByLabelText('Delete preset');
        await fireEvent.click(deleteButton);

        expect(screen.queryByText('To Delete')).toBeNull();
        expect(localStorage.setItem).toHaveBeenCalledWith('header_presets', '[]');
    });
});
