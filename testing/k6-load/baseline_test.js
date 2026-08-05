import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration: 100 Virtual Users for 1 Minute
export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Ramp-up to 20 VUs
    { duration: '40s', target: 100 }, // Hold steady at 100 VUs
    { duration: '10s', target: 0 },   // Ramp-down to 0 VUs
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],       // Less than 1% failure rate
    http_req_duration: ['p(95)<500'],     // 95% of requests must complete under 500ms
    checks: ['rate>0.99'],                // More than 99% check pass rate
  },
};

const TARGET_URL = __ENV.BASE_URL || 'https://test.k6.io';

export default function () {
  // Execute GET Request
  const res = http.get(TARGET_URL);

  // Validate HTTP Response Criteria
  check(res, {
    'status code is 200': (r) => r.status === 200,
    'response body received': (r) => r.body && r.body.length > 0,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Simulate Realistic Think Time (1 second pause)
  sleep(1);
}
