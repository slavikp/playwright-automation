import type { Reporter, FullResult, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestRecord {
  classname: string;
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
}

interface QMetryOptions {
  /** QMetry Cloud API key — overrides QMETRY_API_KEY env var */
  apiKey?: string;
  /** QMetry project key (e.g. "POK") — overrides QMETRY_PROJECT_KEY */
  projectKey?: string;
  /** Test cycle name to create/update in QMetry — overrides QMETRY_CYCLE_NAME */
  cycleName?: string;
  /** Where to write the intermediate JUnit XML (default: test-results/qmetry-junit.xml) */
  outputFile?: string;
}

export default class QMetryReporter implements Reporter {
  private records: TestRecord[] = [];
  private readonly apiKey: string;
  private readonly projectKey: string;
  private readonly cycleName: string;
  private readonly outputFile: string;
  private readonly apiUrl = 'https://qtmcloud.qmetry.com/rest/api/automation/importresult';

  constructor(options: QMetryOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.QMETRY_API_KEY ?? '';
    this.projectKey = options.projectKey ?? process.env.QMETRY_PROJECT_KEY ?? '';
    this.cycleName = options.cycleName ?? process.env.QMETRY_CYCLE_NAME ?? '';
    this.outputFile = options.outputFile ?? 'test-results/qmetry-junit.xml';
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titles = test.titlePath().filter(Boolean);
    this.records.push({
      classname: titles.slice(0, -1).join(' > '),
      name: titles[titles.length - 1] ?? test.title,
      duration: result.duration / 1000,
      status: result.status === 'passed' ? 'passed'
            : result.status === 'skipped' ? 'skipped'
            : 'failed',
      error: result.errors.map(e => e.message ?? String(e)).join('\n') || undefined,
    });
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (!this.apiKey) {
      console.log('[QMetry] QMETRY_API_KEY not set — skipping upload');
      return;
    }

    const xml = this.buildJUnit();
    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, xml, 'utf-8');

    await this.upload(xml);
  }

  private esc(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildJUnit(): string {
    const passed  = this.records.filter(r => r.status === 'passed').length;
    const failed  = this.records.filter(r => r.status === 'failed').length;
    const skipped = this.records.filter(r => r.status === 'skipped').length;
    const total   = this.records.length;
    const time    = this.records.reduce((s, r) => s + r.duration, 0).toFixed(3);

    const cases = this.records.map(r => {
      let tc = `    <testcase classname="${this.esc(r.classname)}" name="${this.esc(r.name)}" time="${r.duration.toFixed(3)}">`;
      if (r.status === 'skipped') {
        tc += '\n      <skipped/>';
      } else if (r.status === 'failed') {
        const msg = this.esc(r.error?.split('\n')[0] ?? 'Test failed');
        const body = this.esc(r.error ?? 'Test failed');
        tc += `\n      <failure message="${msg}">${body}</failure>`;
      }
      tc += '\n    </testcase>';
      return tc;
    }).join('\n');

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<testsuites name="Playwright" tests="${total}" failures="${failed}" skipped="${skipped}" time="${time}">`,
      `  <testsuite name="Playwright" tests="${total}" failures="${failed}" skipped="${skipped}" time="${time}">`,
      cases,
      '  </testsuite>',
      '</testsuites>',
    ].join('\n');
  }

  private async upload(xml: string): Promise<void> {
    try {
      const form = new FormData();
      form.append('file', new Blob([xml], { type: 'application/xml' }), 'results.xml');
      form.append('format', 'junit');
      if (this.projectKey) form.append('projectKey', this.projectKey);
      if (this.cycleName)  form.append('testCycleName', this.cycleName);

      const res  = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { apiKey: this.apiKey },
        body: form,
      });
      const body = await res.text().catch(() => '');

      if (res.ok) {
        let trackingId = '';
        try { trackingId = (JSON.parse(body) as { trackingId?: string }).trackingId ?? ''; } catch { /* ignore */ }
        console.log(`[QMetry] Uploaded${trackingId ? ` — tracking ID: ${trackingId}` : ' successfully'}`);
      } else {
        console.error(`[QMetry] Upload failed: HTTP ${res.status} — ${body}`);
      }
    } catch (err) {
      console.error('[QMetry] Upload error:', err instanceof Error ? err.message : err);
    }
  }
}
