# LIFORA k6 Performance & Load Testing Suite

This directory contains automated k6 load testing scripts designed to evaluate API throughput, response times, percentile SLA thresholds, and system behavior under concurrent load.

---

## 📁 Files Included

- **`baseline_test.js`**: Baseline load test (100 VUs, 1 minute duration, SLA checks).
- **`full_api_flow.js`**: Multi-API user journey load test (Auth login, token handling, GET endpoints).

---

## 🚀 Local Execution

Run the baseline load test using k6:

```bash
k6 run testing/k6-load/baseline_test.js
```

Run with custom target URL:

```bash
k6 run -e BASE_URL=https://your-api.com testing/k6-load/baseline_test.js
```

Run with JSON output report:

```bash
k6 run --out json=testing/k6-load/metrics.json testing/k6-load/baseline_test.js
```

---

## ⚙️ CI/CD Integration

Automated k6 load tests trigger on every `push` and `pull_request` via GitHub Actions workflow:
- **`.github/workflows/k6-load-test.yml`**
