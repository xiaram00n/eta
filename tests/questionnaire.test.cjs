'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const model = require('../public/assets/questionnaire.js');
const sections = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/questions.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'public/assets/questionnaire.js'), 'utf8');

function question(id) {
  return sections.flatMap(section => section.questions).find(item => item.id === id);
}

function answered() {
  return {
    scope: 'business',
    working_roles: ['independent', 'owner'],
    vehicles: '2-3',
    services_selected: ['taxi', 'transfer'],
    service_use: 'current_recent',
    service_name: 'Example booking service',
    join_reason: 'To arrange work with less effort.',
    keep_service: 'Useful requests.',
    existing_charge_basis: ['subscription', 'percentage'],
    existing_spend_30d: { status: 'value', value: '40.50' },
    existing_bookings_30d: { status: 'value', value: '8' },
    existing_receipts_30d: { status: 'value', value: '500' },
    suitable_lost_30d: '1-5',
    suitable_lost_reasons: ['response'],
    month_context: 'typical',
    business_receipts_30d: { status: 'value', value: '1,200.00' },
    business_expenses_30d: { status: 'value', value: '650' }
  };
}

test('all paths use eight purpose-led sections and at most four visible prompts per section', () => {
  const states = ['current_recent', 'current_notrecent', 'former_recent', 'former', 'considered', 'never', 'unknown', undefined];
  assert.equal(sections.length, 8);
  for (const service_use of states) {
    for (const scope of ['driver', 'vehicle', 'business', 'dispatch', undefined]) {
      for (const suitable_lost_30d of ['0', '1-5', 'unknown', undefined]) {
        const answers = { service_use, scope, suitable_lost_30d };
        let count = 0;
        for (const section of sections) {
          assert.ok(section.purpose.length > 30);
          const visible = model.questionsFor(section, answers);
          assert.ok(visible.length <= 4, section.id);
          count += visible.length;
        }
        assert.ok(count <= 29);
      }
    }
  }
});

test('current, former and non-user paths ask the relevant reasons without sales qualification', () => {
  const ids = state => model.questionsFor(sections[2], { service_use: state }).map(item => item.id);
  assert.deepEqual(ids('current_recent'), ['service_use', 'service_name', 'join_reason', 'keep_service']);
  assert.deepEqual(ids('former'), ['service_use', 'service_name', 'join_reason', 'left_service']);
  assert.deepEqual(ids('considered'), ['service_use', 'service_name', 'not_joined_reason']);
  assert.deepEqual(ids('never'), ['service_use', 'current_approach']);
  assert.equal(model.questionsFor(sections[3], { service_use: 'former' }).length, 0);
  assert.equal(model.questionsFor(sections[3], { service_use: 'former_recent' }).length, 4);
  assert.equal(question('payment_model'), undefined);
  assert.equal(sections.some(section => section.service), false);
});

test('financial zero, unknown, inseparable and withheld figures remain distinct', () => {
  const q = question('existing_spend_30d');
  assert.deepEqual(model.parseMetric(q, { status: 'value', value: '0' }), { status: 'value', value: 0 });
  for (const status of ['unknown', 'cannot_separate', 'prefer_not']) {
    assert.deepEqual(model.parseMetric(q, { status, value: '999' }), { status });
  }
  assert.equal(model.displayAnswer(q, undefined), 'Not answered');
  assert.equal(model.displayAnswer(q, { status: 'value', value: '0' }), '$0.00');
  assert.equal(model.displayAnswer(q, { status: 'unknown' }), 'Not tracked / not sure');
});

test('financial inputs reject malformed, negative, excessive-precision and fractional-count answers', () => {
  const money = question('existing_spend_30d');
  for (const value of ['', '-1', '1e3', '1,20', '1.999', 'Infinity', '1000000000']) {
    assert.throws(() => model.parseMetric(money, { status: 'value', value }), model.AnswerError);
  }
  assert.deepEqual(model.parseMetric(money, { status: 'value', value: '.50' }), { status: 'value', value: 0.5 });
  assert.deepEqual(model.parseMetric(money, { status: 'value', value: '1,250.20' }), { status: 'value', value: 1250.2 });
  assert.throws(() => model.parseMetric(question('existing_bookings_30d'), { status: 'value', value: '1.5' }), model.AnswerError);
});

