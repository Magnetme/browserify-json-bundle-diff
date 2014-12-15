Generates a diff between two [browserify-json-bundles](https://github.com/Magnetme/browserify-json-bundler). This is part of the browserify-diff toolchain.

## Example
From:
```json
{
	"version" : 1,
	"modules" : {
		"./foo" : ["console.log('foo');",{}],
		"./bar" : ["console.log('bar');",{}]
	},
	"entry" : ["./foo"]
}
```

To:
```json
{
	"version" : 2,
	"modules" : {
		"./foo" : ["console.log('now I print something else');",{}],
		"./baz" : ["console.log('baz');",{}]
	},
	"entry" : ["./baz"]
}
```

Resulting diff:
```json
{
	"from" : 1,
	"to" : 2,
	"modules" : {
		"./foo" : ["console.log('now I print something else');",{}],
		"./bar" : null,
		"./baz" : ["console.log('baz');",{}]
	},
	"entry" : ["./baz"]
}
```

## Methods
`var diff = require('browserify-json-bundle-diff');`

### create(from, to)
Generates a diff between two browserify-json-bundles. It will:
- Put the version of `from` as the value for the `from` key in the diff
- Put the version of `to` as the value for the `to` key in the diff
- Add any module in `to` that is not present in `from` to the `modules` hash
- Add any module in `to` that is not equal to the same module in `from` to the `modules` hash
- Add any module that is present in `from` but not in `to` to the `modules` hash with a value of `null`
- Adds the `entry` from `to` if it is not equal to the `entry` from `from`.

### merge(first, second)
Merges two diffs together. It is required that the second diff is a direct successor of the first diff, that is `first.to === second.from`.
