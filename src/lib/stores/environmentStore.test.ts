import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	environmentStore,
	activeEnvironmentIdStore,
	createEnvironment,
	deleteEnvironment,
	updateEnvironment,
	setActiveEnvironment,
	getActiveEnvironment
} from './environmentStore';

describe('environmentStore', () => {
	beforeEach(() => {
		// Reset stores manually since they are singletons
		// Note: Persistent stores might retain data in localStorage mock between tests if not cleared.
		localStorage.clear();
		environmentStore.set([{ id: 'global', name: 'Global', variables: {} }]);
		activeEnvironmentIdStore.set('global');
	});

	it('should create environment', () => {
		const id = createEnvironment('Test Env');
		const envs = get(environmentStore);
		expect(envs.length).toBe(2);
		expect(envs[1].name).toBe('Test Env');
		expect(envs[1].id).toBe(id);
	});

	it('should delete environment', () => {
		const id = createEnvironment('To Delete');
		deleteEnvironment(id);
		const envs = get(environmentStore);
		expect(envs.length).toBe(1);
	});

	it('should not delete global environment', () => {
		deleteEnvironment('global');
		const envs = get(environmentStore);
		expect(envs.length).toBe(1);
		expect(envs[0].id).toBe('global');
	});

	it('should update environment', () => {
		const id = createEnvironment('To Update');
		updateEnvironment(id, { name: 'Updated', variables: { foo: 'bar' } });
		const envs = get(environmentStore);
		expect(envs[1].name).toBe('Updated');
		expect(envs[1].variables.foo).toBe('bar');
	});

	it('should set active environment', () => {
		const id = createEnvironment('Active');
		setActiveEnvironment(id);
		expect(get(activeEnvironmentIdStore)).toBe(id);
		const active = getActiveEnvironment();
		expect(active.id).toBe(id);
	});

	it('should reset active to global if deleted', () => {
		const id = createEnvironment('Active');
		setActiveEnvironment(id);
		deleteEnvironment(id);
		expect(get(activeEnvironmentIdStore)).toBe('global');
	});
});
