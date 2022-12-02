export const endpointInfo = {
    ei_Names: {
        hasNextPage: "hasNextPage",
        hasPreviousPage: "hasPreviousPage",
        startCursor: "startCursor",//after,nextPage
        endCursor: "endCursor"//before,previousPage
    },
    ei_CursorLocations: {
        startCursorStepsOfFields: (QMS_name) => { return [QMS_name, 'pageInfo', endpointInfo.endpointNames.startCursor] },
        endCursorStepsOfFields: (QMS_name) => { return [QMS_name, 'pageInfo', endpointInfo.endpointNames.endCursor] },
    }
}

