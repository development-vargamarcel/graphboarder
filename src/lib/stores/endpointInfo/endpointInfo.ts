import { writable } from "svelte/store"

export const example_endpointInfo = {
    url: 'https://vgqkcskomrpikolllkix.nhost.run/v1beta1/relay',
    description: 'edgeBased pagination',
    headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
    naming: {
        hasNextPage: "hasNextPage",
        hasPreviousPage: "hasPreviousPage",
        startCursor: "startCursor",//after,nextPage
        endCursor: "endCursor"//before,previousPage
    },
    cursorLocations: {//StepsOfFields
        get_startCursor: (QMS_name) => { return [QMS_name, 'pageInfo', example_endpointInfo.naming.startCursor] },
        get_endCursor: (QMS_name) => { return [QMS_name, 'pageInfo', example_endpointInfo.naming.endCursor] },
    }
}
export const Create_endpointInfo = (startingValue = example_endpointInfo) => {
    const { subscribe, set, update } = writable(startingValue)
    return { subscribe, set, update }

}
