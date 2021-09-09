import * as testing from '@firebase/rules-unit-testing'
import firebase from 'firebase/compat/app'
import { injectAdaptor } from '../adaptor'
import { getAll } from '../adaptor/utils'
import { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { RulesTestContext } from '@firebase/rules-unit-testing'
import { TestEnvironmentConfig } from '@firebase/rules-unit-testing/dist/src/public_types'

let currentCtx: RulesTestContext

/**
 * Injects @firebase/rules-unit-testing adaptod instead of firebase-admin and set the given
 * app to be used for Firestore operations.
 *
 * ```ts
 * import * as testing from '@firebase/rules-unit-testing'
 * import { injectTestingAdaptor } from 'typesaurus/testing'
 *
 * // To initialize and inject an admin app (with exclusive access to the DB):
 * injectTestingAdaptor(testing.initializeAdminApp({ projectId: 'project-id' }))
 *
 * // To initialize and inject a client app (with given authentication details):
 * injectTestingAdaptor(
 *   testing.initializeTestApp({
 *     projectId: 'project-id',
 *     auth: { uid: 'user-id' }
 *   })
 * )
 * // Load security rules:
 * await testing.loadFirestoreRules({
 *   projectId: 'project-id',
 *   rules: '' // Security rules string
 * })
 * ```
 *
 * @param ctx - The testing app instance
 */
export async function injectTestingAdaptor(ctx: Promise<RulesTestContext>) {
  setCtx(await ctx)

  let firestore = currentCtx.firestore()

  if (!('getAll' in firestore)) {
    firestore = Object.assign(firestore, { getAll })
  }

  injectAdaptor(
    // TODO: Find a way to fix TS error:
    // @ts-ignore: @firebase/rules-unit-testing and firebase-admin use different types
    // for Firestore so I had to disable the error.
    () => firestore,
    {
      DocumentReference: firebase.firestore.DocumentReference,
      Timestamp: firebase.firestore.Timestamp,
      FieldPath: firebase.firestore.FieldPath,
      FieldValue: firebase.firestore.FieldValue
    }
  )
  // console.log('????????? 2')
}

/**
 * Sets the given app to be used for Firestore operations. Must be used after
 * calling `injectTestingAdaptor`.
 *
 * ```ts
 * import * as testing from '@firebase/rules-unit-testing'
 * import { injectTestingAdaptor, setApp } from 'typesaurus/testing'
 *
 * // Initialize as not authenticated:
 * injectTestingAdaptor(
 *   testing.initializeTestApp({
 *     projectId: 'project-id',
 *     auth: null
 *   })
 * )
 *
 * // Authenticate user with user-id as the id:
 * setApp(
 *   testing.initializeTestApp({
 *     projectId: 'project-id',
 *     auth: { user: 'user-id' }
 *   })
 * )
 * ```
 *
 * @param ctx - The testing context instance
 */
export function setCtx(ctx: RulesTestContext) {
  currentCtx = ctx
}

declare module global {
  type Callable<T> = T extends (...args: any[]) => any
    ? (...args: Parameters<T>) => ReturnType<T>
    : never
  let it: Callable<jest.It>
  let describe: Callable<jest.Describe>
}

export function setupJestAfterEnv(
  config: TestEnvironmentConfig,
  clb = (env: RulesTestEnvironment) => env.unauthenticatedContext()
) {
  const testEnv = testing.initializeTestEnvironment(config)
  const adaptor = injectTestingAdaptor(testEnv.then(clb))

  const ti = it
  const ebircsed = describe
  let depth = 0

  global.describe = function (name, fn) {
    depth++

    ebircsed(name, () => {
      if (depth === 1) {
        afterAll(() => {
          testEnv.then((x) => x.cleanup())
        })
      }

      fn()
    })

    depth--
  }

  global.it = function (name, fn) {
    ti(
      name,
      fn === undefined
        ? undefined
        : fn.length > 0
        ? (done) => {
            adaptor.then(() => fn(done))
          }
        : () => adaptor.then(() => fn(undefined!))
    )
  }
}
