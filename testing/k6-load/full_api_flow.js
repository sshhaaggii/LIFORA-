import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],       // Less than 1% failure rate
    http_req_duration: ['p(95)<800'],     // 95% response time < 800ms
    checks: ['rate>0.99'],                // 100% checks passed
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://test.k6.io';

export default function () {
  // 1. Homepage Endpoint
  group('1. Homepage GET', function () {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'Homepage status 200': (r) => r.status === 200,
      'Homepage body received': (r) => r.body && r.body.length > 0,
    });
  });

  sleep(1);

  // 2. Contacts Page Endpoint
  group('2. Contacts Page GET', function () {
    const res = http.get(`${BASE_URL}/contacts.php`);
    check(res, {
      'Contacts page status 200': (r) => r.status === 200,
      'Contacts header verified': (r) => r.body.includes('Contacts'),
    });
  });

  sleep(1);

  // 3. News Page Endpoint
  group('3. News Page GET', function () {
    const res = http.get(`${BASE_URL}/news.php`);
    check(res, {
      'News page status 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}
