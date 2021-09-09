/**
 * Lazy browser Firestore adaptor.
 */

import { getAll } from '../utils'
import type firebase from 'firebase/compat';

export default async function adaptor() {
  const { default: firebase } = await import('firebase/compat/app')
  await import('firebase/compat/firestore')

  const firestore = firebase.firestore()
  // At the moment, the browser's Firestore adaptor doesn't support getAll.
  // Get rid of the fallback when the issue is closed:
  // https://github.com/firebase/firebase-js-sdk/issues/1176
  if (!('getAll' in firestore)) Object.assign(firestore, { getAll })

  return {
    firestore,
    consts: {
      DocumentReference: firebase.firestore.DocumentReference,
      Timestamp: firebase.firestore.Timestamp,
      FieldPath: firebase.firestore.FieldPath,
      FieldValue: firebase.firestore.FieldValue
    },
    getDocMeta: (snapshot: firebase.firestore.DocumentSnapshot) => ({
      fromCache: snapshot.metadata.fromCache,
      hasPendingWrites: snapshot.metadata.hasPendingWrites
    })
  }
}

export function injectAdaptor() {
  throw new Error(
    'Injecting adaptor is not supported in the browser environment'
  )
}
