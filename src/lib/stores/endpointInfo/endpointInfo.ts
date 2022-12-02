export const endpointInfo = {
    endpointNames: {
        hasNextPage: "hasNextPage",
        hasPreviousPage: "hasPreviousPage",
        startCursor: "startCursor",//after,nextPage
        endCursor: "endCursor"//before,previousPage
    },
    endpointCursorLocations: {
        startCursorStepsOfFields: (QMS_name) => { return [QMS_name, 'pageInfo', endpointInfo.endpointNames.startCursor] },
        endCursorStepsOfFields: (QMS_name) => { return [QMS_name, 'pageInfo', endpointInfo.endpointNames.endCursor] },
    }
}

