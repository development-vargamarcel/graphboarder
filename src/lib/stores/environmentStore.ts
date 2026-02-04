import { persisted } from 'svelte-persisted-store';
import { Logger } from '../utils/logger';
import { get } from 'svelte/store';

/**
 * Interface representing an environment containing a set of variables.
 */
export interface Environment {
	/** Unique identifier for the environment */
	id: string;
	/** Name of the environment (e.g., "Local", "Production") */
	name: string;
	/** Key-value pairs of variables */
	variables: Record<string, string>;
}

/**
 * Persisted store for the list of environments.
 * Initialized with a default "Global" environment.
 */
export const environmentStore = persisted<Environment[]>('environments', [
	{ id: 'global', name: 'Global', variables: {} }
]);

/**
 * Persisted store for the ID of the currently active environment.
 * Defaults to 'global'.
 */
export const activeEnvironmentIdStore = persisted<string>('activeEnvironmentId', 'global');

/**
 * Creates a new environment.
 * @param name - The name of the new environment
 * @returns The ID of the created environment
 */
export const createEnvironment = (name: string): string => {
	const id = crypto.randomUUID();
	const newEnv: Environment = {
		id,
		name,
		variables: {}
	};
	Logger.debug('Creating environment', newEnv);
	environmentStore.update((envs) => [...envs, newEnv]);
	return id;
};

/**
 * Deletes an environment.
 * Cannot delete the 'global' environment.
 * If the active environment is deleted, switches back to 'global'.
 * @param id - The ID of the environment to delete
 */
export const deleteEnvironment = (id: string) => {
	if (id === 'global') {
		Logger.warn('Cannot delete Global environment');
		return;
	}
	Logger.debug('Deleting environment', { id });
	environmentStore.update((envs) => envs.filter((e) => e.id !== id));

	// If active env was deleted, reset to global
	if (get(activeEnvironmentIdStore) === id) {
		activeEnvironmentIdStore.set('global');
	}
};

/**
 * Updates an environment's properties.
 * @param id - The ID of the environment
 * @param updates - Partial environment object (name, variables)
 */
export const updateEnvironment = (id: string, updates: Partial<Omit<Environment, 'id'>>) => {
	Logger.debug('Updating environment', { id, updates });
	environmentStore.update((envs) =>
		envs.map((e) => (e.id === id ? { ...e, ...updates } : e))
	);
};

/**
 * Sets the active environment.
 * @param id - The ID of the environment to activate
 */
export const setActiveEnvironment = (id: string) => {
	const envs = get(environmentStore);
	if (envs.find((e) => e.id === id)) {
		Logger.debug('Setting active environment', { id });
		activeEnvironmentIdStore.set(id);
	} else {
		Logger.warn('Cannot set active environment: ID not found', { id });
	}
};

/**
 * Gets the currently active environment object.
 * @returns The active Environment object
 */
export const getActiveEnvironment = (): Environment => {
	const envs = get(environmentStore);
	const activeId = get(activeEnvironmentIdStore);
	return envs.find((e) => e.id === activeId) || envs[0];
};