test('payload drops hidden branches, obsolete questions and unconsented contact data', () => {
  const answers = {
    ...answered(), service_use: 'never', current_approach: 'My current arrangements work.',
    left_service: 'An obsolete answer', payment_model: 'monthly', contact_email: 'not-for-sharing@example.test'
  };
  const body = model.createSubmission(sections, answers, { purposes: [], method: 'email', contact: 'ignored@example.test' }, false, 'synthetic-id');
  assert.equal(body.answers.existing_spend_30d, undefined);
  assert.equal(body.answers.service_name, undefined);
  assert.equal(body.answers.left_service, undefined);
  assert.equal(body.answers.payment_model, undefined);
  assert.equal(body.answers.contact_email, undefined);
  assert.equal(body.contact_email, undefined);
  assert.equal(body.follow_up_consent, false);
  assert.deepEqual(body.answers.services, { taxi: {}, transfer: {} });
  assert.equal(body.questionnaire_version, '2.0.0');
});

test('research can be entirely unanswered and follow-up permissions remain independent', () => {
  const anonymous = model.createSubmission(sections, {}, { purposes: [] }, false, 'empty');
  assert.deepEqual(anonymous.answers.follow_up_purposes, []);
  const followup = model.createSubmission(sections, {}, {
    purposes: ['clarification'], method: 'email', contact: 'operator@example.test'
  }, true, 'followup');
  assert.equal(followup.answers.pilot_interest, false);
  assert.equal(followup.follow_up_consent, true);
  assert.equal(followup.is_test, true);
  assert.equal(followup.contact_email, 'operator@example.test');
  assert.throws(() => model.cleanFollowUp({ purposes: ['prototype'], method: 'email', contact: '' }), model.AnswerError);
  assert.throws(() => model.cleanFollowUp({ purposes: ['prototype'], method: 'email', contact: 'invalid' }), model.AnswerError);
});

test('multi-select limits and exclusive answers cannot silently produce contradictory responses', () => {
  assert.deepEqual(model.selectMultiple(['response', 'payment'], 'unknown', true, 3), ['unknown']);
  assert.deepEqual(model.selectMultiple(['free'], 'subscription', true), ['subscription']);
  assert.throws(() => model.selectMultiple(['a', 'b', 'c'], 'd', true, 3), model.AnswerError);
  assert.throws(() => model.researchAnswers(sections, { capacity_limits: ['none', 'booked'] }), model.AnswerError);
});

