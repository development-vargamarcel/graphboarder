# this is in beta,there will be mre info soon.

For now please take a look bellow

## terminology

QMS means Query/Mutation/Subscription

## install

```bash
npm i auto-gql
```

## How To Use

First of all provide some information about your endpoint in the "endpointInfo" store using the 'smartSet method'

```bash
endpointInfo.smartSet({url:'https://rickandmortyapi.com/graphql'})
```

Wrap everything in MainWraper component

```bash
	<MainWraper>
  # your code
  </MainWraper>
```

Every QMS must be wraped in QMSWraper component

```bash
	<QMSWraper>
  # your code
  </QMSWraper>

```
