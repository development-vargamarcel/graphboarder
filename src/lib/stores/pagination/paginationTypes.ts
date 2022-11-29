import { get } from "svelte/store"

export const paginationTypes = [
    {
        name: 'notAvailable', get_nextPageState: (state, paginationArgs) => {
            console.log('notAvailable')
        }, get_prevPageState: (state, paginationArgs) => {
            console.log('notAvailable')
        }, pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => { return false }, checker: (standsForArray) => {
            return standsForArray.length == 0
        }
    },
    {
        name: 'offsetBased', dynamic: ['offset'], get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
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
        name: 'edgeBased', dynamic: ['after', 'before'], get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
            const afterName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'after' })?.dd_displayName
            const beforeName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'before' })?.dd_displayName
            let _state = JSON.parse(JSON.stringify(state))
            delete _state[afterName]
            delete _state[beforeName]
            return _state
        }, stepsOfFieldsToCursor: ['edges', 'cursor'], pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            const afterName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'after' })?.dd_displayName
            const beforeName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'before' })?.dd_displayName
            return get(_pagination_state_Store)?.[afterName] || get(_pagination_state_Store)?.[beforeName]
        }, checker: (standsForArray) => {
            return standsForArray.includes('first') || standsForArray.includes('last') && standsForArray.includes('after') || standsForArray.includes('before')
        }
    },
    {
        name: 'pageBased', dynamic: ['page'], get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
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