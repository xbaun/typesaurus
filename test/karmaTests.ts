import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const apiKey = process.env.FIREBASE_API_KEY

if (!projectId) throw new Error('FIREBASE_PROJECT_ID must be defined')
if (!apiKey) throw new Error('FIREBASE_API_KEY must be defined')

firebase.initializeApp({ apiKey, projectId })

beforeAll(async () => {
  const username = process.env.FIREBASE_USERNAME
  const password = process.env.FIREBASE_PASSWORD
  if (username && password)
    return firebase.auth().signInWithEmailAndPassword(username, password)
})

const testsContext = require.context('../src/', true, /\/test\.ts$/)
testsContext.keys().forEach(testsContext)
