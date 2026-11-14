'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const serviceDefinition = 'ETA is a proposed booking and trip-coordination service for St. Thomas transportation businesses. Guests would request rides; participating operators would decide whether to accept and provide the ride. ETA would then coordinate the confirmed driver, vehicle and pickup, manage changes, and provide updates to the guest on the operator\'s behalf.';
const model = require('../public/assets/questionnaire.js');
const sections = JSON.parse(fs.readFileSync(path.join(root, 'public/assets/questions.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'public/assets/questionnaire.js'), 'utf8');

function question(id) {
  return sections.flatMap(section => section.questions).find(item => item.id === id);
}

function answered() {
  return {
    scope: 'business',
    working_vehicle_count: '2-3',
    vehicle_arrangement: 'owned',
    medallion_arrangement: 'leased',
    association_affiliation: 'yes',
    booking_authority: 'self',
    medallion_lease_duration: 'One year',
    medallion_consecutive_leases: { status: 'value', value: '3' },
    service_formats: ['private', 'scheduled'],
    pickup_arrangements: 'Prearranged hotel pickups; terminal access needs checking.',
    services_selected: ['taxi', 'transfer'],
    service_use: 'current_recent',
    service_name: 'Example booking service',
    join_reason: 'To arrange work with less effort.',
    keep_service: 'Useful requests.',
    existing_charge_basis: ['subscription', 'percentage'],
    existing_spend_30d: { status: 'value', value: '40.50' },
    existing_bookings_30d: { status: 'value', value: '8' },
    existing_receipts_30d: { status: 'value', value: '500' },
    commitment_stage: 'driver_vehicle',
    outside_booking_updates: 'One person updates our shared calendar.',
    booking_recovery: 'Our coordinator contacts a backup and updates the guest.',
    suitable_lost_30d: '1-5',
    suitable_lost_reasons: ['response'],
    month_context: 'typical',
    completed_bookings_30d: { status: 'value', value: '20' },
    booking_mix_30d: '12 local vehicle bookings; 8 private transfers.',
    business_receipts_30d: { status: 'value', value: '1,200.00' },
    business_expenses_30d: { status: 'value', value: '650' },
    operating_cost_details: 'Fuel about $100 weekly; insurance $1,200 annually; booking fees $40.50 this month, already in the total.',
    booking_control: 'both',
    replace_existing_work: 'Replace duplicated calendar updates and improve the return on existing listing costs.'
  };
}

test('all paths use eight purpose-led sections, at most four prompts per page and 44 overall', () => {
  const states = ['current_recent', 'current_notrecent', 'former_recent', 'former', 'considered', 'never', 'unknown', undefined];
  let maximum = 0;
  let maximumPages = 0;
  assert.equal(sections.length, 8);
  for (const service_use of states) {
    for (const scope of ['driver', 'vehicle', 'business', 'dispatch', undefined]) {
      for (const suitable_lost_30d of ['0', '1-5', 'unknown', undefined]) {
        for (const medallion_arrangement of ['owned', 'leased', 'both', 'other', 'unknown', undefined]) {
          const answers = { service_use, scope, suitable_lost_30d, medallion_arrangement };
          let count = 0;
          let pageCount = 0;
          for (const section of sections) {
            assert.ok(section.purpose.length > 30);
            const pages = model.pagesFor(section, answers);
            pageCount += pages.length;
            for (const page of pages) assert.ok(page.questions.length <= 4, section.id);
            const paged = pages.flatMap(page => page.questions);
            assert.deepEqual(paged, model.questionsFor(section, answers));
            count += paged.length;
          }
          assert.ok(count <= 44);
          maximum = Math.max(maximum, count);
          maximumPages = Math.max(maximumPages, pageCount);
        }
      }
    }
  }
  assert.equal(maximum, 44);
  assert.equal(maximumPages, 14);
});

test('setup separates overlapping arrangements and only asks lease follow-ups for leased medallions', () => {
  const setup = sections[0];
  const pages = answers => model.pagesFor(setup, answers).map(page => page.questions.map(q => q.id));
  assert.deepEqual(pages({}), [
    ['scope', 'working_vehicle_count', 'services_selected', 'vehicle_arrangement'],
    ['medallion_arrangement', 'association_affiliation', 'booking_authority'],
    ['service_formats', 'pickup_arrangements']
  ]);
  for (const medallion_arrangement of ['leased', 'both']) {
    assert.deepEqual(pages({ medallion_arrangement })[2], ['medallion_lease_duration', 'medallion_consecutive_leases']);
  }
  for (const medallion_arrangement of ['owned', 'other', 'unknown', undefined]) {
    assert.equal(pages({ medallion_arrangement }).length, 3);
  }
  const body = model.createSubmission(sections, {
    ...answered(), working_roles: ['lease'], vehicles: '10+'
  }, { purposes: [] }, false, 'overlapping-setup');
  assert.equal(body.answers.vehicle_arrangement, 'owned');
  assert.equal(body.answers.medallion_arrangement, 'leased');
  assert.equal(body.answers.association_affiliation, 'yes');
  assert.equal(body.answers.booking_authority, 'self');
  assert.equal(body.answers.scope, 'business');
  assert.equal(body.answers.working_vehicle_count, '2-3');
  assert.equal(body.answers.vehicles, undefined);
  assert.equal(body.answers.working_roles, undefined);
  assert.equal(body.answers.medallion_consecutive_leases.value, 3);
  assert.throws(() => model.parseMetric(question('medallion_consecutive_leases'), { status: 'value', value: '1.5' }), model.AnswerError);
  const changed = model.createSubmission(sections, {
    ...answered(), medallion_arrangement: 'owned'
  }, { purposes: [] }, false, 'no-lease');
  assert.equal(changed.answers.medallion_lease_duration, undefined);
  assert.equal(changed.answers.medallion_consecutive_leases, undefined);
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

test('payload drops hidden branches, obsolete questions and contact data embedded in research answers', () => {
  const answers = {
    ...answered(), service_use: 'never', current_approach: 'My current arrangements work.',
    left_service: 'An obsolete answer', payment_model: 'monthly', contact_email: 'not-for-sharing@example.test'
  };
  const body = model.createSubmission(sections, answers, { purposes: [] }, false, 'synthetic-id');
  assert.equal(body.answers.existing_spend_30d, undefined);
  assert.equal(body.answers.service_name, undefined);
  assert.equal(body.answers.left_service, undefined);
  assert.equal(body.answers.payment_model, undefined);
  assert.equal(body.answers.contact_email, undefined);
  assert.equal(body.contact_email, undefined);
  assert.equal(body.follow_up_consent, false);
  assert.deepEqual(body.answers.services, { taxi: {}, transfer: {} });
  assert.equal(body.questionnaire_version, '2.2.0');
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

test('optional identity can be shared without granting follow-up permission or supplying contact details', () => {
  const nameOnly = model.createSubmission(sections, {}, { purposes: [], name: ' Sample Operator ' }, false, 'name-only');
  assert.equal(nameOnly.contact_name, 'Sample Operator');
  assert.equal(nameOnly.contact_email, undefined);
  assert.equal(nameOnly.contact_phone, undefined);
  assert.equal(nameOnly.follow_up_consent, false);
  const identity = model.createSubmission(sections, {}, {
    purposes: [], name: 'Sample Operator', method: 'email', contact: 'sample@example.test'
  }, false, 'identity');
  assert.equal(identity.contact_email, 'sample@example.test');
  assert.equal(identity.follow_up_consent, false);
  assert.deepEqual(identity.answers.follow_up_purposes, []);
  assert.throws(() => model.cleanFollowUp({ purposes: [], name: 'x'.repeat(201) }), model.AnswerError);
  assert.throws(() => model.cleanFollowUp({ purposes: [], method: 'email', contact: 'invalid' }), model.AnswerError);
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

async function browser({ initial = {}, post, unavailableStorage = false, failStore = false, failRemove = false, questionFailure = false, search = '', begin = true } = {}) {
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
  for (const id of ['status', 'draft-notice', 'test', 'cover', 'begin', 'workspace', 'progress-panel', 'step', 'progress', 'survey', 'questions', 'controls', 'back', 'next', 'clear']) {
    const element = document.createElement('div');
    element.id = id;
    if (id === 'workspace') element.hidden = true;
    if (id === 'begin') element.disabled = true;
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
  if (begin && !$('begin').disabled) $('begin').onclick();
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
    async review() {
      for (let i = 0; i < 14 && !$('submit-answers'); i++) await this.click('next');
      assert.ok($('submit-answers'), 'Review should be reachable in at most fourteen pages');
    }
  };
}

test('the cover requires Begin questionnaire and section purpose appears after it', async () => {
  const ui = await browser({ begin: false });
  assert.equal(ui.$('cover').hidden, false);
  assert.equal(ui.$('workspace').hidden, true);
  assert.equal(ui.$('begin').disabled, false);
  await ui.click('begin');
  assert.equal(ui.$('cover').hidden, true);
  assert.equal(ui.$('workspace').hidden, false);
  assert.equal(ui.document.activeElement.id, 'section-title');
  assert.ok(ui.$('scope-field'));
  assert.ok(ui.$('questions').textContent.includes(sections[0].purpose));
  await ui.click('next');
  await ui.click('back');
  assert.equal(ui.$('cover').hidden, true);
  assert.equal(ui.$('progress').value, 1);
});

test('visible questionnaire sections explain why their answers inform the research', async () => {
  const ui = await browser({ begin: true });
  let pages = 0;
  while (!ui.$('submit-answers')) {
    assert.ok(++pages <= 14, 'Questionnaire should reach review in at most fourteen pages');
    const sectionIndex = Number(ui.$('step').textContent.match(/^(\d+) \/ 8/)[1]) - 1;
    const section = sections[sectionIndex];
    if (section.id === 'service-value') {
      assert.ok(ui.$('questions').textContent.includes(section.skipNote));
    } else {
      assert.ok(ui.$('questions').textContent.includes(section.purpose), section.id);
    }
    await ui.click('next');
  }
  assert.ok(pages <= 14);
});

test('only a confirmed save replaces the questions with a thank-you heading and closing message', async () => {
  let release;
  const ui = await browser({ post: () => new Promise(resolve => { release = resolve; }) });
  await ui.review();
  const saving = ui.click('submit-answers');
  assert.equal(ui.$('progress-panel').hidden, false);
  assert.doesNotMatch(ui.$('questions').textContent, /Your answers are saved/);
  release({ ok: true, status: 201, json: async () => ({ success: true, id: 'synthetic-closing', created_at: '2026-11-11' }) });
  await saving;
  assert.equal(ui.$('cover').hidden, true);
  assert.equal(ui.$('progress-panel').hidden, true);
  assert.equal(ui.$('controls').hidden, true);
  assert.equal(ui.$('questions').children.length, 2);
  assert.equal(ui.$('section-title').textContent, 'Thank you.');
  assert.match(ui.$('questions').textContent, /Your answers are saved/);
  assert.doesNotMatch(ui.$('questions').textContent, /synthetic-closing|Submit answers|What may we contact/);
  assert.equal(ui.document.activeElement.id, 'section-title');
});

test('controller pages within setup, skips inapplicable lease pages and clears hidden answers', async () => {
  const ui = await browser();
  ui.change('scope-business', undefined, true);
  ui.change('working_vehicle_count-2-3', undefined, true);
  ui.change('scope-driver', undefined, true);
  assert.equal(ui.$('working_vehicle_count-2-3').checked, true);
  assert.equal(JSON.parse(ui.values.get(model.KEY)).answers.working_vehicle_count, '2-3');
  await ui.click('next');
  assert.equal(ui.$('progress').value, 1);
  assert.match(ui.$('step').textContent, /Page 2 of 3/);
  ui.change('medallion_arrangement-leased', undefined, true);
  assert.match(ui.$('step').textContent, /Page 2 of 4/);
  await ui.click('next');
  assert.equal(ui.$('section-title').textContent, 'Your medallion lease.');
  ui.input('medallion_lease_duration-input', 'One year');
  ui.change('medallion_consecutive_leases-status', 'value');
  assert.match(ui.$('medallion_consecutive_leases-field').textContent, /Number of consecutive medallion leases/);
  assert.doesNotMatch(ui.$('medallion_consecutive_leases-field').textContent, /Number of completed bookings/);
  ui.input('medallion_consecutive_leases-input', '1.5');
  await ui.click('next');
  assert.equal(ui.$('section-title').textContent, 'Your medallion lease.');
  assert.equal(ui.document.activeElement.id, 'medallion_consecutive_leases-input');
  ui.input('medallion_consecutive_leases-input', '3');
  await ui.click('back');
  ui.change('medallion_arrangement-owned', undefined, true);
  const saved = JSON.parse(ui.values.get(model.KEY));
  assert.equal(saved.answers.medallion_lease_duration, undefined);
  assert.equal(saved.answers.medallion_consecutive_leases, undefined);
  await ui.click('next');
  assert.equal(ui.$('section-title').textContent, 'The bookings you can serve.');
  await ui.click('back');
  assert.equal(ui.$('section-title').textContent, 'Your arrangements.');
  assert.equal(ui.$('progress').value, 1);
  await ui.click('next');
  await ui.click('next');
  assert.equal(ui.$('progress').value, 2);
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
  assert.match(ui.$('questions').textContent, /no current or recently used service/);
  assert.equal(ui.$('progress').max, 8);
  assert.equal(ui.$('progress').value, 4);
});

test('setup drafts restore their page and include all setup pages in review and submission', async () => {
  const ui = await browser();
  ui.change('scope-driver', undefined, true);
  ui.change('working_vehicle_count-1', undefined, true);
  ui.change('vehicle_arrangement-owned', undefined, true);
  ui.change('services_selected-taxi', undefined, true);
  await ui.click('next');
  ui.change('medallion_arrangement-both', undefined, true);
  ui.change('association_affiliation-yes', undefined, true);
  ui.change('booking_authority-joint', undefined, true);
  await ui.click('next');
  ui.input('medallion_lease_duration-input', 'Six months');
  ui.change('medallion_consecutive_leases-status', 'unknown');
  const saved = JSON.parse(ui.values.get(model.KEY));
  assert.equal(saved.questionnaire_version, '2.2.0');
  assert.equal(saved.step, 0);
  assert.equal(saved.page, 2);
  const resumed = await browser({ initial: Object.fromEntries(ui.values) });
  assert.equal(resumed.$('section-title').textContent, 'Your medallion lease.');
  assert.equal(resumed.$('medallion_lease_duration-input').value, 'Six months');
  await resumed.review();
  assert.match(resumed.$('questions').textContent, /Six months/);
  assert.match(resumed.$('questions').textContent, /We need joint approval/);
  await resumed.click('submit-answers');
  assert.equal(resumed.sent[0].answers.scope, 'driver');
  assert.equal(resumed.sent[0].answers.working_vehicle_count, '1');
  assert.equal(resumed.sent[0].answers.vehicle_arrangement, 'owned');
  assert.equal(resumed.sent[0].answers.medallion_arrangement, 'both');
  assert.equal(resumed.sent[0].answers.association_affiliation, 'yes');
  assert.equal(resumed.sent[0].answers.booking_authority, 'joint');
  assert.equal(resumed.sent[0].answers.medallion_lease_duration, 'Six months');
  assert.deepEqual(resumed.sent[0].answers.medallion_consecutive_leases, { status: 'unknown' });
});

test('older setup drafts keep their original questions and version until explicitly cleared', async () => {
  const initial = {
    [model.KEY]: JSON.stringify({
      answers: { scope: 'business', working_roles: ['lease'], vehicles: '2-3' },
      followUp: { purposes: [] }, step: 0
    })
  };
  const ui = await browser({ initial });
  assert.ok(ui.$('working_roles-field'));
  assert.ok(ui.$('vehicles-field'));
  assert.equal(ui.$('working_vehicle_count-field'), null);
  assert.match(ui.$('draft-notice').textContent, /original questions/);
  assert.equal(ui.values.get(model.KEY), initial[model.KEY]);
  await ui.review();
  await ui.click('submit-answers');
  assert.equal(ui.sent[0].questionnaire_version, '2.0.0');
  assert.deepEqual(ui.sent[0].answers.working_roles, ['lease']);
  assert.equal(ui.sent[0].answers.vehicles, '2-3');
  assert.equal(ui.sent[0].answers.medallion_arrangement, undefined);
  const cleared = await browser({ initial });
  await cleared.click('clear');
  assert.equal(cleared.$('working_roles-field'), null);
  assert.ok(cleared.$('working_vehicle_count-field'));
  cleared.change('scope-driver', undefined, true);
  assert.equal(JSON.parse(cleared.values.get(model.KEY)).questionnaire_version, '2.2.0');
});

test('older pending responses retain the exact body, original review labels and retry identity', async () => {
  const pending = {
    submission_id: 'synthetic-legacy-pending',
    questionnaire_version: '2.0.0',
    language: 'en',
    answers: {
      working_roles: ['independent', 'lease'], scope: 'business', services_selected: ['taxi'],
      vehicles: '2-3', services: { taxi: {} }, follow_up_purposes: [], pilot_interest: false
    },
    follow_up_consent: false,
    is_test: true
  };
  const initial = { [model.PENDING_KEY]: JSON.stringify(pending) };
  const ui = await browser({ initial, post: async () => { throw new Error('ConnectionLost'); } });
  assert.match(ui.$('questions').textContent, /Lease a vehicle or operating rights/);
  assert.match(ui.$('questions').textContent, /2-3/);
  assert.doesNotMatch(ui.$('questions').textContent, /What medallion arrangement/);
  await ui.click('submit-answers');
  assert.deepEqual(ui.sent[0], pending);
  assert.equal(ui.values.get(model.PENDING_KEY), initial[model.PENDING_KEY]);
  const resumed = await browser({ initial: Object.fromEntries(ui.values) });
  await resumed.click('submit-answers');
  assert.deepEqual(resumed.sent[0], pending);
  const rejected = await browser({ initial, post: async () => ({ ok: false, status: 422 }) });
  await rejected.click('submit-answers');
  assert.match(rejected.$('status').textContent, /could not accept/);
  assert.match(rejected.$('questions').textContent, /Lease a vehicle or operating rights/);
  assert.equal(JSON.parse(rejected.values.get(model.KEY)).questionnaire_version, '2.0.0');
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

test('identity fields and follow-up permissions can be independently declined before submission', async () => {
  const ui = await browser();
  await ui.review();
  assert.match(ui.$('questions').textContent, /You do not have to share either/);
  ui.input('follow-up-name-input', 'Sample Operator');
  ui.change('consent-clarification', undefined, true);
  ui.change('contact-method-email', undefined, true);
  ui.input('follow-up-contact-input', 'operator@example.test');
  ui.change('consent-clarification', undefined, false);
  assert.equal(ui.$('follow-up-contact-input').value, 'operator@example.test');
  ui.change('contact-method-none', undefined, true);
  ui.input('follow-up-name-input', '');
  assert.equal(ui.$('follow-up-contact-input'), null);
  await ui.click('submit-answers');
  assert.equal(ui.sent[0].follow_up_consent, false);
  assert.equal(ui.sent[0].contact_email, undefined);
  assert.equal(ui.sent[0].contact_name, undefined);
  assert.equal(ui.values.has(model.KEY), false);
  assert.equal(ui.values.has(model.PENDING_KEY), false);
  assert.match(ui.$('questions').textContent, /Your answers are saved/);
});

test('optional identity survives an uncertain save and reload without adding follow-up permission', async () => {
  const ui = await browser({ post: async () => { throw new Error('ConnectionLost'); } });
  await ui.review();
  ui.input('follow-up-name-input', 'Sample Operator');
  ui.change('contact-method-email', undefined, true);
  ui.input('follow-up-contact-input', 'sample@example.test');
  await ui.click('submit-answers');
  assert.equal(ui.sent[0].follow_up_consent, false);
  const resumed = await browser({ initial: Object.fromEntries(ui.values) });
  assert.match(resumed.$('questions').textContent, /Sample Operator/);
  await resumed.click('submit-answers');
  assert.deepEqual(resumed.sent[0], ui.sent[0]);
  assert.equal(resumed.sent[0].contact_name, 'Sample Operator');
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

test('inactive current services can report ongoing costs and zero completed bookings without changing older paths', () => {
  const answers = {
    ...answered(), service_use: 'current_notrecent',
    existing_bookings_30d: { status: 'value', value: '0' },
    existing_receipts_30d: { status: 'value', value: '0' }
  };
  assert.equal(model.questionsFor(sections[3], answers).length, 4);
  const body = model.createSubmission(sections, answers, { purposes: [] }, false, 'inactive-service');
  assert.equal(body.answers.existing_spend_30d.value, 40.5);
  assert.equal(body.answers.existing_bookings_30d.value, 0);
  for (const version of ['2.0.0', '2.1.0']) {
    const oldSections = model.sectionsForVersion(sections, version);
    assert.equal(model.questionsFor(oldSections[3], answers).length, 0);
    const oldBody = model.createSubmission(sections, answers, { purposes: [] }, false, 'older-service', version);
    assert.equal(oldBody.answers.existing_spend_30d, undefined);
    for (const section of sections) {
      for (const q of section.questions.filter(q => q.introduced)) assert.equal(oldBody.answers[q.id], undefined);
    }
    assert.equal(oldBody.answers.business_receipts_30d.value, 1200);
    assert.equal(oldBody.answers.business_expenses_30d.value, 650);
  }
});

test('version 2.1 drafts and pending responses preserve their original setup and financial semantics', async () => {
  const oldAnswers = {
    scope: 'driver', working_vehicle_count: '1', vehicle_arrangement: 'owned',
    medallion_arrangement: 'owned', association_affiliation: 'yes', booking_authority: 'self',
    service_use: 'current_notrecent',
    month_context: 'typical',
    business_receipts_30d: { status: 'value', value: 500 },
    business_expenses_30d: { status: 'value', value: 300 },
    services: {}, follow_up_purposes: [], pilot_interest: false
  };
  const pending = {
    submission_id: 'synthetic-2.1-pending', questionnaire_version: '2.1.0',
    language: 'en', answers: oldAnswers, follow_up_consent: false, is_test: true
  };
  const ui = await browser({
    initial: { [model.PENDING_KEY]: JSON.stringify(pending) },
    post: async () => { throw new Error('ConnectionLost'); }
  });
  assert.match(ui.$('questions').textContent, /same submission/);
  assert.doesNotMatch(ui.$('questions').textContent, /What do you pay for, how much, and how often/);
  await ui.click('submit-answers');
  assert.deepEqual(ui.sent[0], pending);
  const resumed = await browser({ initial: Object.fromEntries(ui.values) });
  await resumed.click('submit-answers');
  assert.deepEqual(resumed.sent[0], pending);
  const draft = await browser({ initial: {
    [model.KEY]: JSON.stringify({ questionnaire_version: '2.1.0', answers: oldAnswers, followUp: { purposes: [] }, step: 0, page: 1 })
  } });
  assert.equal(draft.$('section-title').textContent, 'Your arrangements.');
  await draft.click('next');
  assert.equal(draft.$('section-title').textContent, 'How guests reach you.');
  assert.equal(draft.$('pickup_arrangements-field'), null);
});

test('financial pages capture completed work and itemized spending separately and survive uncertain saving', async () => {
  const ui = await browser({
    initial: { [model.KEY]: JSON.stringify({ questionnaire_version: '2.2.0', answers: { scope: 'driver' }, followUp: { purposes: [] }, step: 6, page: 0 }) },
    post: async () => { throw new Error('ConnectionLost'); }
  });
  assert.equal(ui.$('section-title').textContent, 'The work you completed.');
  ui.change('completed_bookings_30d-status', 'value');
  ui.input('completed_bookings_30d-input', '2.5');
  await ui.click('next');
  assert.equal(ui.document.activeElement.id, 'completed_bookings_30d-input');
  ui.input('completed_bookings_30d-input', '20');
  ui.input('booking_mix_30d-input', '12 local vehicle bookings; 8 private transfers.');
  await ui.click('next');
  assert.equal(ui.$('section-title').textContent, 'What you receive and spend.');
  assert.match(ui.$('operating_cost_details-help').textContent, /frequency/);
  assert.match(ui.$('operating_cost_details-help').textContent, /Service fees count once/);
  assert.match(ui.$('operating_cost_details-help').textContent, /unpaid administrative time is recorded separately/);
  ui.change('business_receipts_30d-status', 'value');
  ui.input('business_receipts_30d-input', '1200');
  ui.change('business_expenses_30d-status', 'value');
  ui.input('business_expenses_30d-input', '650');
  ui.input('operating_cost_details-input', answered().operating_cost_details);
  await ui.review();
  assert.match(ui.$('questions').textContent, /Fuel about \$100 weekly/);
  await ui.click('submit-answers');
  const body = ui.sent[0];
  assert.equal(body.answers.completed_bookings_30d.value, 20);
  assert.equal(body.answers.business_receipts_30d.value, 1200);
  assert.equal(body.answers.business_expenses_30d.value, 650);
  assert.equal(body.answers.booking_mix_30d, '12 local vehicle bookings; 8 private transfers.');
  assert.equal(body.answers.operating_cost_details, answered().operating_cost_details);
  assert.equal(body.follow_up_consent, false);
  const resumed = await browser({ initial: Object.fromEntries(ui.values) });
  await resumed.click('submit-answers');
  assert.deepEqual(resumed.sent[0], body);
});

test('all displayed checkbox instructions are prominent and connected to their controls', async () => {
  const answers = answered();
  const ui = await browser({ initial: {
    [model.KEY]: JSON.stringify({ questionnaire_version: '2.2.0', answers, followUp: { purposes: [] }, step: 0, page: 0 })
  } });
  for (const section of sections) {
    for (const page of model.pagesFor(section, answers)) {
      for (const q of page.questions.filter(q => q.kind.startsWith('multi'))) {
        const help = ui.$(q.id + '-help');
        assert.ok(help, q.id);
        assert.match(help.className, /selection-help/, q.id);
        assert.match(help.textContent, q.kind === 'multi3' ? /Choose up to three/ : /Choose all that apply/, q.id);
        const control = ui.$(q.id + '-' + q.options[0].split('|')[0]);
        assert.match(control.attributes['aria-describedby'], new RegExp(q.id + '-help'));
      }
      await ui.click('next');
    }
  }
  assert.ok(ui.$('submit-answers'));
});

test('unsupported saved versions remain preserved instead of being silently reinterpreted', async () => {
  const value = JSON.stringify({ questionnaire_version: '9.0.0', answers: answered(), followUp: { purposes: [] }, step: 0 });
  const ui = await browser({ initial: { [model.KEY]: value } });
  assert.equal(ui.values.get(model.KEY), value);
  assert.equal(ui.$('next').disabled, true);
  assert.equal(ui.sent.length, 0);
  await ui.click('clear');
  assert.ok(ui.$('working_vehicle_count-field'));
  ui.change('scope-driver', undefined, true);
  assert.equal(JSON.parse(ui.values.get(model.KEY)).questionnaire_version, '2.2.0');
});

test('page and review headings gain one decorative brand dot without changing questions or existing question marks', async () => {
  const ui = await browser();
  const assertDot = element => {
    const dots = element.children.filter(child => child.className === 'heading-dot');
    assert.equal(dots.length, 1);
    assert.equal(dots[0].textContent, '.');
    assert.equal(dots[0].attributes['aria-hidden'], 'true');
    assert.doesNotMatch(element.textContent, /\.\.$/);
  };
  assert.equal(ui.$('section-title').textContent, 'Your work.');
  assertDot(ui.$('section-title'));
  assert.equal(ui.$('working_vehicle_count-field').children[0].textContent, 'How many working vehicles does that work involve?');
  assert.equal(ui.$('next').textContent, 'Continue');
  await ui.review();
  assertDot(ui.$('section-title'));
  const cards = ui.$('questions').children.filter(element => element.className === 'review-card');
  assert.equal(cards.length, sections.length);
  cards.forEach((card, index) => {
    assert.equal(card.children[0].textContent, sections[index].title + '.');
    assertDot(card.children[0]);
  });
  const questionTitle = await browser({ initial: {
    [model.KEY]: JSON.stringify({ questionnaire_version: '2.2.0', answers: {}, followUp: { purposes: [] }, step: 7, page: 1 })
  } });
  assert.equal(questionTitle.$('section-title').textContent, 'Anything we missed?');
  assert.equal(questionTitle.$('section-title').children.length, 0);
});

test('actual response handler accepts version 2.2 research answers and saves a retry only once in a synthetic database', async () => {
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
            rows.set(values[1], {
              id: values[0], created_at: values[2], answers: JSON.parse(values[5]),
              contact_name: values[7], contact_email: values[9], follow_up_consent: values[10]
            });
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
  assert.equal(rows.get(body.submission_id).answers.medallion_arrangement, 'leased');
  assert.equal(rows.get(body.submission_id).answers.medallion_consecutive_leases.value, 3);
  assert.equal(rows.get(body.submission_id).answers.operating_cost_details, answered().operating_cost_details);
  assert.equal(rows.get(body.submission_id).answers.completed_bookings_30d.value, 20);
  assert.equal(rows.get(body.submission_id).contact_email, 'synthetic@example.test');
  const optionalIdentity = model.createSubmission(sections, {}, {
    purposes: [], name: 'Sample Operator', method: 'email', contact: 'sample@example.test'
  }, true, 'synthetic-optional-identity');
  const identityResponse = await context.worker.fetch(new Request('https://eta.invalid/api/responses', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(optionalIdentity)
  }), env);
  assert.equal(identityResponse.status, 201);
  assert.equal(rows.get(optionalIdentity.submission_id).contact_name, 'Sample Operator');
  assert.equal(rows.get(optionalIdentity.submission_id).contact_email, 'sample@example.test');
  assert.equal(rows.get(optionalIdentity.submission_id).follow_up_consent, 0);
});

function adminWorker() {
  const context = { Request, Response, URL, crypto: { randomUUID } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'worker.js'), 'utf8').replace('export default {', 'globalThis.worker = {'), context);
  return context.worker;
}

test('admin login opens without a credential while every response API remains protected', async () => {
  const worker = adminWorker();
  const env = { eta_responses: { prepare() { assert.fail('Unauthenticated requests must not access the database'); } } };
  const page = await worker.fetch(new Request('https://eta.invalid/admin'), env);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('Cache-Control'), 'no-store');
  assert.match(page.headers.get('Content-Security-Policy'), /connect-src 'self'/);
  assert.match(await page.text(), /id="content" hidden/);
  for (const [path, method] of [['/api/admin/responses', 'GET'], ['/api/admin/export', 'GET'], ['/api/admin/responses/test', 'DELETE']]) {
    const response = await worker.fetch(new Request('https://eta.invalid' + path, { method }), env);
    assert.equal(response.status, 401);
  }
  assert.equal((await worker.fetch(new Request('https://eta.invalid/admin', { method: 'POST' }), env)).status, 405);
});

test('authorized response viewing and CSV export retain the new financial answers in a synthetic database', async () => {
  const worker = adminWorker();
  const row = {
    id: 'synthetic-response', submission_id: 'synthetic-export', questionnaire_version: '2.2.0',
    language: 'en', created_at: '2026-11-12T00:00:00Z',
    answers: JSON.stringify(model.createSubmission(sections, answered(), { purposes: [] }, true, 'synthetic-export').answers),
    follow_up_consent: 0, is_test: 1, contact_name: null, contact_phone: null, contact_email: null
  };
  const env = {
    ADMIN_TOKEN: 'synthetic-test-only',
    eta_responses: { prepare(sql) {
      return {
        bind() { return this; },
        async all() { return { results: sql.includes('WHERE is_test = 0') ? [] : [row] }; }
      };
    } }
  };
  const request = endpoint => worker.fetch(new Request('https://eta.invalid' + endpoint, { headers: { Authorization: 'Bearer synthetic-test-only' } }), env);
  const viewed = await (await request('/api/admin/responses')).json();
  assert.equal(viewed.responses[0].answers.operating_cost_details, answered().operating_cost_details);
  assert.equal(viewed.responses[0].answers.completed_bookings_30d.value, 20);
  assert.equal((await (await request('/api/admin/responses?exclude_test=true')).json()).count, 0);
  const exported = await request('/api/admin/export');
  assert.match(exported.headers.get('Content-Type'), /text\/csv/);
  const csv = await exported.text();
  assert.match(csv, /answer\.operating_cost_details/);
  assert.match(csv, /answer\.completed_bookings_30d\.value/);
  assert.match(csv, /Fuel about \$100 weekly/);
});

async function adminBrowser(fetch) {
  const html = await (await adminWorker().fetch(new Request('https://eta.invalid/admin'), {})).text();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const elements = new Map();
  const document = {
    getElementById(id) { return elements.get(id); },
    querySelector(selector) { assert.equal(selector, '#t tbody'); return elements.get('tbody'); },
    createElement(tag) {
      const element = new Element(tag, this);
      element.appendChild = child => element.append(child);
      element.click = () => { context.downloads++; };
      return element;
    }
  };
  for (const id of ['token', 'login', 'login-button', 'content', 'status', 'detail', 'excludeTest', 'serviceType', 'tbody']) {
    elements.set(id, document.createElement('div'));
  }
  elements.get('content').hidden = true;
  elements.get('excludeTest').checked = true;
  const context = {
    document, fetch, URLSearchParams, downloads: 0,
    URL: { createObjectURL() { return 'blob:synthetic'; }, revokeObjectURL() {} },
    setTimeout(callback) { callback(); }
  };
  vm.createContext(context);
  vm.runInContext(script, context);
  return { context, get: id => elements.get(id), script };
}

test('admin login failures stay visible and successful viewing renders submitted text without HTML execution', async () => {
  let accept = false;
  const calls = [];
  const row = { id: 'synthetic', created_at: '2026-11-12', language: 'en', is_test: false,
    contact_name: '<img src=x onerror=alert(1)>', answers: { services: {}, operating_cost_details: 'Fuel weekly' } };
  const ui = await adminBrowser(async (path, options) => {
    calls.push({ path, options });
    return new Response(JSON.stringify(accept ? { responses: [row] } : { error: 'Unauthorized' }), { status: accept ? 200 : 401 });
  });
  ui.get('token').value = 'synthetic-test-only';
  await ui.context.login();
  assert.equal(ui.get('content').hidden, true);
  assert.match(ui.get('status').textContent, /credential not accepted/);
  accept = true;
  ui.get('token').value = 'synthetic-test-only';
  await ui.context.login();
  assert.equal(ui.get('content').hidden, false);
  assert.equal(ui.get('token').value, '');
  assert.match(ui.get('tbody').textContent, /<img src=x onerror=alert\(1\)>/);
  assert.doesNotMatch(ui.script, /\.innerHTML\s*=/);
  ui.get('tbody').children[0].children.at(-1).children[0].onclick();
  assert.match(ui.get('detail').textContent, /Fuel weekly/);
  assert.equal(calls.at(-1).options.method, 'GET');
  assert.equal(calls.at(-1).options.cache, 'no-store');
  assert.match(calls.at(-1).path, /exclude_test=true/);
  ui.context.logout();
  assert.equal(ui.get('content').hidden, true);
  assert.equal(ui.get('tbody').children.length, 0);
  assert.doesNotMatch(ui.script, /localStorage|sessionStorage/);
});

test('failed or malformed admin exports never start a success-shaped download', async () => {
  let status = 503;
  const ui = await adminBrowser(async () => new Response('Not a CSV', { status }));
  await ui.context.exportCsv();
  assert.equal(ui.context.downloads, 0);
  assert.match(ui.get('status').textContent, /Request failed \(503\)/);
  status = 200;
  await ui.context.exportCsv();
  assert.equal(ui.context.downloads, 0);
  assert.match(ui.get('status').textContent, /did not return a CSV/);
});

test('questionnaire resources and accessibility references are self-contained and use the approved emphasis', () => {
  const html = fs.readFileSync(path.join(root, 'public/questionnaire/index.html'), 'utf8');
  assert.match(html, /around the island/);
  assert.match(html, /<strong>you<\/strong>/);
  assert.match(html, /<strong>we<\/strong>/);
  assert.match(html, /id="workspace"[^>]*hidden/);
  assert.match(html, /<noscript>/);
  assert.match(html, /max="8"/);
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, 'public', match[1])));
  }
  assert.doesNotMatch(html, /https?:\/\//);
});

test('the cover contains the requested copy and hierarchy while research headings and selection help remain readable', () => {
  const html = fs.readFileSync(path.join(root, 'public/questionnaire/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'public/assets/questionnaire.css'), 'utf8');
  assert.match(html, /Our best work starts<br>with understanding yours\./);
  assert.match(html, /VI Taxi Operator Research/);
  assert.match(html, /Help decide what ETA should build/);
  const hero = html.match(/<h1 id="intro-title">([\s\S]*?)<\/h1>/)[1];
  assert.equal((hero.match(/class="hero-line"/g) || []).length, 2);
  assert.deepEqual([...hero.matchAll(/<span>([^<]+)<\/span>/g)].map(match => match[1]),
    ['Better-arranged rides', 'start with your real work.']);
  assert.match(hero, /<em class="hero-line"><span>start with your real work\.<\/span><\/em>/);
  assert.match(html, /<p><strong>Taxi operators asked, we listened\.<\/strong><\/p>/);
  assert.match(html, /<strong>VI Transportation Operator Questionnaire<\/strong>/);
  assert.match(html, /Every question is optional\. Estimates and “not sure” are useful\./);
  assert.ok(html.includes(serviceDefinition));
  assert.match(html, /<p class="service-proposal">This could make travel more efficient, convenient and faster for guests, while helping operators receive consistent guest requests, without the hassle of coordinating each booking\.<\/p>/);
  const invitation = html.match(/<div class="invitation">([\s\S]*?)<\/div>/)[1];
  assert.match(invitation, /Help decide what we build to support your business\./);
  assert.match(invitation, /A useful system earns its place by improving existing work/);
  assert.match(invitation, /Eight short sections about bookings, tools you use, work you complete/);
  assert.doesNotMatch(html, /class="lead"|shared-interest|Offline preview only/);
  assert.match(html, /id="begin"[^>]*>BEGIN &#10132;/);
  assert.match(css, /\.intro h1\{font-family:inherit;font-weight:750;[^}]*text-wrap:balance/);
  assert.match(css, /\.intro h1 em\{font-weight:inherit;font-style:normal\}/);
  assert.match(css, /\.intro h1 \.hero-line\{display:block\}/);
  assert.match(css, /\.intro h1 \.hero-line>span\{display:inline-block;white-space:nowrap\}/);
  assert.match(css, /\.service-proposal\{[^}]*background:var\(--ink\)[^}]*border-left:4px solid var\(--mango\)[^}]*color:var\(--white\)/);
  assert.match(css, /\.workspace h2,\.workspace h3\{font-family:inherit;font-weight:750/);
  assert.match(css, /\.selection-help\{[^}]*background:var\(--accent\);color:var\(--white\);font-size:15px;font-weight:700/);
});

test('public prototype copy defines the service, roles, transportation scope and recommended next step', () => {
  const partnership = fs.readFileSync(path.join(root, 'public/partnership/index.html'), 'utf8');
  const partnershipCss = fs.readFileSync(path.join(root, 'public/assets/partnership.css'), 'utf8');
  const guest = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  const guestScript = fs.readFileSync(path.join(root, 'public/assets/guest.js'), 'utf8');
  const launcher = fs.readFileSync(path.join(root, 'public/preview/index.html'), 'utf8');
  assert.match(partnership, /ETA is a proposed booking and trip-coordination service for St\. Thomas transportation businesses/);
  assert.match(partnership, /Make each ride easy,<br>from request to <em>pickup\.<\/em>/);
  assert.ok(partnership.includes(serviceDefinition));
  assert.match(guest, /Request a ride from a participating St\. Thomas operator\. They decide whether to accept and provide it; ETA would coordinate the confirmed pickup, driver, vehicle and updates on their behalf\./);
  assert.match(guestScript, /ETA is a proposed booking and trip-coordination service\. Guests request rides from participating St\. Thomas operators; operators decide whether to accept and provide the ride\./);
  assert.match(guestScript, /Voice messages and language assistance are possibilities to investigate, not confirmed features/);
  assert.match(partnership, /class="service-value">The aim is more efficient, convenient and faster travel for guests, while helping operators receive consistent guest requests, without the hassle of coordinating each booking\./);
  assert.match(partnership, /A map location alone does not confirm that a driver is available or committed to the trip\./);
  assert.match(partnership, /Opt in to receive requests—and keep each commitment accurate\./);
  assert.match(partnership, /active or reserved ride, on-call commitment, booked tour or paid day rate/);
  assert.match(partnership, /Once accepted, it must close to others and show the guest which operator is responsible/);
  assert.match(partnership, /“Running behind — traffic delay\.”/);
  assert.match(partnership, /“I can wait\.” “I need a change\.” “Please cancel\.”/);
  assert.match(partnership, /Chat with \[Operator Name\]/);
  assert.match(partnership, /Show the guest whether a message was sent, delivered or acknowledged; delivery does not mean the operator has read or accepted it/);
  assert.match(partnership, /Drivers must never be expected to read or reply in motion/);
  assert.match(partnership, /Confirm notification channels and current local requirements before a live pilot/);
  assert.match(partnershipCss, /\.opening-copy > p\.service-value:not\(\.eyebrow\):not\(\.caption\).*background: var\(--sage\).*color: var\(--ink\)/);
  assert.match(partnership, /Intended business customer:<\/strong> a transportation operator or business/);
  assert.match(partnership, /operator-side tools · not built/);
  assert.match(partnership, /Who buys it and who handles coordination are still open questions/);
  assert.ok(partnership.indexOf('href="/questionnaire/"') < partnership.indexOf('id="service"'));
  assert.match(partnership, /Pickup access, service rules, applicable fares and any separate platform charges need confirmation/);
  assert.match(guest, />Stay rides</);
  assert.match(guest, /Transportation during guest stays/);
  assert.match(guestScript, /name: "Transportation during your stay"/);
  assert.doesNotMatch(guest, /Arrange your stay/);
  assert.ok(launcher.indexOf('href="https://eta-stvi.hsvi.workers.dev/partnership/"')
    < launcher.indexOf('href="https://eta-stvi.hsvi.workers.dev/"'));
  assert.ok(launcher.indexOf('href="https://eta-stvi.hsvi.workers.dev/"')
    < launcher.indexOf('href="https://eta-stvi.hsvi.workers.dev/questionnaire/"'));
});
