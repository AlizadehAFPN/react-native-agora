const admin = require('firebase-admin');

// Initialize Firebase Admin once per cold start
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
    ),
  });
}

const db = admin.firestore();
const fcm = admin.messaging();

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async event => {
  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const { callerUserId, calleeUserId, channelName, callerDisplayName } = body;

  if (!callerUserId || !calleeUserId || !channelName || !callerDisplayName) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    // Look up callee's FCM token from Firestore
    const calleeSnap = await db.collection('users').doc(calleeUserId).get();
    if (!calleeSnap.exists) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Callee not found' }),
      };
    }

    const { fcmToken } = calleeSnap.data();
    if (!fcmToken) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Callee has no FCM token registered' }),
      };
    }

    await fcm.send({
      token: fcmToken,
      data: {
        channelName: String(channelName),
        callerDisplayName: String(callerDisplayName),
        callerUserId: String(callerUserId),
      },
      android: { priority: 'high' },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: { aps: { 'content-available': 1 } },
      },
    });

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
