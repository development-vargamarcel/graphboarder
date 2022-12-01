
export const endpointNames = {
    hasNextPage: "hasNextPage",
    hasPreviousPage: "hasPreviousPage",
    startCursor: "startCursor",//after,nextPage
    endCursor: "endCursor"//before,previousPage
}
export const endpointCursorLocations = {
    startCursorStepsOfFields: (QMS_name) => { return [QMS_name, 'pageInfo', endpointNames.startCursor] },
    endCursorStepsOfFields: (QMS_name) => { return [QMS_name, 'pageInfo', endpointNames.endCursor] },
}