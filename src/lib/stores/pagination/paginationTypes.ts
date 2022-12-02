import { getColResultData } from "$lib/utils/usefulFunctions"
import { get } from "svelte/store"
import { endpointInfo } from "../endpointInfo/endpointInfo"
//const endpointInfoVal = get(endpointInfo)
//!!!replace pageIsGreaterThenFirst function with an isFirstPage function,and update app everywhere accordingly,not important,only for aesthetics
//to do:
//totalCount()
//hasNextPage()  //rows.length-totalCount()>0

//console.log('asdasdasda', endpointInfo)
export const paginationTypes = [
    {
        name: 'notAvailable', get_initialState: (paginationArgs) => {
            console.log('notAvailable')
        }, get_dependencyColsData: (QMS_name) => {
            return []
        }, get_nextPageState: (state, paginationArgs) => {
            console.log('notAvailable')
        }, get_prevPageState: (state, paginationArgs) => {
            console.log('notAvailable')
        }, pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => { return false }, checker: (standsForArray) => {
            return standsForArray.length == 0
        }
    },
    {
        name: 'offsetBased', dynamic: ['offset'], get_initialState: (paginationArgs) => {
            const offsetName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'offset' })?.dd_displayName
            const limitName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'limit' })?.dd_displayName
            return {
                [limitName]: 20,
                [offsetName]: 0
            }

        }, get_dependencyColsData: (QMS_name) => {
            return []
        }, get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
            const offsetName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'offset' })?.dd_displayName
            const _state = JSON.parse(JSON.stringify(state))
            _state[offsetName] = 0
            return _state
        }, get_nextPageState: (state, paginationArgs) => {
            const offsetName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'offset' })?.dd_displayName
            const limitName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'limit' })?.dd_displayName
            const _state = JSON.parse(JSON.stringify(state))
            _state[offsetName] += _state[limitName]
            return _state
        }, get_prevPageState: (state, paginationArgs) => {
            const offsetName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'offset' })?.dd_displayName
            const limitName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'limit' })?.dd_displayName
            const _state = JSON.parse(JSON.stringify(state))
            _state[offsetName] -= _state[limitName]
            return _state
        }, pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            const offsetName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'offset' })?.dd_displayName
            return get(_pagination_state_Store)?.[offsetName] > 0

        }, checker: (standsForArray) => {
            return standsForArray.includes('limit') && standsForArray.includes('offset')
        }
    },
    {
        name: 'edgeBased', dynamic: ['after', 'before'], get_initialState: (paginationArgs) => {
            const firstName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'first' })?.dd_displayName
            return {
                [firstName]: 20,
            }

        }, get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
            const afterName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'after' })?.dd_displayName
            const beforeName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'before' })?.dd_displayName
            let _state = JSON.parse(JSON.stringify(state))
            delete _state[afterName]
            delete _state[beforeName]
            return _state
        }, get_dependencyColsData: (QMS_name) => {
            //using 'pageInfo' for getting next page cursor,'nextPage' is not a standard,some use another name like 'endCursor' { title: 'nextPageCursor', stepsOfFields: [QMS_name, 'pageInfo', 'nextPage'] }
            const dependencyColsData = []
            const endpointInfoVal = get(endpointInfo)
            const namings = endpointInfoVal?.namings
            if (namings?.hasNextPage) {
                dependencyColsData.push({ title: namings.hasNextPage, hidden: true, stepsOfFields: [QMS_name, 'pageInfo', namings.hasNextPage] })
            }
            if (namings?.hasPreviousPage) {
                dependencyColsData.push({ title: namings.hasPreviousPage, hidden: true, stepsOfFields: [QMS_name, 'pageInfo', namings.hasPreviousPage] })
            }
            if (namings?.startCursor) {
                dependencyColsData.push({ title: namings.startCursor, hidden: true, stepsOfFields: [QMS_name, 'pageInfo', namings.startCursor] })
            }
            if (namings?.endCursor) {
                dependencyColsData.push({ title: namings.endCursor, hidden: true, stepsOfFields: [QMS_name, 'pageInfo', namings.endCursor] })
            }
            if (namings?.cursor) {
                dependencyColsData.push({ title: namings.cursor, stepsOfFields: [QMS_name, 'edges', namings.cursor] })
            }
            console.log({ dependencyColsData })
            return dependencyColsData
        }, get_nextPageState: (state, paginationArgs, currentRows_LastRow, returnedDataBatch_last) => {
            const afterName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'after' })?.dd_displayName
            const stepsOfFieldsToCursor = ['edges', 'cursor']
            const _state = JSON.parse(JSON.stringify(state))
            _state[afterName] = `'${getColResultData(undefined, currentRows_LastRow, stepsOfFieldsToCursor)}'`
            console.log({ _state })
            return _state
        }, get_prevPageState: (state, paginationArgs, currentRows_LastRow, returnedDataBatch_last) => {
            const _state = JSON.parse(JSON.stringify(state))
            return _state
        }, pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            const afterName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'after' })?.dd_displayName
            const beforeName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'before' })?.dd_displayName
            return get(_pagination_state_Store)?.[afterName] || get(_pagination_state_Store)?.[beforeName]
        }, checker: (standsForArray) => {
            return standsForArray.includes('first') || standsForArray.includes('last') && standsForArray.includes('after') || standsForArray.includes('before')
        }
    },
    {
        name: 'pageBased', dynamic: ['page'], get_initialState: (paginationArgs) => {
            const pageName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'page' })?.dd_displayName
            return {
                [pageName]: 1
            }
        }, get_dependencyColsData: (QMS_name) => {
            return []
        }, get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
            const pageName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'page' })?.dd_displayName
            let _state = JSON.parse(JSON.stringify(state))
            _state = { ..._state, [pageName]: 1 }
            return _state
        }, get_nextPageState: (state, paginationArgs) => {
            const pageName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'page' })?.dd_displayName
            const _state = JSON.parse(JSON.stringify(state))
            _state[pageName]++
            return _state
        }, get_prevPageState: (state, paginationArgs) => {
            const pageName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'page' })?.dd_displayName
            const _state = JSON.parse(JSON.stringify(state))
            _state[pageName]--
            return _state
        }, pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            let pageName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'page' })?.dd_displayName
            return get(_pagination_state_Store)?.[pageName] > 1
        }, checker: (standsForArray) => {
            return standsForArray.includes('page')
        }
    }
]