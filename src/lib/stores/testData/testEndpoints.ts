import { getRootType, get_nodeFieldsQMS_info } from '$lib/utils/usefulFunctions';
import { writable } from 'svelte/store';
import { schemaData } from '$lib/stores/endpointHandling/schemaData';
//TODO:
//idFieldNamePossibilities (id naming convention)
//countLocationPossibilities
let test = [
	{
		url: 'https://7rsm0d0d.directus.app/graphql',
		isMantained: true,
		description: 'offsetBased pagination,rowCount set',
		headers: {
			authorization: 'Bearer aKUvsqBR4-rfnL2z6nqEQmLPRIur4c1m'
		},
		displayNamePossibilitiesForCreateItem: [
			{
				get_Val: (QMS_info) => {
					return `create_${QMS_info.dd_rootName}_item`
				},
				check: (QMS_info) => {
					return true
				}
			},
		]
		,
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				}, //'countDistinct'
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		],
		rowCountLocationPossibilities: [

			{
				get_Val: (QMS_info) => {
					const aggregatedQMS_info = schemaData.get_QMS_Field(
						`${QMS_info.dd_displayName}_aggregated`,
						'query'
					);
					const rootType = getRootType(null, QMS_info.dd_rootName)
					if (!rootType) {
						return null
					}
					const nodeFieldsQMS_info = rootType.fields[0].dd_displayName;
					if (nodeFieldsQMS_info) {
						return [`${QMS_info.dd_displayName}_aggregated`, 'count', nodeFieldsQMS_info];
					}
					return null;
				},
				check: (QMS_info) => {
					return (
						!QMS_info.dd_displayName.toLowerCase().endsWith('aggregated') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('by_id')
					);
				}
			}
		]
	},
	{
		url: 'https://hdfgzkxs.directus.app/graphql',
		isMantained: true,
		description: 'offsetBased pagination,rowCount set',
		headers: {
			authorization: 'Bearer mKZiTQr8DCKMlT3teTi1Xf-3Ml9EKGXh'
		},
		displayNamePossibilitiesForCreateItem: [
			{
				get_Val: (QMS_info) => {
					return `create_${QMS_info.dd_rootName}_item`;
				},
				check: (QMS_info) => {
					return true;
				}
			}
		],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				}, //'countDistinct'
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					const aggregatedQMS_info = schemaData.get_QMS_Field(
						`${QMS_info.dd_displayName}_aggregated`,
						'query'
					);
					const rootType = getRootType(null, QMS_info.dd_rootName);
					if (!rootType) {
						return null;
					}
					const nodeFieldsQMS_info = rootType.fields[0].dd_displayName;
					if (nodeFieldsQMS_info) {
						return [`${QMS_info.dd_displayName}_aggregated`, 'count', nodeFieldsQMS_info];
					}
					return null;
				},
				check: (QMS_info) => {
					return (
						!QMS_info.dd_displayName.toLowerCase().endsWith('aggregated') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('by_id')
					);
				}
			}
		]
	},
	{
		url: 'https://vgqkcskomrpikolllkix.nhost.run/v1/graphql',
		isMantained: true,
		description: 'offsetBased pagination,rowCount set',
		headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			},
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [QMS_info.dd_displayName, 'aggregate', 'count'];
				},
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			},
			{
				get_Val: (QMS_info) => {
					if (schemaData.get_QMS_Field(`${QMS_info.dd_displayName}Aggregate`, 'query')) {
						return [`${QMS_info.dd_displayName}Aggregate`, 'aggregate', 'count'];
					}
					return [`${QMS_info.dd_displayName}_aggregate`, 'aggregate', 'count'];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			}
		]
	},


	{
		url: 'https://api.spacex.land/graphql/',
		isMantained: true,
		description: 'offsetBased pagination,no rowCount avalable',

		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['nodes'];
				},
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		]
	},
	{
		url: 'https://rickandmortyapi.com/graphql',
		isMantained: true,
		description: 'pageBased pagination,rowCount set',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['results'];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [QMS_info.dd_displayName, 'info', 'count'];
				},
				check: (QMS_info) => {
					return (
						QMS_info.dd_displayName.toLowerCase().endsWith('s') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('byids')
					);
				}
			}
		]
	},
	{
		url: 'https://vgqkcskomrpikolllkix.nhost.run/v1beta1/relay',
		isMantained: true,
		description: 'edgeBased pagination,no rowCount avalable',
		headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
		pageInfoFieldsLocation: ['pageInfo'],

		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['edges'];
				},
				check: (QMS_info) => {
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
		isMantained: true,
		description: 'edgeBased pagination,no rowCount avalable',
		pageInfoFieldsLocation: ['pageInfo'],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['edges'];
				},
				check: (QMS_info) => {
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
		isMantained: true,
		description: 'edgeBased pagination,no rowCount avalable',
		pageInfoFieldsLocation: ['pageInfo'],

		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['edges'];
				},
				check: (QMS_info) => {
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
		isMantained: true,
		description: 'edgeBased pagination,rowCount set',
		pageInfoFieldsLocation: ['pageInfo'],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['edges'];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [QMS_info.dd_displayName, 'totalCount'];
				},
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().startsWith('all');
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
		isMantained: false,
		description: 'edgeBased pagination',
		pageInfoFieldsLocation: [],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['data'];
				},
				check: (QMS_info) => {
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
	{
		url: 'https://graphql-camara-deputados.herokuapp.com/',
		isMantained: false,
		description: 'edgeBased pagination'
	},
	{
		url: 'https://countries.trevorblades.com/',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://dex-server.herokuapp.com/',
		isMantained: false,
		description: '?? notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://graphql.anilist.co',
		isMantained: false,
		description: '?? notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql',
		isMantained: false,
		description: '?? notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://etmdb.com/graphql?',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://api.graphql.jobs/',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://demotivation-quotes-api.herokuapp.com/graphql',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://graphql-weather-api.herokuapp.com/',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://fruits-api.netlify.app/graphql',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://graphql-compose.herokuapp.com/northwind/',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://directions-graphql.herokuapp.com/graphql',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://beta.pokeapi.co/graphql/v1beta',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return ['aggregate'];
				},
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		]
	},
	{
		url: 'https://hivdb.stanford.edu/graphql',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://api.react-finland.fi/graphql?',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://graphqlpokemon.favware.tech/',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	},
	{
		url: 'https://graphbrainz.herokuapp.com/?',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		]
	}
];




const stigifyAll = (data) => {
	return JSON.stringify(data, function (key, value) {
		if (typeof value === "function") {
			return "/Function(" + value.toString() + ")/";
		}
		return value;
	});
}



const parseAll = (json) => {
	return JSON.parse(json, function (key, value) {
		if (typeof value === "string" &&
			value.startsWith("/Function(") &&
			value.endsWith(")/")) {
			value = value.substring(10, value.length - 2);
			return (0, eval)("(" + value + ")");
		}
		return value;
	});
}

// test.forEach(element => {
// 	console.log(stigifyAll(element))
// });
// if (typeof document != undefined) {
// 	console.log('TEST ENDPOINTS', parseAll(stigifyAll(test)), typeof document)
// }
export const testEndpoints_Store = writable(test);
