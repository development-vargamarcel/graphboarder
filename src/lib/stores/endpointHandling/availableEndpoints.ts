//!!!  //ALL this will be replaced by database results


import { get } from "svelte/store"
import { testEndpoints_Store } from "$lib/stores/testData/testEndpoints"
const testEndpoints = get(testEndpoints_Store)

export const getAvailableEndpoints = () => {
  return testEndpoints
}
export const getEndpointConfiguration = (endpointId: string) => {
  return testEndpoints.find((endpoint: any) => { return endpoint.url == endpointId })
}