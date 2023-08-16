# This is in beta,there will be more info soon.


- [x] Pagination
- [x] Infinitely advanced filtering
- [x] Infinitely advanced sorting
- [x] Main interfaces (map,ENUM picker,date picker...)
- [x] Companion library (auto-gql) 



For now please take a look bellow

## Terminology

QMS means Query/Mutation/Subscription
QMS_body is the payload

## Install

```bash
npm i auto-gql
```

## How To Use

Wrap everything in MainWraper component

```bash
<MainWraper endpointInfoProvided={{url:'https://rickandmortyapi.com/graphql'}}>
  #as many <QMSWraper> </QMSWraper> as you like
  </MainWraper>

  # or you can omit endpointInfoProvided and instead do the bellow (inside MainWraper or inside it's parent),this can be usefull for example when implementing an endpoint picker:
  endpointInfo.smartSet({url:'https://rickandmortyapi.com/graphql'})
  setContext('endpointInfo', endpointInfo);
```

Every QMS must be wraped in QMSWraper component

```bash
const queryName = 'articles'
const columns=[{title:'id',stepsOfFields:['aticles','id']},{title:'author name',stepsOfFields:['aticles','author','name']}]
<QMSWraper QMSName={queryName} tableColsData_StoreInitialValue={columns}>
  # Do your magic here
  </QMSWraper>
```

Now use the stores present in the context

```bash
	const QMS_bodyPartsUnifier_StoreDerived = getContext('QMS_bodyPartsUnifier_StoreDerived');

	QMS_bodyPartsUnifier_StoreDerived.subscribe((QMS_body) => {
    console.log({QMS_body})
  runQuery(QMS_body);
	});
```

```bash
# next page request example
const paginationState = getContext(`paginationState`);

let lastBatchOfDataFetched=queryData?.data
const QMS_name = 'articles'
const QMS_type='query'
paginationState.nextPage(lastBatchOfDataFetched, queryName, QMS_type);
```

```bash
# add column example
const tableColsData_Store = getContext('tableColsData_Store');
const new_tableColData={title:'summary',stepsOfFields:['articles','summary']}
tableColsData_Store.addColumn(new_tableColData)
```

**Also you can get the entire QMSWraperContext,containing everything you need.**

```
const QMSWraperContext= getContext(`${prefix}QMSWraperContext`);

```

# A simple complete example

```bash
# MyArticles.svelte
<script>
const QMS_bodyPartsUnifier_StoreDerived = getContext('QMS_bodyPartsUnifier_StoreDerived');

QMS_bodyPartsUnifier_StoreDerived.subscribe((QMS_body) => {
  console.log({QMS_body})
  ///runQuery(QMS_body);
});
</script>
```

```bash
<script>
import MyArticles from '$lib/MyArticles.svelte'
const queryName = 'articles'
const columns=[{title:'id',stepsOfFields:['aticles','id']},{title:'author name',stepsOfFields:['aticles','author','name']}]
</script>


<MainWraper endpointInfoProvided={{url:'https://rickandmortyapi.com/graphql'}}>
<QMSWraper QMSName={queryName} tableColsData_StoreInitialValue={columns}>
  <MyArticles/>
  </QMSWraper>
  </MainWraper>

```
