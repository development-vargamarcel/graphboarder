# This is in beta,there will be more info soon.

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
  # your code
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
  # your code
  </QMSWraper>

```

```bsh
	const tableColsData_Store=getContext('tableColsData_Store', tableColsData_Store);

```

Now use the stores in the context

```bash
	const QMS_bodyPartsUnifier_StoreDerived = getContext('QMS_bodyPartsUnifier_StoreDerived');

	QMS_bodyPartsUnifier_StoreDerived.subscribe((QMS_body) => {
  runQuery(QMS_body);
	});

```
