# js-monadic

Monad with do notation in Javascript, using ES6 generators.

## Installing

Using npm:

```bash
$ npm install js-monadic
```

Using yarn:

```bash
$ yarn add js-monadic
```

Using unpkg CDN:

```html
<script src="https://unpkg.com/js-monadic/umd/js-monadic.min.js"></script>
```

## Usage

```js
const Monad = require('js-monadic')

// Unit/Return function of the monad
function unit(v) {
    // ...
}

// Bind function of the monad
function bind(v, f) {
    // ...
}

const MyMonad = Monad(unit, bind)

// Same as calling unit(...)
const val = MyMonad(/* ... */)

MyMonad.do(function*() {
    const foo = yield MyMonad(/* ... */)
    // ...
}())

```

## Example

### Option / Maybe

```js
// type Option<T> = { some: T } | null
const Option = Monad(
  (value) => value === null ? null : { some: value },
  (option, fn) => option === null ? null : fn(option.some)
)

const foo = Option.do(function*() {
    const a = yield Option(1) // a = 1
    const b = yield Option(2) // b = 2
    const c = yield Option(3) // c = 3
    return Option(a + b + c)
}())
// foo = { some: 6 }

const bar = Option.do(function*() {
    const a = yield Option(1)     // a = 1
    const b = yield Option(null)
    // will not reach here at all because the function in
    // the second argument of "bind" was not called when
    // evaluating Option(null), therefore the chain stops here
    const c = yield Option(3)
    return Option(a + b + c)
}())
// bar = null
```

### Result / Either

```js
// type Result<T> = { ok: T } | { error: Error }
const Result = Monad(
  (value) => value instanceof Error ? { error: value } : { ok: value },
  (result, fn) => 'error' in result ? result : fn(result.ok)
)

const foo = Result.do(function*() {
    const a = yield Result(1) // a = 1
    const b = yield Result(2) // b = 2
    return Result(a + b)
}())
// foo = { ok: 3 }

const bar = Result.do(function*() {
    const a = yield Result(1) // a = 1
    const b = yield Result(new Error('Bad object'))
    // will not reach here
    return Result(a + b)
}())
// bar = { error: Error('Bad object') }
```

### Promise

```js
// type Future<T> = Promise<T>
const Future = Monad(
  (value) => Promsie.resolve(value),
  (result, fn) => result.then(fn)
)

const foo = Future.do(function*() {
    const a = yield Promise.resolve(1) // a = 1
    const b = yield Promise.resolve(2) // b = 2
    return Promise.resolve(a + b)
}())
// foo = Promise { 3 }

const bar = Future.do(function*() {
    const a = yield Promise.resolve(1) // a = 1
    const b = yield Promise.reject('Bad object')
    // will not reach here
    return Promise.resolve(a + b)
}())
// bar = Promise { <rejected> 'Bad object' }
```
