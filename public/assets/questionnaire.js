(function () {
  'use strict';

  const VERSION = '2.2.0';
  const VERSIONS = ['2.0.0', '2.1.0', VERSION];
  const KEY = 'eta-research-v4';
  const PENDING_KEY = KEY + '-pending';
  // Keep the original setup schema for drafts and immutable submissions made before 2.1.
  const LEGACY_SETUP = [
    { id: 'working_roles', title: 'Which roles do you handle?', kind: 'multi', help: 'Choose all that apply.', options: ['independent|Drive independently', 'owner|Own or manage vehicles', 'lease|Lease a vehicle or operating rights', 'employee|Drive for someone else', 'dispatcher|Coordinate bookings or drivers', 'other|Other'] },
    { id: 'scope', title: 'Whose work will your answers describe?', kind: 'single', options: ['driver|My own work', 'vehicle|One vehicle', 'business|A business with several vehicles', 'dispatch|A booking or dispatch operation'] },
    { id: 'services_selected', title: 'Which transportation services do you provide?', kind: 'multi', help: 'Choose all that apply.', options: ['taxi|Local rides', 'transfer|Airport or ferry transfers', 'tour|Private tours', 'villa|Transportation during guest stays', 'wedding|Weddings or events', 'reserved|Reserved or hourly driving', 'other|Other'] },
    { id: 'vehicles', title: 'How many working vehicles do these answers cover?', kind: 'single', show: { scope: ['vehicle', 'business', 'dispatch'] }, options: ['1|1', '2-3|2-3', '4-9|4-9', '10+|10 or more', 'unknown|Not sure'] }
  ];
  const SERVICES = ['taxi', 'transfer', 'tour', 'villa', 'wedding', 'reserved', 'other'];
  const EXCLUSIVE = ['none', 'unknown', 'na', 'free'];
  const METRIC_STATUSES = ['value', 'unknown', 'cannot_separate', 'prefer_not'];
  const PURPOSES = ['clarification', 'prototype'];

  class AnswerError extends Error {
    constructor(id, message) {
      super(message);
      this.id = id;
      this.name = 'AnswerError';
    }
  }

  function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function visible(item, answers) {
    return !item.show || Object.entries(item.show).every(([key, choices]) => choices.includes(answers[key]));
  }

  function questionsFor(section, answers) {
    return visible(section, answers) ? section.questions.filter(question => visible(question, answers)) : [];
  }

  function sectionsForVersion(sections, version) {
    if (version === VERSION) return sections;
    if (!VERSIONS.includes(version)) throw new Error('QuestionnaireVersionError');
    return sections.map(section => {
      const legacy = {
        ...section,
        questions: section.questions.filter(question => !question.introduced).map(question => question.id === 'preserve'
          ? { ...question, options: question.options.filter(option => !['customer_data', 'sharing'].includes(option.split('|')[0])) }
          : question)
      };
      if (section.id !== 'setup') delete legacy.pages;
      if (section.id === 'setup' && version === '2.0.0') {
        delete legacy.pages;
        legacy.questions = LEGACY_SETUP;
      }
      if (section.id === 'service-value') {
        legacy.show = { service_use: ['current_recent', 'former_recent'] };
        legacy.skipNote = 'Based on your earlier answer, there is no recently used service to describe here. Continue to the next section, or go back if you would like to change that answer.';
      }
      return legacy;
    });
  }

  function pagesFor(section, answers) {
    const questions = questionsFor(section, answers);
    if (!section.pages || !questions.length) return [{ title: section.title, questions }];
    return section.pages.map((title, page) => ({
      title, questions: questions.filter(question => question.page === page)
    })).filter(page => page.questions.length);
  }

  function selectMultiple(previous, value, checked, limit = Infinity) {
    const values = Array.isArray(previous) ? previous : [];
    if (!checked) return values.filter(item => item !== value);
    if (EXCLUSIVE.includes(value)) return [value];
    const next = [...new Set([...values.filter(item => !EXCLUSIVE.includes(item)), value])];
    if (next.length > limit) throw new AnswerError('', 'Choose up to ' + limit + ' answers for this question.');
    return next;
  }

  function parseMetric(question, answer) {
    if (!record(answer) || !METRIC_STATUSES.includes(answer.status)) {
      throw new AnswerError(question.id, 'Choose how you would like to answer this figure.');
    }
    if (answer.status !== 'value') return { status: answer.status };
    const input = String(answer.value ?? '').trim();
    const pattern = question.kind === 'count'
      ? /^(?:\d+|\d{1,3}(?:,\d{3})+)$/
      : /^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{0,2})?|\.\d{1,2})$/;
    if (!pattern.test(input)) {
      throw new AnswerError(question.id, question.kind === 'count'
        ? 'Enter a whole number, including 0, or choose another answer.'
        : 'Enter a non-negative USD amount with up to two decimal places, including 0, or choose another answer.');
    }
    const value = Number(input.replaceAll(',', ''));
    if (!Number.isFinite(value) || value > 999999999) {
      throw new AnswerError(question.id, 'Use a figure no larger than 999,999,999, or choose another answer.');
    }
    return { status: 'value', value };
  }

  function cleanAnswer(question, value) {
    if (value === undefined || value === '' || value === null || Array.isArray(value) && !value.length) return undefined;
    if (question.kind === 'money' || question.kind === 'count') return parseMetric(question, value);
    if (['text', 'short'].includes(question.kind)) {
      if (typeof value !== 'string' || value.length > (question.kind === 'short' ? 200 : 1500)) {
        throw new AnswerError(question.id, 'Please keep this answer within ' + (question.kind === 'short' ? 200 : 1500) + ' characters.');
      }
      return value.trim() || undefined;
    }
    const allowed = question.options.map(option => option.split('|')[0]);
    if (question.kind.startsWith('multi')) {
      if (!Array.isArray(value) || value.some(item => !allowed.includes(item)) || new Set(value).size !== value.length) {
        throw new AnswerError(question.id, 'Please choose from the displayed answers.');
      }
      if (question.kind === 'multi3' && value.length > 3) throw new AnswerError(question.id, 'Choose up to three answers.');
      if (value.length > 1 && value.some(item => EXCLUSIVE.includes(item))) {
        throw new AnswerError(question.id, 'Choose either the stand-alone answer or the other answers, not both.');
      }
      return value.slice();
    }
    if (!allowed.includes(value)) throw new AnswerError(question.id, 'Please choose from the displayed answers.');
    return value;
  }

  function researchAnswers(sections, answers) {
    const result = {};
    for (const section of sections) {
      for (const question of questionsFor(section, answers)) {
        const value = cleanAnswer(question, answers[question.id]);
        if (value !== undefined) result[question.id] = value;
      }
    }
    return result;
  }

  function cleanFollowUp(followUp) {
    const purposes = Array.isArray(followUp.purposes) ? PURPOSES.filter(purpose => followUp.purposes.includes(purpose)) : [];
    if (followUp.name != null && typeof followUp.name !== 'string' || typeof followUp.name === 'string' && followUp.name.length > 200) {
      throw new AnswerError('follow-up-name', 'Keep your optional name within 200 characters, or leave it blank.');
    }
    const name = typeof followUp.name === 'string' ? followUp.name.trim() : '';
    const contact = typeof followUp.contact === 'string' ? followUp.contact.trim() : '';
    if (contact || purposes.length) {
      if (!['email', 'phone'].includes(followUp.method) || !contact) {
        throw new AnswerError('follow-up-contact', 'If you would like a follow-up invitation, include a contact method and detail. Otherwise, untick the invitations to submit without contact details.');
      }
    }
    if (contact && followUp.method === 'email' && (contact.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))) {
      throw new AnswerError('follow-up-contact', 'Enter a valid email address, or remove it and untick any follow-up invitations to submit without contact details.');
    }
    if (contact && followUp.method === 'phone' && (contact.length > 50 || !/^[+\d()\s.-]+$/.test(contact) || contact.replace(/\D/g, '').length < 7)) {
      throw new AnswerError('follow-up-contact', 'Enter a phone or WhatsApp number, including its area or country code, or remove it and untick any follow-up invitations.');
    }
    return { purposes, ...(name ? { name } : {}), ...(contact ? { method: followUp.method, contact } : {}) };
  }

  function createSubmission(sections, answers, followUp, isTest, id, version = VERSION) {
    sections = sectionsForVersion(sections, version);
    const cleaned = researchAnswers(sections, answers);
    const consent = cleanFollowUp(followUp);
    cleaned.services = Object.fromEntries((cleaned.services_selected || []).filter(service => SERVICES.includes(service)).map(service => [service, {}]));
    cleaned.follow_up_purposes = consent.purposes;
    cleaned.pilot_interest = consent.purposes.includes('prototype');
    const body = {
      submission_id: id,
      questionnaire_version: version,
      language: 'en',
      answers: cleaned,
      follow_up_consent: consent.purposes.length > 0,
      is_test: isTest
    };
    if (consent.name) body.contact_name = consent.name;
    if (consent.contact) body[consent.method === 'email' ? 'contact_email' : 'contact_phone'] = consent.contact;
    return body;
  }

  function displayAnswer(question, value) {
    if (value === undefined || value === '' || Array.isArray(value) && !value.length) return 'Not answered';
    if (question.kind === 'money' || question.kind === 'count') {
      const metric = parseMetric(question, value);
      const labels = { unknown: 'Not tracked / not sure', cannot_separate: 'Cannot separate this figure', prefer_not: 'Prefer not to say' };
      return metric.status === 'value'
        ? (question.kind === 'money' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(metric.value) : String(metric.value))
        : labels[metric.status];
    }
    const label = item => {
      const option = question.options?.find(entry => entry.split('|')[0] === item);
      return option ? option.slice(option.indexOf('|') + 1) : String(item);
    };
    return Array.isArray(value) ? value.map(label).join('; ') : label(value);
  }

  const model = { VERSION, KEY, PENDING_KEY, AnswerError, visible, questionsFor, pagesFor, sectionsForVersion, selectMultiple, parseMetric, researchAnswers, cleanFollowUp, createSubmission, displayAnswer };
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  if (typeof document === 'undefined') return;

  async function start() {
    const $ = id => document.getElementById(id);
    const logError = (message, error) => console.error(message, { name: error.name });
    const node = (tag, text, className) => {
      const element = document.createElement(tag);
      if (text !== undefined) element.textContent = text;
      if (className) element.className = className;
      return element;
    };
    function message(text, error = false) {
      $('status').hidden = !text;
      $('status').textContent = text;
      $('status').className = 'notice' + (error ? ' error' : '');
    }
    function draftNotice(text) {
      $('draft-notice').hidden = false;
      $('draft-notice').textContent = text;
    }
    let sections;
    try {
      const response = await fetch('/assets/questions.json');
      if (!response.ok) throw new Error('QuestionLoadError');
      sections = await response.json();
      if (!Array.isArray(sections) || sections.length !== 8 || sections.some(section => !Array.isArray(section.questions))) {
        throw new Error('QuestionSchemaError');
      }
    } catch (error) {
      logError('Questionnaire questions could not load.', error);
      message('The questions could not load. No answers have been sent. Reload this page when connected. A saved HTML file needs the website and its question files to work.', true);
      return;
    }

    const currentSections = sections;
    let answers = {};
    let followUp = { purposes: [] };
    let step = 0;
    let page = 0;
    let version = VERSION;
    let pending = null;
    let busy = false;
    let done = false;
    let draftLocked = false;
    let storage;
    try {
      storage = window.localStorage;
    } catch (error) {
      logError('Draft storage is unavailable.', error);
      draftNotice('This browser cannot store a draft. Keep the page open until your response is confirmed.');
    }
    if (storage) {
      try {
        const draft = storage.getItem(KEY);
        if (draft) {
          const saved = JSON.parse(draft);
          if (!record(saved) || !record(saved.answers) || !record(saved.followUp)) throw new Error('DraftFormatError');
          version = saved.questionnaire_version ?? '2.0.0';
          sections = sectionsForVersion(currentSections, version);
          answers = saved.answers;
          followUp = saved.followUp;
          step = Number.isInteger(saved.step) && saved.step >= 0 && saved.step < sections.length ? saved.step : 0;
          const pages = pagesFor(sections[step], answers);
          page = Number.isInteger(saved.page) && saved.page >= 0 && saved.page < pages.length ? saved.page : 0;
          draftNotice(version === VERSION
            ? 'Your draft has been restored on this device. Nothing has been sent unless a submission was previously confirmed.'
            : 'Your earlier-version draft has been restored with its original questions. Your answers have not been reinterpreted. Nothing has been sent unless a submission was previously confirmed.');
        }
      } catch (error) {
        draftLocked = true;
        logError('Saved draft could not be restored.', error);
        draftNotice('A saved draft could not be read. It has not been overwritten. Use Clear draft only if you want to discard it and start again.');
      }
      try {
        const saved = storage.getItem(PENDING_KEY);
        if (saved) {
          const candidate = JSON.parse(saved);
          if (!record(candidate) || !VERSIONS.includes(candidate.questionnaire_version) || !record(candidate.answers) || typeof candidate.submission_id !== 'string' || !candidate.submission_id) {
            throw new Error('PendingFormatError');
          }
          const restored = createSubmission(currentSections, candidate.answers, {
            purposes: candidate.answers.follow_up_purposes || [],
            name: candidate.contact_name || '',
            method: candidate.contact_email ? 'email' : 'phone',
            contact: candidate.contact_email || candidate.contact_phone || ''
          }, candidate.is_test, candidate.submission_id, candidate.questionnaire_version);
          if (candidate.language !== 'en' || typeof candidate.is_test !== 'boolean' || JSON.stringify(restored) !== JSON.stringify(candidate)) {
            throw new Error('PendingSnapshotError');
          }
          version = candidate.questionnaire_version;
          sections = sectionsForVersion(currentSections, version);
          pending = candidate;
        }
      } catch (error) {
        logError('Pending submission could not be restored.', error);
        message('A pending submission could not be read safely. It has been preserved. Do not start another response until this draft can be recovered.', true);
        return;
      }
      try {
        if (storage.getItem('eta-research-v3') || storage.getItem('eta-research-v3-pending')) {
          draftNotice('An earlier-version draft or pending response remains stored in this browser. It has not been imported or deleted. If it was awaiting confirmation, resolve that earlier response before sending a new one.');
        }
      } catch (error) {
        logError('Earlier draft status could not be checked.', error);
        draftNotice('Earlier draft status could not be checked. Any older questionnaire drafts have not been changed.');
      }
    }

    const isTest = new URLSearchParams(location.search).get('test') === '1';
    $('test').hidden = !isTest;
    $('progress').max = sections.length;

    function save() {
      if (draftLocked || !storage || pending || done) return;
      try {
        storage.setItem(KEY, JSON.stringify({ questionnaire_version: version, answers, followUp, step, page }));
      } catch (error) {
        logError('Draft could not be stored.', error);
        draftNotice('Your latest changes could not be saved on this device. Keep the page open until submission is confirmed.');
      }
    }

    function removeStored(key) {
      if (!storage) return;
      try {
        storage.removeItem(key);
      } catch (error) {
        logError('Stored questionnaire data could not be removed.', error);
        draftNotice("Some questionnaire data could not be removed from this browser. On a shared device, clear this site's browser data when finished.");
      }
    }

    function discardHidden() {
      const active = new Set(sections.flatMap(section => questionsFor(section, answers)).map(question => question.id));
      for (const key of Object.keys(answers)) if (!active.has(key)) delete answers[key];
    }

    function errorFor(id, text) {
      const error = $(id + '-error');
      if (error) {
        error.hidden = false;
        error.textContent = text;
      }
      const input = $(id + '-input') || $(id + '-status');
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
      message(text, true);
    }

    function clearError(id) {
      const error = $(id + '-error');
      if (error) error.hidden = true;
      for (const suffix of ['-input', '-status']) $(id + suffix)?.removeAttribute('aria-invalid');
    }

    function fieldError(id) {
      const error = node('p', '', 'field-error');
      error.id = id + '-error';
      error.hidden = true;
      error.setAttribute('role', 'alert');
      return error;
    }

    function changeChoice(question, value, checked, focusId) {
      try {
        answers[question.id] = question.kind.startsWith('multi')
          ? selectMultiple(answers[question.id], value, checked, question.kind === 'multi3' ? 3 : Infinity)
          : value;
        if (Array.isArray(answers[question.id]) && !answers[question.id].length) delete answers[question.id];
        discardHidden();
        save();
        renderSection(focusId);
        message('');
      } catch (error) {
        if (!(error instanceof AnswerError)) throw error;
        renderSection(focusId);
        message(error.message, true);
      }
    }

    function addQuestion(question, root) {
      const field = node('fieldset', undefined, 'question');
      field.id = question.id + '-field';
      field.append(node('legend', question.title));
      const multiple = question.kind.startsWith('multi');
      const helpText = question.help || (multiple ? question.kind === 'multi3' ? 'Choose up to three.' : 'Choose all that apply.' : '');
      if (helpText) {
        const help = node('p', helpText, multiple ? 'field-help selection-help' : 'field-help');
        help.id = question.id + '-help';
        field.append(help);
      }
      const description = [helpText ? question.id + '-help' : '', question.id + '-error'].filter(Boolean).join(' ');
      const value = answers[question.id];
      if (question.kind === 'money' || question.kind === 'count') {
        const select = node('select');
        select.id = question.id + '-status';
        select.setAttribute('aria-label', question.title + ': how to answer');
        select.setAttribute('aria-describedby', description);
        for (const [key, label] of [
          ['', 'Leave unanswered'],
          ['value', question.kind === 'money' ? 'Enter an amount (an estimate is fine)' : 'Enter a count (an estimate is fine)'],
          ['unknown', 'Not tracked / not sure'],
          ['cannot_separate', 'Cannot separate this figure'],
          ['prefer_not', 'Prefer not to say']
        ]) {
          const option = node('option', label);
          option.value = key;
          select.append(option);
        }
        select.value = record(value) ? value.status : '';
        select.onchange = () => {
          if (select.value) answers[question.id] = { status: select.value };
          else delete answers[question.id];
          save();
          renderSection(select.id);
        };
        field.append(select);
        if (record(value) && value.status === 'value') {
          const label = node('label', question.inputLabel || (question.kind === 'money' ? 'Amount in US dollars' : 'Number of completed bookings'), 'input-label');
          label.htmlFor = question.id + '-input';
          const input = node('input');
          input.id = label.htmlFor;
          input.type = 'text';
          input.inputMode = question.kind === 'money' ? 'decimal' : 'numeric';
          input.maxLength = 16;
          input.value = String(value.value ?? '');
          input.autocomplete = 'off';
          input.setAttribute('aria-describedby', description);
          input.oninput = () => {
            answers[question.id] = { status: 'value', value: input.value };
            clearError(question.id);
            save();
          };
          field.append(label, input);
        }
      } else if (['text', 'short'].includes(question.kind)) {
        const input = node(question.kind === 'text' ? 'textarea' : 'input');
        input.id = question.id + '-input';
        if (question.kind === 'short') input.type = 'text';
        input.maxLength = question.kind === 'short' ? 200 : 1500;
        input.value = typeof value === 'string' ? value : '';
        input.setAttribute('aria-label', question.title);
        input.setAttribute('aria-describedby', description);
        input.oninput = () => {
          if (input.value) answers[question.id] = input.value;
          else delete answers[question.id];
          clearError(question.id);
          save();
        };
        field.append(input);
      } else {
        for (const option of question.options) {
          const separator = option.indexOf('|');
          const key = option.slice(0, separator);
          const label = node('label', undefined, 'choice');
          const input = node('input');
          input.id = question.id + '-' + key;
          input.type = question.kind.startsWith('multi') ? 'checkbox' : 'radio';
          input.name = question.id;
          input.value = key;
          input.checked = input.type === 'checkbox' ? Array.isArray(value) && value.includes(key) : value === key;
          input.setAttribute('aria-describedby', description);
          input.onchange = () => changeChoice(question, key, input.checked, input.id);
          label.append(input, node('span', option.slice(separator + 1)));
          field.append(label);
        }
        if (!question.kind.startsWith('multi') && value !== undefined) {
          const clear = node('button', 'Leave this question unanswered', 'text-button');
          clear.type = 'button';
          clear.onclick = () => {
            delete answers[question.id];
            discardHidden();
            save();
            renderSection('section-title');
          };
          field.append(clear);
        }
      }
      field.append(fieldError(question.id));
      root.append(field);
    }

    function brandedHeading(tag, title) {
      const period = title.endsWith('.');
      const element = node(tag, period ? title.slice(0, -1) : title);
      if (period || !/[?!]$/.test(title)) {
        const dot = node('span', '.', 'heading-dot');
        dot.setAttribute('aria-hidden', 'true');
        element.append(dot);
      }
      return element;
    }

    function heading(title, purpose) {
      const titleNode = brandedHeading('h2', title);
      titleNode.id = 'section-title';
      titleNode.tabIndex = -1;
      const root = $('questions');
      root.replaceChildren(titleNode);
      if (purpose) root.append(node('p', purpose, 'purpose'));
      return root;
    }

    function focusHeading() {
      $('section-title').focus();
    }

    function renderSection(focusId) {
      const section = sections[step];
      const pages = pagesFor(section, answers);
      page = Math.min(page, pages.length - 1);
      const current = pages[page];
      $('step').textContent = (step + 1) + ' / ' + sections.length + ' · ' + section.title
        + (pages.length > 1 ? ' · Page ' + (page + 1) + ' of ' + pages.length : '');
      $('progress').value = step + 1;
      const root = heading(current.title);
      if (!visible(section, answers)) {
        root.append(node('p', section.skipNote, 'notice'));
      } else {
        if (section.note) root.append(node('p', section.note, 'section-note'));
        for (const question of current.questions) addQuestion(question, root);
      }
      $('controls').hidden = false;
      $('back').disabled = step === 0 && page === 0;
      $('next').textContent = step === sections.length - 1 && page === pages.length - 1 ? 'Review my answers' : 'Continue';
      if (focusId) $(focusId)?.focus();
    }

    function appendFollowUp(root) {
      const panel = node('section', undefined, 'follow-up');
      panel.append(brandedHeading('h3', 'A little about you, only if you wish.'));
      panel.append(node('p', "Your experience helps us understand what could make operators' work easier and more profitable. If you'd like us to know who these answers came from, you're welcome to leave your name and contact details below.", 'section-note'));
      panel.append(node('p', 'You do not have to share either. Prefer not to? Thank you for taking the time to help.', 'optional-note'));
      const nameLabel = node('label', 'Name (optional)', 'input-label');
      nameLabel.htmlFor = 'follow-up-name-input';
      const nameInput = node('input');
      nameInput.id = nameLabel.htmlFor;
      nameInput.type = 'text';
      nameInput.maxLength = 200;
      nameInput.autocomplete = 'name';
      nameInput.value = followUp.name || '';
      nameInput.setAttribute('aria-describedby', 'follow-up-name-error');
      nameInput.oninput = () => {
        followUp.name = nameInput.value;
        clearError('follow-up-name');
        save();
      };
      panel.append(nameLabel, nameInput, fieldError('follow-up-name'));
      const contactField = node('fieldset', undefined, 'question');
      contactField.append(node('legend', 'Contact details (optional)'));
      for (const [value, text] of [['', 'Prefer not to share contact details'], ['email', 'Email'], ['phone', 'Phone / WhatsApp']]) {
        const label = node('label', undefined, 'choice');
        const input = node('input');
        input.id = 'contact-method-' + (value || 'none');
        input.type = 'radio';
        input.name = 'contact-method';
        input.checked = (followUp.method || '') === value;
        input.onchange = () => {
          followUp.method = value;
          followUp.contact = '';
          save();
          renderReview(input.id);
        };
        label.append(input, node('span', text));
        contactField.append(label);
      }
      if (followUp.method) {
        const label = node('label', followUp.method === 'email' ? 'Email address (optional)' : 'Phone / WhatsApp number (optional)', 'input-label');
        label.htmlFor = 'follow-up-contact-input';
        const input = node('input');
        input.id = label.htmlFor;
        input.type = followUp.method === 'email' ? 'email' : 'tel';
        input.maxLength = followUp.method === 'email' ? 200 : 50;
        input.autocomplete = followUp.method === 'email' ? 'email' : 'tel';
        input.value = followUp.contact || '';
        input.setAttribute('aria-describedby', 'follow-up-contact-error');
        input.oninput = () => {
          followUp.contact = input.value;
          clearError('follow-up-contact');
          save();
        };
        contactField.append(label, input);
      }
      contactField.append(fieldError('follow-up-contact'));
      panel.append(contactField);
      panel.append(node('p', 'Sharing your details does not automatically give us permission to contact you. Choose an invitation below only if you would like one; include a contact detail if you do.', 'section-note'));
      const field = node('fieldset', undefined, 'question');
      field.append(node('legend', 'May we contact you? (Optional)'));
      for (const [value, text] of [
        ['clarification', 'Clarifying my research answers'],
        ['prototype', 'Inviting me to give feedback on a prototype']
      ]) {
        const label = node('label', undefined, 'choice');
        const input = node('input');
        input.id = 'consent-' + value;
        input.type = 'checkbox';
        input.checked = Array.isArray(followUp.purposes) && followUp.purposes.includes(value);
        input.onchange = () => {
          followUp.purposes = selectMultiple(followUp.purposes, value, input.checked);
          save();
          renderReview(input.id);
        };
        label.append(input, node('span', text));
        field.append(label);
      }
      panel.append(field);
      root.append(panel);
    }

    function renderReview(focusId) {
      const data = pending ? pending.answers : researchAnswers(sections, answers);
      $('step').textContent = '8 / 8 · Research complete';
      $('progress').value = sections.length;
      const root = heading(pending ? 'Check the same submission.' : 'Your experience, in your words.',
        pending ? 'Confirmation is still pending. Retry sends the same response with the same reference, not a second research response.' : 'Review your answers before sending. You can go back, change anything, or leave questions unanswered.');
      for (const section of sections) {
        const card = node('section', undefined, 'review-card');
        card.append(brandedHeading('h3', section.title));
        const questions = questionsFor(section, data);
        if (!visible(section, data)) card.append(node('p', 'Not applicable based on your earlier answer.', 'review-note'));
        else {
          const list = node('dl');
          for (const question of questions) list.append(node('dt', question.title), node('dd', displayAnswer(question, data[question.id])));
          card.append(list);
        }
        root.append(card);
      }
      if (pending) {
        const card = node('section', undefined, 'review-card');
        card.append(brandedHeading('h3', 'Your optional details and permissions'));
        const purposes = pending.answers.follow_up_purposes || [];
        card.append(node('p', pending.follow_up_consent ? purposes.map(value => value === 'prototype' ? 'Prototype feedback invitation' : 'Clarifying research answers').join('; ') : 'No follow-up contact requested.'));
        if (pending.contact_name) card.append(node('p', pending.contact_name));
        const contact = pending.contact_email || pending.contact_phone;
        if (contact) card.append(node('p', contact));
        root.append(card);
      } else appendFollowUp(root);
      root.append(node('p', 'Submitting sends these answers to ETA. No booking, payment or subscription is created.', 'review-note'));
      const actions = node('div', undefined, 'review-actions');
      if (!pending) {
        const edit = node('button', 'Back to edit', 'button button-outline');
        edit.type = 'button';
        edit.onclick = () => { renderSection(); focusHeading(); message(''); };
        actions.append(edit);
      }
      const submit = node('button', pending ? 'Retry same submission' : 'Submit answers', 'button button-dark');
      submit.id = 'submit-answers';
      submit.type = 'button';
      submit.disabled = busy;
      submit.onclick = send;
      actions.append(submit);
      root.append(actions);
      $('controls').hidden = true;
      if (focusId) $(focusId)?.focus();
    }

    async function send() {
      if (busy || done || draftLocked) return;
      if (!pending) {
        try {
          pending = createSubmission(sections, answers, followUp, isTest, crypto.randomUUID(), version);
        } catch (error) {
          if (!(error instanceof AnswerError)) throw error;
          errorFor(error.id, error.message);
          return;
        }
        if (storage) {
          try {
            storage.setItem(PENDING_KEY, JSON.stringify(pending));
          } catch (error) {
            logError('Pending submission could not be stored.', error);
            draftNotice('This submission cannot be saved for retry after closing the page. Keep this page open until saving is confirmed.');
          }
        }
      }
      busy = true;
      $('clear').disabled = true;
      $('submit-answers').disabled = true;
      $('submit-answers').textContent = 'Waiting for confirmation...';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending),
          signal: controller.signal
        });
        if (response.status === 422) {
          answers = researchAnswers(sections, pending.answers);
          followUp = {
            purposes: pending.answers.follow_up_purposes || [],
            name: pending.contact_name || '',
            method: pending.contact_email ? 'email' : pending.contact_phone ? 'phone' : '',
            contact: pending.contact_email || pending.contact_phone || ''
          };
          pending = null;
          removeStored(PENDING_KEY);
          save();
          renderReview();
          message('The server could not accept this response. Your answers are still here. Go back to check them before trying again.', true);
          return;
        }
        if (!response.ok) throw new Error('SubmissionNotConfirmed');
        const result = await response.json();
        if (result.success !== true || typeof result.id !== 'string' || !result.id || typeof result.created_at !== 'string' || !result.created_at) {
          throw new Error('InvalidConfirmation');
        }
        done = true;
        $('draft-notice').hidden = true;
        removeStored(KEY);
        removeStored(PENDING_KEY);
        heading('Thank you.', 'Your answers are saved. Your experience will help us decide where a different approach could genuinely support operators.');
        $('progress-panel').hidden = true;
        $('controls').hidden = true;
        answers = {};
        followUp = { purposes: [] };
        pending = null;
        message('');
        focusHeading();
      } catch (error) {
        logError('Submission confirmation was not received.', error);
        renderReview();
        message('Saving has not been confirmed. Your answers are still here. Retry the same submission; do not start a second response.', true);
      } finally {
        clearTimeout(timer);
        busy = false;
        $('clear').disabled = Boolean(pending);
        const submit = $('submit-answers');
        if (submit) {
          submit.disabled = false;
          submit.textContent = pending ? 'Retry same submission' : 'Submit answers';
        }
      }
    }

    $('survey').onsubmit = event => event.preventDefault();
    $('next').onclick = () => {
      if (busy || done || pending || draftLocked) return;
      try {
        const pages = pagesFor(sections[step], answers);
        for (const question of pages[page].questions) cleanAnswer(question, answers[question.id]);
        if (page < pages.length - 1) {
          page++;
          save();
          renderSection();
        } else if (step === sections.length - 1) renderReview();
        else {
          step++;
          page = 0;
          save();
          renderSection();
        }
        message('');
        focusHeading();
      } catch (error) {
        if (!(error instanceof AnswerError)) throw error;
        errorFor(error.id, error.message);
      }
    };
    $('back').onclick = () => {
      if (busy || pending || done || draftLocked) return;
      if (page > 0) page--;
      else if (step > 0) {
        step--;
        page = pagesFor(sections[step], answers).length - 1;
      }
      save();
      renderSection();
      message('');
      focusHeading();
    };
    $('clear').onclick = () => {
      if (busy || pending) {
        message('Retry the pending submission before starting another response. This prevents an accidental duplicate.', true);
        return;
      }
      if (!window.confirm('Clear this questionnaire draft from this browser? Earlier-version drafts will not be changed.')) return;
      removeStored(KEY);
      removeStored(PENDING_KEY);
      if (done) return;
      answers = {};
      followUp = { purposes: [] };
      step = 0;
      page = 0;
      sections = currentSections;
      version = VERSION;
      draftLocked = false;
      $('draft-notice').hidden = true;
      $('next').disabled = false;
      renderSection();
      message('');
      focusHeading();
    };
    $('begin').onclick = () => {
      $('cover').hidden = true;
      $('workspace').hidden = false;
      focusHeading();
    };
    $('begin').disabled = false;
    if (pending) {
      $('clear').disabled = true;
      renderReview();
    } else {
      renderSection();
      $('next').disabled = draftLocked;
    }
  }

  start().catch(error => {
    console.error('Questionnaire could not continue.', { name: error.name });
    const status = document.getElementById('status');
    status.hidden = false;
    status.className = 'notice error';
    status.textContent = 'The questionnaire could not continue. No new submission is confirmed. Keep this page open and reload only if your draft was saved.';
  });
})();