// Minimal DOM harness exercises the actual controller without installing browser packages.
class Element {
  constructor(tag, document) {
    this.tagName = tag;
    this.document = document;
    this.children = [];
    this.attributes = {};
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.checked = false;
    this._text = '';
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; this._text = ''; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(' '); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  removeAttribute(key) { delete this.attributes[key]; }
  focus() { this.document.activeElement = this; }
}

async function browser({ initial = {}, post, unavailableStorage = false, failStore = false, failRemove = false, questionFailure = false, search = '' } = {}) {
  const values = new Map(Object.entries(initial));
  const document = {
    roots: [],
    createElement(tag) { return new Element(tag, this); },
    getElementById(id) {
      function walk(element) {
        if (element.id === id) return element;
        for (const child of element.children) {
          const found = walk(child);
          if (found) return found;
        }
        return null;
      }
      for (const root of this.roots) {
        const found = walk(root);
        if (found) return found;
      }
      return null;
    }
  };
  for (const id of ['status', 'draft-notice', 'test', 'workspace', 'step', 'progress', 'survey', 'questions', 'controls', 'back', 'next', 'clear']) {
    const element = document.createElement('div');
    element.id = id;
    document.roots.push(element);
  }
  const sent = [];
  const errors = [];
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { if (failStore) throw new Error('StorageUnavailable'); values.set(key, value); },
    removeItem(key) { if (failRemove) throw new Error('StorageUnavailable'); values.delete(key); }
  };
  const window = { confirm: () => true };
  Object.defineProperty(window, 'localStorage', { get() { if (unavailableStorage) throw new Error('StorageUnavailable'); return storage; } });
  const context = {
    document, window, location: { search }, URLSearchParams, Intl, AbortController,
    crypto: { randomUUID }, setTimeout, clearTimeout,
    console: { error(...args) { errors.push(args); } },
    async fetch(url, options) {
      if (url === '/assets/questions.json') {
        if (questionFailure) throw new Error('Offline');
        return { ok: true, json: async () => JSON.parse(JSON.stringify(sections)) };
      }
      assert.equal(url, '/api/responses');
      sent.push(JSON.parse(options.body));
      if (post) return post(sent.length, options);
      return { ok: true, status: 201, json: async () => ({ success: true, id: 'synthetic-confirmation', created_at: '2026-11-11T00:00:00Z' }) };
    }
  };
  vm.runInNewContext(source, context);
  for (let i = 0; i < 6; i++) await new Promise(resolve => setImmediate(resolve));
  const $ = id => document.getElementById(id);
  return {
    $, document, values, sent, errors,
    async click(id) { assert.ok($(id), 'Missing element: ' + id); if (!$(id).disabled) await $(id).onclick(); },
    change(id, value, checked) {
      const element = $(id);
      assert.ok(element, 'Missing element: ' + id);
      if (value !== undefined) element.value = value;
      if (checked !== undefined) element.checked = checked;
      element.onchange();
    },
    input(id, value) {
      const element = $(id);
      assert.ok(element, 'Missing element: ' + id);
      element.value = value;
      element.oninput();
    },
    async review() { for (let i = 0; i < 8; i++) await this.click('next'); }
  };
}

test('controller branches immediately, removes obsolete answers and focuses the selected control', async () => {
  const ui = await browser();
  ui.change('scope-business', undefined, true);
  assert.ok(ui.$('vehicles-field'));
  ui.change('vehicles-2-3', undefined, true);
  ui.change('scope-driver', undefined, true);
  assert.equal(ui.$('vehicles-field'), null);
  assert.equal(JSON.parse(ui.values.get(model.KEY)).answers.vehicles, undefined);
  await ui.click('next');
  await ui.click('next');
  ui.change('service_use-current_recent', undefined, true);
  assert.ok(ui.$('keep_service-field'));
  ui.input('service_name-input', 'Example service');
  ui.change('service_use-former', undefined, true);
  assert.equal(ui.$('keep_service-field'), null);
  assert.ok(ui.$('left_service-field'));
  ui.change('service_use-never', undefined, true);
  assert.equal(ui.$('service_name-field'), null);
  assert.equal(ui.document.activeElement.id, 'service_use-never');
  assert.equal(JSON.parse(ui.values.get(model.KEY)).answers.service_name, undefined);
  await ui.click('next');
  assert.match(ui.$('questions').textContent, /no recently used service/);
  assert.equal(ui.$('progress').max, 8);
  assert.equal(ui.$('progress').value, 4);
});

test('invalid metric does not advance, while zero and unknown can be reviewed and submitted', async () => {
  const ui = await browser({ initial: { [model.KEY]: JSON.stringify({ answers: answered(), followUp: { purposes: [] }, step: 3 }) } });
  ui.change('existing_spend_30d-status', 'value');
  ui.input('existing_spend_30d-input', '-1');
  await ui.click('next');
  assert.equal(ui.$('progress').value, 4);
  assert.equal(ui.$('existing_spend_30d-error').hidden, false);
  ui.input('existing_spend_30d-input', '0');
  ui.change('existing_receipts_30d-status', 'cannot_separate');
  for (let i = 0; i < 5; i++) await ui.click('next');
  assert.match(ui.$('questions').textContent, /Cannot separate this figure/);
  await ui.click('submit-answers');
  assert.equal(ui.sent[0].answers.existing_spend_30d.value, 0);
  assert.deepEqual(ui.sent[0].answers.existing_receipts_30d, { status: 'cannot_separate' });
});

