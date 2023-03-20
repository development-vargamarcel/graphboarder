<script lang="ts">
	import type monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { parseAll, stigifyAll } from '$lib/stores/testData/testEndpoints';
	import { createEventDispatcher, getContext } from 'svelte';

	export let displayInterface;
	export let rawValue;
	const dispatch = createEventDispatcher();

	//let castAs //most of the times as string
	const mutationVersion = getContext('mutationVersion');
	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;
	const configuration = {
		description: 'no description',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		],
		rowCountLocationPossibilities: [],
		namings: {
			hasNextPage: 'hasNextPage',
			hasPreviousPage: 'hasPreviousPage',
			startCursor: 'previousPage',
			endCursor: 'nextPage',
			cursor: 'cursor'
		},
		paginationArgsPossibleNames: {
			limit: ['limit'],
			offset: ['offset', 'skip'],
			first: ['first', '_size'],
			last: ['last'],
			after: ['after', '_cursor'],
			before: ['before'],
			from: ['from'],
			page: ['page']
		},
		idFieldPossibilities: [
			{
				get_Val: function (QMS_info, schemaData) {
					return this.check(QMS_info, schemaData);
				},
				check: (QMS_info, schemaData) => {
					const rootType = getRootType(null, QMS_info.dd_rootName, schemaData);
					const fields = rootType?.fields;
					let idField;
					const { scalarFields, non_scalarFields, enumFields } = getFields_Grouped(
						rootType,
						[],
						schemaData
					);
					const nonNullScalarFields = scalarFields.filter((field) => {
						return field.dd_NON_NULL;
					});
					if (nonNullScalarFields.length == 1) {
						return nonNullScalarFields[0];
					}

					const tableNameLowercase = QMS_info.dd_displayName.toLowerCase();
					let possibleNames = ['id', tableNameLowercase + '_id', tableNameLowercase + 'id'];
					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase();
						return possibleNames.includes(fieldDisplayNameLowercase) || field.dd_rootName == 'ID';
					});
					if (idField) {
						return idField;
					}

					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase();
						return tableNameLowercase.includes(fieldDisplayNameLowercase);
					});
					if (idField) {
						return idField;
					}
					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase();
						return fieldDisplayNameLowercase.includes(tableNameLowercase);
					});
					if (idField) {
						return idField;
					}
					console.warn('id field is one of these', { nonNullScalarFields });
				}
			}
		],
		typesExtraDataPossibilities: [
			{
				get_Val: () => {
					return {
						displayInterface: 'text',
						defaultValue: '',
						get_convertedValue: string_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('string') || dd_rootNameLowerCase.includes('text');
				}
			},
			{
				get_Val: () => {
					return { displayInterface: 'datetime-local', get_convertedValue: ISO8601_transformer };
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return (
						dd_rootNameLowerCase.includes('timestamp') ||
						dd_rootNameLowerCase.replace('update', '').includes('date') ||
						dd_rootNameLowerCase.includes('time')
					);
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'number',
						defaultValue: null,
						get_convertedValue: (value) => {
							return value;
						}
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return (
						dd_rootNameLowerCase.replace('constraint', '').includes('int') ||
						dd_rootNameLowerCase.includes('float')
					);
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'geo',
						defaultValue: null,
						get_convertedValue: geojson_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('geo');
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'boolean',
						defaultValue: true,
						get_convertedValue: boolean_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('bool');
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'ENUM',
						defaultValue: null,
						get_convertedValue: (val) => {
							return val;
						}
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return (
						dd_rootNameLowerCase.includes('enum') || dd_rootNameLowerCase.includes('constraint')
					);
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: null,
						defaultValue: null,
						get_convertedValue: (val) => {
							return val;
						}
					};
				},
				check: function (dd_rootName) {
					//	console.warn('no typesExtraDataPossibility found,using the default one')
					return true;
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'codeeditor',
						defaultValue: '',
						get_convertedValue: string_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('configuration');
				}
			}
		]
	};

	const configurationAsString = `const configuration = {
		description: 'no description',
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return true;
				}
			}
		],
		rowCountLocationPossibilities: [],
		namings: {
			hasNextPage: 'hasNextPage',
			hasPreviousPage: 'hasPreviousPage',
			startCursor: 'previousPage',
			endCursor: 'nextPage',
			cursor: 'cursor'
		},
		paginationArgsPossibleNames: {
			limit: ['limit'],
			offset: ['offset', 'skip'],
			first: ['first', '_size'],
			last: ['last'],
			after: ['after', '_cursor'],
			before: ['before'],
			from: ['from'],
			page: ['page']
		},
		idFieldPossibilities: [
			{
				get_Val: function (QMS_info, schemaData) {
					return this.check(QMS_info, schemaData);
				},
				check: (QMS_info, schemaData) => {
					const rootType = getRootType(null, QMS_info.dd_rootName, schemaData);
					const fields = rootType?.fields;
					let idField;
					const { scalarFields, non_scalarFields, enumFields } = getFields_Grouped(
						rootType,
						[],
						schemaData
					);
					const nonNullScalarFields = scalarFields.filter((field) => {
						return field.dd_NON_NULL;
					});
					if (nonNullScalarFields.length == 1) {
						return nonNullScalarFields[0];
					}

					const tableNameLowercase = QMS_info.dd_displayName.toLowerCase();
					let possibleNames = ['id', tableNameLowercase + '_id', tableNameLowercase + 'id'];
					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase();
						return possibleNames.includes(fieldDisplayNameLowercase) || field.dd_rootName == 'ID';
					});
					if (idField) {
						return idField;
					}

					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase();
						return tableNameLowercase.includes(fieldDisplayNameLowercase);
					});
					if (idField) {
						return idField;
					}
					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase();
						return fieldDisplayNameLowercase.includes(tableNameLowercase);
					});
					if (idField) {
						return idField;
					}
					console.warn('id field is one of these', { nonNullScalarFields });
				}
			}
		],
		typesExtraDataPossibilities: [
			{
				get_Val: () => {
					return {
						displayInterface: 'text',
						defaultValue: '',
						get_convertedValue: string_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('string') || dd_rootNameLowerCase.includes('text');
				}
			},
			{
				get_Val: () => {
					return { displayInterface: 'datetime-local', get_convertedValue: ISO8601_transformer };
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return (
						dd_rootNameLowerCase.includes('timestamp') ||
						dd_rootNameLowerCase.replace('update', '').includes('date') ||
						dd_rootNameLowerCase.includes('time')
					);
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'number',
						defaultValue: null,
						get_convertedValue: (value) => {
							return value;
						}
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return (
						dd_rootNameLowerCase.replace('constraint', '').includes('int') ||
						dd_rootNameLowerCase.includes('float')
					);
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'geo',
						defaultValue: null,
						get_convertedValue: geojson_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('geo');
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'boolean',
						defaultValue: true,
						get_convertedValue: boolean_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('bool');
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'ENUM',
						defaultValue: null,
						get_convertedValue: (val) => {
							return val;
						}
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return (
						dd_rootNameLowerCase.includes('enum') || dd_rootNameLowerCase.includes('constraint')
					);
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: null,
						defaultValue: null,
						get_convertedValue: (val) => {
							return val;
						}
					};
				},
				check: function (dd_rootName) {
					//	console.warn('no typesExtraDataPossibility found,using the default one')
					return true;
				}
			},
			{
				get_Val: () => {
					return {
						displayInterface: 'codeeditor',
						defaultValue: '',
						get_convertedValue: string_transformer
					};
				},
				check: function (dd_rootName) {
					if (!dd_rootName) {
						return null;
					}
					const dd_rootNameLowerCase = dd_rootName.toLowerCase();
					return dd_rootNameLowerCase.includes('configuration');
				}
			}
		]
	}`;
	console.log({ configurationAsString });
	onMount(async () => {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(divEl, {
			value: configurationAsString,
			language: 'javascript',
			lineNumbers: 'on',
			roundedSelection: false,
			scrollBeyondLastLine: false,
			readOnly: false,
			theme: 'vs-dark',
			tabSize: 2,
			formatOnType: true
		});
		editor.onDidChangeModelContent(function (e) {
			//	console.log('changed');
		});

		return () => {
			editor.dispose();
		};
	});
	const stringToJs = (string) => {
		if (string.includes('/Function')) {
			return parseAll(string);
		}
		return new Function(`return ${string}`)();
	};
</script>

<div class="flex flex-col">
	<div class="overflow-hidden rounded-box">
		<div bind:this={divEl} class="h-max min-h-[180px]   aspect-video rounded-box" />
	</div>
	<div class="flex flex-row-reverse mt-2">
		<button
			class="btn btn-primary btn-xs normal-case ml-2"
			on:click={() => {
				const editorValue = editor.getValue();
				console.log({ editorValue });
				const firstCurlyBraces = editorValue.indexOf('{');
				const lastCurlyBraces = editorValue.lastIndexOf('}');
				const editorValueCleaned = editorValue.substring(firstCurlyBraces, lastCurlyBraces + 1);
				console.log({ editorValueCleaned });

				// const editorValueAsJs = stringToJs(editorValueCleaned);
				// console.log({ editorValueAsJs });
				dispatch('changed', {
					chd_chosen: undefined,
					chd_needsValue: true,
					chd_needsChosen: false,
					chd_rawValue: btoa(editorValueCleaned)
				}); //chd_ == chosen data sdasd ss
			}}>save</button
		>
	</div>
</div>
