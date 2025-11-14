import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getAvailableEndpoints } from '$lib/stores/endpointHandling/availableEndpoints';

export const GET: RequestHandler = async () => {
  const endpoints = getAvailableEndpoints();
  return json(endpoints);
};