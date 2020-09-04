import Monad from "../src"
import chai, { expect } from "chai"
import chaiThings from "chai-things"
import chaiPromise from "chai-as-promised"

chai.should()
chai.use(chaiThings)
chai.use(chaiPromise)

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

type Future<T> = Promise<T>

const Future = Monad<any, Future<any>>(
  async (v: any) => Promise.resolve(v),
  async (v: Promise<any>, fn: (v: any) => Promise<any>): Promise<any> => {
    return v.then(fn)
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
  it("should resolve", () => {
    const val = Future.do(function*() {
      const a: number = yield Promise.resolve(1)
      const b: number = yield Promise.resolve(2)
      return Promise.resolve(a + b)
    }())
    expect(val).is.instanceOf(Promise).and.eventually.equal(3)
  })
  it("should reject", () => {
    const val = Future.do(function*() {
      const a: number = yield Promise.resolve(1)
      const b: number = yield Promise.reject("Bad object")
      return Promise.resolve(a + b)
    }())
    expect(val).is.instanceOf(Promise).and.to.be.rejectedWith("Bad object")
  })
})
