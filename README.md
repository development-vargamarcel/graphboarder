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

First of all provide some information about your endpoint in the "endpointInfo" store using the 'smartSet method' and set it to the context

```bash
endpointInfo.smartSet({url:'https://rickandmortyapi.com/graphql'})
# and set it to the context
setContext('endpointInfo', endpointInfo);
```

Wrap everything in MainWraper component

```bash
	<MainWraper endpointInfoProvided={{url:'https://rickandmortyapi.com/graphql'}}>
  # your code
  </MainWraper>

  # or you can omit endpointInfoProvided and instead to the bellow,this can be usefull for example when implementing an endpoint picker:
  endpointInfo.smartSet({url:'https://rickandmortyapi.com/graphql'})
  setContext('endpointInfo', endpointInfo);
```

Every QMS must be wraped in QMSWraper component

```bash
const queryName = 'articles'

	<QMSWraper QMSName={queryName}>
  # your code
  </QMSWraper>

```

Now use the stores in the context

```bash
	const QMS_bodyPartsUnifier_StoreDerived = getContext('QMS_bodyPartsUnifier_StoreDerived');

	QMS_bodyPartsUnifier_StoreDerived.subscribe((QMS_body) => {
  runQuery(QMS_body);
	});

```
