export default interface Monad<T, R> {
  (value: T): R
  do(gen: Generator<R, R, T>): R
}

export default function Monad<T, R>(unit: (value: T) => R, bind: (monad: R, fn: (value: T) => R) => R): Monad<T, R> {
  const obj = function(value: T): R { return unit(value) }
  obj.do = (gen: Generator<R, R, T>): R => {
    function step(value?: T) {
      const result = gen.next(value as T)
      if (result.done) {
        return result.value
      }
      return bind(result.value, step)
    }
    return step()
  }
  return obj
}
