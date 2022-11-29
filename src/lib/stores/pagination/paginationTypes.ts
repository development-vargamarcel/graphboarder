import { get } from "svelte/store"

export const paginationTypes = [
    {
        name: 'notAvailable', pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => { return false }, checker: (standsForArray) => {
            return standsForArray.length == 0
        }
    },
    {
        name: 'offsetBased', dynamic: ['offset'], pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            let offsetName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'offset' })?.dd_displayName
            return get(_pagination_state_Store)?.[offsetName] > 0

        }, checker: (standsForArray) => {
            return standsForArray.includes('limit') && standsForArray.includes('offset')
        }
    },
    {
        name: 'edgeBased', dynamic: ['after', 'before'], stepsOfFieldsToCursor: ['edges', 'cursor'], pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            let afterName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'after' })?.dd_displayName
            let beforeName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'before' })?.dd_displayName
            return get(_pagination_state_Store)?.[afterName] || get(_pagination_state_Store)?.[beforeName]
        }, checker: (standsForArray) => {
            return standsForArray.includes('first') || standsForArray.includes('last') && standsForArray.includes('after') || standsForArray.includes('before')
        }
    },
    {
        name: 'pageBased', dynamic: ['page'], pageIsGreaterThenFirst: (_pagination_state_Store, paginationArgs) => {
            let pageName = paginationArgs.find((arg) => { return arg.dd_standsFor == 'page' })?.dd_displayName
            return get(_pagination_state_Store)?.[pageName] > 0
        }, checker: (standsForArray) => {
            return standsForArray.includes('page')
        }
    }
]