test('optional contact is purpose-specific and revoking consent removes the contact before submission', async () => {
  const ui = await browser();
  await ui.review();
  ui.change('consent-clarification', undefined, true);
  ui.change('contact-method-email', undefined, true);
  ui.input('follow-up-contact-input', 'operator@example.test');
  ui.change('consent-clarification', undefined, false);
  assert.equal(ui.$('follow-up-contact-input'), null);
  await ui.click('submit-answers');
  assert.equal(ui.sent[0].follow_up_consent, false);
  assert.equal(ui.sent[0].contact_email, undefined);
  assert.equal(ui.values.has(model.KEY), false);
  assert.equal(ui.values.has(model.PENDING_KEY), false);
  assert.match(ui.$('questions').textContent, /Your answers are saved/);
});

test('ambiguous save retries the exact snapshot and id, including after reload', async () => {
  const ui = await browser({ post: async () => { throw new Error('ConnectionLost'); }, search: '?test=1' });
  await ui.review();
  await ui.click('submit-answers');
  const saved = ui.values.get(model.PENDING_KEY);
  assert.ok(saved);
  assert.equal(ui.$('clear').disabled, true);
  assert.match(ui.$('status').textContent, /not been confirmed/);
  await ui.click('submit-answers');
  assert.deepEqual(ui.sent[0], ui.sent[1]);
  const resumed = await browser({ initial: Object.fromEntries(ui.values), search: '' });
  assert.match(resumed.$('questions').textContent, /same submission/);
  await resumed.click('submit-answers');
  assert.deepEqual(resumed.sent[0], JSON.parse(saved));
  assert.equal(resumed.sent[0].is_test, true);
});

test('server validation rejection restores editable answers without claiming success', async () => {
  const ui = await browser({ post: async () => ({ ok: false, status: 422 }) });
  await ui.review();
  await ui.click('submit-answers');
  assert.match(ui.$('status').textContent, /could not accept/);
  assert.equal(ui.values.has(model.PENDING_KEY), false);
  assert.equal(ui.$('submit-answers').disabled, false);
  assert.match(ui.$('questions').textContent, /Back to edit/);
  assert.doesNotMatch(ui.$('questions').textContent, /Your answers are saved/);
});

test('missing confirmation data never clears the pending response or displays success', async () => {
  const ui = await browser({ post: async () => ({ ok: true, status: 200, json: async () => ({ success: true }) }) });
  await ui.review();
  await ui.click('submit-answers');
  assert.ok(ui.values.has(model.PENDING_KEY));
  assert.match(ui.$('status').textContent, /not been confirmed/);
  assert.doesNotMatch(ui.$('questions').textContent, /Your answers are saved/);
});

test('unavailable storage is explicit and still permits an in-page retry', async () => {
  const ui = await browser({ unavailableStorage: true, post: async count => {
    if (count === 1) throw new Error('NetworkFailure');
    return { ok: true, status: 201, json: async () => ({ success: true, id: 'retry-confirmed', created_at: '2026-11-11' }) };
  } });
  assert.match(ui.$('draft-notice').textContent, /cannot store a draft/);
  await ui.review();
  await ui.click('submit-answers');
  await ui.click('submit-answers');
  assert.deepEqual(ui.sent[0], ui.sent[1]);
  assert.match(ui.$('questions').textContent, /Your answers are saved/);
});

