import { getRootType, stringToJs } from '$lib/utils/usefulFunctions';

//TODO:
//idFieldNamePossibilities (id naming convention)
//countLocationPossibilities
export const localEndpoints = [
	{
		id: 'directus',
		url: 'https://directus-production-c2de.up.railway.app/graphql',
		isMantained: false,
		description: 'offsetBased pagination,rowCount set',
		headers: {
			authorization: 'Bearer S4YM_Cd7Uo6laJhQV594l59EGZASSmBw'
		},
		displayNamePossibilitiesForCreateItem: [
			{
				get_Val: (QMS_info, schemaData) => {
					return `create_${QMS_info.dd_rootName}_item`
				},
				check: (QMS_info, schemaData) => {
					return true
				}
			},
		]
		,
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				}, //'countDistinct'
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		],
		rowCountLocationPossibilities: [

			{
				get_Val: (QMS_info, schemaData) => {
					const aggregatedQMS_info = schemaData.get_QMS_Field(
						`${QMS_info.dd_displayName}_aggregated`,
						'query'
					);
					const rootType = schemaData.get_rootType(null, QMS_info.dd_rootName, schemaData)
					if (!rootType) {
						return null
					}
					const nodeFieldsQMS_info = rootType.fields[0].dd_displayName;
					if (nodeFieldsQMS_info) {
						return [`${QMS_info.dd_displayName}_aggregated`, 'count', nodeFieldsQMS_info];
					}
					return null;
				},
				check: (QMS_info, schemaData) => {
					return (
						!QMS_info.dd_displayName.toLowerCase().endsWith('aggregated') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('by_id')
					);
				}
			}
		],
		returningColumnsPossibleLocationsInMutations: [[]
		],
		returningColumnsPossibleLocationsInQueriesPerRow: [
			[]
		],
		inputColumnsPossibleLocationsInArg: [
			[]
		]
		,
	},
	{
		id: 'directus2',

		url: 'https://hdfgzkxs.directus.app/graphql',
		isMantained: false,
		description: 'offsetBased pagination,rowCount set',
		headers: {
			authorization: 'Bearer mKZiTQr8DCKMlT3teTi1Xf-3Ml9EKGXh'
		},
		displayNamePossibilitiesForCreateItem: [
			{
				get_Val: (QMS_info, schemaData) => {
					return `create_${QMS_info.dd_rootName}_item`;
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				}, //'countDistinct'
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					const aggregatedQMS_info = schemaData.get_QMS_Field(
						`${QMS_info.dd_displayName}_aggregated`,
						'query'
					);
					const rootType = schemaData.get_rootType(null, QMS_info.dd_rootName, schemaData);
					if (!rootType) {
						return null;
					}
					const nodeFieldsQMS_info = rootType.fields[0].dd_displayName;
					if (nodeFieldsQMS_info) {
						return [`${QMS_info.dd_displayName}_aggregated`, 'count', nodeFieldsQMS_info];
					}
					return null;
				},
				check: (QMS_info, schemaData) => {
					return (
						!QMS_info.dd_displayName.toLowerCase().endsWith('aggregated') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('by_id')
					);
				}
			}
		],
		returningColumnsPossibleLocationsInMutations: [[]
		],
		returningColumnsPossibleLocationsInQueriesPerRow: [
			[]
		],
		inputColumnsPossibleLocationsInArg: [
			[]
		]
		,
	},
	{
		id: 'nhost',
		url: 'https://mtupwwndtaxgboomfjim.hasura.eu-central-1.nhost.run/v1/graphql',
		isMantained: true,
		description: 'offsetBased pagination,rowCount set',
		headers: { 'x-hasura-admin-secret': ',v!)R06aVMCPsY:xL&es$q0PSMYe1g)!' },
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			}
		],
		returningColumnsPossibleLocationsInMutations: [
			['returning'], []
		],
		returningColumnsPossibleLocationsInQueriesPerRow: [
			[]
		],
		inputColumnsPossibleLocationsInArg: [
			['data']
		]
		,
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [QMS_info.dd_displayName, 'aggregate', 'count'];
				},
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					if (schemaData.get_QMS_Field(`${QMS_info.dd_displayName}Aggregate`, 'query')) {
						return [`${QMS_info.dd_displayName}Aggregate`, 'aggregate', 'count'];
					}
					return [`${QMS_info.dd_displayName}_aggregate`, 'aggregate', 'count'];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			}
		]
	},


	{
		id: 'spacex',

		url: 'https://api.spacex.land/graphql/',
		isMantained: false,
		description: 'offsetBased pagination,no rowCount avalable',

		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['nodes'];
				},
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		]
	},
	{
		id: 'rickandmortyapi',

		url: 'https://rickandmortyapi.com/graphql',
		isMantained: false,
		description: 'pageBased pagination,rowCount set',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['results'];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [QMS_info.dd_displayName, 'info', 'count'];
				},
				check: (QMS_info, schemaData) => {
					return (
						QMS_info.dd_displayName.toLowerCase().endsWith('s') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('byids')
					);
				}
			}
		]
	},
	{
		id: 'nhostRelay',

		url: 'https://mtupwwndtaxgboomfjim.hasura.eu-central-1.nhost.run/v1beta1/relay',
		isMantained: true,
		description: 'edgeBased pagination,no rowCount avalable',
		headers: { 'x-hasura-admin-secret': ',v!)R06aVMCPsY:xL&es$q0PSMYe1g)!' },
		pageInfoFieldsLocation: ['pageInfo'],
		returningColumnsPossibleLocationsInMutations: [
			['returning'], []
		],
		returningColumnsPossibleLocationsInQueriesPerRow: [
			['node'], []
		],
		inputColumnsPossibleLocationsInArg: [
			['data']
		]
		,
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['edges'];
				},
				check: (QMS_info, schemaData) => {
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
		,
		idDecoderPossibilities: [
			{
				get_Val: (QMS_info, schemaData, id) => {
					let array = stringToJs(atob(id))
					return array[array.length - 1]
				},
				check: (QMS_info, schemaData) => { return true }
			},
		],
	},
	{
		id: 'supabase',
		url: 'https://bdpktzyqszaqnlbushhk.supabase.co/graphql/v1',
		isMantained: false,
		description: 'offset based pagination,no rowCount avalable',
		headers: { 'apiKey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcGt0enlxc3phcW5sYnVzaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NDg1ODcsImV4cCI6MjAyNTEyNDU4N30.ADkneNGSwCcLgtKSdQuMOd0P5dN6ZZ1FFNnjgQaid44' },
		pageInfoFieldsLocation: ['pageInfo'],
		returningColumnsPossibleLocationsInMutations: [
			['records'], []
		],
		returningColumnsPossibleLocationsInQueriesPerRow: [
			['node'], []
		],
		inputColumnsPossibleLocationsInArg: [
			['data']
		]
		,
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['edges'];
				},
				check: (QMS_info, schemaData) => {
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
		,
		idDecoderPossibilities: [
			{
				get_Val: (QMS_info, schemaData, id) => {
					return id
				},
				check: (QMS_info, schemaData) => { return true }
			},
		],
	},
	{
		id: 'ehri-project',

		url: 'https://portal.ehri-project.eu/api/graphql',
		isMantained: false,
		description: 'edgeBased pagination,no rowCount avalable',
		pageInfoFieldsLocation: ['pageInfo'],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['edges'];
				},
				check: (QMS_info, schemaData) => {
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
		id: 'gitlab',

		url: 'https://gitlab.com/api/graphql',
		isMantained: false,
		description: 'edgeBased pagination,no rowCount avalable',
		pageInfoFieldsLocation: ['pageInfo'],

		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['edges'];
				},
				check: (QMS_info, schemaData) => {
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
		id: 'swapi-graphql',

		url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
		authToken: '',
		isMantained: false,
		description: 'edgeBased pagination,rowCount set',
		pageInfoFieldsLocation: ['pageInfo'],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['edges'];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [QMS_info.dd_displayName, 'totalCount'];
				},
				check: (QMS_info, schemaData) => {
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
		id: 'fauna',

		url: 'https://graphql.fauna.com/graphql',
		isMantained: false,
		description: 'edgeBased pagination',
		pageInfoFieldsLocation: [],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['data'];
				},
				check: (QMS_info, schemaData) => {
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
		id: 'camera-deputados',

		url: 'https://graphql-camara-deputados.herokuapp.com/',
		isMantained: false,
		description: 'edgeBased pagination'
	},
	{
		id: 'countries',

		url: 'https://countries.trevorblades.com/',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'dex-server',

		url: 'https://dex-server.herokuapp.com/',
		isMantained: false,
		description: '?? notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'anilist',

		url: 'https://graphql.anilist.co',
		isMantained: false,
		description: '?? notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'digitransit',

		url: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql',
		isMantained: false,
		description: '?? notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'etmdb',

		url: 'https://etmdb.com/graphql?',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'api.graphql.jobs',

		url: 'https://api.graphql.jobs/',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'demotion-quotes-api',

		url: 'https://demotivation-quotes-api.herokuapp.com/graphql',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'weather-api',

		url: 'https://graphql-weather-api.herokuapp.com/',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'fruits-api',

		url: 'https://fruits-api.netlify.app/graphql',
		isMantained: false,
		description: 'notAvailable pagination',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'composeNrthwind',

		url: 'https://graphql-compose.herokuapp.com/northwind/',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'directions-graphql',

		url: 'https://directions-graphql.herokuapp.com/graphql',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'pokeapi',

		url: 'https://beta.pokeapi.co/graphql/v1beta',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return ['aggregate'];
				},
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		]
	},
	{
		id: 'hivdb',

		url: 'https://hivdb.stanford.edu/graphql',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'react-finland',

		url: 'https://api.react-finland.fi/graphql?',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'favware-graphql-pokemon',

		url: 'https://graphqlpokemon.favware.tech/',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	},
	{
		id: 'graphbrainz',

		url: 'https://graphbrainz.herokuapp.com/?',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return true;
				}
			}
		]
	}
];

