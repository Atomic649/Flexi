
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Member
 * 
 */
export type Member = $Result.DefaultSelection<Prisma.$MemberPayload>
/**
 * Model BusinessAcc
 * 
 */
export type BusinessAcc = $Result.DefaultSelection<Prisma.$BusinessAccPayload>
/**
 * Model Office
 * 
 */
export type Office = $Result.DefaultSelection<Prisma.$OfficePayload>
/**
 * Model Coach
 * 
 */
export type Coach = $Result.DefaultSelection<Prisma.$CoachPayload>
/**
 * Model Bank
 * 
 */
export type Bank = $Result.DefaultSelection<Prisma.$BankPayload>
/**
 * Model Agency
 * 
 */
export type Agency = $Result.DefaultSelection<Prisma.$AgencyPayload>
/**
 * Model Orm
 * 
 */
export type Orm = $Result.DefaultSelection<Prisma.$OrmPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Category: {
  Office: 'Office',
  Coach: 'Coach',
  Bank: 'Bank',
  Agency: 'Agency',
  Account: 'Account',
  Orm: 'Orm'
};

export type Category = (typeof Category)[keyof typeof Category]

}

export type Category = $Enums.Category

export const Category: typeof $Enums.Category

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.member`: Exposes CRUD operations for the **Member** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Members
    * const members = await prisma.member.findMany()
    * ```
    */
  get member(): Prisma.MemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.businessAcc`: Exposes CRUD operations for the **BusinessAcc** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BusinessAccs
    * const businessAccs = await prisma.businessAcc.findMany()
    * ```
    */
  get businessAcc(): Prisma.BusinessAccDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.office`: Exposes CRUD operations for the **Office** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Offices
    * const offices = await prisma.office.findMany()
    * ```
    */
  get office(): Prisma.OfficeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.coach`: Exposes CRUD operations for the **Coach** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Coaches
    * const coaches = await prisma.coach.findMany()
    * ```
    */
  get coach(): Prisma.CoachDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bank`: Exposes CRUD operations for the **Bank** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Banks
    * const banks = await prisma.bank.findMany()
    * ```
    */
  get bank(): Prisma.BankDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agency`: Exposes CRUD operations for the **Agency** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agencies
    * const agencies = await prisma.agency.findMany()
    * ```
    */
  get agency(): Prisma.AgencyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orm`: Exposes CRUD operations for the **Orm** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orms
    * const orms = await prisma.orm.findMany()
    * ```
    */
  get orm(): Prisma.OrmDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Member: 'Member',
    BusinessAcc: 'BusinessAcc',
    Office: 'Office',
    Coach: 'Coach',
    Bank: 'Bank',
    Agency: 'Agency',
    Orm: 'Orm'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "member" | "businessAcc" | "office" | "coach" | "bank" | "agency" | "orm"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Member: {
        payload: Prisma.$MemberPayload<ExtArgs>
        fields: Prisma.MemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          findFirst: {
            args: Prisma.MemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          findMany: {
            args: Prisma.MemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>[]
          }
          create: {
            args: Prisma.MemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          createMany: {
            args: Prisma.MemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>[]
          }
          delete: {
            args: Prisma.MemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          update: {
            args: Prisma.MemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          deleteMany: {
            args: Prisma.MemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>[]
          }
          upsert: {
            args: Prisma.MemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberPayload>
          }
          aggregate: {
            args: Prisma.MemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMember>
          }
          groupBy: {
            args: Prisma.MemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemberCountArgs<ExtArgs>
            result: $Utils.Optional<MemberCountAggregateOutputType> | number
          }
        }
      }
      BusinessAcc: {
        payload: Prisma.$BusinessAccPayload<ExtArgs>
        fields: Prisma.BusinessAccFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BusinessAccFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BusinessAccFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>
          }
          findFirst: {
            args: Prisma.BusinessAccFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BusinessAccFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>
          }
          findMany: {
            args: Prisma.BusinessAccFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>[]
          }
          create: {
            args: Prisma.BusinessAccCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>
          }
          createMany: {
            args: Prisma.BusinessAccCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BusinessAccCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>[]
          }
          delete: {
            args: Prisma.BusinessAccDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>
          }
          update: {
            args: Prisma.BusinessAccUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>
          }
          deleteMany: {
            args: Prisma.BusinessAccDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BusinessAccUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BusinessAccUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>[]
          }
          upsert: {
            args: Prisma.BusinessAccUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusinessAccPayload>
          }
          aggregate: {
            args: Prisma.BusinessAccAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBusinessAcc>
          }
          groupBy: {
            args: Prisma.BusinessAccGroupByArgs<ExtArgs>
            result: $Utils.Optional<BusinessAccGroupByOutputType>[]
          }
          count: {
            args: Prisma.BusinessAccCountArgs<ExtArgs>
            result: $Utils.Optional<BusinessAccCountAggregateOutputType> | number
          }
        }
      }
      Office: {
        payload: Prisma.$OfficePayload<ExtArgs>
        fields: Prisma.OfficeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OfficeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OfficeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>
          }
          findFirst: {
            args: Prisma.OfficeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OfficeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>
          }
          findMany: {
            args: Prisma.OfficeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>[]
          }
          create: {
            args: Prisma.OfficeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>
          }
          createMany: {
            args: Prisma.OfficeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OfficeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>[]
          }
          delete: {
            args: Prisma.OfficeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>
          }
          update: {
            args: Prisma.OfficeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>
          }
          deleteMany: {
            args: Prisma.OfficeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OfficeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OfficeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>[]
          }
          upsert: {
            args: Prisma.OfficeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OfficePayload>
          }
          aggregate: {
            args: Prisma.OfficeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOffice>
          }
          groupBy: {
            args: Prisma.OfficeGroupByArgs<ExtArgs>
            result: $Utils.Optional<OfficeGroupByOutputType>[]
          }
          count: {
            args: Prisma.OfficeCountArgs<ExtArgs>
            result: $Utils.Optional<OfficeCountAggregateOutputType> | number
          }
        }
      }
      Coach: {
        payload: Prisma.$CoachPayload<ExtArgs>
        fields: Prisma.CoachFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CoachFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CoachFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>
          }
          findFirst: {
            args: Prisma.CoachFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CoachFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>
          }
          findMany: {
            args: Prisma.CoachFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>[]
          }
          create: {
            args: Prisma.CoachCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>
          }
          createMany: {
            args: Prisma.CoachCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CoachCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>[]
          }
          delete: {
            args: Prisma.CoachDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>
          }
          update: {
            args: Prisma.CoachUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>
          }
          deleteMany: {
            args: Prisma.CoachDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CoachUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CoachUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>[]
          }
          upsert: {
            args: Prisma.CoachUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CoachPayload>
          }
          aggregate: {
            args: Prisma.CoachAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCoach>
          }
          groupBy: {
            args: Prisma.CoachGroupByArgs<ExtArgs>
            result: $Utils.Optional<CoachGroupByOutputType>[]
          }
          count: {
            args: Prisma.CoachCountArgs<ExtArgs>
            result: $Utils.Optional<CoachCountAggregateOutputType> | number
          }
        }
      }
      Bank: {
        payload: Prisma.$BankPayload<ExtArgs>
        fields: Prisma.BankFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BankFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BankFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          findFirst: {
            args: Prisma.BankFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BankFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          findMany: {
            args: Prisma.BankFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>[]
          }
          create: {
            args: Prisma.BankCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          createMany: {
            args: Prisma.BankCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BankCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>[]
          }
          delete: {
            args: Prisma.BankDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          update: {
            args: Prisma.BankUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          deleteMany: {
            args: Prisma.BankDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BankUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BankUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>[]
          }
          upsert: {
            args: Prisma.BankUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BankPayload>
          }
          aggregate: {
            args: Prisma.BankAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBank>
          }
          groupBy: {
            args: Prisma.BankGroupByArgs<ExtArgs>
            result: $Utils.Optional<BankGroupByOutputType>[]
          }
          count: {
            args: Prisma.BankCountArgs<ExtArgs>
            result: $Utils.Optional<BankCountAggregateOutputType> | number
          }
        }
      }
      Agency: {
        payload: Prisma.$AgencyPayload<ExtArgs>
        fields: Prisma.AgencyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgencyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgencyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          findFirst: {
            args: Prisma.AgencyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgencyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          findMany: {
            args: Prisma.AgencyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>[]
          }
          create: {
            args: Prisma.AgencyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          createMany: {
            args: Prisma.AgencyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgencyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>[]
          }
          delete: {
            args: Prisma.AgencyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          update: {
            args: Prisma.AgencyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          deleteMany: {
            args: Prisma.AgencyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgencyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgencyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>[]
          }
          upsert: {
            args: Prisma.AgencyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgencyPayload>
          }
          aggregate: {
            args: Prisma.AgencyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgency>
          }
          groupBy: {
            args: Prisma.AgencyGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgencyGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgencyCountArgs<ExtArgs>
            result: $Utils.Optional<AgencyCountAggregateOutputType> | number
          }
        }
      }
      Orm: {
        payload: Prisma.$OrmPayload<ExtArgs>
        fields: Prisma.OrmFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrmFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrmFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>
          }
          findFirst: {
            args: Prisma.OrmFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrmFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>
          }
          findMany: {
            args: Prisma.OrmFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>[]
          }
          create: {
            args: Prisma.OrmCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>
          }
          createMany: {
            args: Prisma.OrmCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrmCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>[]
          }
          delete: {
            args: Prisma.OrmDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>
          }
          update: {
            args: Prisma.OrmUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>
          }
          deleteMany: {
            args: Prisma.OrmDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrmUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrmUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>[]
          }
          upsert: {
            args: Prisma.OrmUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrmPayload>
          }
          aggregate: {
            args: Prisma.OrmAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrm>
          }
          groupBy: {
            args: Prisma.OrmGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrmGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrmCountArgs<ExtArgs>
            result: $Utils.Optional<OrmCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    member?: MemberOmit
    businessAcc?: BusinessAccOmit
    office?: OfficeOmit
    coach?: CoachOmit
    bank?: BankOmit
    agency?: AgencyOmit
    orm?: OrmOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    Business: number
    member: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Business?: boolean | UserCountOutputTypeCountBusinessArgs
    member?: boolean | UserCountOutputTypeCountMemberArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBusinessArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BusinessAccWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMemberArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberWhereInput
  }


  /**
   * Count Type MemberCountOutputType
   */

  export type MemberCountOutputType = {
    office: number
    coach: number
    bank: number
    agency: number
    orm: number
  }

  export type MemberCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    office?: boolean | MemberCountOutputTypeCountOfficeArgs
    coach?: boolean | MemberCountOutputTypeCountCoachArgs
    bank?: boolean | MemberCountOutputTypeCountBankArgs
    agency?: boolean | MemberCountOutputTypeCountAgencyArgs
    orm?: boolean | MemberCountOutputTypeCountOrmArgs
  }

  // Custom InputTypes
  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberCountOutputType
     */
    select?: MemberCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountOfficeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OfficeWhereInput
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountCoachArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoachWhereInput
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountBankArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankWhereInput
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountAgencyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgencyWhereInput
  }

  /**
   * MemberCountOutputType without action
   */
  export type MemberCountOutputTypeCountOrmArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrmWhereInput
  }


  /**
   * Count Type BusinessAccCountOutputType
   */

  export type BusinessAccCountOutputType = {
    AllMember: number
    Office: number
    Coach: number
    Bank: number
    Agency: number
    Orm: number
  }

  export type BusinessAccCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    AllMember?: boolean | BusinessAccCountOutputTypeCountAllMemberArgs
    Office?: boolean | BusinessAccCountOutputTypeCountOfficeArgs
    Coach?: boolean | BusinessAccCountOutputTypeCountCoachArgs
    Bank?: boolean | BusinessAccCountOutputTypeCountBankArgs
    Agency?: boolean | BusinessAccCountOutputTypeCountAgencyArgs
    Orm?: boolean | BusinessAccCountOutputTypeCountOrmArgs
  }

  // Custom InputTypes
  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAccCountOutputType
     */
    select?: BusinessAccCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeCountAllMemberArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberWhereInput
  }

  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeCountOfficeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OfficeWhereInput
  }

  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeCountCoachArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoachWhereInput
  }

  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeCountBankArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankWhereInput
  }

  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeCountAgencyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgencyWhereInput
  }

  /**
   * BusinessAccCountOutputType without action
   */
  export type BusinessAccCountOutputTypeCountOrmArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrmWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    firstName: string | null
    lastName: string | null
    avatar: string | null
    createdAt: Date | null
    updatedAt: Date | null
    phone: string | null
    username: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    firstName: string | null
    lastName: string | null
    avatar: string | null
    createdAt: Date | null
    updatedAt: Date | null
    phone: string | null
    username: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    firstName: number
    lastName: number
    avatar: number
    createdAt: number
    updatedAt: number
    phone: number
    username: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    firstName?: true
    lastName?: true
    avatar?: true
    createdAt?: true
    updatedAt?: true
    phone?: true
    username?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    firstName?: true
    lastName?: true
    avatar?: true
    createdAt?: true
    updatedAt?: true
    phone?: true
    username?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    firstName?: true
    lastName?: true
    avatar?: true
    createdAt?: true
    updatedAt?: true
    phone?: true
    username?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    email: string
    password: string
    firstName: string
    lastName: string
    avatar: string | null
    createdAt: Date
    updatedAt: Date
    phone: string
    username: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    avatar?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phone?: boolean
    username?: boolean
    Business?: boolean | User$BusinessArgs<ExtArgs>
    member?: boolean | User$memberArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    avatar?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phone?: boolean
    username?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    avatar?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phone?: boolean
    username?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    firstName?: boolean
    lastName?: boolean
    avatar?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    phone?: boolean
    username?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "firstName" | "lastName" | "avatar" | "createdAt" | "updatedAt" | "phone" | "username", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Business?: boolean | User$BusinessArgs<ExtArgs>
    member?: boolean | User$memberArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      Business: Prisma.$BusinessAccPayload<ExtArgs>[]
      member: Prisma.$MemberPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      email: string
      password: string
      firstName: string
      lastName: string
      avatar: string | null
      createdAt: Date
      updatedAt: Date
      phone: string
      username: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Business<T extends User$BusinessArgs<ExtArgs> = {}>(args?: Subset<T, User$BusinessArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    member<T extends User$memberArgs<ExtArgs> = {}>(args?: Subset<T, User$memberArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly avatar: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly phone: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.Business
   */
  export type User$BusinessArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    where?: BusinessAccWhereInput
    orderBy?: BusinessAccOrderByWithRelationInput | BusinessAccOrderByWithRelationInput[]
    cursor?: BusinessAccWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BusinessAccScalarFieldEnum | BusinessAccScalarFieldEnum[]
  }

  /**
   * User.member
   */
  export type User$memberArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    where?: MemberWhereInput
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    cursor?: MemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Member
   */

  export type AggregateMember = {
    _count: MemberCountAggregateOutputType | null
    _avg: MemberAvgAggregateOutputType | null
    _sum: MemberSumAggregateOutputType | null
    _min: MemberMinAggregateOutputType | null
    _max: MemberMaxAggregateOutputType | null
  }

  export type MemberAvgAggregateOutputType = {
    userId: number | null
    businessId: number | null
  }

  export type MemberSumAggregateOutputType = {
    userId: number | null
    businessId: number | null
  }

  export type MemberMinAggregateOutputType = {
    uniqueId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    businessId: number | null
  }

  export type MemberMaxAggregateOutputType = {
    uniqueId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: number | null
    businessId: number | null
  }

  export type MemberCountAggregateOutputType = {
    uniqueId: number
    createdAt: number
    updatedAt: number
    userId: number
    businessId: number
    _all: number
  }


  export type MemberAvgAggregateInputType = {
    userId?: true
    businessId?: true
  }

  export type MemberSumAggregateInputType = {
    userId?: true
    businessId?: true
  }

  export type MemberMinAggregateInputType = {
    uniqueId?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    businessId?: true
  }

  export type MemberMaxAggregateInputType = {
    uniqueId?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    businessId?: true
  }

  export type MemberCountAggregateInputType = {
    uniqueId?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    businessId?: true
    _all?: true
  }

  export type MemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Member to aggregate.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Members
    **/
    _count?: true | MemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MemberAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MemberSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemberMaxAggregateInputType
  }

  export type GetMemberAggregateType<T extends MemberAggregateArgs> = {
        [P in keyof T & keyof AggregateMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMember[P]>
      : GetScalarType<T[P], AggregateMember[P]>
  }




  export type MemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberWhereInput
    orderBy?: MemberOrderByWithAggregationInput | MemberOrderByWithAggregationInput[]
    by: MemberScalarFieldEnum[] | MemberScalarFieldEnum
    having?: MemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemberCountAggregateInputType | true
    _avg?: MemberAvgAggregateInputType
    _sum?: MemberSumAggregateInputType
    _min?: MemberMinAggregateInputType
    _max?: MemberMaxAggregateInputType
  }

  export type MemberGroupByOutputType = {
    uniqueId: string
    createdAt: Date
    updatedAt: Date
    userId: number
    businessId: number | null
    _count: MemberCountAggregateOutputType | null
    _avg: MemberAvgAggregateOutputType | null
    _sum: MemberSumAggregateOutputType | null
    _min: MemberMinAggregateOutputType | null
    _max: MemberMaxAggregateOutputType | null
  }

  type GetMemberGroupByPayload<T extends MemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemberGroupByOutputType[P]>
            : GetScalarType<T[P], MemberGroupByOutputType[P]>
        }
      >
    >


  export type MemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    uniqueId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    businessId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    business?: boolean | Member$businessArgs<ExtArgs>
    office?: boolean | Member$officeArgs<ExtArgs>
    coach?: boolean | Member$coachArgs<ExtArgs>
    bank?: boolean | Member$bankArgs<ExtArgs>
    agency?: boolean | Member$agencyArgs<ExtArgs>
    orm?: boolean | Member$ormArgs<ExtArgs>
    _count?: boolean | MemberCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["member"]>

  export type MemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    uniqueId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    businessId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    business?: boolean | Member$businessArgs<ExtArgs>
  }, ExtArgs["result"]["member"]>

  export type MemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    uniqueId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    businessId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    business?: boolean | Member$businessArgs<ExtArgs>
  }, ExtArgs["result"]["member"]>

  export type MemberSelectScalar = {
    uniqueId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    businessId?: boolean
  }

  export type MemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"uniqueId" | "createdAt" | "updatedAt" | "userId" | "businessId", ExtArgs["result"]["member"]>
  export type MemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    business?: boolean | Member$businessArgs<ExtArgs>
    office?: boolean | Member$officeArgs<ExtArgs>
    coach?: boolean | Member$coachArgs<ExtArgs>
    bank?: boolean | Member$bankArgs<ExtArgs>
    agency?: boolean | Member$agencyArgs<ExtArgs>
    orm?: boolean | Member$ormArgs<ExtArgs>
    _count?: boolean | MemberCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    business?: boolean | Member$businessArgs<ExtArgs>
  }
  export type MemberIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    business?: boolean | Member$businessArgs<ExtArgs>
  }

  export type $MemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Member"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      business: Prisma.$BusinessAccPayload<ExtArgs> | null
      office: Prisma.$OfficePayload<ExtArgs>[]
      coach: Prisma.$CoachPayload<ExtArgs>[]
      bank: Prisma.$BankPayload<ExtArgs>[]
      agency: Prisma.$AgencyPayload<ExtArgs>[]
      orm: Prisma.$OrmPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      uniqueId: string
      createdAt: Date
      updatedAt: Date
      userId: number
      businessId: number | null
    }, ExtArgs["result"]["member"]>
    composites: {}
  }

  type MemberGetPayload<S extends boolean | null | undefined | MemberDefaultArgs> = $Result.GetResult<Prisma.$MemberPayload, S>

  type MemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemberCountAggregateInputType | true
    }

  export interface MemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Member'], meta: { name: 'Member' } }
    /**
     * Find zero or one Member that matches the filter.
     * @param {MemberFindUniqueArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemberFindUniqueArgs>(args: SelectSubset<T, MemberFindUniqueArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Member that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemberFindUniqueOrThrowArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemberFindUniqueOrThrowArgs>(args: SelectSubset<T, MemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Member that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberFindFirstArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemberFindFirstArgs>(args?: SelectSubset<T, MemberFindFirstArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Member that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberFindFirstOrThrowArgs} args - Arguments to find a Member
     * @example
     * // Get one Member
     * const member = await prisma.member.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemberFindFirstOrThrowArgs>(args?: SelectSubset<T, MemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Members that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Members
     * const members = await prisma.member.findMany()
     * 
     * // Get first 10 Members
     * const members = await prisma.member.findMany({ take: 10 })
     * 
     * // Only select the `uniqueId`
     * const memberWithUniqueIdOnly = await prisma.member.findMany({ select: { uniqueId: true } })
     * 
     */
    findMany<T extends MemberFindManyArgs>(args?: SelectSubset<T, MemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Member.
     * @param {MemberCreateArgs} args - Arguments to create a Member.
     * @example
     * // Create one Member
     * const Member = await prisma.member.create({
     *   data: {
     *     // ... data to create a Member
     *   }
     * })
     * 
     */
    create<T extends MemberCreateArgs>(args: SelectSubset<T, MemberCreateArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Members.
     * @param {MemberCreateManyArgs} args - Arguments to create many Members.
     * @example
     * // Create many Members
     * const member = await prisma.member.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemberCreateManyArgs>(args?: SelectSubset<T, MemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Members and returns the data saved in the database.
     * @param {MemberCreateManyAndReturnArgs} args - Arguments to create many Members.
     * @example
     * // Create many Members
     * const member = await prisma.member.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Members and only return the `uniqueId`
     * const memberWithUniqueIdOnly = await prisma.member.createManyAndReturn({
     *   select: { uniqueId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemberCreateManyAndReturnArgs>(args?: SelectSubset<T, MemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Member.
     * @param {MemberDeleteArgs} args - Arguments to delete one Member.
     * @example
     * // Delete one Member
     * const Member = await prisma.member.delete({
     *   where: {
     *     // ... filter to delete one Member
     *   }
     * })
     * 
     */
    delete<T extends MemberDeleteArgs>(args: SelectSubset<T, MemberDeleteArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Member.
     * @param {MemberUpdateArgs} args - Arguments to update one Member.
     * @example
     * // Update one Member
     * const member = await prisma.member.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemberUpdateArgs>(args: SelectSubset<T, MemberUpdateArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Members.
     * @param {MemberDeleteManyArgs} args - Arguments to filter Members to delete.
     * @example
     * // Delete a few Members
     * const { count } = await prisma.member.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemberDeleteManyArgs>(args?: SelectSubset<T, MemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Members.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Members
     * const member = await prisma.member.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemberUpdateManyArgs>(args: SelectSubset<T, MemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Members and returns the data updated in the database.
     * @param {MemberUpdateManyAndReturnArgs} args - Arguments to update many Members.
     * @example
     * // Update many Members
     * const member = await prisma.member.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Members and only return the `uniqueId`
     * const memberWithUniqueIdOnly = await prisma.member.updateManyAndReturn({
     *   select: { uniqueId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MemberUpdateManyAndReturnArgs>(args: SelectSubset<T, MemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Member.
     * @param {MemberUpsertArgs} args - Arguments to update or create a Member.
     * @example
     * // Update or create a Member
     * const member = await prisma.member.upsert({
     *   create: {
     *     // ... data to create a Member
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Member we want to update
     *   }
     * })
     */
    upsert<T extends MemberUpsertArgs>(args: SelectSubset<T, MemberUpsertArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Members.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberCountArgs} args - Arguments to filter Members to count.
     * @example
     * // Count the number of Members
     * const count = await prisma.member.count({
     *   where: {
     *     // ... the filter for the Members we want to count
     *   }
     * })
    **/
    count<T extends MemberCountArgs>(
      args?: Subset<T, MemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Member.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MemberAggregateArgs>(args: Subset<T, MemberAggregateArgs>): Prisma.PrismaPromise<GetMemberAggregateType<T>>

    /**
     * Group by Member.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemberGroupByArgs['orderBy'] }
        : { orderBy?: MemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Member model
   */
  readonly fields: MemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Member.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    business<T extends Member$businessArgs<ExtArgs> = {}>(args?: Subset<T, Member$businessArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    office<T extends Member$officeArgs<ExtArgs> = {}>(args?: Subset<T, Member$officeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    coach<T extends Member$coachArgs<ExtArgs> = {}>(args?: Subset<T, Member$coachArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    bank<T extends Member$bankArgs<ExtArgs> = {}>(args?: Subset<T, Member$bankArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    agency<T extends Member$agencyArgs<ExtArgs> = {}>(args?: Subset<T, Member$agencyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    orm<T extends Member$ormArgs<ExtArgs> = {}>(args?: Subset<T, Member$ormArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Member model
   */
  interface MemberFieldRefs {
    readonly uniqueId: FieldRef<"Member", 'String'>
    readonly createdAt: FieldRef<"Member", 'DateTime'>
    readonly updatedAt: FieldRef<"Member", 'DateTime'>
    readonly userId: FieldRef<"Member", 'Int'>
    readonly businessId: FieldRef<"Member", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Member findUnique
   */
  export type MemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member findUniqueOrThrow
   */
  export type MemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member findFirst
   */
  export type MemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Members.
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Members.
     */
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * Member findFirstOrThrow
   */
  export type MemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Member to fetch.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Members.
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Members.
     */
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * Member findMany
   */
  export type MemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter, which Members to fetch.
     */
    where?: MemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Members to fetch.
     */
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Members.
     */
    cursor?: MemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Members from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Members.
     */
    skip?: number
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * Member create
   */
  export type MemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * The data needed to create a Member.
     */
    data: XOR<MemberCreateInput, MemberUncheckedCreateInput>
  }

  /**
   * Member createMany
   */
  export type MemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Members.
     */
    data: MemberCreateManyInput | MemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Member createManyAndReturn
   */
  export type MemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * The data used to create many Members.
     */
    data: MemberCreateManyInput | MemberCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Member update
   */
  export type MemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * The data needed to update a Member.
     */
    data: XOR<MemberUpdateInput, MemberUncheckedUpdateInput>
    /**
     * Choose, which Member to update.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member updateMany
   */
  export type MemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Members.
     */
    data: XOR<MemberUpdateManyMutationInput, MemberUncheckedUpdateManyInput>
    /**
     * Filter which Members to update
     */
    where?: MemberWhereInput
    /**
     * Limit how many Members to update.
     */
    limit?: number
  }

  /**
   * Member updateManyAndReturn
   */
  export type MemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * The data used to update Members.
     */
    data: XOR<MemberUpdateManyMutationInput, MemberUncheckedUpdateManyInput>
    /**
     * Filter which Members to update
     */
    where?: MemberWhereInput
    /**
     * Limit how many Members to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Member upsert
   */
  export type MemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * The filter to search for the Member to update in case it exists.
     */
    where: MemberWhereUniqueInput
    /**
     * In case the Member found by the `where` argument doesn't exist, create a new Member with this data.
     */
    create: XOR<MemberCreateInput, MemberUncheckedCreateInput>
    /**
     * In case the Member was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemberUpdateInput, MemberUncheckedUpdateInput>
  }

  /**
   * Member delete
   */
  export type MemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    /**
     * Filter which Member to delete.
     */
    where: MemberWhereUniqueInput
  }

  /**
   * Member deleteMany
   */
  export type MemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Members to delete
     */
    where?: MemberWhereInput
    /**
     * Limit how many Members to delete.
     */
    limit?: number
  }

  /**
   * Member.business
   */
  export type Member$businessArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    where?: BusinessAccWhereInput
  }

  /**
   * Member.office
   */
  export type Member$officeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    where?: OfficeWhereInput
    orderBy?: OfficeOrderByWithRelationInput | OfficeOrderByWithRelationInput[]
    cursor?: OfficeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OfficeScalarFieldEnum | OfficeScalarFieldEnum[]
  }

  /**
   * Member.coach
   */
  export type Member$coachArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    where?: CoachWhereInput
    orderBy?: CoachOrderByWithRelationInput | CoachOrderByWithRelationInput[]
    cursor?: CoachWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CoachScalarFieldEnum | CoachScalarFieldEnum[]
  }

  /**
   * Member.bank
   */
  export type Member$bankArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    where?: BankWhereInput
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    cursor?: BankWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Member.agency
   */
  export type Member$agencyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    where?: AgencyWhereInput
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    cursor?: AgencyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Member.orm
   */
  export type Member$ormArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    where?: OrmWhereInput
    orderBy?: OrmOrderByWithRelationInput | OrmOrderByWithRelationInput[]
    cursor?: OrmWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrmScalarFieldEnum | OrmScalarFieldEnum[]
  }

  /**
   * Member without action
   */
  export type MemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
  }


  /**
   * Model BusinessAcc
   */

  export type AggregateBusinessAcc = {
    _count: BusinessAccCountAggregateOutputType | null
    _avg: BusinessAccAvgAggregateOutputType | null
    _sum: BusinessAccSumAggregateOutputType | null
    _min: BusinessAccMinAggregateOutputType | null
    _max: BusinessAccMaxAggregateOutputType | null
  }

  export type BusinessAccAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type BusinessAccSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type BusinessAccMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    businessType: $Enums.Category | null
    userId: number | null
  }

  export type BusinessAccMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    businessType: $Enums.Category | null
    userId: number | null
  }

  export type BusinessAccCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    businessType: number
    userId: number
    _all: number
  }


  export type BusinessAccAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type BusinessAccSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type BusinessAccMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    businessType?: true
    userId?: true
  }

  export type BusinessAccMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    businessType?: true
    userId?: true
  }

  export type BusinessAccCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    businessType?: true
    userId?: true
    _all?: true
  }

  export type BusinessAccAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BusinessAcc to aggregate.
     */
    where?: BusinessAccWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessAccs to fetch.
     */
    orderBy?: BusinessAccOrderByWithRelationInput | BusinessAccOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BusinessAccWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessAccs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessAccs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BusinessAccs
    **/
    _count?: true | BusinessAccCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BusinessAccAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BusinessAccSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BusinessAccMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BusinessAccMaxAggregateInputType
  }

  export type GetBusinessAccAggregateType<T extends BusinessAccAggregateArgs> = {
        [P in keyof T & keyof AggregateBusinessAcc]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBusinessAcc[P]>
      : GetScalarType<T[P], AggregateBusinessAcc[P]>
  }




  export type BusinessAccGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BusinessAccWhereInput
    orderBy?: BusinessAccOrderByWithAggregationInput | BusinessAccOrderByWithAggregationInput[]
    by: BusinessAccScalarFieldEnum[] | BusinessAccScalarFieldEnum
    having?: BusinessAccScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BusinessAccCountAggregateInputType | true
    _avg?: BusinessAccAvgAggregateInputType
    _sum?: BusinessAccSumAggregateInputType
    _min?: BusinessAccMinAggregateInputType
    _max?: BusinessAccMaxAggregateInputType
  }

  export type BusinessAccGroupByOutputType = {
    id: number
    createdAt: Date | null
    updatedAt: Date | null
    name: string
    businessType: $Enums.Category
    userId: number
    _count: BusinessAccCountAggregateOutputType | null
    _avg: BusinessAccAvgAggregateOutputType | null
    _sum: BusinessAccSumAggregateOutputType | null
    _min: BusinessAccMinAggregateOutputType | null
    _max: BusinessAccMaxAggregateOutputType | null
  }

  type GetBusinessAccGroupByPayload<T extends BusinessAccGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BusinessAccGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BusinessAccGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BusinessAccGroupByOutputType[P]>
            : GetScalarType<T[P], BusinessAccGroupByOutputType[P]>
        }
      >
    >


  export type BusinessAccSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    businessType?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    AllMember?: boolean | BusinessAcc$AllMemberArgs<ExtArgs>
    Office?: boolean | BusinessAcc$OfficeArgs<ExtArgs>
    Coach?: boolean | BusinessAcc$CoachArgs<ExtArgs>
    Bank?: boolean | BusinessAcc$BankArgs<ExtArgs>
    Agency?: boolean | BusinessAcc$AgencyArgs<ExtArgs>
    Orm?: boolean | BusinessAcc$OrmArgs<ExtArgs>
    _count?: boolean | BusinessAccCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businessAcc"]>

  export type BusinessAccSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    businessType?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businessAcc"]>

  export type BusinessAccSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    businessType?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["businessAcc"]>

  export type BusinessAccSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    businessType?: boolean
    userId?: boolean
  }

  export type BusinessAccOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "name" | "businessType" | "userId", ExtArgs["result"]["businessAcc"]>
  export type BusinessAccInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    AllMember?: boolean | BusinessAcc$AllMemberArgs<ExtArgs>
    Office?: boolean | BusinessAcc$OfficeArgs<ExtArgs>
    Coach?: boolean | BusinessAcc$CoachArgs<ExtArgs>
    Bank?: boolean | BusinessAcc$BankArgs<ExtArgs>
    Agency?: boolean | BusinessAcc$AgencyArgs<ExtArgs>
    Orm?: boolean | BusinessAcc$OrmArgs<ExtArgs>
    _count?: boolean | BusinessAccCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BusinessAccIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BusinessAccIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BusinessAccPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BusinessAcc"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      AllMember: Prisma.$MemberPayload<ExtArgs>[]
      Office: Prisma.$OfficePayload<ExtArgs>[]
      Coach: Prisma.$CoachPayload<ExtArgs>[]
      Bank: Prisma.$BankPayload<ExtArgs>[]
      Agency: Prisma.$AgencyPayload<ExtArgs>[]
      Orm: Prisma.$OrmPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date | null
      updatedAt: Date | null
      name: string
      businessType: $Enums.Category
      userId: number
    }, ExtArgs["result"]["businessAcc"]>
    composites: {}
  }

  type BusinessAccGetPayload<S extends boolean | null | undefined | BusinessAccDefaultArgs> = $Result.GetResult<Prisma.$BusinessAccPayload, S>

  type BusinessAccCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BusinessAccFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BusinessAccCountAggregateInputType | true
    }

  export interface BusinessAccDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BusinessAcc'], meta: { name: 'BusinessAcc' } }
    /**
     * Find zero or one BusinessAcc that matches the filter.
     * @param {BusinessAccFindUniqueArgs} args - Arguments to find a BusinessAcc
     * @example
     * // Get one BusinessAcc
     * const businessAcc = await prisma.businessAcc.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BusinessAccFindUniqueArgs>(args: SelectSubset<T, BusinessAccFindUniqueArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BusinessAcc that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BusinessAccFindUniqueOrThrowArgs} args - Arguments to find a BusinessAcc
     * @example
     * // Get one BusinessAcc
     * const businessAcc = await prisma.businessAcc.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BusinessAccFindUniqueOrThrowArgs>(args: SelectSubset<T, BusinessAccFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BusinessAcc that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccFindFirstArgs} args - Arguments to find a BusinessAcc
     * @example
     * // Get one BusinessAcc
     * const businessAcc = await prisma.businessAcc.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BusinessAccFindFirstArgs>(args?: SelectSubset<T, BusinessAccFindFirstArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BusinessAcc that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccFindFirstOrThrowArgs} args - Arguments to find a BusinessAcc
     * @example
     * // Get one BusinessAcc
     * const businessAcc = await prisma.businessAcc.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BusinessAccFindFirstOrThrowArgs>(args?: SelectSubset<T, BusinessAccFindFirstOrThrowArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BusinessAccs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BusinessAccs
     * const businessAccs = await prisma.businessAcc.findMany()
     * 
     * // Get first 10 BusinessAccs
     * const businessAccs = await prisma.businessAcc.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const businessAccWithIdOnly = await prisma.businessAcc.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BusinessAccFindManyArgs>(args?: SelectSubset<T, BusinessAccFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BusinessAcc.
     * @param {BusinessAccCreateArgs} args - Arguments to create a BusinessAcc.
     * @example
     * // Create one BusinessAcc
     * const BusinessAcc = await prisma.businessAcc.create({
     *   data: {
     *     // ... data to create a BusinessAcc
     *   }
     * })
     * 
     */
    create<T extends BusinessAccCreateArgs>(args: SelectSubset<T, BusinessAccCreateArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BusinessAccs.
     * @param {BusinessAccCreateManyArgs} args - Arguments to create many BusinessAccs.
     * @example
     * // Create many BusinessAccs
     * const businessAcc = await prisma.businessAcc.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BusinessAccCreateManyArgs>(args?: SelectSubset<T, BusinessAccCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BusinessAccs and returns the data saved in the database.
     * @param {BusinessAccCreateManyAndReturnArgs} args - Arguments to create many BusinessAccs.
     * @example
     * // Create many BusinessAccs
     * const businessAcc = await prisma.businessAcc.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BusinessAccs and only return the `id`
     * const businessAccWithIdOnly = await prisma.businessAcc.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BusinessAccCreateManyAndReturnArgs>(args?: SelectSubset<T, BusinessAccCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BusinessAcc.
     * @param {BusinessAccDeleteArgs} args - Arguments to delete one BusinessAcc.
     * @example
     * // Delete one BusinessAcc
     * const BusinessAcc = await prisma.businessAcc.delete({
     *   where: {
     *     // ... filter to delete one BusinessAcc
     *   }
     * })
     * 
     */
    delete<T extends BusinessAccDeleteArgs>(args: SelectSubset<T, BusinessAccDeleteArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BusinessAcc.
     * @param {BusinessAccUpdateArgs} args - Arguments to update one BusinessAcc.
     * @example
     * // Update one BusinessAcc
     * const businessAcc = await prisma.businessAcc.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BusinessAccUpdateArgs>(args: SelectSubset<T, BusinessAccUpdateArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BusinessAccs.
     * @param {BusinessAccDeleteManyArgs} args - Arguments to filter BusinessAccs to delete.
     * @example
     * // Delete a few BusinessAccs
     * const { count } = await prisma.businessAcc.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BusinessAccDeleteManyArgs>(args?: SelectSubset<T, BusinessAccDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BusinessAccs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BusinessAccs
     * const businessAcc = await prisma.businessAcc.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BusinessAccUpdateManyArgs>(args: SelectSubset<T, BusinessAccUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BusinessAccs and returns the data updated in the database.
     * @param {BusinessAccUpdateManyAndReturnArgs} args - Arguments to update many BusinessAccs.
     * @example
     * // Update many BusinessAccs
     * const businessAcc = await prisma.businessAcc.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BusinessAccs and only return the `id`
     * const businessAccWithIdOnly = await prisma.businessAcc.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BusinessAccUpdateManyAndReturnArgs>(args: SelectSubset<T, BusinessAccUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BusinessAcc.
     * @param {BusinessAccUpsertArgs} args - Arguments to update or create a BusinessAcc.
     * @example
     * // Update or create a BusinessAcc
     * const businessAcc = await prisma.businessAcc.upsert({
     *   create: {
     *     // ... data to create a BusinessAcc
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BusinessAcc we want to update
     *   }
     * })
     */
    upsert<T extends BusinessAccUpsertArgs>(args: SelectSubset<T, BusinessAccUpsertArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BusinessAccs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccCountArgs} args - Arguments to filter BusinessAccs to count.
     * @example
     * // Count the number of BusinessAccs
     * const count = await prisma.businessAcc.count({
     *   where: {
     *     // ... the filter for the BusinessAccs we want to count
     *   }
     * })
    **/
    count<T extends BusinessAccCountArgs>(
      args?: Subset<T, BusinessAccCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BusinessAccCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BusinessAcc.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BusinessAccAggregateArgs>(args: Subset<T, BusinessAccAggregateArgs>): Prisma.PrismaPromise<GetBusinessAccAggregateType<T>>

    /**
     * Group by BusinessAcc.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusinessAccGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BusinessAccGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BusinessAccGroupByArgs['orderBy'] }
        : { orderBy?: BusinessAccGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BusinessAccGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBusinessAccGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BusinessAcc model
   */
  readonly fields: BusinessAccFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BusinessAcc.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BusinessAccClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    AllMember<T extends BusinessAcc$AllMemberArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAcc$AllMemberArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Office<T extends BusinessAcc$OfficeArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAcc$OfficeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Coach<T extends BusinessAcc$CoachArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAcc$CoachArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Bank<T extends BusinessAcc$BankArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAcc$BankArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Agency<T extends BusinessAcc$AgencyArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAcc$AgencyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Orm<T extends BusinessAcc$OrmArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAcc$OrmArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BusinessAcc model
   */
  interface BusinessAccFieldRefs {
    readonly id: FieldRef<"BusinessAcc", 'Int'>
    readonly createdAt: FieldRef<"BusinessAcc", 'DateTime'>
    readonly updatedAt: FieldRef<"BusinessAcc", 'DateTime'>
    readonly name: FieldRef<"BusinessAcc", 'String'>
    readonly businessType: FieldRef<"BusinessAcc", 'Category'>
    readonly userId: FieldRef<"BusinessAcc", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * BusinessAcc findUnique
   */
  export type BusinessAccFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * Filter, which BusinessAcc to fetch.
     */
    where: BusinessAccWhereUniqueInput
  }

  /**
   * BusinessAcc findUniqueOrThrow
   */
  export type BusinessAccFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * Filter, which BusinessAcc to fetch.
     */
    where: BusinessAccWhereUniqueInput
  }

  /**
   * BusinessAcc findFirst
   */
  export type BusinessAccFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * Filter, which BusinessAcc to fetch.
     */
    where?: BusinessAccWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessAccs to fetch.
     */
    orderBy?: BusinessAccOrderByWithRelationInput | BusinessAccOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BusinessAccs.
     */
    cursor?: BusinessAccWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessAccs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessAccs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BusinessAccs.
     */
    distinct?: BusinessAccScalarFieldEnum | BusinessAccScalarFieldEnum[]
  }

  /**
   * BusinessAcc findFirstOrThrow
   */
  export type BusinessAccFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * Filter, which BusinessAcc to fetch.
     */
    where?: BusinessAccWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessAccs to fetch.
     */
    orderBy?: BusinessAccOrderByWithRelationInput | BusinessAccOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BusinessAccs.
     */
    cursor?: BusinessAccWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessAccs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessAccs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BusinessAccs.
     */
    distinct?: BusinessAccScalarFieldEnum | BusinessAccScalarFieldEnum[]
  }

  /**
   * BusinessAcc findMany
   */
  export type BusinessAccFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * Filter, which BusinessAccs to fetch.
     */
    where?: BusinessAccWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BusinessAccs to fetch.
     */
    orderBy?: BusinessAccOrderByWithRelationInput | BusinessAccOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BusinessAccs.
     */
    cursor?: BusinessAccWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BusinessAccs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BusinessAccs.
     */
    skip?: number
    distinct?: BusinessAccScalarFieldEnum | BusinessAccScalarFieldEnum[]
  }

  /**
   * BusinessAcc create
   */
  export type BusinessAccCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * The data needed to create a BusinessAcc.
     */
    data: XOR<BusinessAccCreateInput, BusinessAccUncheckedCreateInput>
  }

  /**
   * BusinessAcc createMany
   */
  export type BusinessAccCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BusinessAccs.
     */
    data: BusinessAccCreateManyInput | BusinessAccCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BusinessAcc createManyAndReturn
   */
  export type BusinessAccCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * The data used to create many BusinessAccs.
     */
    data: BusinessAccCreateManyInput | BusinessAccCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BusinessAcc update
   */
  export type BusinessAccUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * The data needed to update a BusinessAcc.
     */
    data: XOR<BusinessAccUpdateInput, BusinessAccUncheckedUpdateInput>
    /**
     * Choose, which BusinessAcc to update.
     */
    where: BusinessAccWhereUniqueInput
  }

  /**
   * BusinessAcc updateMany
   */
  export type BusinessAccUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BusinessAccs.
     */
    data: XOR<BusinessAccUpdateManyMutationInput, BusinessAccUncheckedUpdateManyInput>
    /**
     * Filter which BusinessAccs to update
     */
    where?: BusinessAccWhereInput
    /**
     * Limit how many BusinessAccs to update.
     */
    limit?: number
  }

  /**
   * BusinessAcc updateManyAndReturn
   */
  export type BusinessAccUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * The data used to update BusinessAccs.
     */
    data: XOR<BusinessAccUpdateManyMutationInput, BusinessAccUncheckedUpdateManyInput>
    /**
     * Filter which BusinessAccs to update
     */
    where?: BusinessAccWhereInput
    /**
     * Limit how many BusinessAccs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BusinessAcc upsert
   */
  export type BusinessAccUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * The filter to search for the BusinessAcc to update in case it exists.
     */
    where: BusinessAccWhereUniqueInput
    /**
     * In case the BusinessAcc found by the `where` argument doesn't exist, create a new BusinessAcc with this data.
     */
    create: XOR<BusinessAccCreateInput, BusinessAccUncheckedCreateInput>
    /**
     * In case the BusinessAcc was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BusinessAccUpdateInput, BusinessAccUncheckedUpdateInput>
  }

  /**
   * BusinessAcc delete
   */
  export type BusinessAccDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
    /**
     * Filter which BusinessAcc to delete.
     */
    where: BusinessAccWhereUniqueInput
  }

  /**
   * BusinessAcc deleteMany
   */
  export type BusinessAccDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BusinessAccs to delete
     */
    where?: BusinessAccWhereInput
    /**
     * Limit how many BusinessAccs to delete.
     */
    limit?: number
  }

  /**
   * BusinessAcc.AllMember
   */
  export type BusinessAcc$AllMemberArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Member
     */
    select?: MemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Member
     */
    omit?: MemberOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberInclude<ExtArgs> | null
    where?: MemberWhereInput
    orderBy?: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]
    cursor?: MemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemberScalarFieldEnum | MemberScalarFieldEnum[]
  }

  /**
   * BusinessAcc.Office
   */
  export type BusinessAcc$OfficeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    where?: OfficeWhereInput
    orderBy?: OfficeOrderByWithRelationInput | OfficeOrderByWithRelationInput[]
    cursor?: OfficeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OfficeScalarFieldEnum | OfficeScalarFieldEnum[]
  }

  /**
   * BusinessAcc.Coach
   */
  export type BusinessAcc$CoachArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    where?: CoachWhereInput
    orderBy?: CoachOrderByWithRelationInput | CoachOrderByWithRelationInput[]
    cursor?: CoachWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CoachScalarFieldEnum | CoachScalarFieldEnum[]
  }

  /**
   * BusinessAcc.Bank
   */
  export type BusinessAcc$BankArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    where?: BankWhereInput
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    cursor?: BankWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * BusinessAcc.Agency
   */
  export type BusinessAcc$AgencyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    where?: AgencyWhereInput
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    cursor?: AgencyWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * BusinessAcc.Orm
   */
  export type BusinessAcc$OrmArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    where?: OrmWhereInput
    orderBy?: OrmOrderByWithRelationInput | OrmOrderByWithRelationInput[]
    cursor?: OrmWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrmScalarFieldEnum | OrmScalarFieldEnum[]
  }

  /**
   * BusinessAcc without action
   */
  export type BusinessAccDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BusinessAcc
     */
    select?: BusinessAccSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BusinessAcc
     */
    omit?: BusinessAccOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BusinessAccInclude<ExtArgs> | null
  }


  /**
   * Model Office
   */

  export type AggregateOffice = {
    _count: OfficeCountAggregateOutputType | null
    _avg: OfficeAvgAggregateOutputType | null
    _sum: OfficeSumAggregateOutputType | null
    _min: OfficeMinAggregateOutputType | null
    _max: OfficeMaxAggregateOutputType | null
  }

  export type OfficeAvgAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type OfficeSumAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type OfficeMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type OfficeMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type OfficeCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    Category: number
    title: number
    description: number
    image: number
    callToAction: number
    businessId: number
    authorId: number
    _all: number
  }


  export type OfficeAvgAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type OfficeSumAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type OfficeMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type OfficeMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type OfficeCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
    _all?: true
  }

  export type OfficeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Office to aggregate.
     */
    where?: OfficeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offices to fetch.
     */
    orderBy?: OfficeOrderByWithRelationInput | OfficeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OfficeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Offices
    **/
    _count?: true | OfficeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OfficeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OfficeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OfficeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OfficeMaxAggregateInputType
  }

  export type GetOfficeAggregateType<T extends OfficeAggregateArgs> = {
        [P in keyof T & keyof AggregateOffice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOffice[P]>
      : GetScalarType<T[P], AggregateOffice[P]>
  }




  export type OfficeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OfficeWhereInput
    orderBy?: OfficeOrderByWithAggregationInput | OfficeOrderByWithAggregationInput[]
    by: OfficeScalarFieldEnum[] | OfficeScalarFieldEnum
    having?: OfficeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OfficeCountAggregateInputType | true
    _avg?: OfficeAvgAggregateInputType
    _sum?: OfficeSumAggregateInputType
    _min?: OfficeMinAggregateInputType
    _max?: OfficeMaxAggregateInputType
  }

  export type OfficeGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    Category: $Enums.Category
    title: string
    description: string
    image: string | null
    callToAction: string | null
    businessId: number
    authorId: string
    _count: OfficeCountAggregateOutputType | null
    _avg: OfficeAvgAggregateOutputType | null
    _sum: OfficeSumAggregateOutputType | null
    _min: OfficeMinAggregateOutputType | null
    _max: OfficeMaxAggregateOutputType | null
  }

  type GetOfficeGroupByPayload<T extends OfficeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OfficeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OfficeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OfficeGroupByOutputType[P]>
            : GetScalarType<T[P], OfficeGroupByOutputType[P]>
        }
      >
    >


  export type OfficeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["office"]>

  export type OfficeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["office"]>

  export type OfficeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["office"]>

  export type OfficeSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
  }

  export type OfficeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "Category" | "title" | "description" | "image" | "callToAction" | "businessId" | "authorId", ExtArgs["result"]["office"]>
  export type OfficeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type OfficeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type OfficeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }

  export type $OfficePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Office"
    objects: {
      businessAcc: Prisma.$BusinessAccPayload<ExtArgs>
      author: Prisma.$MemberPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      Category: $Enums.Category
      title: string
      description: string
      image: string | null
      callToAction: string | null
      businessId: number
      authorId: string
    }, ExtArgs["result"]["office"]>
    composites: {}
  }

  type OfficeGetPayload<S extends boolean | null | undefined | OfficeDefaultArgs> = $Result.GetResult<Prisma.$OfficePayload, S>

  type OfficeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OfficeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OfficeCountAggregateInputType | true
    }

  export interface OfficeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Office'], meta: { name: 'Office' } }
    /**
     * Find zero or one Office that matches the filter.
     * @param {OfficeFindUniqueArgs} args - Arguments to find a Office
     * @example
     * // Get one Office
     * const office = await prisma.office.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OfficeFindUniqueArgs>(args: SelectSubset<T, OfficeFindUniqueArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Office that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OfficeFindUniqueOrThrowArgs} args - Arguments to find a Office
     * @example
     * // Get one Office
     * const office = await prisma.office.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OfficeFindUniqueOrThrowArgs>(args: SelectSubset<T, OfficeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Office that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeFindFirstArgs} args - Arguments to find a Office
     * @example
     * // Get one Office
     * const office = await prisma.office.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OfficeFindFirstArgs>(args?: SelectSubset<T, OfficeFindFirstArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Office that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeFindFirstOrThrowArgs} args - Arguments to find a Office
     * @example
     * // Get one Office
     * const office = await prisma.office.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OfficeFindFirstOrThrowArgs>(args?: SelectSubset<T, OfficeFindFirstOrThrowArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Offices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Offices
     * const offices = await prisma.office.findMany()
     * 
     * // Get first 10 Offices
     * const offices = await prisma.office.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const officeWithIdOnly = await prisma.office.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OfficeFindManyArgs>(args?: SelectSubset<T, OfficeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Office.
     * @param {OfficeCreateArgs} args - Arguments to create a Office.
     * @example
     * // Create one Office
     * const Office = await prisma.office.create({
     *   data: {
     *     // ... data to create a Office
     *   }
     * })
     * 
     */
    create<T extends OfficeCreateArgs>(args: SelectSubset<T, OfficeCreateArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Offices.
     * @param {OfficeCreateManyArgs} args - Arguments to create many Offices.
     * @example
     * // Create many Offices
     * const office = await prisma.office.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OfficeCreateManyArgs>(args?: SelectSubset<T, OfficeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Offices and returns the data saved in the database.
     * @param {OfficeCreateManyAndReturnArgs} args - Arguments to create many Offices.
     * @example
     * // Create many Offices
     * const office = await prisma.office.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Offices and only return the `id`
     * const officeWithIdOnly = await prisma.office.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OfficeCreateManyAndReturnArgs>(args?: SelectSubset<T, OfficeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Office.
     * @param {OfficeDeleteArgs} args - Arguments to delete one Office.
     * @example
     * // Delete one Office
     * const Office = await prisma.office.delete({
     *   where: {
     *     // ... filter to delete one Office
     *   }
     * })
     * 
     */
    delete<T extends OfficeDeleteArgs>(args: SelectSubset<T, OfficeDeleteArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Office.
     * @param {OfficeUpdateArgs} args - Arguments to update one Office.
     * @example
     * // Update one Office
     * const office = await prisma.office.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OfficeUpdateArgs>(args: SelectSubset<T, OfficeUpdateArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Offices.
     * @param {OfficeDeleteManyArgs} args - Arguments to filter Offices to delete.
     * @example
     * // Delete a few Offices
     * const { count } = await prisma.office.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OfficeDeleteManyArgs>(args?: SelectSubset<T, OfficeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Offices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Offices
     * const office = await prisma.office.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OfficeUpdateManyArgs>(args: SelectSubset<T, OfficeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Offices and returns the data updated in the database.
     * @param {OfficeUpdateManyAndReturnArgs} args - Arguments to update many Offices.
     * @example
     * // Update many Offices
     * const office = await prisma.office.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Offices and only return the `id`
     * const officeWithIdOnly = await prisma.office.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OfficeUpdateManyAndReturnArgs>(args: SelectSubset<T, OfficeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Office.
     * @param {OfficeUpsertArgs} args - Arguments to update or create a Office.
     * @example
     * // Update or create a Office
     * const office = await prisma.office.upsert({
     *   create: {
     *     // ... data to create a Office
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Office we want to update
     *   }
     * })
     */
    upsert<T extends OfficeUpsertArgs>(args: SelectSubset<T, OfficeUpsertArgs<ExtArgs>>): Prisma__OfficeClient<$Result.GetResult<Prisma.$OfficePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Offices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeCountArgs} args - Arguments to filter Offices to count.
     * @example
     * // Count the number of Offices
     * const count = await prisma.office.count({
     *   where: {
     *     // ... the filter for the Offices we want to count
     *   }
     * })
    **/
    count<T extends OfficeCountArgs>(
      args?: Subset<T, OfficeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OfficeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Office.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OfficeAggregateArgs>(args: Subset<T, OfficeAggregateArgs>): Prisma.PrismaPromise<GetOfficeAggregateType<T>>

    /**
     * Group by Office.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OfficeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OfficeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OfficeGroupByArgs['orderBy'] }
        : { orderBy?: OfficeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OfficeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOfficeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Office model
   */
  readonly fields: OfficeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Office.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OfficeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessAcc<T extends BusinessAccDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAccDefaultArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Office model
   */
  interface OfficeFieldRefs {
    readonly id: FieldRef<"Office", 'Int'>
    readonly createdAt: FieldRef<"Office", 'DateTime'>
    readonly updatedAt: FieldRef<"Office", 'DateTime'>
    readonly Category: FieldRef<"Office", 'Category'>
    readonly title: FieldRef<"Office", 'String'>
    readonly description: FieldRef<"Office", 'String'>
    readonly image: FieldRef<"Office", 'String'>
    readonly callToAction: FieldRef<"Office", 'String'>
    readonly businessId: FieldRef<"Office", 'Int'>
    readonly authorId: FieldRef<"Office", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Office findUnique
   */
  export type OfficeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * Filter, which Office to fetch.
     */
    where: OfficeWhereUniqueInput
  }

  /**
   * Office findUniqueOrThrow
   */
  export type OfficeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * Filter, which Office to fetch.
     */
    where: OfficeWhereUniqueInput
  }

  /**
   * Office findFirst
   */
  export type OfficeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * Filter, which Office to fetch.
     */
    where?: OfficeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offices to fetch.
     */
    orderBy?: OfficeOrderByWithRelationInput | OfficeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Offices.
     */
    cursor?: OfficeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Offices.
     */
    distinct?: OfficeScalarFieldEnum | OfficeScalarFieldEnum[]
  }

  /**
   * Office findFirstOrThrow
   */
  export type OfficeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * Filter, which Office to fetch.
     */
    where?: OfficeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offices to fetch.
     */
    orderBy?: OfficeOrderByWithRelationInput | OfficeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Offices.
     */
    cursor?: OfficeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Offices.
     */
    distinct?: OfficeScalarFieldEnum | OfficeScalarFieldEnum[]
  }

  /**
   * Office findMany
   */
  export type OfficeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * Filter, which Offices to fetch.
     */
    where?: OfficeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Offices to fetch.
     */
    orderBy?: OfficeOrderByWithRelationInput | OfficeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Offices.
     */
    cursor?: OfficeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Offices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Offices.
     */
    skip?: number
    distinct?: OfficeScalarFieldEnum | OfficeScalarFieldEnum[]
  }

  /**
   * Office create
   */
  export type OfficeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * The data needed to create a Office.
     */
    data: XOR<OfficeCreateInput, OfficeUncheckedCreateInput>
  }

  /**
   * Office createMany
   */
  export type OfficeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Offices.
     */
    data: OfficeCreateManyInput | OfficeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Office createManyAndReturn
   */
  export type OfficeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * The data used to create many Offices.
     */
    data: OfficeCreateManyInput | OfficeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Office update
   */
  export type OfficeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * The data needed to update a Office.
     */
    data: XOR<OfficeUpdateInput, OfficeUncheckedUpdateInput>
    /**
     * Choose, which Office to update.
     */
    where: OfficeWhereUniqueInput
  }

  /**
   * Office updateMany
   */
  export type OfficeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Offices.
     */
    data: XOR<OfficeUpdateManyMutationInput, OfficeUncheckedUpdateManyInput>
    /**
     * Filter which Offices to update
     */
    where?: OfficeWhereInput
    /**
     * Limit how many Offices to update.
     */
    limit?: number
  }

  /**
   * Office updateManyAndReturn
   */
  export type OfficeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * The data used to update Offices.
     */
    data: XOR<OfficeUpdateManyMutationInput, OfficeUncheckedUpdateManyInput>
    /**
     * Filter which Offices to update
     */
    where?: OfficeWhereInput
    /**
     * Limit how many Offices to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Office upsert
   */
  export type OfficeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * The filter to search for the Office to update in case it exists.
     */
    where: OfficeWhereUniqueInput
    /**
     * In case the Office found by the `where` argument doesn't exist, create a new Office with this data.
     */
    create: XOR<OfficeCreateInput, OfficeUncheckedCreateInput>
    /**
     * In case the Office was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OfficeUpdateInput, OfficeUncheckedUpdateInput>
  }

  /**
   * Office delete
   */
  export type OfficeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
    /**
     * Filter which Office to delete.
     */
    where: OfficeWhereUniqueInput
  }

  /**
   * Office deleteMany
   */
  export type OfficeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Offices to delete
     */
    where?: OfficeWhereInput
    /**
     * Limit how many Offices to delete.
     */
    limit?: number
  }

  /**
   * Office without action
   */
  export type OfficeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Office
     */
    select?: OfficeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Office
     */
    omit?: OfficeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OfficeInclude<ExtArgs> | null
  }


  /**
   * Model Coach
   */

  export type AggregateCoach = {
    _count: CoachCountAggregateOutputType | null
    _avg: CoachAvgAggregateOutputType | null
    _sum: CoachSumAggregateOutputType | null
    _min: CoachMinAggregateOutputType | null
    _max: CoachMaxAggregateOutputType | null
  }

  export type CoachAvgAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type CoachSumAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type CoachMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type CoachMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type CoachCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    Category: number
    title: number
    description: number
    image: number
    callToAction: number
    businessId: number
    authorId: number
    _all: number
  }


  export type CoachAvgAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type CoachSumAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type CoachMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type CoachMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type CoachCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
    _all?: true
  }

  export type CoachAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coach to aggregate.
     */
    where?: CoachWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coaches to fetch.
     */
    orderBy?: CoachOrderByWithRelationInput | CoachOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CoachWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Coaches
    **/
    _count?: true | CoachCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoachAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoachSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoachMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoachMaxAggregateInputType
  }

  export type GetCoachAggregateType<T extends CoachAggregateArgs> = {
        [P in keyof T & keyof AggregateCoach]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoach[P]>
      : GetScalarType<T[P], AggregateCoach[P]>
  }




  export type CoachGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CoachWhereInput
    orderBy?: CoachOrderByWithAggregationInput | CoachOrderByWithAggregationInput[]
    by: CoachScalarFieldEnum[] | CoachScalarFieldEnum
    having?: CoachScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoachCountAggregateInputType | true
    _avg?: CoachAvgAggregateInputType
    _sum?: CoachSumAggregateInputType
    _min?: CoachMinAggregateInputType
    _max?: CoachMaxAggregateInputType
  }

  export type CoachGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    Category: $Enums.Category
    title: string
    description: string
    image: string | null
    callToAction: string | null
    businessId: number
    authorId: string
    _count: CoachCountAggregateOutputType | null
    _avg: CoachAvgAggregateOutputType | null
    _sum: CoachSumAggregateOutputType | null
    _min: CoachMinAggregateOutputType | null
    _max: CoachMaxAggregateOutputType | null
  }

  type GetCoachGroupByPayload<T extends CoachGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoachGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoachGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoachGroupByOutputType[P]>
            : GetScalarType<T[P], CoachGroupByOutputType[P]>
        }
      >
    >


  export type CoachSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["coach"]>

  export type CoachSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["coach"]>

  export type CoachSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["coach"]>

  export type CoachSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
  }

  export type CoachOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "Category" | "title" | "description" | "image" | "callToAction" | "businessId" | "authorId", ExtArgs["result"]["coach"]>
  export type CoachInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type CoachIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type CoachIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }

  export type $CoachPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Coach"
    objects: {
      businessAcc: Prisma.$BusinessAccPayload<ExtArgs>
      author: Prisma.$MemberPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      Category: $Enums.Category
      title: string
      description: string
      image: string | null
      callToAction: string | null
      businessId: number
      authorId: string
    }, ExtArgs["result"]["coach"]>
    composites: {}
  }

  type CoachGetPayload<S extends boolean | null | undefined | CoachDefaultArgs> = $Result.GetResult<Prisma.$CoachPayload, S>

  type CoachCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CoachFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CoachCountAggregateInputType | true
    }

  export interface CoachDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Coach'], meta: { name: 'Coach' } }
    /**
     * Find zero or one Coach that matches the filter.
     * @param {CoachFindUniqueArgs} args - Arguments to find a Coach
     * @example
     * // Get one Coach
     * const coach = await prisma.coach.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CoachFindUniqueArgs>(args: SelectSubset<T, CoachFindUniqueArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Coach that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CoachFindUniqueOrThrowArgs} args - Arguments to find a Coach
     * @example
     * // Get one Coach
     * const coach = await prisma.coach.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CoachFindUniqueOrThrowArgs>(args: SelectSubset<T, CoachFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Coach that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachFindFirstArgs} args - Arguments to find a Coach
     * @example
     * // Get one Coach
     * const coach = await prisma.coach.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CoachFindFirstArgs>(args?: SelectSubset<T, CoachFindFirstArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Coach that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachFindFirstOrThrowArgs} args - Arguments to find a Coach
     * @example
     * // Get one Coach
     * const coach = await prisma.coach.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CoachFindFirstOrThrowArgs>(args?: SelectSubset<T, CoachFindFirstOrThrowArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Coaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Coaches
     * const coaches = await prisma.coach.findMany()
     * 
     * // Get first 10 Coaches
     * const coaches = await prisma.coach.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coachWithIdOnly = await prisma.coach.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CoachFindManyArgs>(args?: SelectSubset<T, CoachFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Coach.
     * @param {CoachCreateArgs} args - Arguments to create a Coach.
     * @example
     * // Create one Coach
     * const Coach = await prisma.coach.create({
     *   data: {
     *     // ... data to create a Coach
     *   }
     * })
     * 
     */
    create<T extends CoachCreateArgs>(args: SelectSubset<T, CoachCreateArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Coaches.
     * @param {CoachCreateManyArgs} args - Arguments to create many Coaches.
     * @example
     * // Create many Coaches
     * const coach = await prisma.coach.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CoachCreateManyArgs>(args?: SelectSubset<T, CoachCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Coaches and returns the data saved in the database.
     * @param {CoachCreateManyAndReturnArgs} args - Arguments to create many Coaches.
     * @example
     * // Create many Coaches
     * const coach = await prisma.coach.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Coaches and only return the `id`
     * const coachWithIdOnly = await prisma.coach.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CoachCreateManyAndReturnArgs>(args?: SelectSubset<T, CoachCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Coach.
     * @param {CoachDeleteArgs} args - Arguments to delete one Coach.
     * @example
     * // Delete one Coach
     * const Coach = await prisma.coach.delete({
     *   where: {
     *     // ... filter to delete one Coach
     *   }
     * })
     * 
     */
    delete<T extends CoachDeleteArgs>(args: SelectSubset<T, CoachDeleteArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Coach.
     * @param {CoachUpdateArgs} args - Arguments to update one Coach.
     * @example
     * // Update one Coach
     * const coach = await prisma.coach.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CoachUpdateArgs>(args: SelectSubset<T, CoachUpdateArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Coaches.
     * @param {CoachDeleteManyArgs} args - Arguments to filter Coaches to delete.
     * @example
     * // Delete a few Coaches
     * const { count } = await prisma.coach.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CoachDeleteManyArgs>(args?: SelectSubset<T, CoachDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Coaches
     * const coach = await prisma.coach.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CoachUpdateManyArgs>(args: SelectSubset<T, CoachUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Coaches and returns the data updated in the database.
     * @param {CoachUpdateManyAndReturnArgs} args - Arguments to update many Coaches.
     * @example
     * // Update many Coaches
     * const coach = await prisma.coach.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Coaches and only return the `id`
     * const coachWithIdOnly = await prisma.coach.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CoachUpdateManyAndReturnArgs>(args: SelectSubset<T, CoachUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Coach.
     * @param {CoachUpsertArgs} args - Arguments to update or create a Coach.
     * @example
     * // Update or create a Coach
     * const coach = await prisma.coach.upsert({
     *   create: {
     *     // ... data to create a Coach
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Coach we want to update
     *   }
     * })
     */
    upsert<T extends CoachUpsertArgs>(args: SelectSubset<T, CoachUpsertArgs<ExtArgs>>): Prisma__CoachClient<$Result.GetResult<Prisma.$CoachPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Coaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachCountArgs} args - Arguments to filter Coaches to count.
     * @example
     * // Count the number of Coaches
     * const count = await prisma.coach.count({
     *   where: {
     *     // ... the filter for the Coaches we want to count
     *   }
     * })
    **/
    count<T extends CoachCountArgs>(
      args?: Subset<T, CoachCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoachCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Coach.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CoachAggregateArgs>(args: Subset<T, CoachAggregateArgs>): Prisma.PrismaPromise<GetCoachAggregateType<T>>

    /**
     * Group by Coach.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoachGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CoachGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CoachGroupByArgs['orderBy'] }
        : { orderBy?: CoachGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CoachGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoachGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Coach model
   */
  readonly fields: CoachFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Coach.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CoachClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessAcc<T extends BusinessAccDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAccDefaultArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Coach model
   */
  interface CoachFieldRefs {
    readonly id: FieldRef<"Coach", 'Int'>
    readonly createdAt: FieldRef<"Coach", 'DateTime'>
    readonly updatedAt: FieldRef<"Coach", 'DateTime'>
    readonly Category: FieldRef<"Coach", 'Category'>
    readonly title: FieldRef<"Coach", 'String'>
    readonly description: FieldRef<"Coach", 'String'>
    readonly image: FieldRef<"Coach", 'String'>
    readonly callToAction: FieldRef<"Coach", 'String'>
    readonly businessId: FieldRef<"Coach", 'Int'>
    readonly authorId: FieldRef<"Coach", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Coach findUnique
   */
  export type CoachFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * Filter, which Coach to fetch.
     */
    where: CoachWhereUniqueInput
  }

  /**
   * Coach findUniqueOrThrow
   */
  export type CoachFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * Filter, which Coach to fetch.
     */
    where: CoachWhereUniqueInput
  }

  /**
   * Coach findFirst
   */
  export type CoachFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * Filter, which Coach to fetch.
     */
    where?: CoachWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coaches to fetch.
     */
    orderBy?: CoachOrderByWithRelationInput | CoachOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coaches.
     */
    cursor?: CoachWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coaches.
     */
    distinct?: CoachScalarFieldEnum | CoachScalarFieldEnum[]
  }

  /**
   * Coach findFirstOrThrow
   */
  export type CoachFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * Filter, which Coach to fetch.
     */
    where?: CoachWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coaches to fetch.
     */
    orderBy?: CoachOrderByWithRelationInput | CoachOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Coaches.
     */
    cursor?: CoachWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Coaches.
     */
    distinct?: CoachScalarFieldEnum | CoachScalarFieldEnum[]
  }

  /**
   * Coach findMany
   */
  export type CoachFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * Filter, which Coaches to fetch.
     */
    where?: CoachWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Coaches to fetch.
     */
    orderBy?: CoachOrderByWithRelationInput | CoachOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Coaches.
     */
    cursor?: CoachWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Coaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Coaches.
     */
    skip?: number
    distinct?: CoachScalarFieldEnum | CoachScalarFieldEnum[]
  }

  /**
   * Coach create
   */
  export type CoachCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * The data needed to create a Coach.
     */
    data: XOR<CoachCreateInput, CoachUncheckedCreateInput>
  }

  /**
   * Coach createMany
   */
  export type CoachCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Coaches.
     */
    data: CoachCreateManyInput | CoachCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Coach createManyAndReturn
   */
  export type CoachCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * The data used to create many Coaches.
     */
    data: CoachCreateManyInput | CoachCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Coach update
   */
  export type CoachUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * The data needed to update a Coach.
     */
    data: XOR<CoachUpdateInput, CoachUncheckedUpdateInput>
    /**
     * Choose, which Coach to update.
     */
    where: CoachWhereUniqueInput
  }

  /**
   * Coach updateMany
   */
  export type CoachUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Coaches.
     */
    data: XOR<CoachUpdateManyMutationInput, CoachUncheckedUpdateManyInput>
    /**
     * Filter which Coaches to update
     */
    where?: CoachWhereInput
    /**
     * Limit how many Coaches to update.
     */
    limit?: number
  }

  /**
   * Coach updateManyAndReturn
   */
  export type CoachUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * The data used to update Coaches.
     */
    data: XOR<CoachUpdateManyMutationInput, CoachUncheckedUpdateManyInput>
    /**
     * Filter which Coaches to update
     */
    where?: CoachWhereInput
    /**
     * Limit how many Coaches to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Coach upsert
   */
  export type CoachUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * The filter to search for the Coach to update in case it exists.
     */
    where: CoachWhereUniqueInput
    /**
     * In case the Coach found by the `where` argument doesn't exist, create a new Coach with this data.
     */
    create: XOR<CoachCreateInput, CoachUncheckedCreateInput>
    /**
     * In case the Coach was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CoachUpdateInput, CoachUncheckedUpdateInput>
  }

  /**
   * Coach delete
   */
  export type CoachDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
    /**
     * Filter which Coach to delete.
     */
    where: CoachWhereUniqueInput
  }

  /**
   * Coach deleteMany
   */
  export type CoachDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Coaches to delete
     */
    where?: CoachWhereInput
    /**
     * Limit how many Coaches to delete.
     */
    limit?: number
  }

  /**
   * Coach without action
   */
  export type CoachDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Coach
     */
    select?: CoachSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Coach
     */
    omit?: CoachOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CoachInclude<ExtArgs> | null
  }


  /**
   * Model Bank
   */

  export type AggregateBank = {
    _count: BankCountAggregateOutputType | null
    _avg: BankAvgAggregateOutputType | null
    _sum: BankSumAggregateOutputType | null
    _min: BankMinAggregateOutputType | null
    _max: BankMaxAggregateOutputType | null
  }

  export type BankAvgAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type BankSumAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type BankMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type BankMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type BankCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    Category: number
    title: number
    description: number
    image: number
    callToAction: number
    businessId: number
    authorId: number
    _all: number
  }


  export type BankAvgAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type BankSumAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type BankMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type BankMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type BankCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
    _all?: true
  }

  export type BankAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bank to aggregate.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Banks
    **/
    _count?: true | BankCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BankAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BankSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BankMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BankMaxAggregateInputType
  }

  export type GetBankAggregateType<T extends BankAggregateArgs> = {
        [P in keyof T & keyof AggregateBank]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBank[P]>
      : GetScalarType<T[P], AggregateBank[P]>
  }




  export type BankGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BankWhereInput
    orderBy?: BankOrderByWithAggregationInput | BankOrderByWithAggregationInput[]
    by: BankScalarFieldEnum[] | BankScalarFieldEnum
    having?: BankScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BankCountAggregateInputType | true
    _avg?: BankAvgAggregateInputType
    _sum?: BankSumAggregateInputType
    _min?: BankMinAggregateInputType
    _max?: BankMaxAggregateInputType
  }

  export type BankGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    Category: $Enums.Category
    title: string
    description: string
    image: string | null
    callToAction: string | null
    businessId: number
    authorId: string
    _count: BankCountAggregateOutputType | null
    _avg: BankAvgAggregateOutputType | null
    _sum: BankSumAggregateOutputType | null
    _min: BankMinAggregateOutputType | null
    _max: BankMaxAggregateOutputType | null
  }

  type GetBankGroupByPayload<T extends BankGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BankGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BankGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BankGroupByOutputType[P]>
            : GetScalarType<T[P], BankGroupByOutputType[P]>
        }
      >
    >


  export type BankSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bank"]>

  export type BankSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bank"]>

  export type BankSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bank"]>

  export type BankSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
  }

  export type BankOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "Category" | "title" | "description" | "image" | "callToAction" | "businessId" | "authorId", ExtArgs["result"]["bank"]>
  export type BankInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type BankIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type BankIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }

  export type $BankPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bank"
    objects: {
      businessAcc: Prisma.$BusinessAccPayload<ExtArgs>
      author: Prisma.$MemberPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      Category: $Enums.Category
      title: string
      description: string
      image: string | null
      callToAction: string | null
      businessId: number
      authorId: string
    }, ExtArgs["result"]["bank"]>
    composites: {}
  }

  type BankGetPayload<S extends boolean | null | undefined | BankDefaultArgs> = $Result.GetResult<Prisma.$BankPayload, S>

  type BankCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BankFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BankCountAggregateInputType | true
    }

  export interface BankDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bank'], meta: { name: 'Bank' } }
    /**
     * Find zero or one Bank that matches the filter.
     * @param {BankFindUniqueArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BankFindUniqueArgs>(args: SelectSubset<T, BankFindUniqueArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bank that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BankFindUniqueOrThrowArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BankFindUniqueOrThrowArgs>(args: SelectSubset<T, BankFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bank that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankFindFirstArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BankFindFirstArgs>(args?: SelectSubset<T, BankFindFirstArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bank that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankFindFirstOrThrowArgs} args - Arguments to find a Bank
     * @example
     * // Get one Bank
     * const bank = await prisma.bank.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BankFindFirstOrThrowArgs>(args?: SelectSubset<T, BankFindFirstOrThrowArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Banks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Banks
     * const banks = await prisma.bank.findMany()
     * 
     * // Get first 10 Banks
     * const banks = await prisma.bank.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bankWithIdOnly = await prisma.bank.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BankFindManyArgs>(args?: SelectSubset<T, BankFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bank.
     * @param {BankCreateArgs} args - Arguments to create a Bank.
     * @example
     * // Create one Bank
     * const Bank = await prisma.bank.create({
     *   data: {
     *     // ... data to create a Bank
     *   }
     * })
     * 
     */
    create<T extends BankCreateArgs>(args: SelectSubset<T, BankCreateArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Banks.
     * @param {BankCreateManyArgs} args - Arguments to create many Banks.
     * @example
     * // Create many Banks
     * const bank = await prisma.bank.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BankCreateManyArgs>(args?: SelectSubset<T, BankCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Banks and returns the data saved in the database.
     * @param {BankCreateManyAndReturnArgs} args - Arguments to create many Banks.
     * @example
     * // Create many Banks
     * const bank = await prisma.bank.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Banks and only return the `id`
     * const bankWithIdOnly = await prisma.bank.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BankCreateManyAndReturnArgs>(args?: SelectSubset<T, BankCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bank.
     * @param {BankDeleteArgs} args - Arguments to delete one Bank.
     * @example
     * // Delete one Bank
     * const Bank = await prisma.bank.delete({
     *   where: {
     *     // ... filter to delete one Bank
     *   }
     * })
     * 
     */
    delete<T extends BankDeleteArgs>(args: SelectSubset<T, BankDeleteArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bank.
     * @param {BankUpdateArgs} args - Arguments to update one Bank.
     * @example
     * // Update one Bank
     * const bank = await prisma.bank.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BankUpdateArgs>(args: SelectSubset<T, BankUpdateArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Banks.
     * @param {BankDeleteManyArgs} args - Arguments to filter Banks to delete.
     * @example
     * // Delete a few Banks
     * const { count } = await prisma.bank.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BankDeleteManyArgs>(args?: SelectSubset<T, BankDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Banks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Banks
     * const bank = await prisma.bank.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BankUpdateManyArgs>(args: SelectSubset<T, BankUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Banks and returns the data updated in the database.
     * @param {BankUpdateManyAndReturnArgs} args - Arguments to update many Banks.
     * @example
     * // Update many Banks
     * const bank = await prisma.bank.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Banks and only return the `id`
     * const bankWithIdOnly = await prisma.bank.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BankUpdateManyAndReturnArgs>(args: SelectSubset<T, BankUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bank.
     * @param {BankUpsertArgs} args - Arguments to update or create a Bank.
     * @example
     * // Update or create a Bank
     * const bank = await prisma.bank.upsert({
     *   create: {
     *     // ... data to create a Bank
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bank we want to update
     *   }
     * })
     */
    upsert<T extends BankUpsertArgs>(args: SelectSubset<T, BankUpsertArgs<ExtArgs>>): Prisma__BankClient<$Result.GetResult<Prisma.$BankPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Banks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankCountArgs} args - Arguments to filter Banks to count.
     * @example
     * // Count the number of Banks
     * const count = await prisma.bank.count({
     *   where: {
     *     // ... the filter for the Banks we want to count
     *   }
     * })
    **/
    count<T extends BankCountArgs>(
      args?: Subset<T, BankCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BankCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BankAggregateArgs>(args: Subset<T, BankAggregateArgs>): Prisma.PrismaPromise<GetBankAggregateType<T>>

    /**
     * Group by Bank.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BankGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BankGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BankGroupByArgs['orderBy'] }
        : { orderBy?: BankGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BankGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBankGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bank model
   */
  readonly fields: BankFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bank.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BankClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessAcc<T extends BusinessAccDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAccDefaultArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bank model
   */
  interface BankFieldRefs {
    readonly id: FieldRef<"Bank", 'Int'>
    readonly createdAt: FieldRef<"Bank", 'DateTime'>
    readonly updatedAt: FieldRef<"Bank", 'DateTime'>
    readonly Category: FieldRef<"Bank", 'Category'>
    readonly title: FieldRef<"Bank", 'String'>
    readonly description: FieldRef<"Bank", 'String'>
    readonly image: FieldRef<"Bank", 'String'>
    readonly callToAction: FieldRef<"Bank", 'String'>
    readonly businessId: FieldRef<"Bank", 'Int'>
    readonly authorId: FieldRef<"Bank", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Bank findUnique
   */
  export type BankFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank findUniqueOrThrow
   */
  export type BankFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank findFirst
   */
  export type BankFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Banks.
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banks.
     */
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Bank findFirstOrThrow
   */
  export type BankFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Bank to fetch.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Banks.
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Banks.
     */
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Bank findMany
   */
  export type BankFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter, which Banks to fetch.
     */
    where?: BankWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Banks to fetch.
     */
    orderBy?: BankOrderByWithRelationInput | BankOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Banks.
     */
    cursor?: BankWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Banks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Banks.
     */
    skip?: number
    distinct?: BankScalarFieldEnum | BankScalarFieldEnum[]
  }

  /**
   * Bank create
   */
  export type BankCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * The data needed to create a Bank.
     */
    data: XOR<BankCreateInput, BankUncheckedCreateInput>
  }

  /**
   * Bank createMany
   */
  export type BankCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Banks.
     */
    data: BankCreateManyInput | BankCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bank createManyAndReturn
   */
  export type BankCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * The data used to create many Banks.
     */
    data: BankCreateManyInput | BankCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bank update
   */
  export type BankUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * The data needed to update a Bank.
     */
    data: XOR<BankUpdateInput, BankUncheckedUpdateInput>
    /**
     * Choose, which Bank to update.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank updateMany
   */
  export type BankUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Banks.
     */
    data: XOR<BankUpdateManyMutationInput, BankUncheckedUpdateManyInput>
    /**
     * Filter which Banks to update
     */
    where?: BankWhereInput
    /**
     * Limit how many Banks to update.
     */
    limit?: number
  }

  /**
   * Bank updateManyAndReturn
   */
  export type BankUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * The data used to update Banks.
     */
    data: XOR<BankUpdateManyMutationInput, BankUncheckedUpdateManyInput>
    /**
     * Filter which Banks to update
     */
    where?: BankWhereInput
    /**
     * Limit how many Banks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bank upsert
   */
  export type BankUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * The filter to search for the Bank to update in case it exists.
     */
    where: BankWhereUniqueInput
    /**
     * In case the Bank found by the `where` argument doesn't exist, create a new Bank with this data.
     */
    create: XOR<BankCreateInput, BankUncheckedCreateInput>
    /**
     * In case the Bank was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BankUpdateInput, BankUncheckedUpdateInput>
  }

  /**
   * Bank delete
   */
  export type BankDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
    /**
     * Filter which Bank to delete.
     */
    where: BankWhereUniqueInput
  }

  /**
   * Bank deleteMany
   */
  export type BankDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Banks to delete
     */
    where?: BankWhereInput
    /**
     * Limit how many Banks to delete.
     */
    limit?: number
  }

  /**
   * Bank without action
   */
  export type BankDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bank
     */
    select?: BankSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bank
     */
    omit?: BankOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BankInclude<ExtArgs> | null
  }


  /**
   * Model Agency
   */

  export type AggregateAgency = {
    _count: AgencyCountAggregateOutputType | null
    _avg: AgencyAvgAggregateOutputType | null
    _sum: AgencySumAggregateOutputType | null
    _min: AgencyMinAggregateOutputType | null
    _max: AgencyMaxAggregateOutputType | null
  }

  export type AgencyAvgAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type AgencySumAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type AgencyMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type AgencyMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type AgencyCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    Category: number
    title: number
    description: number
    image: number
    callToAction: number
    businessId: number
    authorId: number
    _all: number
  }


  export type AgencyAvgAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type AgencySumAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type AgencyMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type AgencyMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type AgencyCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
    _all?: true
  }

  export type AgencyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agency to aggregate.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Agencies
    **/
    _count?: true | AgencyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgencyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgencySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgencyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgencyMaxAggregateInputType
  }

  export type GetAgencyAggregateType<T extends AgencyAggregateArgs> = {
        [P in keyof T & keyof AggregateAgency]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgency[P]>
      : GetScalarType<T[P], AggregateAgency[P]>
  }




  export type AgencyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgencyWhereInput
    orderBy?: AgencyOrderByWithAggregationInput | AgencyOrderByWithAggregationInput[]
    by: AgencyScalarFieldEnum[] | AgencyScalarFieldEnum
    having?: AgencyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgencyCountAggregateInputType | true
    _avg?: AgencyAvgAggregateInputType
    _sum?: AgencySumAggregateInputType
    _min?: AgencyMinAggregateInputType
    _max?: AgencyMaxAggregateInputType
  }

  export type AgencyGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    Category: $Enums.Category
    title: string
    description: string
    image: string | null
    callToAction: string | null
    businessId: number
    authorId: string
    _count: AgencyCountAggregateOutputType | null
    _avg: AgencyAvgAggregateOutputType | null
    _sum: AgencySumAggregateOutputType | null
    _min: AgencyMinAggregateOutputType | null
    _max: AgencyMaxAggregateOutputType | null
  }

  type GetAgencyGroupByPayload<T extends AgencyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgencyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgencyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgencyGroupByOutputType[P]>
            : GetScalarType<T[P], AgencyGroupByOutputType[P]>
        }
      >
    >


  export type AgencySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agency"]>

  export type AgencySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agency"]>

  export type AgencySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agency"]>

  export type AgencySelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
  }

  export type AgencyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "Category" | "title" | "description" | "image" | "callToAction" | "businessId" | "authorId", ExtArgs["result"]["agency"]>
  export type AgencyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type AgencyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type AgencyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }

  export type $AgencyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Agency"
    objects: {
      businessAcc: Prisma.$BusinessAccPayload<ExtArgs>
      author: Prisma.$MemberPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      Category: $Enums.Category
      title: string
      description: string
      image: string | null
      callToAction: string | null
      businessId: number
      authorId: string
    }, ExtArgs["result"]["agency"]>
    composites: {}
  }

  type AgencyGetPayload<S extends boolean | null | undefined | AgencyDefaultArgs> = $Result.GetResult<Prisma.$AgencyPayload, S>

  type AgencyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgencyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgencyCountAggregateInputType | true
    }

  export interface AgencyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Agency'], meta: { name: 'Agency' } }
    /**
     * Find zero or one Agency that matches the filter.
     * @param {AgencyFindUniqueArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgencyFindUniqueArgs>(args: SelectSubset<T, AgencyFindUniqueArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Agency that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgencyFindUniqueOrThrowArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgencyFindUniqueOrThrowArgs>(args: SelectSubset<T, AgencyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agency that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyFindFirstArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgencyFindFirstArgs>(args?: SelectSubset<T, AgencyFindFirstArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agency that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyFindFirstOrThrowArgs} args - Arguments to find a Agency
     * @example
     * // Get one Agency
     * const agency = await prisma.agency.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgencyFindFirstOrThrowArgs>(args?: SelectSubset<T, AgencyFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Agencies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agencies
     * const agencies = await prisma.agency.findMany()
     * 
     * // Get first 10 Agencies
     * const agencies = await prisma.agency.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agencyWithIdOnly = await prisma.agency.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgencyFindManyArgs>(args?: SelectSubset<T, AgencyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Agency.
     * @param {AgencyCreateArgs} args - Arguments to create a Agency.
     * @example
     * // Create one Agency
     * const Agency = await prisma.agency.create({
     *   data: {
     *     // ... data to create a Agency
     *   }
     * })
     * 
     */
    create<T extends AgencyCreateArgs>(args: SelectSubset<T, AgencyCreateArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Agencies.
     * @param {AgencyCreateManyArgs} args - Arguments to create many Agencies.
     * @example
     * // Create many Agencies
     * const agency = await prisma.agency.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgencyCreateManyArgs>(args?: SelectSubset<T, AgencyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Agencies and returns the data saved in the database.
     * @param {AgencyCreateManyAndReturnArgs} args - Arguments to create many Agencies.
     * @example
     * // Create many Agencies
     * const agency = await prisma.agency.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Agencies and only return the `id`
     * const agencyWithIdOnly = await prisma.agency.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgencyCreateManyAndReturnArgs>(args?: SelectSubset<T, AgencyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Agency.
     * @param {AgencyDeleteArgs} args - Arguments to delete one Agency.
     * @example
     * // Delete one Agency
     * const Agency = await prisma.agency.delete({
     *   where: {
     *     // ... filter to delete one Agency
     *   }
     * })
     * 
     */
    delete<T extends AgencyDeleteArgs>(args: SelectSubset<T, AgencyDeleteArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Agency.
     * @param {AgencyUpdateArgs} args - Arguments to update one Agency.
     * @example
     * // Update one Agency
     * const agency = await prisma.agency.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgencyUpdateArgs>(args: SelectSubset<T, AgencyUpdateArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Agencies.
     * @param {AgencyDeleteManyArgs} args - Arguments to filter Agencies to delete.
     * @example
     * // Delete a few Agencies
     * const { count } = await prisma.agency.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgencyDeleteManyArgs>(args?: SelectSubset<T, AgencyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agencies
     * const agency = await prisma.agency.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgencyUpdateManyArgs>(args: SelectSubset<T, AgencyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agencies and returns the data updated in the database.
     * @param {AgencyUpdateManyAndReturnArgs} args - Arguments to update many Agencies.
     * @example
     * // Update many Agencies
     * const agency = await prisma.agency.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Agencies and only return the `id`
     * const agencyWithIdOnly = await prisma.agency.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgencyUpdateManyAndReturnArgs>(args: SelectSubset<T, AgencyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Agency.
     * @param {AgencyUpsertArgs} args - Arguments to update or create a Agency.
     * @example
     * // Update or create a Agency
     * const agency = await prisma.agency.upsert({
     *   create: {
     *     // ... data to create a Agency
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agency we want to update
     *   }
     * })
     */
    upsert<T extends AgencyUpsertArgs>(args: SelectSubset<T, AgencyUpsertArgs<ExtArgs>>): Prisma__AgencyClient<$Result.GetResult<Prisma.$AgencyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Agencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyCountArgs} args - Arguments to filter Agencies to count.
     * @example
     * // Count the number of Agencies
     * const count = await prisma.agency.count({
     *   where: {
     *     // ... the filter for the Agencies we want to count
     *   }
     * })
    **/
    count<T extends AgencyCountArgs>(
      args?: Subset<T, AgencyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgencyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgencyAggregateArgs>(args: Subset<T, AgencyAggregateArgs>): Prisma.PrismaPromise<GetAgencyAggregateType<T>>

    /**
     * Group by Agency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgencyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgencyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgencyGroupByArgs['orderBy'] }
        : { orderBy?: AgencyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgencyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgencyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Agency model
   */
  readonly fields: AgencyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Agency.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgencyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessAcc<T extends BusinessAccDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAccDefaultArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Agency model
   */
  interface AgencyFieldRefs {
    readonly id: FieldRef<"Agency", 'Int'>
    readonly createdAt: FieldRef<"Agency", 'DateTime'>
    readonly updatedAt: FieldRef<"Agency", 'DateTime'>
    readonly Category: FieldRef<"Agency", 'Category'>
    readonly title: FieldRef<"Agency", 'String'>
    readonly description: FieldRef<"Agency", 'String'>
    readonly image: FieldRef<"Agency", 'String'>
    readonly callToAction: FieldRef<"Agency", 'String'>
    readonly businessId: FieldRef<"Agency", 'Int'>
    readonly authorId: FieldRef<"Agency", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Agency findUnique
   */
  export type AgencyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency findUniqueOrThrow
   */
  export type AgencyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency findFirst
   */
  export type AgencyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agencies.
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencies.
     */
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Agency findFirstOrThrow
   */
  export type AgencyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agency to fetch.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agencies.
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencies.
     */
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Agency findMany
   */
  export type AgencyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter, which Agencies to fetch.
     */
    where?: AgencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencies to fetch.
     */
    orderBy?: AgencyOrderByWithRelationInput | AgencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Agencies.
     */
    cursor?: AgencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencies.
     */
    skip?: number
    distinct?: AgencyScalarFieldEnum | AgencyScalarFieldEnum[]
  }

  /**
   * Agency create
   */
  export type AgencyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * The data needed to create a Agency.
     */
    data: XOR<AgencyCreateInput, AgencyUncheckedCreateInput>
  }

  /**
   * Agency createMany
   */
  export type AgencyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Agencies.
     */
    data: AgencyCreateManyInput | AgencyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Agency createManyAndReturn
   */
  export type AgencyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * The data used to create many Agencies.
     */
    data: AgencyCreateManyInput | AgencyCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agency update
   */
  export type AgencyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * The data needed to update a Agency.
     */
    data: XOR<AgencyUpdateInput, AgencyUncheckedUpdateInput>
    /**
     * Choose, which Agency to update.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency updateMany
   */
  export type AgencyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Agencies.
     */
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyInput>
    /**
     * Filter which Agencies to update
     */
    where?: AgencyWhereInput
    /**
     * Limit how many Agencies to update.
     */
    limit?: number
  }

  /**
   * Agency updateManyAndReturn
   */
  export type AgencyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * The data used to update Agencies.
     */
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyInput>
    /**
     * Filter which Agencies to update
     */
    where?: AgencyWhereInput
    /**
     * Limit how many Agencies to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agency upsert
   */
  export type AgencyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * The filter to search for the Agency to update in case it exists.
     */
    where: AgencyWhereUniqueInput
    /**
     * In case the Agency found by the `where` argument doesn't exist, create a new Agency with this data.
     */
    create: XOR<AgencyCreateInput, AgencyUncheckedCreateInput>
    /**
     * In case the Agency was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgencyUpdateInput, AgencyUncheckedUpdateInput>
  }

  /**
   * Agency delete
   */
  export type AgencyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
    /**
     * Filter which Agency to delete.
     */
    where: AgencyWhereUniqueInput
  }

  /**
   * Agency deleteMany
   */
  export type AgencyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agencies to delete
     */
    where?: AgencyWhereInput
    /**
     * Limit how many Agencies to delete.
     */
    limit?: number
  }

  /**
   * Agency without action
   */
  export type AgencyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agency
     */
    select?: AgencySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agency
     */
    omit?: AgencyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgencyInclude<ExtArgs> | null
  }


  /**
   * Model Orm
   */

  export type AggregateOrm = {
    _count: OrmCountAggregateOutputType | null
    _avg: OrmAvgAggregateOutputType | null
    _sum: OrmSumAggregateOutputType | null
    _min: OrmMinAggregateOutputType | null
    _max: OrmMaxAggregateOutputType | null
  }

  export type OrmAvgAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type OrmSumAggregateOutputType = {
    id: number | null
    businessId: number | null
  }

  export type OrmMinAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type OrmMaxAggregateOutputType = {
    id: number | null
    createdAt: Date | null
    updatedAt: Date | null
    Category: $Enums.Category | null
    title: string | null
    description: string | null
    image: string | null
    callToAction: string | null
    businessId: number | null
    authorId: string | null
  }

  export type OrmCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    Category: number
    title: number
    description: number
    image: number
    callToAction: number
    businessId: number
    authorId: number
    _all: number
  }


  export type OrmAvgAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type OrmSumAggregateInputType = {
    id?: true
    businessId?: true
  }

  export type OrmMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type OrmMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
  }

  export type OrmCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    Category?: true
    title?: true
    description?: true
    image?: true
    callToAction?: true
    businessId?: true
    authorId?: true
    _all?: true
  }

  export type OrmAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orm to aggregate.
     */
    where?: OrmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orms to fetch.
     */
    orderBy?: OrmOrderByWithRelationInput | OrmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orms
    **/
    _count?: true | OrmCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrmAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrmSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrmMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrmMaxAggregateInputType
  }

  export type GetOrmAggregateType<T extends OrmAggregateArgs> = {
        [P in keyof T & keyof AggregateOrm]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrm[P]>
      : GetScalarType<T[P], AggregateOrm[P]>
  }




  export type OrmGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrmWhereInput
    orderBy?: OrmOrderByWithAggregationInput | OrmOrderByWithAggregationInput[]
    by: OrmScalarFieldEnum[] | OrmScalarFieldEnum
    having?: OrmScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrmCountAggregateInputType | true
    _avg?: OrmAvgAggregateInputType
    _sum?: OrmSumAggregateInputType
    _min?: OrmMinAggregateInputType
    _max?: OrmMaxAggregateInputType
  }

  export type OrmGroupByOutputType = {
    id: number
    createdAt: Date
    updatedAt: Date
    Category: $Enums.Category
    title: string
    description: string
    image: string | null
    callToAction: string | null
    businessId: number
    authorId: string
    _count: OrmCountAggregateOutputType | null
    _avg: OrmAvgAggregateOutputType | null
    _sum: OrmSumAggregateOutputType | null
    _min: OrmMinAggregateOutputType | null
    _max: OrmMaxAggregateOutputType | null
  }

  type GetOrmGroupByPayload<T extends OrmGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrmGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrmGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrmGroupByOutputType[P]>
            : GetScalarType<T[P], OrmGroupByOutputType[P]>
        }
      >
    >


  export type OrmSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orm"]>

  export type OrmSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orm"]>

  export type OrmSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orm"]>

  export type OrmSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Category?: boolean
    title?: boolean
    description?: boolean
    image?: boolean
    callToAction?: boolean
    businessId?: boolean
    authorId?: boolean
  }

  export type OrmOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "updatedAt" | "Category" | "title" | "description" | "image" | "callToAction" | "businessId" | "authorId", ExtArgs["result"]["orm"]>
  export type OrmInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type OrmIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }
  export type OrmIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    businessAcc?: boolean | BusinessAccDefaultArgs<ExtArgs>
    author?: boolean | MemberDefaultArgs<ExtArgs>
  }

  export type $OrmPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Orm"
    objects: {
      businessAcc: Prisma.$BusinessAccPayload<ExtArgs>
      author: Prisma.$MemberPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      createdAt: Date
      updatedAt: Date
      Category: $Enums.Category
      title: string
      description: string
      image: string | null
      callToAction: string | null
      businessId: number
      authorId: string
    }, ExtArgs["result"]["orm"]>
    composites: {}
  }

  type OrmGetPayload<S extends boolean | null | undefined | OrmDefaultArgs> = $Result.GetResult<Prisma.$OrmPayload, S>

  type OrmCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrmFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrmCountAggregateInputType | true
    }

  export interface OrmDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Orm'], meta: { name: 'Orm' } }
    /**
     * Find zero or one Orm that matches the filter.
     * @param {OrmFindUniqueArgs} args - Arguments to find a Orm
     * @example
     * // Get one Orm
     * const orm = await prisma.orm.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrmFindUniqueArgs>(args: SelectSubset<T, OrmFindUniqueArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Orm that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrmFindUniqueOrThrowArgs} args - Arguments to find a Orm
     * @example
     * // Get one Orm
     * const orm = await prisma.orm.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrmFindUniqueOrThrowArgs>(args: SelectSubset<T, OrmFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Orm that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmFindFirstArgs} args - Arguments to find a Orm
     * @example
     * // Get one Orm
     * const orm = await prisma.orm.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrmFindFirstArgs>(args?: SelectSubset<T, OrmFindFirstArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Orm that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmFindFirstOrThrowArgs} args - Arguments to find a Orm
     * @example
     * // Get one Orm
     * const orm = await prisma.orm.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrmFindFirstOrThrowArgs>(args?: SelectSubset<T, OrmFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orms
     * const orms = await prisma.orm.findMany()
     * 
     * // Get first 10 Orms
     * const orms = await prisma.orm.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ormWithIdOnly = await prisma.orm.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrmFindManyArgs>(args?: SelectSubset<T, OrmFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Orm.
     * @param {OrmCreateArgs} args - Arguments to create a Orm.
     * @example
     * // Create one Orm
     * const Orm = await prisma.orm.create({
     *   data: {
     *     // ... data to create a Orm
     *   }
     * })
     * 
     */
    create<T extends OrmCreateArgs>(args: SelectSubset<T, OrmCreateArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orms.
     * @param {OrmCreateManyArgs} args - Arguments to create many Orms.
     * @example
     * // Create many Orms
     * const orm = await prisma.orm.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrmCreateManyArgs>(args?: SelectSubset<T, OrmCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orms and returns the data saved in the database.
     * @param {OrmCreateManyAndReturnArgs} args - Arguments to create many Orms.
     * @example
     * // Create many Orms
     * const orm = await prisma.orm.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orms and only return the `id`
     * const ormWithIdOnly = await prisma.orm.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrmCreateManyAndReturnArgs>(args?: SelectSubset<T, OrmCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Orm.
     * @param {OrmDeleteArgs} args - Arguments to delete one Orm.
     * @example
     * // Delete one Orm
     * const Orm = await prisma.orm.delete({
     *   where: {
     *     // ... filter to delete one Orm
     *   }
     * })
     * 
     */
    delete<T extends OrmDeleteArgs>(args: SelectSubset<T, OrmDeleteArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Orm.
     * @param {OrmUpdateArgs} args - Arguments to update one Orm.
     * @example
     * // Update one Orm
     * const orm = await prisma.orm.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrmUpdateArgs>(args: SelectSubset<T, OrmUpdateArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orms.
     * @param {OrmDeleteManyArgs} args - Arguments to filter Orms to delete.
     * @example
     * // Delete a few Orms
     * const { count } = await prisma.orm.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrmDeleteManyArgs>(args?: SelectSubset<T, OrmDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orms
     * const orm = await prisma.orm.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrmUpdateManyArgs>(args: SelectSubset<T, OrmUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orms and returns the data updated in the database.
     * @param {OrmUpdateManyAndReturnArgs} args - Arguments to update many Orms.
     * @example
     * // Update many Orms
     * const orm = await prisma.orm.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orms and only return the `id`
     * const ormWithIdOnly = await prisma.orm.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrmUpdateManyAndReturnArgs>(args: SelectSubset<T, OrmUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Orm.
     * @param {OrmUpsertArgs} args - Arguments to update or create a Orm.
     * @example
     * // Update or create a Orm
     * const orm = await prisma.orm.upsert({
     *   create: {
     *     // ... data to create a Orm
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Orm we want to update
     *   }
     * })
     */
    upsert<T extends OrmUpsertArgs>(args: SelectSubset<T, OrmUpsertArgs<ExtArgs>>): Prisma__OrmClient<$Result.GetResult<Prisma.$OrmPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmCountArgs} args - Arguments to filter Orms to count.
     * @example
     * // Count the number of Orms
     * const count = await prisma.orm.count({
     *   where: {
     *     // ... the filter for the Orms we want to count
     *   }
     * })
    **/
    count<T extends OrmCountArgs>(
      args?: Subset<T, OrmCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrmCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Orm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrmAggregateArgs>(args: Subset<T, OrmAggregateArgs>): Prisma.PrismaPromise<GetOrmAggregateType<T>>

    /**
     * Group by Orm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrmGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrmGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrmGroupByArgs['orderBy'] }
        : { orderBy?: OrmGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrmGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrmGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Orm model
   */
  readonly fields: OrmFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Orm.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrmClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    businessAcc<T extends BusinessAccDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BusinessAccDefaultArgs<ExtArgs>>): Prisma__BusinessAccClient<$Result.GetResult<Prisma.$BusinessAccPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends MemberDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MemberDefaultArgs<ExtArgs>>): Prisma__MemberClient<$Result.GetResult<Prisma.$MemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Orm model
   */
  interface OrmFieldRefs {
    readonly id: FieldRef<"Orm", 'Int'>
    readonly createdAt: FieldRef<"Orm", 'DateTime'>
    readonly updatedAt: FieldRef<"Orm", 'DateTime'>
    readonly Category: FieldRef<"Orm", 'Category'>
    readonly title: FieldRef<"Orm", 'String'>
    readonly description: FieldRef<"Orm", 'String'>
    readonly image: FieldRef<"Orm", 'String'>
    readonly callToAction: FieldRef<"Orm", 'String'>
    readonly businessId: FieldRef<"Orm", 'Int'>
    readonly authorId: FieldRef<"Orm", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Orm findUnique
   */
  export type OrmFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * Filter, which Orm to fetch.
     */
    where: OrmWhereUniqueInput
  }

  /**
   * Orm findUniqueOrThrow
   */
  export type OrmFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * Filter, which Orm to fetch.
     */
    where: OrmWhereUniqueInput
  }

  /**
   * Orm findFirst
   */
  export type OrmFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * Filter, which Orm to fetch.
     */
    where?: OrmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orms to fetch.
     */
    orderBy?: OrmOrderByWithRelationInput | OrmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orms.
     */
    cursor?: OrmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orms.
     */
    distinct?: OrmScalarFieldEnum | OrmScalarFieldEnum[]
  }

  /**
   * Orm findFirstOrThrow
   */
  export type OrmFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * Filter, which Orm to fetch.
     */
    where?: OrmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orms to fetch.
     */
    orderBy?: OrmOrderByWithRelationInput | OrmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orms.
     */
    cursor?: OrmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orms.
     */
    distinct?: OrmScalarFieldEnum | OrmScalarFieldEnum[]
  }

  /**
   * Orm findMany
   */
  export type OrmFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * Filter, which Orms to fetch.
     */
    where?: OrmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orms to fetch.
     */
    orderBy?: OrmOrderByWithRelationInput | OrmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orms.
     */
    cursor?: OrmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orms.
     */
    skip?: number
    distinct?: OrmScalarFieldEnum | OrmScalarFieldEnum[]
  }

  /**
   * Orm create
   */
  export type OrmCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * The data needed to create a Orm.
     */
    data: XOR<OrmCreateInput, OrmUncheckedCreateInput>
  }

  /**
   * Orm createMany
   */
  export type OrmCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orms.
     */
    data: OrmCreateManyInput | OrmCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Orm createManyAndReturn
   */
  export type OrmCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * The data used to create many Orms.
     */
    data: OrmCreateManyInput | OrmCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Orm update
   */
  export type OrmUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * The data needed to update a Orm.
     */
    data: XOR<OrmUpdateInput, OrmUncheckedUpdateInput>
    /**
     * Choose, which Orm to update.
     */
    where: OrmWhereUniqueInput
  }

  /**
   * Orm updateMany
   */
  export type OrmUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orms.
     */
    data: XOR<OrmUpdateManyMutationInput, OrmUncheckedUpdateManyInput>
    /**
     * Filter which Orms to update
     */
    where?: OrmWhereInput
    /**
     * Limit how many Orms to update.
     */
    limit?: number
  }

  /**
   * Orm updateManyAndReturn
   */
  export type OrmUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * The data used to update Orms.
     */
    data: XOR<OrmUpdateManyMutationInput, OrmUncheckedUpdateManyInput>
    /**
     * Filter which Orms to update
     */
    where?: OrmWhereInput
    /**
     * Limit how many Orms to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Orm upsert
   */
  export type OrmUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * The filter to search for the Orm to update in case it exists.
     */
    where: OrmWhereUniqueInput
    /**
     * In case the Orm found by the `where` argument doesn't exist, create a new Orm with this data.
     */
    create: XOR<OrmCreateInput, OrmUncheckedCreateInput>
    /**
     * In case the Orm was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrmUpdateInput, OrmUncheckedUpdateInput>
  }

  /**
   * Orm delete
   */
  export type OrmDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
    /**
     * Filter which Orm to delete.
     */
    where: OrmWhereUniqueInput
  }

  /**
   * Orm deleteMany
   */
  export type OrmDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orms to delete
     */
    where?: OrmWhereInput
    /**
     * Limit how many Orms to delete.
     */
    limit?: number
  }

  /**
   * Orm without action
   */
  export type OrmDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Orm
     */
    select?: OrmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Orm
     */
    omit?: OrmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrmInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    firstName: 'firstName',
    lastName: 'lastName',
    avatar: 'avatar',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    phone: 'phone',
    username: 'username'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const MemberScalarFieldEnum: {
    uniqueId: 'uniqueId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    businessId: 'businessId'
  };

  export type MemberScalarFieldEnum = (typeof MemberScalarFieldEnum)[keyof typeof MemberScalarFieldEnum]


  export const BusinessAccScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    businessType: 'businessType',
    userId: 'userId'
  };

  export type BusinessAccScalarFieldEnum = (typeof BusinessAccScalarFieldEnum)[keyof typeof BusinessAccScalarFieldEnum]


  export const OfficeScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    Category: 'Category',
    title: 'title',
    description: 'description',
    image: 'image',
    callToAction: 'callToAction',
    businessId: 'businessId',
    authorId: 'authorId'
  };

  export type OfficeScalarFieldEnum = (typeof OfficeScalarFieldEnum)[keyof typeof OfficeScalarFieldEnum]


  export const CoachScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    Category: 'Category',
    title: 'title',
    description: 'description',
    image: 'image',
    callToAction: 'callToAction',
    businessId: 'businessId',
    authorId: 'authorId'
  };

  export type CoachScalarFieldEnum = (typeof CoachScalarFieldEnum)[keyof typeof CoachScalarFieldEnum]


  export const BankScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    Category: 'Category',
    title: 'title',
    description: 'description',
    image: 'image',
    callToAction: 'callToAction',
    businessId: 'businessId',
    authorId: 'authorId'
  };

  export type BankScalarFieldEnum = (typeof BankScalarFieldEnum)[keyof typeof BankScalarFieldEnum]


  export const AgencyScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    Category: 'Category',
    title: 'title',
    description: 'description',
    image: 'image',
    callToAction: 'callToAction',
    businessId: 'businessId',
    authorId: 'authorId'
  };

  export type AgencyScalarFieldEnum = (typeof AgencyScalarFieldEnum)[keyof typeof AgencyScalarFieldEnum]


  export const OrmScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    Category: 'Category',
    title: 'title',
    description: 'description',
    image: 'image',
    callToAction: 'callToAction',
    businessId: 'businessId',
    authorId: 'authorId'
  };

  export type OrmScalarFieldEnum = (typeof OrmScalarFieldEnum)[keyof typeof OrmScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Category'
   */
  export type EnumCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Category'>
    


  /**
   * Reference to a field of type 'Category[]'
   */
  export type ListEnumCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Category[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    phone?: StringFilter<"User"> | string
    username?: StringNullableFilter<"User"> | string | null
    Business?: BusinessAccListRelationFilter
    member?: MemberListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    avatar?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phone?: SortOrder
    username?: SortOrderInput | SortOrder
    Business?: BusinessAccOrderByRelationAggregateInput
    member?: MemberOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    phone?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    Business?: BusinessAccListRelationFilter
    member?: MemberListRelationFilter
  }, "id" | "email" | "phone" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    avatar?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phone?: SortOrder
    username?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    avatar?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    phone?: StringWithAggregatesFilter<"User"> | string
    username?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type MemberWhereInput = {
    AND?: MemberWhereInput | MemberWhereInput[]
    OR?: MemberWhereInput[]
    NOT?: MemberWhereInput | MemberWhereInput[]
    uniqueId?: StringFilter<"Member"> | string
    createdAt?: DateTimeFilter<"Member"> | Date | string
    updatedAt?: DateTimeFilter<"Member"> | Date | string
    userId?: IntFilter<"Member"> | number
    businessId?: IntNullableFilter<"Member"> | number | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    business?: XOR<BusinessAccNullableScalarRelationFilter, BusinessAccWhereInput> | null
    office?: OfficeListRelationFilter
    coach?: CoachListRelationFilter
    bank?: BankListRelationFilter
    agency?: AgencyListRelationFilter
    orm?: OrmListRelationFilter
  }

  export type MemberOrderByWithRelationInput = {
    uniqueId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    businessId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    business?: BusinessAccOrderByWithRelationInput
    office?: OfficeOrderByRelationAggregateInput
    coach?: CoachOrderByRelationAggregateInput
    bank?: BankOrderByRelationAggregateInput
    agency?: AgencyOrderByRelationAggregateInput
    orm?: OrmOrderByRelationAggregateInput
  }

  export type MemberWhereUniqueInput = Prisma.AtLeast<{
    uniqueId?: string
    AND?: MemberWhereInput | MemberWhereInput[]
    OR?: MemberWhereInput[]
    NOT?: MemberWhereInput | MemberWhereInput[]
    createdAt?: DateTimeFilter<"Member"> | Date | string
    updatedAt?: DateTimeFilter<"Member"> | Date | string
    userId?: IntFilter<"Member"> | number
    businessId?: IntNullableFilter<"Member"> | number | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    business?: XOR<BusinessAccNullableScalarRelationFilter, BusinessAccWhereInput> | null
    office?: OfficeListRelationFilter
    coach?: CoachListRelationFilter
    bank?: BankListRelationFilter
    agency?: AgencyListRelationFilter
    orm?: OrmListRelationFilter
  }, "uniqueId">

  export type MemberOrderByWithAggregationInput = {
    uniqueId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    businessId?: SortOrderInput | SortOrder
    _count?: MemberCountOrderByAggregateInput
    _avg?: MemberAvgOrderByAggregateInput
    _max?: MemberMaxOrderByAggregateInput
    _min?: MemberMinOrderByAggregateInput
    _sum?: MemberSumOrderByAggregateInput
  }

  export type MemberScalarWhereWithAggregatesInput = {
    AND?: MemberScalarWhereWithAggregatesInput | MemberScalarWhereWithAggregatesInput[]
    OR?: MemberScalarWhereWithAggregatesInput[]
    NOT?: MemberScalarWhereWithAggregatesInput | MemberScalarWhereWithAggregatesInput[]
    uniqueId?: StringWithAggregatesFilter<"Member"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Member"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Member"> | Date | string
    userId?: IntWithAggregatesFilter<"Member"> | number
    businessId?: IntNullableWithAggregatesFilter<"Member"> | number | null
  }

  export type BusinessAccWhereInput = {
    AND?: BusinessAccWhereInput | BusinessAccWhereInput[]
    OR?: BusinessAccWhereInput[]
    NOT?: BusinessAccWhereInput | BusinessAccWhereInput[]
    id?: IntFilter<"BusinessAcc"> | number
    createdAt?: DateTimeNullableFilter<"BusinessAcc"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"BusinessAcc"> | Date | string | null
    name?: StringFilter<"BusinessAcc"> | string
    businessType?: EnumCategoryFilter<"BusinessAcc"> | $Enums.Category
    userId?: IntFilter<"BusinessAcc"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    AllMember?: MemberListRelationFilter
    Office?: OfficeListRelationFilter
    Coach?: CoachListRelationFilter
    Bank?: BankListRelationFilter
    Agency?: AgencyListRelationFilter
    Orm?: OrmListRelationFilter
  }

  export type BusinessAccOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    name?: SortOrder
    businessType?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
    AllMember?: MemberOrderByRelationAggregateInput
    Office?: OfficeOrderByRelationAggregateInput
    Coach?: CoachOrderByRelationAggregateInput
    Bank?: BankOrderByRelationAggregateInput
    Agency?: AgencyOrderByRelationAggregateInput
    Orm?: OrmOrderByRelationAggregateInput
  }

  export type BusinessAccWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: BusinessAccWhereInput | BusinessAccWhereInput[]
    OR?: BusinessAccWhereInput[]
    NOT?: BusinessAccWhereInput | BusinessAccWhereInput[]
    createdAt?: DateTimeNullableFilter<"BusinessAcc"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"BusinessAcc"> | Date | string | null
    name?: StringFilter<"BusinessAcc"> | string
    businessType?: EnumCategoryFilter<"BusinessAcc"> | $Enums.Category
    userId?: IntFilter<"BusinessAcc"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    AllMember?: MemberListRelationFilter
    Office?: OfficeListRelationFilter
    Coach?: CoachListRelationFilter
    Bank?: BankListRelationFilter
    Agency?: AgencyListRelationFilter
    Orm?: OrmListRelationFilter
  }, "id">

  export type BusinessAccOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    name?: SortOrder
    businessType?: SortOrder
    userId?: SortOrder
    _count?: BusinessAccCountOrderByAggregateInput
    _avg?: BusinessAccAvgOrderByAggregateInput
    _max?: BusinessAccMaxOrderByAggregateInput
    _min?: BusinessAccMinOrderByAggregateInput
    _sum?: BusinessAccSumOrderByAggregateInput
  }

  export type BusinessAccScalarWhereWithAggregatesInput = {
    AND?: BusinessAccScalarWhereWithAggregatesInput | BusinessAccScalarWhereWithAggregatesInput[]
    OR?: BusinessAccScalarWhereWithAggregatesInput[]
    NOT?: BusinessAccScalarWhereWithAggregatesInput | BusinessAccScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"BusinessAcc"> | number
    createdAt?: DateTimeNullableWithAggregatesFilter<"BusinessAcc"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"BusinessAcc"> | Date | string | null
    name?: StringWithAggregatesFilter<"BusinessAcc"> | string
    businessType?: EnumCategoryWithAggregatesFilter<"BusinessAcc"> | $Enums.Category
    userId?: IntWithAggregatesFilter<"BusinessAcc"> | number
  }

  export type OfficeWhereInput = {
    AND?: OfficeWhereInput | OfficeWhereInput[]
    OR?: OfficeWhereInput[]
    NOT?: OfficeWhereInput | OfficeWhereInput[]
    id?: IntFilter<"Office"> | number
    createdAt?: DateTimeFilter<"Office"> | Date | string
    updatedAt?: DateTimeFilter<"Office"> | Date | string
    Category?: EnumCategoryFilter<"Office"> | $Enums.Category
    title?: StringFilter<"Office"> | string
    description?: StringFilter<"Office"> | string
    image?: StringNullableFilter<"Office"> | string | null
    callToAction?: StringNullableFilter<"Office"> | string | null
    businessId?: IntFilter<"Office"> | number
    authorId?: StringFilter<"Office"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }

  export type OfficeOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    businessAcc?: BusinessAccOrderByWithRelationInput
    author?: MemberOrderByWithRelationInput
  }

  export type OfficeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OfficeWhereInput | OfficeWhereInput[]
    OR?: OfficeWhereInput[]
    NOT?: OfficeWhereInput | OfficeWhereInput[]
    createdAt?: DateTimeFilter<"Office"> | Date | string
    updatedAt?: DateTimeFilter<"Office"> | Date | string
    Category?: EnumCategoryFilter<"Office"> | $Enums.Category
    title?: StringFilter<"Office"> | string
    description?: StringFilter<"Office"> | string
    image?: StringNullableFilter<"Office"> | string | null
    callToAction?: StringNullableFilter<"Office"> | string | null
    businessId?: IntFilter<"Office"> | number
    authorId?: StringFilter<"Office"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }, "id">

  export type OfficeOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    _count?: OfficeCountOrderByAggregateInput
    _avg?: OfficeAvgOrderByAggregateInput
    _max?: OfficeMaxOrderByAggregateInput
    _min?: OfficeMinOrderByAggregateInput
    _sum?: OfficeSumOrderByAggregateInput
  }

  export type OfficeScalarWhereWithAggregatesInput = {
    AND?: OfficeScalarWhereWithAggregatesInput | OfficeScalarWhereWithAggregatesInput[]
    OR?: OfficeScalarWhereWithAggregatesInput[]
    NOT?: OfficeScalarWhereWithAggregatesInput | OfficeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Office"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Office"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Office"> | Date | string
    Category?: EnumCategoryWithAggregatesFilter<"Office"> | $Enums.Category
    title?: StringWithAggregatesFilter<"Office"> | string
    description?: StringWithAggregatesFilter<"Office"> | string
    image?: StringNullableWithAggregatesFilter<"Office"> | string | null
    callToAction?: StringNullableWithAggregatesFilter<"Office"> | string | null
    businessId?: IntWithAggregatesFilter<"Office"> | number
    authorId?: StringWithAggregatesFilter<"Office"> | string
  }

  export type CoachWhereInput = {
    AND?: CoachWhereInput | CoachWhereInput[]
    OR?: CoachWhereInput[]
    NOT?: CoachWhereInput | CoachWhereInput[]
    id?: IntFilter<"Coach"> | number
    createdAt?: DateTimeFilter<"Coach"> | Date | string
    updatedAt?: DateTimeFilter<"Coach"> | Date | string
    Category?: EnumCategoryFilter<"Coach"> | $Enums.Category
    title?: StringFilter<"Coach"> | string
    description?: StringFilter<"Coach"> | string
    image?: StringNullableFilter<"Coach"> | string | null
    callToAction?: StringNullableFilter<"Coach"> | string | null
    businessId?: IntFilter<"Coach"> | number
    authorId?: StringFilter<"Coach"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }

  export type CoachOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    businessAcc?: BusinessAccOrderByWithRelationInput
    author?: MemberOrderByWithRelationInput
  }

  export type CoachWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CoachWhereInput | CoachWhereInput[]
    OR?: CoachWhereInput[]
    NOT?: CoachWhereInput | CoachWhereInput[]
    createdAt?: DateTimeFilter<"Coach"> | Date | string
    updatedAt?: DateTimeFilter<"Coach"> | Date | string
    Category?: EnumCategoryFilter<"Coach"> | $Enums.Category
    title?: StringFilter<"Coach"> | string
    description?: StringFilter<"Coach"> | string
    image?: StringNullableFilter<"Coach"> | string | null
    callToAction?: StringNullableFilter<"Coach"> | string | null
    businessId?: IntFilter<"Coach"> | number
    authorId?: StringFilter<"Coach"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }, "id">

  export type CoachOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    _count?: CoachCountOrderByAggregateInput
    _avg?: CoachAvgOrderByAggregateInput
    _max?: CoachMaxOrderByAggregateInput
    _min?: CoachMinOrderByAggregateInput
    _sum?: CoachSumOrderByAggregateInput
  }

  export type CoachScalarWhereWithAggregatesInput = {
    AND?: CoachScalarWhereWithAggregatesInput | CoachScalarWhereWithAggregatesInput[]
    OR?: CoachScalarWhereWithAggregatesInput[]
    NOT?: CoachScalarWhereWithAggregatesInput | CoachScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Coach"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Coach"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Coach"> | Date | string
    Category?: EnumCategoryWithAggregatesFilter<"Coach"> | $Enums.Category
    title?: StringWithAggregatesFilter<"Coach"> | string
    description?: StringWithAggregatesFilter<"Coach"> | string
    image?: StringNullableWithAggregatesFilter<"Coach"> | string | null
    callToAction?: StringNullableWithAggregatesFilter<"Coach"> | string | null
    businessId?: IntWithAggregatesFilter<"Coach"> | number
    authorId?: StringWithAggregatesFilter<"Coach"> | string
  }

  export type BankWhereInput = {
    AND?: BankWhereInput | BankWhereInput[]
    OR?: BankWhereInput[]
    NOT?: BankWhereInput | BankWhereInput[]
    id?: IntFilter<"Bank"> | number
    createdAt?: DateTimeFilter<"Bank"> | Date | string
    updatedAt?: DateTimeFilter<"Bank"> | Date | string
    Category?: EnumCategoryFilter<"Bank"> | $Enums.Category
    title?: StringFilter<"Bank"> | string
    description?: StringFilter<"Bank"> | string
    image?: StringNullableFilter<"Bank"> | string | null
    callToAction?: StringNullableFilter<"Bank"> | string | null
    businessId?: IntFilter<"Bank"> | number
    authorId?: StringFilter<"Bank"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }

  export type BankOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    businessAcc?: BusinessAccOrderByWithRelationInput
    author?: MemberOrderByWithRelationInput
  }

  export type BankWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: BankWhereInput | BankWhereInput[]
    OR?: BankWhereInput[]
    NOT?: BankWhereInput | BankWhereInput[]
    createdAt?: DateTimeFilter<"Bank"> | Date | string
    updatedAt?: DateTimeFilter<"Bank"> | Date | string
    Category?: EnumCategoryFilter<"Bank"> | $Enums.Category
    title?: StringFilter<"Bank"> | string
    description?: StringFilter<"Bank"> | string
    image?: StringNullableFilter<"Bank"> | string | null
    callToAction?: StringNullableFilter<"Bank"> | string | null
    businessId?: IntFilter<"Bank"> | number
    authorId?: StringFilter<"Bank"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }, "id">

  export type BankOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    _count?: BankCountOrderByAggregateInput
    _avg?: BankAvgOrderByAggregateInput
    _max?: BankMaxOrderByAggregateInput
    _min?: BankMinOrderByAggregateInput
    _sum?: BankSumOrderByAggregateInput
  }

  export type BankScalarWhereWithAggregatesInput = {
    AND?: BankScalarWhereWithAggregatesInput | BankScalarWhereWithAggregatesInput[]
    OR?: BankScalarWhereWithAggregatesInput[]
    NOT?: BankScalarWhereWithAggregatesInput | BankScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Bank"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Bank"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Bank"> | Date | string
    Category?: EnumCategoryWithAggregatesFilter<"Bank"> | $Enums.Category
    title?: StringWithAggregatesFilter<"Bank"> | string
    description?: StringWithAggregatesFilter<"Bank"> | string
    image?: StringNullableWithAggregatesFilter<"Bank"> | string | null
    callToAction?: StringNullableWithAggregatesFilter<"Bank"> | string | null
    businessId?: IntWithAggregatesFilter<"Bank"> | number
    authorId?: StringWithAggregatesFilter<"Bank"> | string
  }

  export type AgencyWhereInput = {
    AND?: AgencyWhereInput | AgencyWhereInput[]
    OR?: AgencyWhereInput[]
    NOT?: AgencyWhereInput | AgencyWhereInput[]
    id?: IntFilter<"Agency"> | number
    createdAt?: DateTimeFilter<"Agency"> | Date | string
    updatedAt?: DateTimeFilter<"Agency"> | Date | string
    Category?: EnumCategoryFilter<"Agency"> | $Enums.Category
    title?: StringFilter<"Agency"> | string
    description?: StringFilter<"Agency"> | string
    image?: StringNullableFilter<"Agency"> | string | null
    callToAction?: StringNullableFilter<"Agency"> | string | null
    businessId?: IntFilter<"Agency"> | number
    authorId?: StringFilter<"Agency"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }

  export type AgencyOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    businessAcc?: BusinessAccOrderByWithRelationInput
    author?: MemberOrderByWithRelationInput
  }

  export type AgencyWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AgencyWhereInput | AgencyWhereInput[]
    OR?: AgencyWhereInput[]
    NOT?: AgencyWhereInput | AgencyWhereInput[]
    createdAt?: DateTimeFilter<"Agency"> | Date | string
    updatedAt?: DateTimeFilter<"Agency"> | Date | string
    Category?: EnumCategoryFilter<"Agency"> | $Enums.Category
    title?: StringFilter<"Agency"> | string
    description?: StringFilter<"Agency"> | string
    image?: StringNullableFilter<"Agency"> | string | null
    callToAction?: StringNullableFilter<"Agency"> | string | null
    businessId?: IntFilter<"Agency"> | number
    authorId?: StringFilter<"Agency"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }, "id">

  export type AgencyOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    _count?: AgencyCountOrderByAggregateInput
    _avg?: AgencyAvgOrderByAggregateInput
    _max?: AgencyMaxOrderByAggregateInput
    _min?: AgencyMinOrderByAggregateInput
    _sum?: AgencySumOrderByAggregateInput
  }

  export type AgencyScalarWhereWithAggregatesInput = {
    AND?: AgencyScalarWhereWithAggregatesInput | AgencyScalarWhereWithAggregatesInput[]
    OR?: AgencyScalarWhereWithAggregatesInput[]
    NOT?: AgencyScalarWhereWithAggregatesInput | AgencyScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Agency"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Agency"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Agency"> | Date | string
    Category?: EnumCategoryWithAggregatesFilter<"Agency"> | $Enums.Category
    title?: StringWithAggregatesFilter<"Agency"> | string
    description?: StringWithAggregatesFilter<"Agency"> | string
    image?: StringNullableWithAggregatesFilter<"Agency"> | string | null
    callToAction?: StringNullableWithAggregatesFilter<"Agency"> | string | null
    businessId?: IntWithAggregatesFilter<"Agency"> | number
    authorId?: StringWithAggregatesFilter<"Agency"> | string
  }

  export type OrmWhereInput = {
    AND?: OrmWhereInput | OrmWhereInput[]
    OR?: OrmWhereInput[]
    NOT?: OrmWhereInput | OrmWhereInput[]
    id?: IntFilter<"Orm"> | number
    createdAt?: DateTimeFilter<"Orm"> | Date | string
    updatedAt?: DateTimeFilter<"Orm"> | Date | string
    Category?: EnumCategoryFilter<"Orm"> | $Enums.Category
    title?: StringFilter<"Orm"> | string
    description?: StringFilter<"Orm"> | string
    image?: StringNullableFilter<"Orm"> | string | null
    callToAction?: StringNullableFilter<"Orm"> | string | null
    businessId?: IntFilter<"Orm"> | number
    authorId?: StringFilter<"Orm"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }

  export type OrmOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    businessAcc?: BusinessAccOrderByWithRelationInput
    author?: MemberOrderByWithRelationInput
  }

  export type OrmWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OrmWhereInput | OrmWhereInput[]
    OR?: OrmWhereInput[]
    NOT?: OrmWhereInput | OrmWhereInput[]
    createdAt?: DateTimeFilter<"Orm"> | Date | string
    updatedAt?: DateTimeFilter<"Orm"> | Date | string
    Category?: EnumCategoryFilter<"Orm"> | $Enums.Category
    title?: StringFilter<"Orm"> | string
    description?: StringFilter<"Orm"> | string
    image?: StringNullableFilter<"Orm"> | string | null
    callToAction?: StringNullableFilter<"Orm"> | string | null
    businessId?: IntFilter<"Orm"> | number
    authorId?: StringFilter<"Orm"> | string
    businessAcc?: XOR<BusinessAccScalarRelationFilter, BusinessAccWhereInput>
    author?: XOR<MemberScalarRelationFilter, MemberWhereInput>
  }, "id">

  export type OrmOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrderInput | SortOrder
    callToAction?: SortOrderInput | SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
    _count?: OrmCountOrderByAggregateInput
    _avg?: OrmAvgOrderByAggregateInput
    _max?: OrmMaxOrderByAggregateInput
    _min?: OrmMinOrderByAggregateInput
    _sum?: OrmSumOrderByAggregateInput
  }

  export type OrmScalarWhereWithAggregatesInput = {
    AND?: OrmScalarWhereWithAggregatesInput | OrmScalarWhereWithAggregatesInput[]
    OR?: OrmScalarWhereWithAggregatesInput[]
    NOT?: OrmScalarWhereWithAggregatesInput | OrmScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Orm"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Orm"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Orm"> | Date | string
    Category?: EnumCategoryWithAggregatesFilter<"Orm"> | $Enums.Category
    title?: StringWithAggregatesFilter<"Orm"> | string
    description?: StringWithAggregatesFilter<"Orm"> | string
    image?: StringNullableWithAggregatesFilter<"Orm"> | string | null
    callToAction?: StringNullableWithAggregatesFilter<"Orm"> | string | null
    businessId?: IntWithAggregatesFilter<"Orm"> | number
    authorId?: StringWithAggregatesFilter<"Orm"> | string
  }

  export type UserCreateInput = {
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
    Business?: BusinessAccCreateNestedManyWithoutUserInput
    member?: MemberCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
    Business?: BusinessAccUncheckedCreateNestedManyWithoutUserInput
    member?: MemberUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    Business?: BusinessAccUpdateManyWithoutUserNestedInput
    member?: MemberUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    Business?: BusinessAccUncheckedUpdateManyWithoutUserNestedInput
    member?: MemberUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
  }

  export type UserUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MemberCreateInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberUpdateInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type MemberCreateManyInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
  }

  export type MemberUpdateManyMutationInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberUncheckedUpdateManyInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type BusinessAccCreateInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUpdateInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccCreateManyInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
  }

  export type BusinessAccUpdateManyMutationInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
  }

  export type BusinessAccUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type OfficeCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutOfficeInput
    author: MemberCreateNestedOneWithoutOfficeInput
  }

  export type OfficeUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type OfficeUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutOfficeNestedInput
    author?: MemberUpdateOneRequiredWithoutOfficeNestedInput
  }

  export type OfficeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type OfficeCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type OfficeUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OfficeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type CoachCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutCoachInput
    author: MemberCreateNestedOneWithoutCoachInput
  }

  export type CoachUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type CoachUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutCoachNestedInput
    author?: MemberUpdateOneRequiredWithoutCoachNestedInput
  }

  export type CoachUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type CoachCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type CoachUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CoachUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type BankCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutBankInput
    author: MemberCreateNestedOneWithoutBankInput
  }

  export type BankUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type BankUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutBankNestedInput
    author?: MemberUpdateOneRequiredWithoutBankNestedInput
  }

  export type BankUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type BankCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type BankUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BankUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type AgencyCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutAgencyInput
    author: MemberCreateNestedOneWithoutAgencyInput
  }

  export type AgencyUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type AgencyUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutAgencyNestedInput
    author?: MemberUpdateOneRequiredWithoutAgencyNestedInput
  }

  export type AgencyUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type AgencyCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type AgencyUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgencyUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type OrmCreateInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutOrmInput
    author: MemberCreateNestedOneWithoutOrmInput
  }

  export type OrmUncheckedCreateInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type OrmUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutOrmNestedInput
    author?: MemberUpdateOneRequiredWithoutOrmNestedInput
  }

  export type OrmUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type OrmCreateManyInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
    authorId: string
  }

  export type OrmUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OrmUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BusinessAccListRelationFilter = {
    every?: BusinessAccWhereInput
    some?: BusinessAccWhereInput
    none?: BusinessAccWhereInput
  }

  export type MemberListRelationFilter = {
    every?: MemberWhereInput
    some?: MemberWhereInput
    none?: MemberWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BusinessAccOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    avatar?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phone?: SortOrder
    username?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    avatar?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phone?: SortOrder
    username?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    avatar?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    phone?: SortOrder
    username?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type BusinessAccNullableScalarRelationFilter = {
    is?: BusinessAccWhereInput | null
    isNot?: BusinessAccWhereInput | null
  }

  export type OfficeListRelationFilter = {
    every?: OfficeWhereInput
    some?: OfficeWhereInput
    none?: OfficeWhereInput
  }

  export type CoachListRelationFilter = {
    every?: CoachWhereInput
    some?: CoachWhereInput
    none?: CoachWhereInput
  }

  export type BankListRelationFilter = {
    every?: BankWhereInput
    some?: BankWhereInput
    none?: BankWhereInput
  }

  export type AgencyListRelationFilter = {
    every?: AgencyWhereInput
    some?: AgencyWhereInput
    none?: AgencyWhereInput
  }

  export type OrmListRelationFilter = {
    every?: OrmWhereInput
    some?: OrmWhereInput
    none?: OrmWhereInput
  }

  export type OfficeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CoachOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BankOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgencyOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrmOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MemberCountOrderByAggregateInput = {
    uniqueId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    businessId?: SortOrder
  }

  export type MemberAvgOrderByAggregateInput = {
    userId?: SortOrder
    businessId?: SortOrder
  }

  export type MemberMaxOrderByAggregateInput = {
    uniqueId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    businessId?: SortOrder
  }

  export type MemberMinOrderByAggregateInput = {
    uniqueId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    businessId?: SortOrder
  }

  export type MemberSumOrderByAggregateInput = {
    userId?: SortOrder
    businessId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryFilter<$PrismaModel> | $Enums.Category
  }

  export type BusinessAccCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    businessType?: SortOrder
    userId?: SortOrder
  }

  export type BusinessAccAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type BusinessAccMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    businessType?: SortOrder
    userId?: SortOrder
  }

  export type BusinessAccMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    businessType?: SortOrder
    userId?: SortOrder
  }

  export type BusinessAccSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryWithAggregatesFilter<$PrismaModel> | $Enums.Category
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCategoryFilter<$PrismaModel>
    _max?: NestedEnumCategoryFilter<$PrismaModel>
  }

  export type BusinessAccScalarRelationFilter = {
    is?: BusinessAccWhereInput
    isNot?: BusinessAccWhereInput
  }

  export type MemberScalarRelationFilter = {
    is?: MemberWhereInput
    isNot?: MemberWhereInput
  }

  export type OfficeCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type OfficeAvgOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type OfficeMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type OfficeMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type OfficeSumOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type CoachCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type CoachAvgOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type CoachMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type CoachMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type CoachSumOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type BankCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type BankAvgOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type BankMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type BankMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type BankSumOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type AgencyCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type AgencyAvgOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type AgencyMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type AgencyMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type AgencySumOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type OrmCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type OrmAvgOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type OrmMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type OrmMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Category?: SortOrder
    title?: SortOrder
    description?: SortOrder
    image?: SortOrder
    callToAction?: SortOrder
    businessId?: SortOrder
    authorId?: SortOrder
  }

  export type OrmSumOrderByAggregateInput = {
    id?: SortOrder
    businessId?: SortOrder
  }

  export type BusinessAccCreateNestedManyWithoutUserInput = {
    create?: XOR<BusinessAccCreateWithoutUserInput, BusinessAccUncheckedCreateWithoutUserInput> | BusinessAccCreateWithoutUserInput[] | BusinessAccUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BusinessAccCreateOrConnectWithoutUserInput | BusinessAccCreateOrConnectWithoutUserInput[]
    createMany?: BusinessAccCreateManyUserInputEnvelope
    connect?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
  }

  export type MemberCreateNestedManyWithoutUserInput = {
    create?: XOR<MemberCreateWithoutUserInput, MemberUncheckedCreateWithoutUserInput> | MemberCreateWithoutUserInput[] | MemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutUserInput | MemberCreateOrConnectWithoutUserInput[]
    createMany?: MemberCreateManyUserInputEnvelope
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
  }

  export type BusinessAccUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BusinessAccCreateWithoutUserInput, BusinessAccUncheckedCreateWithoutUserInput> | BusinessAccCreateWithoutUserInput[] | BusinessAccUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BusinessAccCreateOrConnectWithoutUserInput | BusinessAccCreateOrConnectWithoutUserInput[]
    createMany?: BusinessAccCreateManyUserInputEnvelope
    connect?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
  }

  export type MemberUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MemberCreateWithoutUserInput, MemberUncheckedCreateWithoutUserInput> | MemberCreateWithoutUserInput[] | MemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutUserInput | MemberCreateOrConnectWithoutUserInput[]
    createMany?: MemberCreateManyUserInputEnvelope
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BusinessAccUpdateManyWithoutUserNestedInput = {
    create?: XOR<BusinessAccCreateWithoutUserInput, BusinessAccUncheckedCreateWithoutUserInput> | BusinessAccCreateWithoutUserInput[] | BusinessAccUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BusinessAccCreateOrConnectWithoutUserInput | BusinessAccCreateOrConnectWithoutUserInput[]
    upsert?: BusinessAccUpsertWithWhereUniqueWithoutUserInput | BusinessAccUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BusinessAccCreateManyUserInputEnvelope
    set?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    disconnect?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    delete?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    connect?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    update?: BusinessAccUpdateWithWhereUniqueWithoutUserInput | BusinessAccUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BusinessAccUpdateManyWithWhereWithoutUserInput | BusinessAccUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BusinessAccScalarWhereInput | BusinessAccScalarWhereInput[]
  }

  export type MemberUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemberCreateWithoutUserInput, MemberUncheckedCreateWithoutUserInput> | MemberCreateWithoutUserInput[] | MemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutUserInput | MemberCreateOrConnectWithoutUserInput[]
    upsert?: MemberUpsertWithWhereUniqueWithoutUserInput | MemberUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemberCreateManyUserInputEnvelope
    set?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    disconnect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    delete?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    update?: MemberUpdateWithWhereUniqueWithoutUserInput | MemberUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemberUpdateManyWithWhereWithoutUserInput | MemberUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemberScalarWhereInput | MemberScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BusinessAccUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<BusinessAccCreateWithoutUserInput, BusinessAccUncheckedCreateWithoutUserInput> | BusinessAccCreateWithoutUserInput[] | BusinessAccUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BusinessAccCreateOrConnectWithoutUserInput | BusinessAccCreateOrConnectWithoutUserInput[]
    upsert?: BusinessAccUpsertWithWhereUniqueWithoutUserInput | BusinessAccUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BusinessAccCreateManyUserInputEnvelope
    set?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    disconnect?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    delete?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    connect?: BusinessAccWhereUniqueInput | BusinessAccWhereUniqueInput[]
    update?: BusinessAccUpdateWithWhereUniqueWithoutUserInput | BusinessAccUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BusinessAccUpdateManyWithWhereWithoutUserInput | BusinessAccUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BusinessAccScalarWhereInput | BusinessAccScalarWhereInput[]
  }

  export type MemberUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemberCreateWithoutUserInput, MemberUncheckedCreateWithoutUserInput> | MemberCreateWithoutUserInput[] | MemberUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutUserInput | MemberCreateOrConnectWithoutUserInput[]
    upsert?: MemberUpsertWithWhereUniqueWithoutUserInput | MemberUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemberCreateManyUserInputEnvelope
    set?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    disconnect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    delete?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    update?: MemberUpdateWithWhereUniqueWithoutUserInput | MemberUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemberUpdateManyWithWhereWithoutUserInput | MemberUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemberScalarWhereInput | MemberScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMemberInput = {
    create?: XOR<UserCreateWithoutMemberInput, UserUncheckedCreateWithoutMemberInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemberInput
    connect?: UserWhereUniqueInput
  }

  export type BusinessAccCreateNestedOneWithoutAllMemberInput = {
    create?: XOR<BusinessAccCreateWithoutAllMemberInput, BusinessAccUncheckedCreateWithoutAllMemberInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutAllMemberInput
    connect?: BusinessAccWhereUniqueInput
  }

  export type OfficeCreateNestedManyWithoutAuthorInput = {
    create?: XOR<OfficeCreateWithoutAuthorInput, OfficeUncheckedCreateWithoutAuthorInput> | OfficeCreateWithoutAuthorInput[] | OfficeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutAuthorInput | OfficeCreateOrConnectWithoutAuthorInput[]
    createMany?: OfficeCreateManyAuthorInputEnvelope
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
  }

  export type CoachCreateNestedManyWithoutAuthorInput = {
    create?: XOR<CoachCreateWithoutAuthorInput, CoachUncheckedCreateWithoutAuthorInput> | CoachCreateWithoutAuthorInput[] | CoachUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutAuthorInput | CoachCreateOrConnectWithoutAuthorInput[]
    createMany?: CoachCreateManyAuthorInputEnvelope
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
  }

  export type BankCreateNestedManyWithoutAuthorInput = {
    create?: XOR<BankCreateWithoutAuthorInput, BankUncheckedCreateWithoutAuthorInput> | BankCreateWithoutAuthorInput[] | BankUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BankCreateOrConnectWithoutAuthorInput | BankCreateOrConnectWithoutAuthorInput[]
    createMany?: BankCreateManyAuthorInputEnvelope
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
  }

  export type AgencyCreateNestedManyWithoutAuthorInput = {
    create?: XOR<AgencyCreateWithoutAuthorInput, AgencyUncheckedCreateWithoutAuthorInput> | AgencyCreateWithoutAuthorInput[] | AgencyUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutAuthorInput | AgencyCreateOrConnectWithoutAuthorInput[]
    createMany?: AgencyCreateManyAuthorInputEnvelope
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
  }

  export type OrmCreateNestedManyWithoutAuthorInput = {
    create?: XOR<OrmCreateWithoutAuthorInput, OrmUncheckedCreateWithoutAuthorInput> | OrmCreateWithoutAuthorInput[] | OrmUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutAuthorInput | OrmCreateOrConnectWithoutAuthorInput[]
    createMany?: OrmCreateManyAuthorInputEnvelope
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
  }

  export type OfficeUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<OfficeCreateWithoutAuthorInput, OfficeUncheckedCreateWithoutAuthorInput> | OfficeCreateWithoutAuthorInput[] | OfficeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutAuthorInput | OfficeCreateOrConnectWithoutAuthorInput[]
    createMany?: OfficeCreateManyAuthorInputEnvelope
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
  }

  export type CoachUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<CoachCreateWithoutAuthorInput, CoachUncheckedCreateWithoutAuthorInput> | CoachCreateWithoutAuthorInput[] | CoachUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutAuthorInput | CoachCreateOrConnectWithoutAuthorInput[]
    createMany?: CoachCreateManyAuthorInputEnvelope
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
  }

  export type BankUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<BankCreateWithoutAuthorInput, BankUncheckedCreateWithoutAuthorInput> | BankCreateWithoutAuthorInput[] | BankUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BankCreateOrConnectWithoutAuthorInput | BankCreateOrConnectWithoutAuthorInput[]
    createMany?: BankCreateManyAuthorInputEnvelope
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
  }

  export type AgencyUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<AgencyCreateWithoutAuthorInput, AgencyUncheckedCreateWithoutAuthorInput> | AgencyCreateWithoutAuthorInput[] | AgencyUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutAuthorInput | AgencyCreateOrConnectWithoutAuthorInput[]
    createMany?: AgencyCreateManyAuthorInputEnvelope
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
  }

  export type OrmUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<OrmCreateWithoutAuthorInput, OrmUncheckedCreateWithoutAuthorInput> | OrmCreateWithoutAuthorInput[] | OrmUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutAuthorInput | OrmCreateOrConnectWithoutAuthorInput[]
    createMany?: OrmCreateManyAuthorInputEnvelope
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutMemberNestedInput = {
    create?: XOR<UserCreateWithoutMemberInput, UserUncheckedCreateWithoutMemberInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemberInput
    upsert?: UserUpsertWithoutMemberInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMemberInput, UserUpdateWithoutMemberInput>, UserUncheckedUpdateWithoutMemberInput>
  }

  export type BusinessAccUpdateOneWithoutAllMemberNestedInput = {
    create?: XOR<BusinessAccCreateWithoutAllMemberInput, BusinessAccUncheckedCreateWithoutAllMemberInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutAllMemberInput
    upsert?: BusinessAccUpsertWithoutAllMemberInput
    disconnect?: BusinessAccWhereInput | boolean
    delete?: BusinessAccWhereInput | boolean
    connect?: BusinessAccWhereUniqueInput
    update?: XOR<XOR<BusinessAccUpdateToOneWithWhereWithoutAllMemberInput, BusinessAccUpdateWithoutAllMemberInput>, BusinessAccUncheckedUpdateWithoutAllMemberInput>
  }

  export type OfficeUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<OfficeCreateWithoutAuthorInput, OfficeUncheckedCreateWithoutAuthorInput> | OfficeCreateWithoutAuthorInput[] | OfficeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutAuthorInput | OfficeCreateOrConnectWithoutAuthorInput[]
    upsert?: OfficeUpsertWithWhereUniqueWithoutAuthorInput | OfficeUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: OfficeCreateManyAuthorInputEnvelope
    set?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    disconnect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    delete?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    update?: OfficeUpdateWithWhereUniqueWithoutAuthorInput | OfficeUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: OfficeUpdateManyWithWhereWithoutAuthorInput | OfficeUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: OfficeScalarWhereInput | OfficeScalarWhereInput[]
  }

  export type CoachUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<CoachCreateWithoutAuthorInput, CoachUncheckedCreateWithoutAuthorInput> | CoachCreateWithoutAuthorInput[] | CoachUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutAuthorInput | CoachCreateOrConnectWithoutAuthorInput[]
    upsert?: CoachUpsertWithWhereUniqueWithoutAuthorInput | CoachUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: CoachCreateManyAuthorInputEnvelope
    set?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    disconnect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    delete?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    update?: CoachUpdateWithWhereUniqueWithoutAuthorInput | CoachUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: CoachUpdateManyWithWhereWithoutAuthorInput | CoachUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: CoachScalarWhereInput | CoachScalarWhereInput[]
  }

  export type BankUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<BankCreateWithoutAuthorInput, BankUncheckedCreateWithoutAuthorInput> | BankCreateWithoutAuthorInput[] | BankUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BankCreateOrConnectWithoutAuthorInput | BankCreateOrConnectWithoutAuthorInput[]
    upsert?: BankUpsertWithWhereUniqueWithoutAuthorInput | BankUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: BankCreateManyAuthorInputEnvelope
    set?: BankWhereUniqueInput | BankWhereUniqueInput[]
    disconnect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    delete?: BankWhereUniqueInput | BankWhereUniqueInput[]
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    update?: BankUpdateWithWhereUniqueWithoutAuthorInput | BankUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: BankUpdateManyWithWhereWithoutAuthorInput | BankUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: BankScalarWhereInput | BankScalarWhereInput[]
  }

  export type AgencyUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<AgencyCreateWithoutAuthorInput, AgencyUncheckedCreateWithoutAuthorInput> | AgencyCreateWithoutAuthorInput[] | AgencyUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutAuthorInput | AgencyCreateOrConnectWithoutAuthorInput[]
    upsert?: AgencyUpsertWithWhereUniqueWithoutAuthorInput | AgencyUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: AgencyCreateManyAuthorInputEnvelope
    set?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    disconnect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    delete?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    update?: AgencyUpdateWithWhereUniqueWithoutAuthorInput | AgencyUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: AgencyUpdateManyWithWhereWithoutAuthorInput | AgencyUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
  }

  export type OrmUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<OrmCreateWithoutAuthorInput, OrmUncheckedCreateWithoutAuthorInput> | OrmCreateWithoutAuthorInput[] | OrmUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutAuthorInput | OrmCreateOrConnectWithoutAuthorInput[]
    upsert?: OrmUpsertWithWhereUniqueWithoutAuthorInput | OrmUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: OrmCreateManyAuthorInputEnvelope
    set?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    disconnect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    delete?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    update?: OrmUpdateWithWhereUniqueWithoutAuthorInput | OrmUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: OrmUpdateManyWithWhereWithoutAuthorInput | OrmUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: OrmScalarWhereInput | OrmScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OfficeUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<OfficeCreateWithoutAuthorInput, OfficeUncheckedCreateWithoutAuthorInput> | OfficeCreateWithoutAuthorInput[] | OfficeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutAuthorInput | OfficeCreateOrConnectWithoutAuthorInput[]
    upsert?: OfficeUpsertWithWhereUniqueWithoutAuthorInput | OfficeUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: OfficeCreateManyAuthorInputEnvelope
    set?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    disconnect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    delete?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    update?: OfficeUpdateWithWhereUniqueWithoutAuthorInput | OfficeUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: OfficeUpdateManyWithWhereWithoutAuthorInput | OfficeUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: OfficeScalarWhereInput | OfficeScalarWhereInput[]
  }

  export type CoachUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<CoachCreateWithoutAuthorInput, CoachUncheckedCreateWithoutAuthorInput> | CoachCreateWithoutAuthorInput[] | CoachUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutAuthorInput | CoachCreateOrConnectWithoutAuthorInput[]
    upsert?: CoachUpsertWithWhereUniqueWithoutAuthorInput | CoachUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: CoachCreateManyAuthorInputEnvelope
    set?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    disconnect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    delete?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    update?: CoachUpdateWithWhereUniqueWithoutAuthorInput | CoachUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: CoachUpdateManyWithWhereWithoutAuthorInput | CoachUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: CoachScalarWhereInput | CoachScalarWhereInput[]
  }

  export type BankUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<BankCreateWithoutAuthorInput, BankUncheckedCreateWithoutAuthorInput> | BankCreateWithoutAuthorInput[] | BankUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BankCreateOrConnectWithoutAuthorInput | BankCreateOrConnectWithoutAuthorInput[]
    upsert?: BankUpsertWithWhereUniqueWithoutAuthorInput | BankUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: BankCreateManyAuthorInputEnvelope
    set?: BankWhereUniqueInput | BankWhereUniqueInput[]
    disconnect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    delete?: BankWhereUniqueInput | BankWhereUniqueInput[]
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    update?: BankUpdateWithWhereUniqueWithoutAuthorInput | BankUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: BankUpdateManyWithWhereWithoutAuthorInput | BankUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: BankScalarWhereInput | BankScalarWhereInput[]
  }

  export type AgencyUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<AgencyCreateWithoutAuthorInput, AgencyUncheckedCreateWithoutAuthorInput> | AgencyCreateWithoutAuthorInput[] | AgencyUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutAuthorInput | AgencyCreateOrConnectWithoutAuthorInput[]
    upsert?: AgencyUpsertWithWhereUniqueWithoutAuthorInput | AgencyUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: AgencyCreateManyAuthorInputEnvelope
    set?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    disconnect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    delete?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    update?: AgencyUpdateWithWhereUniqueWithoutAuthorInput | AgencyUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: AgencyUpdateManyWithWhereWithoutAuthorInput | AgencyUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
  }

  export type OrmUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<OrmCreateWithoutAuthorInput, OrmUncheckedCreateWithoutAuthorInput> | OrmCreateWithoutAuthorInput[] | OrmUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutAuthorInput | OrmCreateOrConnectWithoutAuthorInput[]
    upsert?: OrmUpsertWithWhereUniqueWithoutAuthorInput | OrmUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: OrmCreateManyAuthorInputEnvelope
    set?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    disconnect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    delete?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    update?: OrmUpdateWithWhereUniqueWithoutAuthorInput | OrmUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: OrmUpdateManyWithWhereWithoutAuthorInput | OrmUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: OrmScalarWhereInput | OrmScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutBusinessInput = {
    create?: XOR<UserCreateWithoutBusinessInput, UserUncheckedCreateWithoutBusinessInput>
    connectOrCreate?: UserCreateOrConnectWithoutBusinessInput
    connect?: UserWhereUniqueInput
  }

  export type MemberCreateNestedManyWithoutBusinessInput = {
    create?: XOR<MemberCreateWithoutBusinessInput, MemberUncheckedCreateWithoutBusinessInput> | MemberCreateWithoutBusinessInput[] | MemberUncheckedCreateWithoutBusinessInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutBusinessInput | MemberCreateOrConnectWithoutBusinessInput[]
    createMany?: MemberCreateManyBusinessInputEnvelope
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
  }

  export type OfficeCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<OfficeCreateWithoutBusinessAccInput, OfficeUncheckedCreateWithoutBusinessAccInput> | OfficeCreateWithoutBusinessAccInput[] | OfficeUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutBusinessAccInput | OfficeCreateOrConnectWithoutBusinessAccInput[]
    createMany?: OfficeCreateManyBusinessAccInputEnvelope
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
  }

  export type CoachCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<CoachCreateWithoutBusinessAccInput, CoachUncheckedCreateWithoutBusinessAccInput> | CoachCreateWithoutBusinessAccInput[] | CoachUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutBusinessAccInput | CoachCreateOrConnectWithoutBusinessAccInput[]
    createMany?: CoachCreateManyBusinessAccInputEnvelope
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
  }

  export type BankCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<BankCreateWithoutBusinessAccInput, BankUncheckedCreateWithoutBusinessAccInput> | BankCreateWithoutBusinessAccInput[] | BankUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: BankCreateOrConnectWithoutBusinessAccInput | BankCreateOrConnectWithoutBusinessAccInput[]
    createMany?: BankCreateManyBusinessAccInputEnvelope
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
  }

  export type AgencyCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<AgencyCreateWithoutBusinessAccInput, AgencyUncheckedCreateWithoutBusinessAccInput> | AgencyCreateWithoutBusinessAccInput[] | AgencyUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutBusinessAccInput | AgencyCreateOrConnectWithoutBusinessAccInput[]
    createMany?: AgencyCreateManyBusinessAccInputEnvelope
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
  }

  export type OrmCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<OrmCreateWithoutBusinessAccInput, OrmUncheckedCreateWithoutBusinessAccInput> | OrmCreateWithoutBusinessAccInput[] | OrmUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutBusinessAccInput | OrmCreateOrConnectWithoutBusinessAccInput[]
    createMany?: OrmCreateManyBusinessAccInputEnvelope
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
  }

  export type MemberUncheckedCreateNestedManyWithoutBusinessInput = {
    create?: XOR<MemberCreateWithoutBusinessInput, MemberUncheckedCreateWithoutBusinessInput> | MemberCreateWithoutBusinessInput[] | MemberUncheckedCreateWithoutBusinessInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutBusinessInput | MemberCreateOrConnectWithoutBusinessInput[]
    createMany?: MemberCreateManyBusinessInputEnvelope
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
  }

  export type OfficeUncheckedCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<OfficeCreateWithoutBusinessAccInput, OfficeUncheckedCreateWithoutBusinessAccInput> | OfficeCreateWithoutBusinessAccInput[] | OfficeUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutBusinessAccInput | OfficeCreateOrConnectWithoutBusinessAccInput[]
    createMany?: OfficeCreateManyBusinessAccInputEnvelope
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
  }

  export type CoachUncheckedCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<CoachCreateWithoutBusinessAccInput, CoachUncheckedCreateWithoutBusinessAccInput> | CoachCreateWithoutBusinessAccInput[] | CoachUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutBusinessAccInput | CoachCreateOrConnectWithoutBusinessAccInput[]
    createMany?: CoachCreateManyBusinessAccInputEnvelope
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
  }

  export type BankUncheckedCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<BankCreateWithoutBusinessAccInput, BankUncheckedCreateWithoutBusinessAccInput> | BankCreateWithoutBusinessAccInput[] | BankUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: BankCreateOrConnectWithoutBusinessAccInput | BankCreateOrConnectWithoutBusinessAccInput[]
    createMany?: BankCreateManyBusinessAccInputEnvelope
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
  }

  export type AgencyUncheckedCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<AgencyCreateWithoutBusinessAccInput, AgencyUncheckedCreateWithoutBusinessAccInput> | AgencyCreateWithoutBusinessAccInput[] | AgencyUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutBusinessAccInput | AgencyCreateOrConnectWithoutBusinessAccInput[]
    createMany?: AgencyCreateManyBusinessAccInputEnvelope
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
  }

  export type OrmUncheckedCreateNestedManyWithoutBusinessAccInput = {
    create?: XOR<OrmCreateWithoutBusinessAccInput, OrmUncheckedCreateWithoutBusinessAccInput> | OrmCreateWithoutBusinessAccInput[] | OrmUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutBusinessAccInput | OrmCreateOrConnectWithoutBusinessAccInput[]
    createMany?: OrmCreateManyBusinessAccInputEnvelope
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumCategoryFieldUpdateOperationsInput = {
    set?: $Enums.Category
  }

  export type UserUpdateOneRequiredWithoutBusinessNestedInput = {
    create?: XOR<UserCreateWithoutBusinessInput, UserUncheckedCreateWithoutBusinessInput>
    connectOrCreate?: UserCreateOrConnectWithoutBusinessInput
    upsert?: UserUpsertWithoutBusinessInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBusinessInput, UserUpdateWithoutBusinessInput>, UserUncheckedUpdateWithoutBusinessInput>
  }

  export type MemberUpdateManyWithoutBusinessNestedInput = {
    create?: XOR<MemberCreateWithoutBusinessInput, MemberUncheckedCreateWithoutBusinessInput> | MemberCreateWithoutBusinessInput[] | MemberUncheckedCreateWithoutBusinessInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutBusinessInput | MemberCreateOrConnectWithoutBusinessInput[]
    upsert?: MemberUpsertWithWhereUniqueWithoutBusinessInput | MemberUpsertWithWhereUniqueWithoutBusinessInput[]
    createMany?: MemberCreateManyBusinessInputEnvelope
    set?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    disconnect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    delete?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    update?: MemberUpdateWithWhereUniqueWithoutBusinessInput | MemberUpdateWithWhereUniqueWithoutBusinessInput[]
    updateMany?: MemberUpdateManyWithWhereWithoutBusinessInput | MemberUpdateManyWithWhereWithoutBusinessInput[]
    deleteMany?: MemberScalarWhereInput | MemberScalarWhereInput[]
  }

  export type OfficeUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<OfficeCreateWithoutBusinessAccInput, OfficeUncheckedCreateWithoutBusinessAccInput> | OfficeCreateWithoutBusinessAccInput[] | OfficeUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutBusinessAccInput | OfficeCreateOrConnectWithoutBusinessAccInput[]
    upsert?: OfficeUpsertWithWhereUniqueWithoutBusinessAccInput | OfficeUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: OfficeCreateManyBusinessAccInputEnvelope
    set?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    disconnect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    delete?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    update?: OfficeUpdateWithWhereUniqueWithoutBusinessAccInput | OfficeUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: OfficeUpdateManyWithWhereWithoutBusinessAccInput | OfficeUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: OfficeScalarWhereInput | OfficeScalarWhereInput[]
  }

  export type CoachUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<CoachCreateWithoutBusinessAccInput, CoachUncheckedCreateWithoutBusinessAccInput> | CoachCreateWithoutBusinessAccInput[] | CoachUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutBusinessAccInput | CoachCreateOrConnectWithoutBusinessAccInput[]
    upsert?: CoachUpsertWithWhereUniqueWithoutBusinessAccInput | CoachUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: CoachCreateManyBusinessAccInputEnvelope
    set?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    disconnect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    delete?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    update?: CoachUpdateWithWhereUniqueWithoutBusinessAccInput | CoachUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: CoachUpdateManyWithWhereWithoutBusinessAccInput | CoachUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: CoachScalarWhereInput | CoachScalarWhereInput[]
  }

  export type BankUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<BankCreateWithoutBusinessAccInput, BankUncheckedCreateWithoutBusinessAccInput> | BankCreateWithoutBusinessAccInput[] | BankUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: BankCreateOrConnectWithoutBusinessAccInput | BankCreateOrConnectWithoutBusinessAccInput[]
    upsert?: BankUpsertWithWhereUniqueWithoutBusinessAccInput | BankUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: BankCreateManyBusinessAccInputEnvelope
    set?: BankWhereUniqueInput | BankWhereUniqueInput[]
    disconnect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    delete?: BankWhereUniqueInput | BankWhereUniqueInput[]
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    update?: BankUpdateWithWhereUniqueWithoutBusinessAccInput | BankUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: BankUpdateManyWithWhereWithoutBusinessAccInput | BankUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: BankScalarWhereInput | BankScalarWhereInput[]
  }

  export type AgencyUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<AgencyCreateWithoutBusinessAccInput, AgencyUncheckedCreateWithoutBusinessAccInput> | AgencyCreateWithoutBusinessAccInput[] | AgencyUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutBusinessAccInput | AgencyCreateOrConnectWithoutBusinessAccInput[]
    upsert?: AgencyUpsertWithWhereUniqueWithoutBusinessAccInput | AgencyUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: AgencyCreateManyBusinessAccInputEnvelope
    set?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    disconnect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    delete?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    update?: AgencyUpdateWithWhereUniqueWithoutBusinessAccInput | AgencyUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: AgencyUpdateManyWithWhereWithoutBusinessAccInput | AgencyUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
  }

  export type OrmUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<OrmCreateWithoutBusinessAccInput, OrmUncheckedCreateWithoutBusinessAccInput> | OrmCreateWithoutBusinessAccInput[] | OrmUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutBusinessAccInput | OrmCreateOrConnectWithoutBusinessAccInput[]
    upsert?: OrmUpsertWithWhereUniqueWithoutBusinessAccInput | OrmUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: OrmCreateManyBusinessAccInputEnvelope
    set?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    disconnect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    delete?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    update?: OrmUpdateWithWhereUniqueWithoutBusinessAccInput | OrmUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: OrmUpdateManyWithWhereWithoutBusinessAccInput | OrmUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: OrmScalarWhereInput | OrmScalarWhereInput[]
  }

  export type MemberUncheckedUpdateManyWithoutBusinessNestedInput = {
    create?: XOR<MemberCreateWithoutBusinessInput, MemberUncheckedCreateWithoutBusinessInput> | MemberCreateWithoutBusinessInput[] | MemberUncheckedCreateWithoutBusinessInput[]
    connectOrCreate?: MemberCreateOrConnectWithoutBusinessInput | MemberCreateOrConnectWithoutBusinessInput[]
    upsert?: MemberUpsertWithWhereUniqueWithoutBusinessInput | MemberUpsertWithWhereUniqueWithoutBusinessInput[]
    createMany?: MemberCreateManyBusinessInputEnvelope
    set?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    disconnect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    delete?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    connect?: MemberWhereUniqueInput | MemberWhereUniqueInput[]
    update?: MemberUpdateWithWhereUniqueWithoutBusinessInput | MemberUpdateWithWhereUniqueWithoutBusinessInput[]
    updateMany?: MemberUpdateManyWithWhereWithoutBusinessInput | MemberUpdateManyWithWhereWithoutBusinessInput[]
    deleteMany?: MemberScalarWhereInput | MemberScalarWhereInput[]
  }

  export type OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<OfficeCreateWithoutBusinessAccInput, OfficeUncheckedCreateWithoutBusinessAccInput> | OfficeCreateWithoutBusinessAccInput[] | OfficeUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OfficeCreateOrConnectWithoutBusinessAccInput | OfficeCreateOrConnectWithoutBusinessAccInput[]
    upsert?: OfficeUpsertWithWhereUniqueWithoutBusinessAccInput | OfficeUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: OfficeCreateManyBusinessAccInputEnvelope
    set?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    disconnect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    delete?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    connect?: OfficeWhereUniqueInput | OfficeWhereUniqueInput[]
    update?: OfficeUpdateWithWhereUniqueWithoutBusinessAccInput | OfficeUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: OfficeUpdateManyWithWhereWithoutBusinessAccInput | OfficeUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: OfficeScalarWhereInput | OfficeScalarWhereInput[]
  }

  export type CoachUncheckedUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<CoachCreateWithoutBusinessAccInput, CoachUncheckedCreateWithoutBusinessAccInput> | CoachCreateWithoutBusinessAccInput[] | CoachUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: CoachCreateOrConnectWithoutBusinessAccInput | CoachCreateOrConnectWithoutBusinessAccInput[]
    upsert?: CoachUpsertWithWhereUniqueWithoutBusinessAccInput | CoachUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: CoachCreateManyBusinessAccInputEnvelope
    set?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    disconnect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    delete?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    connect?: CoachWhereUniqueInput | CoachWhereUniqueInput[]
    update?: CoachUpdateWithWhereUniqueWithoutBusinessAccInput | CoachUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: CoachUpdateManyWithWhereWithoutBusinessAccInput | CoachUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: CoachScalarWhereInput | CoachScalarWhereInput[]
  }

  export type BankUncheckedUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<BankCreateWithoutBusinessAccInput, BankUncheckedCreateWithoutBusinessAccInput> | BankCreateWithoutBusinessAccInput[] | BankUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: BankCreateOrConnectWithoutBusinessAccInput | BankCreateOrConnectWithoutBusinessAccInput[]
    upsert?: BankUpsertWithWhereUniqueWithoutBusinessAccInput | BankUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: BankCreateManyBusinessAccInputEnvelope
    set?: BankWhereUniqueInput | BankWhereUniqueInput[]
    disconnect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    delete?: BankWhereUniqueInput | BankWhereUniqueInput[]
    connect?: BankWhereUniqueInput | BankWhereUniqueInput[]
    update?: BankUpdateWithWhereUniqueWithoutBusinessAccInput | BankUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: BankUpdateManyWithWhereWithoutBusinessAccInput | BankUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: BankScalarWhereInput | BankScalarWhereInput[]
  }

  export type AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<AgencyCreateWithoutBusinessAccInput, AgencyUncheckedCreateWithoutBusinessAccInput> | AgencyCreateWithoutBusinessAccInput[] | AgencyUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: AgencyCreateOrConnectWithoutBusinessAccInput | AgencyCreateOrConnectWithoutBusinessAccInput[]
    upsert?: AgencyUpsertWithWhereUniqueWithoutBusinessAccInput | AgencyUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: AgencyCreateManyBusinessAccInputEnvelope
    set?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    disconnect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    delete?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    connect?: AgencyWhereUniqueInput | AgencyWhereUniqueInput[]
    update?: AgencyUpdateWithWhereUniqueWithoutBusinessAccInput | AgencyUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: AgencyUpdateManyWithWhereWithoutBusinessAccInput | AgencyUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
  }

  export type OrmUncheckedUpdateManyWithoutBusinessAccNestedInput = {
    create?: XOR<OrmCreateWithoutBusinessAccInput, OrmUncheckedCreateWithoutBusinessAccInput> | OrmCreateWithoutBusinessAccInput[] | OrmUncheckedCreateWithoutBusinessAccInput[]
    connectOrCreate?: OrmCreateOrConnectWithoutBusinessAccInput | OrmCreateOrConnectWithoutBusinessAccInput[]
    upsert?: OrmUpsertWithWhereUniqueWithoutBusinessAccInput | OrmUpsertWithWhereUniqueWithoutBusinessAccInput[]
    createMany?: OrmCreateManyBusinessAccInputEnvelope
    set?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    disconnect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    delete?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    connect?: OrmWhereUniqueInput | OrmWhereUniqueInput[]
    update?: OrmUpdateWithWhereUniqueWithoutBusinessAccInput | OrmUpdateWithWhereUniqueWithoutBusinessAccInput[]
    updateMany?: OrmUpdateManyWithWhereWithoutBusinessAccInput | OrmUpdateManyWithWhereWithoutBusinessAccInput[]
    deleteMany?: OrmScalarWhereInput | OrmScalarWhereInput[]
  }

  export type BusinessAccCreateNestedOneWithoutOfficeInput = {
    create?: XOR<BusinessAccCreateWithoutOfficeInput, BusinessAccUncheckedCreateWithoutOfficeInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutOfficeInput
    connect?: BusinessAccWhereUniqueInput
  }

  export type MemberCreateNestedOneWithoutOfficeInput = {
    create?: XOR<MemberCreateWithoutOfficeInput, MemberUncheckedCreateWithoutOfficeInput>
    connectOrCreate?: MemberCreateOrConnectWithoutOfficeInput
    connect?: MemberWhereUniqueInput
  }

  export type BusinessAccUpdateOneRequiredWithoutOfficeNestedInput = {
    create?: XOR<BusinessAccCreateWithoutOfficeInput, BusinessAccUncheckedCreateWithoutOfficeInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutOfficeInput
    upsert?: BusinessAccUpsertWithoutOfficeInput
    connect?: BusinessAccWhereUniqueInput
    update?: XOR<XOR<BusinessAccUpdateToOneWithWhereWithoutOfficeInput, BusinessAccUpdateWithoutOfficeInput>, BusinessAccUncheckedUpdateWithoutOfficeInput>
  }

  export type MemberUpdateOneRequiredWithoutOfficeNestedInput = {
    create?: XOR<MemberCreateWithoutOfficeInput, MemberUncheckedCreateWithoutOfficeInput>
    connectOrCreate?: MemberCreateOrConnectWithoutOfficeInput
    upsert?: MemberUpsertWithoutOfficeInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutOfficeInput, MemberUpdateWithoutOfficeInput>, MemberUncheckedUpdateWithoutOfficeInput>
  }

  export type BusinessAccCreateNestedOneWithoutCoachInput = {
    create?: XOR<BusinessAccCreateWithoutCoachInput, BusinessAccUncheckedCreateWithoutCoachInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutCoachInput
    connect?: BusinessAccWhereUniqueInput
  }

  export type MemberCreateNestedOneWithoutCoachInput = {
    create?: XOR<MemberCreateWithoutCoachInput, MemberUncheckedCreateWithoutCoachInput>
    connectOrCreate?: MemberCreateOrConnectWithoutCoachInput
    connect?: MemberWhereUniqueInput
  }

  export type BusinessAccUpdateOneRequiredWithoutCoachNestedInput = {
    create?: XOR<BusinessAccCreateWithoutCoachInput, BusinessAccUncheckedCreateWithoutCoachInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutCoachInput
    upsert?: BusinessAccUpsertWithoutCoachInput
    connect?: BusinessAccWhereUniqueInput
    update?: XOR<XOR<BusinessAccUpdateToOneWithWhereWithoutCoachInput, BusinessAccUpdateWithoutCoachInput>, BusinessAccUncheckedUpdateWithoutCoachInput>
  }

  export type MemberUpdateOneRequiredWithoutCoachNestedInput = {
    create?: XOR<MemberCreateWithoutCoachInput, MemberUncheckedCreateWithoutCoachInput>
    connectOrCreate?: MemberCreateOrConnectWithoutCoachInput
    upsert?: MemberUpsertWithoutCoachInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutCoachInput, MemberUpdateWithoutCoachInput>, MemberUncheckedUpdateWithoutCoachInput>
  }

  export type BusinessAccCreateNestedOneWithoutBankInput = {
    create?: XOR<BusinessAccCreateWithoutBankInput, BusinessAccUncheckedCreateWithoutBankInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutBankInput
    connect?: BusinessAccWhereUniqueInput
  }

  export type MemberCreateNestedOneWithoutBankInput = {
    create?: XOR<MemberCreateWithoutBankInput, MemberUncheckedCreateWithoutBankInput>
    connectOrCreate?: MemberCreateOrConnectWithoutBankInput
    connect?: MemberWhereUniqueInput
  }

  export type BusinessAccUpdateOneRequiredWithoutBankNestedInput = {
    create?: XOR<BusinessAccCreateWithoutBankInput, BusinessAccUncheckedCreateWithoutBankInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutBankInput
    upsert?: BusinessAccUpsertWithoutBankInput
    connect?: BusinessAccWhereUniqueInput
    update?: XOR<XOR<BusinessAccUpdateToOneWithWhereWithoutBankInput, BusinessAccUpdateWithoutBankInput>, BusinessAccUncheckedUpdateWithoutBankInput>
  }

  export type MemberUpdateOneRequiredWithoutBankNestedInput = {
    create?: XOR<MemberCreateWithoutBankInput, MemberUncheckedCreateWithoutBankInput>
    connectOrCreate?: MemberCreateOrConnectWithoutBankInput
    upsert?: MemberUpsertWithoutBankInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutBankInput, MemberUpdateWithoutBankInput>, MemberUncheckedUpdateWithoutBankInput>
  }

  export type BusinessAccCreateNestedOneWithoutAgencyInput = {
    create?: XOR<BusinessAccCreateWithoutAgencyInput, BusinessAccUncheckedCreateWithoutAgencyInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutAgencyInput
    connect?: BusinessAccWhereUniqueInput
  }

  export type MemberCreateNestedOneWithoutAgencyInput = {
    create?: XOR<MemberCreateWithoutAgencyInput, MemberUncheckedCreateWithoutAgencyInput>
    connectOrCreate?: MemberCreateOrConnectWithoutAgencyInput
    connect?: MemberWhereUniqueInput
  }

  export type BusinessAccUpdateOneRequiredWithoutAgencyNestedInput = {
    create?: XOR<BusinessAccCreateWithoutAgencyInput, BusinessAccUncheckedCreateWithoutAgencyInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutAgencyInput
    upsert?: BusinessAccUpsertWithoutAgencyInput
    connect?: BusinessAccWhereUniqueInput
    update?: XOR<XOR<BusinessAccUpdateToOneWithWhereWithoutAgencyInput, BusinessAccUpdateWithoutAgencyInput>, BusinessAccUncheckedUpdateWithoutAgencyInput>
  }

  export type MemberUpdateOneRequiredWithoutAgencyNestedInput = {
    create?: XOR<MemberCreateWithoutAgencyInput, MemberUncheckedCreateWithoutAgencyInput>
    connectOrCreate?: MemberCreateOrConnectWithoutAgencyInput
    upsert?: MemberUpsertWithoutAgencyInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutAgencyInput, MemberUpdateWithoutAgencyInput>, MemberUncheckedUpdateWithoutAgencyInput>
  }

  export type BusinessAccCreateNestedOneWithoutOrmInput = {
    create?: XOR<BusinessAccCreateWithoutOrmInput, BusinessAccUncheckedCreateWithoutOrmInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutOrmInput
    connect?: BusinessAccWhereUniqueInput
  }

  export type MemberCreateNestedOneWithoutOrmInput = {
    create?: XOR<MemberCreateWithoutOrmInput, MemberUncheckedCreateWithoutOrmInput>
    connectOrCreate?: MemberCreateOrConnectWithoutOrmInput
    connect?: MemberWhereUniqueInput
  }

  export type BusinessAccUpdateOneRequiredWithoutOrmNestedInput = {
    create?: XOR<BusinessAccCreateWithoutOrmInput, BusinessAccUncheckedCreateWithoutOrmInput>
    connectOrCreate?: BusinessAccCreateOrConnectWithoutOrmInput
    upsert?: BusinessAccUpsertWithoutOrmInput
    connect?: BusinessAccWhereUniqueInput
    update?: XOR<XOR<BusinessAccUpdateToOneWithWhereWithoutOrmInput, BusinessAccUpdateWithoutOrmInput>, BusinessAccUncheckedUpdateWithoutOrmInput>
  }

  export type MemberUpdateOneRequiredWithoutOrmNestedInput = {
    create?: XOR<MemberCreateWithoutOrmInput, MemberUncheckedCreateWithoutOrmInput>
    connectOrCreate?: MemberCreateOrConnectWithoutOrmInput
    upsert?: MemberUpsertWithoutOrmInput
    connect?: MemberWhereUniqueInput
    update?: XOR<XOR<MemberUpdateToOneWithWhereWithoutOrmInput, MemberUpdateWithoutOrmInput>, MemberUncheckedUpdateWithoutOrmInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryFilter<$PrismaModel> | $Enums.Category
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Category | EnumCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.Category[] | ListEnumCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumCategoryWithAggregatesFilter<$PrismaModel> | $Enums.Category
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCategoryFilter<$PrismaModel>
    _max?: NestedEnumCategoryFilter<$PrismaModel>
  }

  export type BusinessAccCreateWithoutUserInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutUserInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutUserInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutUserInput, BusinessAccUncheckedCreateWithoutUserInput>
  }

  export type BusinessAccCreateManyUserInputEnvelope = {
    data: BusinessAccCreateManyUserInput | BusinessAccCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MemberCreateWithoutUserInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutUserInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    businessId?: number | null
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutUserInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutUserInput, MemberUncheckedCreateWithoutUserInput>
  }

  export type MemberCreateManyUserInputEnvelope = {
    data: MemberCreateManyUserInput | MemberCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type BusinessAccUpsertWithWhereUniqueWithoutUserInput = {
    where: BusinessAccWhereUniqueInput
    update: XOR<BusinessAccUpdateWithoutUserInput, BusinessAccUncheckedUpdateWithoutUserInput>
    create: XOR<BusinessAccCreateWithoutUserInput, BusinessAccUncheckedCreateWithoutUserInput>
  }

  export type BusinessAccUpdateWithWhereUniqueWithoutUserInput = {
    where: BusinessAccWhereUniqueInput
    data: XOR<BusinessAccUpdateWithoutUserInput, BusinessAccUncheckedUpdateWithoutUserInput>
  }

  export type BusinessAccUpdateManyWithWhereWithoutUserInput = {
    where: BusinessAccScalarWhereInput
    data: XOR<BusinessAccUpdateManyMutationInput, BusinessAccUncheckedUpdateManyWithoutUserInput>
  }

  export type BusinessAccScalarWhereInput = {
    AND?: BusinessAccScalarWhereInput | BusinessAccScalarWhereInput[]
    OR?: BusinessAccScalarWhereInput[]
    NOT?: BusinessAccScalarWhereInput | BusinessAccScalarWhereInput[]
    id?: IntFilter<"BusinessAcc"> | number
    createdAt?: DateTimeNullableFilter<"BusinessAcc"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"BusinessAcc"> | Date | string | null
    name?: StringFilter<"BusinessAcc"> | string
    businessType?: EnumCategoryFilter<"BusinessAcc"> | $Enums.Category
    userId?: IntFilter<"BusinessAcc"> | number
  }

  export type MemberUpsertWithWhereUniqueWithoutUserInput = {
    where: MemberWhereUniqueInput
    update: XOR<MemberUpdateWithoutUserInput, MemberUncheckedUpdateWithoutUserInput>
    create: XOR<MemberCreateWithoutUserInput, MemberUncheckedCreateWithoutUserInput>
  }

  export type MemberUpdateWithWhereUniqueWithoutUserInput = {
    where: MemberWhereUniqueInput
    data: XOR<MemberUpdateWithoutUserInput, MemberUncheckedUpdateWithoutUserInput>
  }

  export type MemberUpdateManyWithWhereWithoutUserInput = {
    where: MemberScalarWhereInput
    data: XOR<MemberUpdateManyMutationInput, MemberUncheckedUpdateManyWithoutUserInput>
  }

  export type MemberScalarWhereInput = {
    AND?: MemberScalarWhereInput | MemberScalarWhereInput[]
    OR?: MemberScalarWhereInput[]
    NOT?: MemberScalarWhereInput | MemberScalarWhereInput[]
    uniqueId?: StringFilter<"Member"> | string
    createdAt?: DateTimeFilter<"Member"> | Date | string
    updatedAt?: DateTimeFilter<"Member"> | Date | string
    userId?: IntFilter<"Member"> | number
    businessId?: IntNullableFilter<"Member"> | number | null
  }

  export type UserCreateWithoutMemberInput = {
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
    Business?: BusinessAccCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMemberInput = {
    id?: number
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
    Business?: BusinessAccUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMemberInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMemberInput, UserUncheckedCreateWithoutMemberInput>
  }

  export type BusinessAccCreateWithoutAllMemberInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutAllMemberInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutAllMemberInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutAllMemberInput, BusinessAccUncheckedCreateWithoutAllMemberInput>
  }

  export type OfficeCreateWithoutAuthorInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutOfficeInput
  }

  export type OfficeUncheckedCreateWithoutAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type OfficeCreateOrConnectWithoutAuthorInput = {
    where: OfficeWhereUniqueInput
    create: XOR<OfficeCreateWithoutAuthorInput, OfficeUncheckedCreateWithoutAuthorInput>
  }

  export type OfficeCreateManyAuthorInputEnvelope = {
    data: OfficeCreateManyAuthorInput | OfficeCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type CoachCreateWithoutAuthorInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutCoachInput
  }

  export type CoachUncheckedCreateWithoutAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type CoachCreateOrConnectWithoutAuthorInput = {
    where: CoachWhereUniqueInput
    create: XOR<CoachCreateWithoutAuthorInput, CoachUncheckedCreateWithoutAuthorInput>
  }

  export type CoachCreateManyAuthorInputEnvelope = {
    data: CoachCreateManyAuthorInput | CoachCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type BankCreateWithoutAuthorInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutBankInput
  }

  export type BankUncheckedCreateWithoutAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type BankCreateOrConnectWithoutAuthorInput = {
    where: BankWhereUniqueInput
    create: XOR<BankCreateWithoutAuthorInput, BankUncheckedCreateWithoutAuthorInput>
  }

  export type BankCreateManyAuthorInputEnvelope = {
    data: BankCreateManyAuthorInput | BankCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type AgencyCreateWithoutAuthorInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutAgencyInput
  }

  export type AgencyUncheckedCreateWithoutAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type AgencyCreateOrConnectWithoutAuthorInput = {
    where: AgencyWhereUniqueInput
    create: XOR<AgencyCreateWithoutAuthorInput, AgencyUncheckedCreateWithoutAuthorInput>
  }

  export type AgencyCreateManyAuthorInputEnvelope = {
    data: AgencyCreateManyAuthorInput | AgencyCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type OrmCreateWithoutAuthorInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessAcc: BusinessAccCreateNestedOneWithoutOrmInput
  }

  export type OrmUncheckedCreateWithoutAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type OrmCreateOrConnectWithoutAuthorInput = {
    where: OrmWhereUniqueInput
    create: XOR<OrmCreateWithoutAuthorInput, OrmUncheckedCreateWithoutAuthorInput>
  }

  export type OrmCreateManyAuthorInputEnvelope = {
    data: OrmCreateManyAuthorInput | OrmCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutMemberInput = {
    update: XOR<UserUpdateWithoutMemberInput, UserUncheckedUpdateWithoutMemberInput>
    create: XOR<UserCreateWithoutMemberInput, UserUncheckedCreateWithoutMemberInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMemberInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMemberInput, UserUncheckedUpdateWithoutMemberInput>
  }

  export type UserUpdateWithoutMemberInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    Business?: BusinessAccUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMemberInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    Business?: BusinessAccUncheckedUpdateManyWithoutUserNestedInput
  }

  export type BusinessAccUpsertWithoutAllMemberInput = {
    update: XOR<BusinessAccUpdateWithoutAllMemberInput, BusinessAccUncheckedUpdateWithoutAllMemberInput>
    create: XOR<BusinessAccCreateWithoutAllMemberInput, BusinessAccUncheckedCreateWithoutAllMemberInput>
    where?: BusinessAccWhereInput
  }

  export type BusinessAccUpdateToOneWithWhereWithoutAllMemberInput = {
    where?: BusinessAccWhereInput
    data: XOR<BusinessAccUpdateWithoutAllMemberInput, BusinessAccUncheckedUpdateWithoutAllMemberInput>
  }

  export type BusinessAccUpdateWithoutAllMemberInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutAllMemberInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type OfficeUpsertWithWhereUniqueWithoutAuthorInput = {
    where: OfficeWhereUniqueInput
    update: XOR<OfficeUpdateWithoutAuthorInput, OfficeUncheckedUpdateWithoutAuthorInput>
    create: XOR<OfficeCreateWithoutAuthorInput, OfficeUncheckedCreateWithoutAuthorInput>
  }

  export type OfficeUpdateWithWhereUniqueWithoutAuthorInput = {
    where: OfficeWhereUniqueInput
    data: XOR<OfficeUpdateWithoutAuthorInput, OfficeUncheckedUpdateWithoutAuthorInput>
  }

  export type OfficeUpdateManyWithWhereWithoutAuthorInput = {
    where: OfficeScalarWhereInput
    data: XOR<OfficeUpdateManyMutationInput, OfficeUncheckedUpdateManyWithoutAuthorInput>
  }

  export type OfficeScalarWhereInput = {
    AND?: OfficeScalarWhereInput | OfficeScalarWhereInput[]
    OR?: OfficeScalarWhereInput[]
    NOT?: OfficeScalarWhereInput | OfficeScalarWhereInput[]
    id?: IntFilter<"Office"> | number
    createdAt?: DateTimeFilter<"Office"> | Date | string
    updatedAt?: DateTimeFilter<"Office"> | Date | string
    Category?: EnumCategoryFilter<"Office"> | $Enums.Category
    title?: StringFilter<"Office"> | string
    description?: StringFilter<"Office"> | string
    image?: StringNullableFilter<"Office"> | string | null
    callToAction?: StringNullableFilter<"Office"> | string | null
    businessId?: IntFilter<"Office"> | number
    authorId?: StringFilter<"Office"> | string
  }

  export type CoachUpsertWithWhereUniqueWithoutAuthorInput = {
    where: CoachWhereUniqueInput
    update: XOR<CoachUpdateWithoutAuthorInput, CoachUncheckedUpdateWithoutAuthorInput>
    create: XOR<CoachCreateWithoutAuthorInput, CoachUncheckedCreateWithoutAuthorInput>
  }

  export type CoachUpdateWithWhereUniqueWithoutAuthorInput = {
    where: CoachWhereUniqueInput
    data: XOR<CoachUpdateWithoutAuthorInput, CoachUncheckedUpdateWithoutAuthorInput>
  }

  export type CoachUpdateManyWithWhereWithoutAuthorInput = {
    where: CoachScalarWhereInput
    data: XOR<CoachUpdateManyMutationInput, CoachUncheckedUpdateManyWithoutAuthorInput>
  }

  export type CoachScalarWhereInput = {
    AND?: CoachScalarWhereInput | CoachScalarWhereInput[]
    OR?: CoachScalarWhereInput[]
    NOT?: CoachScalarWhereInput | CoachScalarWhereInput[]
    id?: IntFilter<"Coach"> | number
    createdAt?: DateTimeFilter<"Coach"> | Date | string
    updatedAt?: DateTimeFilter<"Coach"> | Date | string
    Category?: EnumCategoryFilter<"Coach"> | $Enums.Category
    title?: StringFilter<"Coach"> | string
    description?: StringFilter<"Coach"> | string
    image?: StringNullableFilter<"Coach"> | string | null
    callToAction?: StringNullableFilter<"Coach"> | string | null
    businessId?: IntFilter<"Coach"> | number
    authorId?: StringFilter<"Coach"> | string
  }

  export type BankUpsertWithWhereUniqueWithoutAuthorInput = {
    where: BankWhereUniqueInput
    update: XOR<BankUpdateWithoutAuthorInput, BankUncheckedUpdateWithoutAuthorInput>
    create: XOR<BankCreateWithoutAuthorInput, BankUncheckedCreateWithoutAuthorInput>
  }

  export type BankUpdateWithWhereUniqueWithoutAuthorInput = {
    where: BankWhereUniqueInput
    data: XOR<BankUpdateWithoutAuthorInput, BankUncheckedUpdateWithoutAuthorInput>
  }

  export type BankUpdateManyWithWhereWithoutAuthorInput = {
    where: BankScalarWhereInput
    data: XOR<BankUpdateManyMutationInput, BankUncheckedUpdateManyWithoutAuthorInput>
  }

  export type BankScalarWhereInput = {
    AND?: BankScalarWhereInput | BankScalarWhereInput[]
    OR?: BankScalarWhereInput[]
    NOT?: BankScalarWhereInput | BankScalarWhereInput[]
    id?: IntFilter<"Bank"> | number
    createdAt?: DateTimeFilter<"Bank"> | Date | string
    updatedAt?: DateTimeFilter<"Bank"> | Date | string
    Category?: EnumCategoryFilter<"Bank"> | $Enums.Category
    title?: StringFilter<"Bank"> | string
    description?: StringFilter<"Bank"> | string
    image?: StringNullableFilter<"Bank"> | string | null
    callToAction?: StringNullableFilter<"Bank"> | string | null
    businessId?: IntFilter<"Bank"> | number
    authorId?: StringFilter<"Bank"> | string
  }

  export type AgencyUpsertWithWhereUniqueWithoutAuthorInput = {
    where: AgencyWhereUniqueInput
    update: XOR<AgencyUpdateWithoutAuthorInput, AgencyUncheckedUpdateWithoutAuthorInput>
    create: XOR<AgencyCreateWithoutAuthorInput, AgencyUncheckedCreateWithoutAuthorInput>
  }

  export type AgencyUpdateWithWhereUniqueWithoutAuthorInput = {
    where: AgencyWhereUniqueInput
    data: XOR<AgencyUpdateWithoutAuthorInput, AgencyUncheckedUpdateWithoutAuthorInput>
  }

  export type AgencyUpdateManyWithWhereWithoutAuthorInput = {
    where: AgencyScalarWhereInput
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyWithoutAuthorInput>
  }

  export type AgencyScalarWhereInput = {
    AND?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
    OR?: AgencyScalarWhereInput[]
    NOT?: AgencyScalarWhereInput | AgencyScalarWhereInput[]
    id?: IntFilter<"Agency"> | number
    createdAt?: DateTimeFilter<"Agency"> | Date | string
    updatedAt?: DateTimeFilter<"Agency"> | Date | string
    Category?: EnumCategoryFilter<"Agency"> | $Enums.Category
    title?: StringFilter<"Agency"> | string
    description?: StringFilter<"Agency"> | string
    image?: StringNullableFilter<"Agency"> | string | null
    callToAction?: StringNullableFilter<"Agency"> | string | null
    businessId?: IntFilter<"Agency"> | number
    authorId?: StringFilter<"Agency"> | string
  }

  export type OrmUpsertWithWhereUniqueWithoutAuthorInput = {
    where: OrmWhereUniqueInput
    update: XOR<OrmUpdateWithoutAuthorInput, OrmUncheckedUpdateWithoutAuthorInput>
    create: XOR<OrmCreateWithoutAuthorInput, OrmUncheckedCreateWithoutAuthorInput>
  }

  export type OrmUpdateWithWhereUniqueWithoutAuthorInput = {
    where: OrmWhereUniqueInput
    data: XOR<OrmUpdateWithoutAuthorInput, OrmUncheckedUpdateWithoutAuthorInput>
  }

  export type OrmUpdateManyWithWhereWithoutAuthorInput = {
    where: OrmScalarWhereInput
    data: XOR<OrmUpdateManyMutationInput, OrmUncheckedUpdateManyWithoutAuthorInput>
  }

  export type OrmScalarWhereInput = {
    AND?: OrmScalarWhereInput | OrmScalarWhereInput[]
    OR?: OrmScalarWhereInput[]
    NOT?: OrmScalarWhereInput | OrmScalarWhereInput[]
    id?: IntFilter<"Orm"> | number
    createdAt?: DateTimeFilter<"Orm"> | Date | string
    updatedAt?: DateTimeFilter<"Orm"> | Date | string
    Category?: EnumCategoryFilter<"Orm"> | $Enums.Category
    title?: StringFilter<"Orm"> | string
    description?: StringFilter<"Orm"> | string
    image?: StringNullableFilter<"Orm"> | string | null
    callToAction?: StringNullableFilter<"Orm"> | string | null
    businessId?: IntFilter<"Orm"> | number
    authorId?: StringFilter<"Orm"> | string
  }

  export type UserCreateWithoutBusinessInput = {
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
    member?: MemberCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutBusinessInput = {
    id?: number
    email: string
    password: string
    firstName: string
    lastName: string
    avatar?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    phone: string
    username?: string | null
    member?: MemberUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutBusinessInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBusinessInput, UserUncheckedCreateWithoutBusinessInput>
  }

  export type MemberCreateWithoutBusinessInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutBusinessInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutBusinessInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutBusinessInput, MemberUncheckedCreateWithoutBusinessInput>
  }

  export type MemberCreateManyBusinessInputEnvelope = {
    data: MemberCreateManyBusinessInput | MemberCreateManyBusinessInput[]
    skipDuplicates?: boolean
  }

  export type OfficeCreateWithoutBusinessAccInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    author: MemberCreateNestedOneWithoutOfficeInput
  }

  export type OfficeUncheckedCreateWithoutBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type OfficeCreateOrConnectWithoutBusinessAccInput = {
    where: OfficeWhereUniqueInput
    create: XOR<OfficeCreateWithoutBusinessAccInput, OfficeUncheckedCreateWithoutBusinessAccInput>
  }

  export type OfficeCreateManyBusinessAccInputEnvelope = {
    data: OfficeCreateManyBusinessAccInput | OfficeCreateManyBusinessAccInput[]
    skipDuplicates?: boolean
  }

  export type CoachCreateWithoutBusinessAccInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    author: MemberCreateNestedOneWithoutCoachInput
  }

  export type CoachUncheckedCreateWithoutBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type CoachCreateOrConnectWithoutBusinessAccInput = {
    where: CoachWhereUniqueInput
    create: XOR<CoachCreateWithoutBusinessAccInput, CoachUncheckedCreateWithoutBusinessAccInput>
  }

  export type CoachCreateManyBusinessAccInputEnvelope = {
    data: CoachCreateManyBusinessAccInput | CoachCreateManyBusinessAccInput[]
    skipDuplicates?: boolean
  }

  export type BankCreateWithoutBusinessAccInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    author: MemberCreateNestedOneWithoutBankInput
  }

  export type BankUncheckedCreateWithoutBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type BankCreateOrConnectWithoutBusinessAccInput = {
    where: BankWhereUniqueInput
    create: XOR<BankCreateWithoutBusinessAccInput, BankUncheckedCreateWithoutBusinessAccInput>
  }

  export type BankCreateManyBusinessAccInputEnvelope = {
    data: BankCreateManyBusinessAccInput | BankCreateManyBusinessAccInput[]
    skipDuplicates?: boolean
  }

  export type AgencyCreateWithoutBusinessAccInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    author: MemberCreateNestedOneWithoutAgencyInput
  }

  export type AgencyUncheckedCreateWithoutBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type AgencyCreateOrConnectWithoutBusinessAccInput = {
    where: AgencyWhereUniqueInput
    create: XOR<AgencyCreateWithoutBusinessAccInput, AgencyUncheckedCreateWithoutBusinessAccInput>
  }

  export type AgencyCreateManyBusinessAccInputEnvelope = {
    data: AgencyCreateManyBusinessAccInput | AgencyCreateManyBusinessAccInput[]
    skipDuplicates?: boolean
  }

  export type OrmCreateWithoutBusinessAccInput = {
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    author: MemberCreateNestedOneWithoutOrmInput
  }

  export type OrmUncheckedCreateWithoutBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type OrmCreateOrConnectWithoutBusinessAccInput = {
    where: OrmWhereUniqueInput
    create: XOR<OrmCreateWithoutBusinessAccInput, OrmUncheckedCreateWithoutBusinessAccInput>
  }

  export type OrmCreateManyBusinessAccInputEnvelope = {
    data: OrmCreateManyBusinessAccInput | OrmCreateManyBusinessAccInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutBusinessInput = {
    update: XOR<UserUpdateWithoutBusinessInput, UserUncheckedUpdateWithoutBusinessInput>
    create: XOR<UserCreateWithoutBusinessInput, UserUncheckedCreateWithoutBusinessInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBusinessInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBusinessInput, UserUncheckedUpdateWithoutBusinessInput>
  }

  export type UserUpdateWithoutBusinessInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    member?: MemberUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutBusinessInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    phone?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    member?: MemberUncheckedUpdateManyWithoutUserNestedInput
  }

  export type MemberUpsertWithWhereUniqueWithoutBusinessInput = {
    where: MemberWhereUniqueInput
    update: XOR<MemberUpdateWithoutBusinessInput, MemberUncheckedUpdateWithoutBusinessInput>
    create: XOR<MemberCreateWithoutBusinessInput, MemberUncheckedCreateWithoutBusinessInput>
  }

  export type MemberUpdateWithWhereUniqueWithoutBusinessInput = {
    where: MemberWhereUniqueInput
    data: XOR<MemberUpdateWithoutBusinessInput, MemberUncheckedUpdateWithoutBusinessInput>
  }

  export type MemberUpdateManyWithWhereWithoutBusinessInput = {
    where: MemberScalarWhereInput
    data: XOR<MemberUpdateManyMutationInput, MemberUncheckedUpdateManyWithoutBusinessInput>
  }

  export type OfficeUpsertWithWhereUniqueWithoutBusinessAccInput = {
    where: OfficeWhereUniqueInput
    update: XOR<OfficeUpdateWithoutBusinessAccInput, OfficeUncheckedUpdateWithoutBusinessAccInput>
    create: XOR<OfficeCreateWithoutBusinessAccInput, OfficeUncheckedCreateWithoutBusinessAccInput>
  }

  export type OfficeUpdateWithWhereUniqueWithoutBusinessAccInput = {
    where: OfficeWhereUniqueInput
    data: XOR<OfficeUpdateWithoutBusinessAccInput, OfficeUncheckedUpdateWithoutBusinessAccInput>
  }

  export type OfficeUpdateManyWithWhereWithoutBusinessAccInput = {
    where: OfficeScalarWhereInput
    data: XOR<OfficeUpdateManyMutationInput, OfficeUncheckedUpdateManyWithoutBusinessAccInput>
  }

  export type CoachUpsertWithWhereUniqueWithoutBusinessAccInput = {
    where: CoachWhereUniqueInput
    update: XOR<CoachUpdateWithoutBusinessAccInput, CoachUncheckedUpdateWithoutBusinessAccInput>
    create: XOR<CoachCreateWithoutBusinessAccInput, CoachUncheckedCreateWithoutBusinessAccInput>
  }

  export type CoachUpdateWithWhereUniqueWithoutBusinessAccInput = {
    where: CoachWhereUniqueInput
    data: XOR<CoachUpdateWithoutBusinessAccInput, CoachUncheckedUpdateWithoutBusinessAccInput>
  }

  export type CoachUpdateManyWithWhereWithoutBusinessAccInput = {
    where: CoachScalarWhereInput
    data: XOR<CoachUpdateManyMutationInput, CoachUncheckedUpdateManyWithoutBusinessAccInput>
  }

  export type BankUpsertWithWhereUniqueWithoutBusinessAccInput = {
    where: BankWhereUniqueInput
    update: XOR<BankUpdateWithoutBusinessAccInput, BankUncheckedUpdateWithoutBusinessAccInput>
    create: XOR<BankCreateWithoutBusinessAccInput, BankUncheckedCreateWithoutBusinessAccInput>
  }

  export type BankUpdateWithWhereUniqueWithoutBusinessAccInput = {
    where: BankWhereUniqueInput
    data: XOR<BankUpdateWithoutBusinessAccInput, BankUncheckedUpdateWithoutBusinessAccInput>
  }

  export type BankUpdateManyWithWhereWithoutBusinessAccInput = {
    where: BankScalarWhereInput
    data: XOR<BankUpdateManyMutationInput, BankUncheckedUpdateManyWithoutBusinessAccInput>
  }

  export type AgencyUpsertWithWhereUniqueWithoutBusinessAccInput = {
    where: AgencyWhereUniqueInput
    update: XOR<AgencyUpdateWithoutBusinessAccInput, AgencyUncheckedUpdateWithoutBusinessAccInput>
    create: XOR<AgencyCreateWithoutBusinessAccInput, AgencyUncheckedCreateWithoutBusinessAccInput>
  }

  export type AgencyUpdateWithWhereUniqueWithoutBusinessAccInput = {
    where: AgencyWhereUniqueInput
    data: XOR<AgencyUpdateWithoutBusinessAccInput, AgencyUncheckedUpdateWithoutBusinessAccInput>
  }

  export type AgencyUpdateManyWithWhereWithoutBusinessAccInput = {
    where: AgencyScalarWhereInput
    data: XOR<AgencyUpdateManyMutationInput, AgencyUncheckedUpdateManyWithoutBusinessAccInput>
  }

  export type OrmUpsertWithWhereUniqueWithoutBusinessAccInput = {
    where: OrmWhereUniqueInput
    update: XOR<OrmUpdateWithoutBusinessAccInput, OrmUncheckedUpdateWithoutBusinessAccInput>
    create: XOR<OrmCreateWithoutBusinessAccInput, OrmUncheckedCreateWithoutBusinessAccInput>
  }

  export type OrmUpdateWithWhereUniqueWithoutBusinessAccInput = {
    where: OrmWhereUniqueInput
    data: XOR<OrmUpdateWithoutBusinessAccInput, OrmUncheckedUpdateWithoutBusinessAccInput>
  }

  export type OrmUpdateManyWithWhereWithoutBusinessAccInput = {
    where: OrmScalarWhereInput
    data: XOR<OrmUpdateManyMutationInput, OrmUncheckedUpdateManyWithoutBusinessAccInput>
  }

  export type BusinessAccCreateWithoutOfficeInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutOfficeInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutOfficeInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutOfficeInput, BusinessAccUncheckedCreateWithoutOfficeInput>
  }

  export type MemberCreateWithoutOfficeInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutOfficeInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutOfficeInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutOfficeInput, MemberUncheckedCreateWithoutOfficeInput>
  }

  export type BusinessAccUpsertWithoutOfficeInput = {
    update: XOR<BusinessAccUpdateWithoutOfficeInput, BusinessAccUncheckedUpdateWithoutOfficeInput>
    create: XOR<BusinessAccCreateWithoutOfficeInput, BusinessAccUncheckedCreateWithoutOfficeInput>
    where?: BusinessAccWhereInput
  }

  export type BusinessAccUpdateToOneWithWhereWithoutOfficeInput = {
    where?: BusinessAccWhereInput
    data: XOR<BusinessAccUpdateWithoutOfficeInput, BusinessAccUncheckedUpdateWithoutOfficeInput>
  }

  export type BusinessAccUpdateWithoutOfficeInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutOfficeInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type MemberUpsertWithoutOfficeInput = {
    update: XOR<MemberUpdateWithoutOfficeInput, MemberUncheckedUpdateWithoutOfficeInput>
    create: XOR<MemberCreateWithoutOfficeInput, MemberUncheckedCreateWithoutOfficeInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutOfficeInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutOfficeInput, MemberUncheckedUpdateWithoutOfficeInput>
  }

  export type MemberUpdateWithoutOfficeInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutOfficeInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type BusinessAccCreateWithoutCoachInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutCoachInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutCoachInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutCoachInput, BusinessAccUncheckedCreateWithoutCoachInput>
  }

  export type MemberCreateWithoutCoachInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutCoachInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutCoachInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutCoachInput, MemberUncheckedCreateWithoutCoachInput>
  }

  export type BusinessAccUpsertWithoutCoachInput = {
    update: XOR<BusinessAccUpdateWithoutCoachInput, BusinessAccUncheckedUpdateWithoutCoachInput>
    create: XOR<BusinessAccCreateWithoutCoachInput, BusinessAccUncheckedCreateWithoutCoachInput>
    where?: BusinessAccWhereInput
  }

  export type BusinessAccUpdateToOneWithWhereWithoutCoachInput = {
    where?: BusinessAccWhereInput
    data: XOR<BusinessAccUpdateWithoutCoachInput, BusinessAccUncheckedUpdateWithoutCoachInput>
  }

  export type BusinessAccUpdateWithoutCoachInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutCoachInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type MemberUpsertWithoutCoachInput = {
    update: XOR<MemberUpdateWithoutCoachInput, MemberUncheckedUpdateWithoutCoachInput>
    create: XOR<MemberCreateWithoutCoachInput, MemberUncheckedCreateWithoutCoachInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutCoachInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutCoachInput, MemberUncheckedUpdateWithoutCoachInput>
  }

  export type MemberUpdateWithoutCoachInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutCoachInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type BusinessAccCreateWithoutBankInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutBankInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutBankInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutBankInput, BusinessAccUncheckedCreateWithoutBankInput>
  }

  export type MemberCreateWithoutBankInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutBankInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutBankInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutBankInput, MemberUncheckedCreateWithoutBankInput>
  }

  export type BusinessAccUpsertWithoutBankInput = {
    update: XOR<BusinessAccUpdateWithoutBankInput, BusinessAccUncheckedUpdateWithoutBankInput>
    create: XOR<BusinessAccCreateWithoutBankInput, BusinessAccUncheckedCreateWithoutBankInput>
    where?: BusinessAccWhereInput
  }

  export type BusinessAccUpdateToOneWithWhereWithoutBankInput = {
    where?: BusinessAccWhereInput
    data: XOR<BusinessAccUpdateWithoutBankInput, BusinessAccUncheckedUpdateWithoutBankInput>
  }

  export type BusinessAccUpdateWithoutBankInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutBankInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type MemberUpsertWithoutBankInput = {
    update: XOR<MemberUpdateWithoutBankInput, MemberUncheckedUpdateWithoutBankInput>
    create: XOR<MemberCreateWithoutBankInput, MemberUncheckedCreateWithoutBankInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutBankInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutBankInput, MemberUncheckedUpdateWithoutBankInput>
  }

  export type MemberUpdateWithoutBankInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutBankInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type BusinessAccCreateWithoutAgencyInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutAgencyInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Orm?: OrmUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutAgencyInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutAgencyInput, BusinessAccUncheckedCreateWithoutAgencyInput>
  }

  export type MemberCreateWithoutAgencyInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    orm?: OrmCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutAgencyInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    orm?: OrmUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutAgencyInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutAgencyInput, MemberUncheckedCreateWithoutAgencyInput>
  }

  export type BusinessAccUpsertWithoutAgencyInput = {
    update: XOR<BusinessAccUpdateWithoutAgencyInput, BusinessAccUncheckedUpdateWithoutAgencyInput>
    create: XOR<BusinessAccCreateWithoutAgencyInput, BusinessAccUncheckedCreateWithoutAgencyInput>
    where?: BusinessAccWhereInput
  }

  export type BusinessAccUpdateToOneWithWhereWithoutAgencyInput = {
    where?: BusinessAccWhereInput
    data: XOR<BusinessAccUpdateWithoutAgencyInput, BusinessAccUncheckedUpdateWithoutAgencyInput>
  }

  export type BusinessAccUpdateWithoutAgencyInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutAgencyInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type MemberUpsertWithoutAgencyInput = {
    update: XOR<MemberUpdateWithoutAgencyInput, MemberUncheckedUpdateWithoutAgencyInput>
    create: XOR<MemberCreateWithoutAgencyInput, MemberUncheckedCreateWithoutAgencyInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutAgencyInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutAgencyInput, MemberUncheckedUpdateWithoutAgencyInput>
  }

  export type MemberUpdateWithoutAgencyInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutAgencyInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type BusinessAccCreateWithoutOrmInput = {
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    user: UserCreateNestedOneWithoutBusinessInput
    AllMember?: MemberCreateNestedManyWithoutBusinessInput
    Office?: OfficeCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachCreateNestedManyWithoutBusinessAccInput
    Bank?: BankCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccUncheckedCreateWithoutOrmInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
    userId: number
    AllMember?: MemberUncheckedCreateNestedManyWithoutBusinessInput
    Office?: OfficeUncheckedCreateNestedManyWithoutBusinessAccInput
    Coach?: CoachUncheckedCreateNestedManyWithoutBusinessAccInput
    Bank?: BankUncheckedCreateNestedManyWithoutBusinessAccInput
    Agency?: AgencyUncheckedCreateNestedManyWithoutBusinessAccInput
  }

  export type BusinessAccCreateOrConnectWithoutOrmInput = {
    where: BusinessAccWhereUniqueInput
    create: XOR<BusinessAccCreateWithoutOrmInput, BusinessAccUncheckedCreateWithoutOrmInput>
  }

  export type MemberCreateWithoutOrmInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutMemberInput
    business?: BusinessAccCreateNestedOneWithoutAllMemberInput
    office?: OfficeCreateNestedManyWithoutAuthorInput
    coach?: CoachCreateNestedManyWithoutAuthorInput
    bank?: BankCreateNestedManyWithoutAuthorInput
    agency?: AgencyCreateNestedManyWithoutAuthorInput
  }

  export type MemberUncheckedCreateWithoutOrmInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
    businessId?: number | null
    office?: OfficeUncheckedCreateNestedManyWithoutAuthorInput
    coach?: CoachUncheckedCreateNestedManyWithoutAuthorInput
    bank?: BankUncheckedCreateNestedManyWithoutAuthorInput
    agency?: AgencyUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type MemberCreateOrConnectWithoutOrmInput = {
    where: MemberWhereUniqueInput
    create: XOR<MemberCreateWithoutOrmInput, MemberUncheckedCreateWithoutOrmInput>
  }

  export type BusinessAccUpsertWithoutOrmInput = {
    update: XOR<BusinessAccUpdateWithoutOrmInput, BusinessAccUncheckedUpdateWithoutOrmInput>
    create: XOR<BusinessAccCreateWithoutOrmInput, BusinessAccUncheckedCreateWithoutOrmInput>
    where?: BusinessAccWhereInput
  }

  export type BusinessAccUpdateToOneWithWhereWithoutOrmInput = {
    where?: BusinessAccWhereInput
    data: XOR<BusinessAccUpdateWithoutOrmInput, BusinessAccUncheckedUpdateWithoutOrmInput>
  }

  export type BusinessAccUpdateWithoutOrmInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    user?: UserUpdateOneRequiredWithoutBusinessNestedInput
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutOrmInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    userId?: IntFieldUpdateOperationsInput | number
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type MemberUpsertWithoutOrmInput = {
    update: XOR<MemberUpdateWithoutOrmInput, MemberUncheckedUpdateWithoutOrmInput>
    create: XOR<MemberCreateWithoutOrmInput, MemberUncheckedCreateWithoutOrmInput>
    where?: MemberWhereInput
  }

  export type MemberUpdateToOneWithWhereWithoutOrmInput = {
    where?: MemberWhereInput
    data: XOR<MemberUpdateWithoutOrmInput, MemberUncheckedUpdateWithoutOrmInput>
  }

  export type MemberUpdateWithoutOrmInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutOrmInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type BusinessAccCreateManyUserInput = {
    id?: number
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    name: string
    businessType: $Enums.Category
  }

  export type MemberCreateManyUserInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    businessId?: number | null
  }

  export type BusinessAccUpdateWithoutUserInput = {
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    AllMember?: MemberUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    AllMember?: MemberUncheckedUpdateManyWithoutBusinessNestedInput
    Office?: OfficeUncheckedUpdateManyWithoutBusinessAccNestedInput
    Coach?: CoachUncheckedUpdateManyWithoutBusinessAccNestedInput
    Bank?: BankUncheckedUpdateManyWithoutBusinessAccNestedInput
    Agency?: AgencyUncheckedUpdateManyWithoutBusinessAccNestedInput
    Orm?: OrmUncheckedUpdateManyWithoutBusinessAccNestedInput
  }

  export type BusinessAccUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    name?: StringFieldUpdateOperationsInput | string
    businessType?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
  }

  export type MemberUpdateWithoutUserInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    business?: BusinessAccUpdateOneWithoutAllMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutUserInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateManyWithoutUserInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    businessId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type OfficeCreateManyAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type CoachCreateManyAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type BankCreateManyAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type AgencyCreateManyAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type OrmCreateManyAuthorInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    businessId: number
  }

  export type OfficeUpdateWithoutAuthorInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutOfficeNestedInput
  }

  export type OfficeUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type OfficeUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type CoachUpdateWithoutAuthorInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutCoachNestedInput
  }

  export type CoachUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type CoachUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type BankUpdateWithoutAuthorInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutBankNestedInput
  }

  export type BankUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type BankUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type AgencyUpdateWithoutAuthorInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutAgencyNestedInput
  }

  export type AgencyUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type AgencyUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type OrmUpdateWithoutAuthorInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessAcc?: BusinessAccUpdateOneRequiredWithoutOrmNestedInput
  }

  export type OrmUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type OrmUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    businessId?: IntFieldUpdateOperationsInput | number
  }

  export type MemberCreateManyBusinessInput = {
    uniqueId?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: number
  }

  export type OfficeCreateManyBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type CoachCreateManyBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type BankCreateManyBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type AgencyCreateManyBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type OrmCreateManyBusinessAccInput = {
    id?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    Category?: $Enums.Category
    title: string
    description: string
    image?: string | null
    callToAction?: string | null
    authorId: string
  }

  export type MemberUpdateWithoutBusinessInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutMemberNestedInput
    office?: OfficeUpdateManyWithoutAuthorNestedInput
    coach?: CoachUpdateManyWithoutAuthorNestedInput
    bank?: BankUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUpdateManyWithoutAuthorNestedInput
    orm?: OrmUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateWithoutBusinessInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
    office?: OfficeUncheckedUpdateManyWithoutAuthorNestedInput
    coach?: CoachUncheckedUpdateManyWithoutAuthorNestedInput
    bank?: BankUncheckedUpdateManyWithoutAuthorNestedInput
    agency?: AgencyUncheckedUpdateManyWithoutAuthorNestedInput
    orm?: OrmUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type MemberUncheckedUpdateManyWithoutBusinessInput = {
    uniqueId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: IntFieldUpdateOperationsInput | number
  }

  export type OfficeUpdateWithoutBusinessAccInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    author?: MemberUpdateOneRequiredWithoutOfficeNestedInput
  }

  export type OfficeUncheckedUpdateWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type OfficeUncheckedUpdateManyWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type CoachUpdateWithoutBusinessAccInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    author?: MemberUpdateOneRequiredWithoutCoachNestedInput
  }

  export type CoachUncheckedUpdateWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type CoachUncheckedUpdateManyWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type BankUpdateWithoutBusinessAccInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    author?: MemberUpdateOneRequiredWithoutBankNestedInput
  }

  export type BankUncheckedUpdateWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type BankUncheckedUpdateManyWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type AgencyUpdateWithoutBusinessAccInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    author?: MemberUpdateOneRequiredWithoutAgencyNestedInput
  }

  export type AgencyUncheckedUpdateWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type AgencyUncheckedUpdateManyWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type OrmUpdateWithoutBusinessAccInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    author?: MemberUpdateOneRequiredWithoutOrmNestedInput
  }

  export type OrmUncheckedUpdateWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type OrmUncheckedUpdateManyWithoutBusinessAccInput = {
    id?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Category?: EnumCategoryFieldUpdateOperationsInput | $Enums.Category
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    image?: NullableStringFieldUpdateOperationsInput | string | null
    callToAction?: NullableStringFieldUpdateOperationsInput | string | null
    authorId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}