test('double submit stays locked until confirmation, and storage failures are disclosed', async () => {
  let release;
  const ui = await browser({ failStore: true, failRemove: true, post: () => new Promise(resolve => { release = resolve; }) });
  await ui.review();
  const saving = ui.click('submit-answers');
  await ui.click('submit-answers');
  assert.equal(ui.sent.length, 1);
  assert.equal(ui.$('clear').disabled, true);
  assert.match(ui.$('draft-notice').textContent, /cannot be saved for retry/);
  release({ ok: true, status: 201, json: async () => ({ success: true, id: 'one-confirmation', created_at: '2026-11-11' }) });
  await saving;
  assert.match(ui.$('questions').textContent, /Your answers are saved/);
  assert.match(ui.$('draft-notice').textContent, /could not be removed/);
  assert.equal(ui.$('draft-notice').hidden, false);
});

test('older drafts remain untouched and corrupt current drafts are not silently overwritten', async () => {
  const legacy = '{"legacy":"synthetic"}';
  const ui = await browser({ initial: { 'eta-research-v3': legacy, [model.KEY]: '{broken' } });
  assert.equal(ui.$('next').disabled, true);
  assert.equal(ui.values.get(model.KEY), '{broken');
  assert.equal(ui.values.get('eta-research-v3'), legacy);
  await ui.click('clear');
  assert.equal(ui.values.has(model.KEY), false);
  assert.equal(ui.values.get('eta-research-v3'), legacy);
  assert.equal(ui.$('next').disabled, false);
});

test('question loading and pending recovery failures are visible and cannot send an empty replacement', async () => {
  const offline = await browser({ questionFailure: true });
  assert.match(offline.$('status').textContent, /could not load/);
  assert.equal(offline.sent.length, 0);
  const corrupt = await browser({ initial: { [model.PENDING_KEY]: '{broken' } });
  assert.match(corrupt.$('status').textContent, /pending submission could not be read/);
  assert.equal(corrupt.values.get(model.PENDING_KEY), '{broken');
  assert.equal(corrupt.sent.length, 0);
});

test('actual response handler accepts version 2 answers and saves a retry only once in a synthetic database', async () => {
  const workerSource = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
  const context = { Request, Response, URL, crypto: { randomUUID } };
  vm.createContext(context);
  vm.runInContext(workerSource.replace('export default {', 'globalThis.worker = {'), context);
  const rows = new Map();
  let inserts = 0;
  const env = {
    eta_responses: {
      prepare(sql) {
        let values;
        return {
          bind(...args) { values = args; return this; },
          async first() { return rows.get(values[0]) || null; },
          async run() {
            assert.match(sql, /^INSERT INTO responses/);
            inserts++;
            rows.set(values[1], { id: values[0], created_at: values[2], answers: JSON.parse(values[5]), contact_email: values[9] });
          }
        };
      }
    }
  };
  const body = model.createSubmission(sections, answered(), { purposes: ['clarification'], method: 'email', contact: 'synthetic@example.test' }, true, 'synthetic-integration-id');
  const submit = () => context.worker.fetch(new Request('https://eta.invalid/api/responses', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }), env);
  const first = await submit();
  const second = await submit();
  assert.equal(first.status, 201);
  assert.equal(second.status, 200);
  assert.equal((await second.json()).duplicate, true);
  assert.equal(inserts, 1);
  assert.equal(rows.get(body.submission_id).answers.existing_spend_30d.value, 40.5);
  assert.equal(rows.get(body.submission_id).contact_email, 'synthetic@example.test');
});

test('questionnaire resources and accessibility references are self-contained and use the approved emphasis', () => {
  const html = fs.readFileSync(path.join(root, 'public/questionnaire/index.html'), 'utf8');
  assert.match(html, /around island/);
  assert.match(html, /<strong><em>you<\/em><\/strong>/);
  assert.match(html, /<strong><em>we<\/em><\/strong>/);
  assert.match(html, /id="workspace"[^>]*hidden/);
  assert.match(html, /<noscript>/);
  assert.match(html, /max="8"/);
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, 'public', match[1])));
  }
  assert.doesNotMatch(html, /https?:\/\//);
});