// {
// 	url: 'https://hdfgzkxs.directus.app/graphql',
// 		isMantained: false,
// 			description: 'offsetBased pagination,rowCount set',
// 				headers: {
// 		authorization: 'Bearer mKZiTQr8DCKMlT3teTi1Xf-3Ml9EKGXh'
// 	},
// 	displayNamePossibilitiesForCreateItem: [
// 		{
// 			get_Val: (QMS_info,schemaData) => {
// 				return `create_${QMS_info.dd_rootName}_item`;
// 			},
// 			check: (QMS_info,schemaData) => {
// 				return true;
// 			}
// 		}
// 	],
// 		rowsLocationPossibilities: [
// 			{
// 				get_Val: (QMS_info,schemaData) => {
// 					return [];
// 				}, //'countDistinct'
// 				check: (QMS_info,schemaData) => {
// 					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
// 				}
// 			},
// 			{
// 				get_Val: (QMS_info,schemaData) => {
// 					return [];
// 				},
// 				check: (QMS_info,schemaData) => {
// 					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
// 				}
// 			}
// 		],
// 			rowCountLocationPossibilities: [
// 				{
// 					get_Val: (QMS_info, schemaData) => {
// 						const rootType = schemaData.get_rootType(null, QMS_info.dd_rootName, schemaData);
// 						if (!rootType) {
// 							return null;
// 						}
// 						const nodeFieldsQMS_info = rootType.fields[0].dd_displayName;
// 						if (nodeFieldsQMS_info) {
// 							return [`${QMS_info.dd_displayName}_aggregated`, 'count', nodeFieldsQMS_info];
// 						}
// 						return null;
// 					},
// 					check: (QMS_info,schemaData) => {
// 						return (
// 							!QMS_info.dd_displayName.toLowerCase().endsWith('aggregated') &&
// 							!QMS_info.dd_displayName.toLowerCase().endsWith('by_id')
// 						);
// 					}
// 				}
// 			]
// };



export const stigifyAll = (data) => {
	return JSON.stringify(data, function (key, value) {
		if (typeof value === "function") {
			return "/Function(" + value.toString() + ")/";
		}
		return value;
	});
}



export const parseAll = (json) => {
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
//export const testEndpoints_Store = writable(test);
