export default interface Monad<T, R> {
  (value: T): R
  do(gen: Generator<R, R, T>): R
}

export default function Monad<T, R>(unit: (value: T) => R, bind: (monad: R, fn: (value: T) => R) => R): Monad<T, R> {
  const obj = function(value: T): R { return unit(value) }
  obj.do = (gen: Generator<R, R, T>): R => {
    let result = gen.next()
    let called = true
    function step(value: T) {
      called = true
      result = gen.next(value)
    }
    while (called && !result.done) {
      called = false
      bind(result.value, step as (value: T) => R)
    }
    return result.value
  }
  return obj
}
