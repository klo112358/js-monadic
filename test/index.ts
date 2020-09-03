import Monad from "../src"
import chai, { expect } from "chai"
import chaiThings from "chai-things"

chai.should()
chai.use(chaiThings)

type Option<T> = { some: T } | null

const Option = Monad<any, Option<any>>(
  (v: any) => v === null ? null : { some: v },
  (v: Option<any>, fn: (v: any) => Option<any>): Option<any> => {
    return v === null ? null : fn(v.some)
  }
)

type Result<T, E> = { ok: T } | { error: E }

const Result = Monad<any, Result<any, Error>>(
  (v: any) => v instanceof Error ? { error: v } : { ok: v },
  (v: Result<any, Error>, fn: (v: any) => Result<any, Error>): Result<any, Error> => {
    return "error" in v ? v : fn(v.ok)
  }
)

describe("Test Option", () => {
  it("should return some", () => {
    const val = Option.do(function*() {
      const a: number = yield Option(1)
      const b: number = yield Option(2)
      return Option(a + b)
    }())
    expect(val).is.an("object").and.has.property("some", 3)
  })
  it("should return none", () => {
    const val = Option.do(function*() {
      const a: number = yield Option(1)
      const b: number = yield Option(null)
      return Option(a + b)
    }())
    expect(val).is.null
  })
  it("should return result", () => {
    const val = Result.do(function*() {
      const a: number = yield Result(1)
      const b: number = yield Result(2)
      return Result(a + b)
    }())
    expect(val).is.an("object").and.has.property("ok", 3)
  })
  it("should return error", () => {
    const val = Result.do(function*() {
      const a: number = yield Result(new Error("Bad object"))
      const b: number = yield Result(1)
      return Result(a + b)
    }())
    expect(val).is.an("object").and.has.property("error")
  })
})
