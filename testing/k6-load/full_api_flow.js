import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],       // Error rate under 2%
    http_req_duration: ['p(95)<400'],     // 95% response time < 400ms
    'http_req_duration{group:::1. Authentication API}': ['p(95)<600'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://reqres.in';

export default function () {
  let authToken = '';

  // 1. Authentication API
  group('1. Authentication API', function () {
    const payload = JSON.stringify({
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/login`, payload, params);

    const isOk = check(res, {
      'Auth status 200': (r) => r.status === 200,
      'Auth token present': (r) => JSON.parse(r.body).token !== undefined,
    });

    if (isOk) {
      authToken = JSON.parse(res.body).token;
    }
  });

  sleep(1);

  // 2. GET API (Fetch List)
  group('2. Fetch Users List (GET API)', function () {
    const params = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
    };
    const res = http.get(`${BASE_URL}/api/users?page=2`, params);

    check(res, {
      'Get Users status 200': (r) => r.status === 200,
      'Response has users': (r) => JSON.parse(r.body).data.length > 0,
    });
  });

  sleep(1);
}
