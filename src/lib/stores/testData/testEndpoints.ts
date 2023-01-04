import { writable } from "svelte/store";
//TODO:
//idFieldNamePossibilities (id naming convention)
//countLocationPossibilities
let test = [
    {
        url: 'https://vgqkcskomrpikolllkix.nhost.run/v1/graphql',
        description: 'offsetBased pagination',
        headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
        rowsLocationPossibilities: [
            {
                rowsLocation: ['aggregate'],
                check: (QMS_Info) => {
                    return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            },
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            }
        ],
        rowCountLocationPossibilities: [
            {
                get_Val: (QMS_Info) => {
                    return [QMS_Info.dd_displayName, 'aggregate', 'count'];
                },
                check: (QMS_Info) => {
                    return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregate');
                }
            },
            {
                get_Val: (QMS_Info) => {
                    return [`${QMS_Info.dd_displayName}Aggregate`, 'aggregate', 'count'];
                },
                check: (QMS_Info) => {
                    return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregate');
                }
            }
        ]
    },

    {
        url: 'https://7rsm0d0d.directus.app/graphql',
        description: 'offsetBased pagination',
        headers: {
            authorization: 'Bearer aKUvsqBR4-rfnL2z6nqEQmLPRIur4c1m'
        },
        rowsLocationPossibilities: [
            {
                rowsLocation: [], //'countDistinct'
                check: (QMS_Info) => {
                    return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            },
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            }
        ]
    },
    {
        url: 'https://api.spacex.land/graphql/',
        description: 'offsetBased pagination',

        rowsLocationPossibilities: [
            {
                rowsLocation: ['nodes'],
                check: (QMS_Info) => {
                    return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            },
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            }
        ]
    },
    {
        url: 'https://rickandmortyapi.com/graphql',
        description: 'pageBased pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: ['results'],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://vgqkcskomrpikolllkix.nhost.run/v1beta1/relay',
        description: 'edgeBased pagination',
        headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
        pageInfoFieldsLocation: ['pageInfo'],

        rowsLocationPossibilities: [
            {
                rowsLocation: ['edges'],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ],
        namings: {
            hasNextPage: 'hasNextPage',
            hasPreviousPage: 'hasPreviousPage',
            startCursor: 'startCursor',
            endCursor: 'endCursor',
            cursor: 'cursor'
        }
    },
    {
        url: 'https://portal.ehri-project.eu/api/graphql',
        description: 'edgeBased pagination',
        pageInfoFieldsLocation: ['pageInfo'],
        rowsLocationPossibilities: [
            {
                rowsLocation: ['edges'],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ],
        namings: {
            hasNextPage: 'hasNextPage',
            hasPreviousPage: 'hasPreviousPage',
            startCursor: 'previousPage',
            endCursor: 'nextPage',
            cursor: 'cursor'
        }
    },
    {
        url: 'https://gitlab.com/api/graphql',
        description: 'edgeBased pagination',
        pageInfoFieldsLocation: ['pageInfo'],

        rowsLocationPossibilities: [
            {
                rowsLocation: ['edges'],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ],
        namings: {
            hasNextPage: 'hasNextPage',
            hasPreviousPage: 'hasPreviousPage',
            startCursor: 'startCursor',
            endCursor: 'endCursor',
            cursor: 'cursor'
        }
    },
    {
        url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
        authToken: '',
        description: 'edgeBased pagination',
        pageInfoFieldsLocation: ['pageInfo'],
        rowsLocationPossibilities: [
            {
                rowsLocation: ['edges'],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ],
        namings: {
            hasNextPage: 'hasNextPage',
            hasPreviousPage: 'hasPreviousPage',
            startCursor: 'startCursor',
            endCursor: 'endCursor',
            cursor: 'cursor'
        }
    },
    {
        url: 'https://graphql.fauna.com/graphql',
        description: 'edgeBased pagination',
        pageInfoFieldsLocation: [],
        rowsLocationPossibilities: [
            {
                rowsLocation: ['data'],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ],
        namings: {
            startCursor: 'after',
            endCursor: 'before'
        },
        headers: {
            authorization: 'Basic Zm5BRFFVdWNRb0FDQ1VpZDAxeXVIdWt2SnptaVY4STI4a2R6Y0p2UDo='
        }
    },
    { url: 'https://graphql-camara-deputados.herokuapp.com/', description: 'edgeBased pagination' },
    {
        url: 'https://countries.trevorblades.com/',
        description: 'notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://dex-server.herokuapp.com/',
        description: '?? notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://graphql.anilist.co',
        description: '?? notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql',
        description: '?? notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://etmdb.com/graphql?',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://api.graphql.jobs/',
        description: 'notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://demotivation-quotes-api.herokuapp.com/graphql',
        description: 'notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://graphql-weather-api.herokuapp.com/',
        description: 'notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://fruits-api.netlify.app/graphql',
        description: 'notAvailable pagination',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://graphql-compose.herokuapp.com/northwind/',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://directions-graphql.herokuapp.com/graphql',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://beta.pokeapi.co/graphql/v1beta',
        rowsLocationPossibilities: [
            {
                rowsLocation: ['aggregate'],
                check: (QMS_Info) => {
                    return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            },
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
                }
            }
        ]
    },
    {
        url: 'https://hivdb.stanford.edu/graphql',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://api.react-finland.fi/graphql?',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://graphqlpokemon.favware.tech/',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    },
    {
        url: 'https://graphbrainz.herokuapp.com/?',
        rowsLocationPossibilities: [
            {
                rowsLocation: [],
                check: (QMS_Info) => {
                    return true;
                }
            }
        ]
    }
];

export const testEndpoints_Store = writable(test)