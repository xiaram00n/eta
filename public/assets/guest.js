(function () {
  "use strict";

  const SERVICES = {
    taxi: { name: "Your local ride", short: "Local ride", amount: 80, description: "A dinner reservation, the beach, or the next stop in your day." },
    transfer: { name: "Your arrival, arranged", short: "Airport & ferry", amount: 110, description: "Keep arrival details, luggage and the onward journey together." },
    tour: { name: "Your day on the island", short: "Private tour", amount: 480, description: "Choose an example route, allow time to explore, and keep your group together." },
    villa: { name: "Transportation during your stay", short: "Stay rides", amount: 100, description: "Plan each arrival, outing and departure with your group. This example arranges transportation, not lodging." },
    wedding: { name: "Everyone, in the right place", short: "Wedding", amount: 160, description: "Plan each pickup group and return. The whole plan needs the right vehicles, not just the first trip." }
  };
  const DRIVERS = {
    maya: { name: "Maya R.", initials: "MR" },
    samir: { name: "Samir A.", initials: "SA" },
    leila: { name: "Leila D.", initials: "LD" },
    noah: { name: "Noah B.", initials: "NB" },
    talia: { name: "Talia J.", initials: "TJ" },
    alex: { name: "Alex C.", initials: "AC" }
  };
  const PHASES = ["confirmed", "enroute", "arrived", "inprogress", "completed"];
  const PHASE_LABELS = {
    requested: "Request prepared", held: "Sample capacity held", confirmed: "Confirmed",
    enroute: "On the way", arrived: "At your pickup", inprogress: "On your way",
    completed: "Completed", attention: "Needs attention", cancelled: "Canceled"
  };
  const SEATS = 8;
  const HOLD_MS = 5 * 60 * 1000;

  class DemoError extends Error {}

  function islandClock(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/St_Thomas", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date);
    return Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  }

  function localDate(offset = 0) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    const parts = islandClock(date);
    return [parts.year, parts.month, parts.day].join("-");
  }

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + "T12:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function shifted(leg, minutes) {
    const date = new Date(leg.date + "T" + leg.time + ":00Z");
    date.setUTCMinutes(date.getUTCMinutes() + minutes);
    return {
      date: date.toISOString().slice(0, 10),
      time: date.toISOString().slice(11, 16)
    };
  }

  function requireValue(condition, message) {
    if (!condition) throw new DemoError(message);
  }

  function cleanText(value, max, field) {
    const text = String(value ?? "").trim();
    requireValue(text.length <= max, field + " is too long.");
    return text;
  }

  function validateSchedule(leg) {
    requireValue(validDate(leg.date), "Choose a valid date for every trip.");
    requireValue(/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(leg.time), "Choose a valid pickup time for every trip.");
    requireValue(leg.date >= localDate(), "Choose today or a future date. A past pickup cannot be reserved.");
    const pickup = new Date(leg.date + "T" + leg.time + ":00-04:00");
    requireValue(pickup.getTime() >= Date.now() - 60000, "That pickup time has passed. Choose a later time.");
  }

  class GuestDemo {
    constructor() {
      this.plans = [];
      this.fleet = Object.keys(DRIVERS).map((driver, index) => ({ id: "DEMO-VAN-" + (index + 1), driver }));
    }

    get(id) {
      const plan = this.plans.find(item => item.id === id);
      requireValue(plan, "This sample plan could not be found.");
      return plan;
    }

    leg(plan, id) {
      const leg = plan.legs.find(item => item.id === id);
      requireValue(leg, "Select a trip from this plan.");
      return leg;
    }

    window(plan, leg) {
      const start = new Date(leg.date + "T" + leg.time + ":00-04:00").getTime();
      const minutes = plan.service === "tour" ? plan.duration * 60 : 90;
      const reserved = leg.id === plan.legs[0].id ? plan.standby * 60 : 0;
      return { start: start - 30 * 60000, end: start + Math.max(minutes, reserved) * 60000 };
    }

    overlaps(first, second) {
      return first.start < second.end && second.start < first.end;
    }

    vehicleFree(vehicle, window, ignorePlan, ignoreLeg) {
      return !this.plans.some(plan => {
        if (plan.id === ignorePlan && !ignoreLeg) return false;
        const held = ["requested", "held"].includes(plan.status) && plan.holdUntil > Date.now();
        if (!held && !["confirmed", "active", "attention", "completed"].includes(plan.status)) return false;
        return plan.legs.some(leg => {
          if (plan.id === ignorePlan && leg.id === ignoreLeg) return false;
          return leg.phase !== "cancelled" && leg.vehicleIds.includes(vehicle.id) && this.overlaps(window, this.window(plan, leg));
        });
      });
    }

    create(input) {
      requireValue(Object.hasOwn(SERVICES, input.service), "Choose a service.");
      requireValue(Array.isArray(input.legs) && input.legs.length > 0 && input.legs.length <= 20, "Add between one and twenty trips.");
      const legs = input.legs.map((item, index) => {
        const leg = {
          id: "leg-" + (index + 1),
          label: cleanText(item.label || "Trip " + (index + 1), 80, "Trip name"),
          pickup: cleanText(item.pickup, 150, "Pickup"),
          destination: cleanText(item.destination, 150, "Destination"),
          date: String(item.date || ""), time: String(item.time || ""),
          guests: Number(item.guests), vehicles: 0, vehicleIds: [], accepted: false, driver: null,
          phase: "requested", updatedAt: null
        };
        requireValue(leg.pickup && leg.destination, "Add a pickup and destination for every trip.");
        requireValue(Number.isInteger(leg.guests) && leg.guests >= 1 && leg.guests <= 200, "Each trip needs a whole guest count between 1 and 200.");
        requireValue(leg.pickup.toLowerCase() !== leg.destination.toLowerCase(), "Pickup and destination should be different.");
        validateSchedule(leg);
        leg.requiredVehicles = Math.ceil(leg.guests / SEATS);
        return leg;
      });
      const duration = Number(input.duration || 4);
      const standby = Number(input.standby || 0);
      requireValue([3, 4, 6].includes(duration), "Choose one of the sample tour durations.");
      requireValue([0, 2, 4, 8].includes(standby), "Choose a listed reserved-driver window.");
      const luggage = Number(input.luggage || 0);
      requireValue(Number.isInteger(luggage) && luggage >= 0 && luggage <= 200, "Use a whole luggage count between 0 and 200.");
      const preferred = input.preferred || "";
      requireValue(!preferred || Object.hasOwn(DRIVERS, preferred), "Choose a listed sample driver.");
      const plan = {
        id: "ETA-DEMO-" + String(this.plans.length + 1).padStart(3, "0"),
        service: input.service, legs, duration, standby, preferred,
        luggage, accessibility: Boolean(input.accessibility),
        notes: cleanText(input.notes, 1000, "Details"),
        flight: cleanText(input.flight, 80, "Arrival reference"),
        status: "requested", quote: null, holdUntil: null, issue: null, change: null,
        payment: { paid: 0, refunded: 0, status: "due" },
        messages: [{ author: "ETA preview", text: "Your trip details stay with this plan. This conversation is a demonstration; no one receives these messages.", system: true }],
        history: ["Sample request prepared. No operator contacted."]
      };
      this.plans.push(plan);
      return plan;
    }

    offer(id, driverChoice) {
      const plan = this.get(id);
      requireValue(["requested", "held"].includes(plan.status), "This plan is no longer at the availability step.");
      requireValue(!plan.accessibility, "Accessible vehicle suitability needs operator review. This preview will not assume a suitable vehicle.");
      requireValue(plan.legs.every(leg => plan.luggage <= leg.requiredVehicles * 6), "This luggage load needs a vehicle-fit review before capacity can be held.");
      requireValue(!plan.issue || plan.issue.type === "preferred", "Resolve the availability issue before continuing.");
      if (plan.issue?.type === "preferred") {
        requireValue(driverChoice && driverChoice !== plan.preferred, "Choose an available alternative explicitly, or keep the request open.");
      }
      const driver = driverChoice || plan.preferred || "maya";
      requireValue(Object.hasOwn(DRIVERS, driver), "Choose a listed sample driver.");
      const assignments = [];
      for (const leg of plan.legs) {
        validateSchedule(leg);
        const window = this.window(plan, leg);
        const available = this.fleet.filter(vehicle => this.vehicleFree(vehicle, window, plan.id) &&
          !assignments.some(item => item.vehicleIds.includes(vehicle.id) && this.overlaps(window, item.window)));
        available.sort((first, second) => Number(second.driver === driver) - Number(first.driver === driver));
        if (available.length < leg.requiredVehicles || (leg === plan.legs[0] && (plan.preferred || driverChoice) && available[0]?.driver !== driver)) {
          plan.legs.forEach(item => {
            item.vehicles = 0; item.vehicleIds = []; item.accepted = false; item.driver = null; item.phase = "requested";
          });
          plan.status = "requested"; plan.quote = null; plan.holdUntil = null;
          plan.issue = { type: available.length < leg.requiredVehicles ? (plan.service === "wedding" ? "capacity" : "unavailable") : "preferred", legId: leg.id };
          plan.history.push("Availability check found insufficient sample capacity or an unavailable preferred lead driver.");
          return plan;
        }
        assignments.push({ leg, window, vehicleIds: available.slice(0, leg.requiredVehicles).map(vehicle => vehicle.id), driver: available[0].driver });
      }
      for (const item of assignments) {
        const leg = item.leg;
        leg.vehicleIds = item.vehicleIds;
        leg.vehicles = item.vehicleIds.length;
        leg.accepted = true;
        leg.driver = item.driver;
        leg.phase = "held";
      }
      const vehicleLegs = plan.legs.reduce((sum, leg) => sum + leg.requiredVehicles, 0);
      const transport = Math.round(SERVICES[plan.service].amount * vehicleLegs * (plan.service === "tour" ? plan.duration / 4 : 1));
      const standby = plan.standby * 25 * Math.max(...plan.legs.map(leg => leg.requiredVehicles));
      plan.quote = { transport, standby, total: transport + standby };
      plan.holdUntil = Date.now() + HOLD_MS;
      plan.issue = null;
      plan.status = "held";
      plan.history.push("Illustrative operator acceptance and quote prepared; temporary sample capacity held.");
      return plan;
    }

    confirm(id) {
      const plan = this.get(id);
      requireValue(plan.status === "held" && plan.quote, "Review available capacity and the sample quote first.");
      requireValue(plan.holdUntil > Date.now(), "The sample hold has expired. Check availability again.");
      requireValue(!plan.issue, "Resolve the open issue before confirming.");
      for (const leg of plan.legs) {
        validateSchedule(leg);
        requireValue(leg.accepted && leg.driver && leg.vehicleIds.length >= leg.requiredVehicles, "Every trip needs accepted vehicle capacity before the whole plan can be confirmed.");
        requireValue(leg.vehicleIds.every(id => this.vehicleFree(this.fleet.find(vehicle => vehicle.id === id), this.window(plan, leg), plan.id, leg.id)), "A vehicle now has a conflicting commitment. Recheck availability.");
      }
      plan.status = "confirmed";
      plan.legs.forEach(leg => { leg.phase = "confirmed"; });
      plan.history.push("Guest confirmed the illustrative quote and all sample assignments.");
      return plan;
    }

    refresh(id) {
      const plan = this.get(id);
      if (plan.status === "held" && plan.holdUntil <= Date.now()) {
        plan.status = "requested"; plan.quote = null; plan.holdUntil = null;
        plan.legs.forEach(leg => {
          leg.phase = "requested"; leg.accepted = false; leg.driver = null; leg.vehicles = 0; leg.vehicleIds = [];
        });
        plan.history.push("Temporary sample hold expired. Availability and the quote need rechecking.");
        return true;
      }
      if (["confirmed", "active"].includes(plan.status) && !plan.issue) {
        const stale = plan.legs.find(leg => ["enroute", "arrived", "inprogress"].includes(leg.phase) &&
          leg.updatedAt !== null && Date.now() - leg.updatedAt >= 10 * 60000);
        if (stale) {
          plan.issue = { type: "stale", legId: stale.id };
          return true;
        }
      }
      return false;
    }

    advance(id, legId) {
      const plan = this.get(id);
      const leg = this.leg(plan, legId);
      this.refresh(id);
      requireValue(["confirmed", "active"].includes(plan.status), "Secure the plan before starting a trip update.");
      requireValue(!plan.issue, "Resolve the open trip issue before continuing.");
      const current = PHASES.indexOf(leg.phase);
      requireValue(current >= 0 && current < PHASES.length - 1, "This trip cannot advance from its current status.");
      leg.phase = PHASES[current + 1];
      leg.updatedAt = Date.now();
      plan.status = plan.legs.every(item => item.phase === "completed") ? "completed" : "active";
      plan.history.push(leg.label + ": " + PHASE_LABELS[leg.phase] + " (simulated).");
      return plan;
    }

    requestChange(id, legId, schedule) {
      const plan = this.get(id);
      const leg = this.leg(plan, legId);
      requireValue(["confirmed", "active"].includes(plan.status) && leg.phase === "confirmed", "Changes in this preview are available before the selected trip starts.");
      requireValue(!plan.change && !plan.issue, "Resolve the existing request or issue before adding another change.");
      const proposed = { date: String(schedule.date || ""), time: String(schedule.time || "") };
      validateSchedule(proposed);
      requireValue(proposed.date !== leg.date || proposed.time !== leg.time, "Choose a different pickup date or time.");
      plan.change = { legId, ...proposed, conflict: false };
      plan.history.push("Pickup change requested; original arrangement retained.");
      return plan;
    }

    approveChange(id) {
      const plan = this.get(id);
      requireValue(plan.change, "There is no change awaiting review.");
      requireValue(!plan.change.conflict, "The new time conflicts with another booking. The original arrangement stays in place.");
      requireValue(!plan.issue, "Resolve the trip issue before approving a change.");
      const leg = this.leg(plan, plan.change.legId);
      requireValue(leg.phase === "confirmed", "This trip has already started.");
      validateSchedule(plan.change);
      const window = this.window(plan, { ...leg, date: plan.change.date, time: plan.change.time });
      if (!leg.vehicleIds.every(id => this.vehicleFree(this.fleet.find(vehicle => vehicle.id === id), window, plan.id, leg.id))) {
        plan.change.conflict = true;
        throw new DemoError("The assigned vehicle is committed at that time. Your original pickup stays confirmed.");
      }
      leg.date = plan.change.date;
      leg.time = plan.change.time;
      plan.change = null;
      plan.history.push("Simulated operator review completed. Revised pickup accepted with the same sample price and capacity.");
      return plan;
    }

    keepOriginal(id) {
      const plan = this.get(id);
      requireValue(plan.change, "There is no pending change.");
      plan.change = null;
      plan.history.push("Change withdrawn. Original pickup retained.");
      return plan;
    }

    scenario(id, type, legId) {
      const plan = this.get(id);
      const leg = this.leg(plan, legId || plan.legs[0].id);
      requireValue(!["completed", "cancelled"].includes(plan.status), "Use an unfinished sample plan for this scenario.");
      requireValue(!plan.change, "Resolve the pending schedule change first.");
      if (["preferred", "unavailable", "capacity"].includes(type)) {
        requireValue(["requested", "held"].includes(plan.status), "Try availability scenarios before confirming a plan.");
        if (type === "preferred") {
          requireValue(plan.preferred, "Choose a preferred driver in a new plan to try this scenario.");
        }
        if (type === "capacity") requireValue(plan.service === "wedding", "Use a wedding plan to explore an unsecured pickup group.");
        plan.legs.forEach(item => {
          item.vehicles = 0; item.vehicleIds = []; item.accepted = false; item.driver = null; item.phase = "requested";
        });
        plan.status = "requested";
        plan.quote = null;
        plan.holdUntil = null;
        plan.issue = { type, legId: leg.id };
      } else if (type === "driver") {
        requireValue(["confirmed", "active"].includes(plan.status) && leg.phase !== "completed", "Confirm a plan and select an unfinished trip first.");
        plan.issue = { type, legId: leg.id, previousDriver: leg.driver };
        leg.accepted = false; leg.vehicles = 0; leg.vehicleIds = []; leg.phase = "attention";
        plan.status = "attention";
      } else if (type === "stale") {
        requireValue(["enroute", "arrived", "inprogress"].includes(leg.phase) && !plan.issue, "Advance a trip to a pickup update before trying stale location.");
        leg.updatedAt = Date.now() - 12 * 60 * 1000;
        plan.issue = { type, legId: leg.id };
      } else if (type === "conflict" || type === "arrival") {
        this.requestChange(id, leg.id, shifted(leg, 45));
        if (type === "conflict") plan.change.conflict = true;
      } else {
        throw new DemoError("Choose a listed demonstration scenario.");
      }
      plan.history.push("Scenario: " + type + ". This is not a real service event.");
      return plan;
    }

    resolve(id, choice) {
      const plan = this.get(id);
      requireValue(plan.issue, "There is no open issue to resolve.");
      const issue = plan.issue;
      if (issue.type === "preferred") return this.offer(id, choice);
      if (issue.type === "driver") {
        requireValue(Object.hasOwn(DRIVERS, choice) && choice !== issue.previousDriver, "Choose the listed replacement explicitly.");
        const leg = this.leg(plan, issue.legId);
        const available = this.fleet.filter(vehicle => vehicle.driver !== issue.previousDriver && this.vehicleFree(vehicle, this.window(plan, leg), plan.id, leg.id));
        available.sort((first, second) => Number(second.driver === choice) - Number(first.driver === choice));
        requireValue(available.length >= leg.requiredVehicles && available[0]?.driver === choice, "That replacement is not available for the full trip. The original assignment remains unsecured.");
        leg.driver = choice; leg.vehicleIds = available.slice(0, leg.requiredVehicles).map(vehicle => vehicle.id);
        leg.vehicles = leg.vehicleIds.length; leg.accepted = true; leg.phase = "confirmed"; leg.updatedAt = null;
        plan.status = plan.legs.some(item => ["enroute", "arrived", "inprogress", "completed"].includes(item.phase)) ? "active" : "confirmed";
      } else if (issue.type === "stale") {
        this.leg(plan, issue.legId).updatedAt = Date.now();
      } else if (["unavailable", "capacity"].includes(issue.type)) {
        plan.issue = null;
        return this.offer(id);
      } else {
        throw new DemoError("This issue needs a different resolution.");
      }
      plan.issue = null;
      plan.history.push("Sample issue resolved with an explicit updated assignment or fresh signal.");
      return plan;
    }

    pay(id, success, deposit = false) {
      const plan = this.get(id);
      requireValue(["confirmed", "active", "completed"].includes(plan.status) && plan.quote, "Confirm sample capacity and pricing before previewing payment.");
      requireValue(plan.payment.status !== "refund_pending" && plan.payment.status !== "refunded", "This sample payment is in a refund process.");
      requireValue(plan.payment.paid < plan.quote.total, "The sample balance is already paid.");
      if (!success) {
        plan.payment.status = "failed";
      } else {
        const amount = deposit && plan.payment.paid === 0 ? Math.round(plan.quote.total / 2) : plan.quote.total - plan.payment.paid;
        plan.payment.paid += amount;
        plan.payment.status = plan.payment.paid === plan.quote.total ? "paid" : "deposit_paid";
      }
      plan.history.push(success ? "Illustrative payment recorded. No funds moved." : "Illustrative payment failed. No paid balance changed.");
      return plan;
    }

    cancel(id) {
      const plan = this.get(id);
      requireValue(["requested", "held", "confirmed"].includes(plan.status), "Only an unstarted sample plan can be canceled here.");
      plan.status = "cancelled"; plan.issue = null; plan.change = null;
      plan.legs.forEach(leg => { leg.phase = "cancelled"; leg.accepted = false; leg.vehicles = 0; leg.vehicleIds = []; });
      if (plan.payment.paid > 0) plan.payment.status = "refund_review";
      plan.history.push("Sample plan canceled. Refund eligibility still requires review.");
      return plan;
    }

    refund(id, complete = false) {
      const plan = this.get(id);
      requireValue(plan.status === "cancelled" && plan.payment.paid > 0, "A paid, canceled sample plan is needed for a refund.");
      if (complete) {
        requireValue(plan.payment.status === "refund_pending", "Request a sample refund before completing it.");
        plan.payment.refunded = plan.payment.paid;
        plan.payment.status = "refunded";
      } else {
        requireValue(plan.payment.status === "refund_review", "This sample refund is not awaiting a request.");
        plan.payment.status = "refund_pending";
      }
      plan.history.push(complete ? "Illustrative full refund completed. No funds moved." : "Illustrative full refund requested, not yet processed.");
      return plan;
    }

    message(id, text, reply = false) {
      const plan = this.get(id);
      const body = cleanText(text, 600, "Message");
      requireValue(body, "Write a sample message first.");
      plan.messages.push({ author: reply ? "Example operator" : "You", text: body, system: reply });
      return plan;
    }

    rebookInput(id, date) {
      const plan = this.get(id);
      requireValue(validDate(date) && date >= localDate(), "Choose a new future date before rebooking.");
      const firstDate = new Date(plan.legs[0].date + "T12:00:00Z");
      return {
        service: plan.service, preferred: plan.preferred, duration: plan.duration, standby: plan.standby,
        luggage: plan.luggage, accessibility: plan.accessibility, notes: plan.notes, flight: "",
        legs: plan.legs.map(leg => {
          const offset = Math.round((new Date(leg.date + "T12:00:00Z") - firstDate) / 86400000);
          const next = new Date(date + "T12:00:00Z");
          next.setUTCDate(next.getUTCDate() + offset);
          return { label: leg.label, pickup: leg.pickup, destination: leg.destination, guests: leg.guests, date: next.toISOString().slice(0, 10), time: leg.time };
        })
      };
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { GuestDemo, DemoError, SERVICES, PHASES, localDate, shifted };
  }
  if (typeof document === "undefined") return;

  const demo = new GuestDemo();
  const dialog = document.getElementById("journey-dialog");
  const content = document.getElementById("journey-content");
  const feedback = document.getElementById("journey-feedback");
  let currentId = null;
  let selectedLeg = null;
  let activeTab = "itinerary";
  let builderService = "taxi";
  let builderSeed = null;
  let opener = null;

  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const dateLabel = value => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value + "T12:00:00Z"));
  const timeLabel = value => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date("2000-01-01T" + value + ":00Z"));
  const button = (action, text, kind = "button-outline", extra = "") => `<button type="button" class="button ${kind}" data-action="${action}" ${extra}>${text}</button>`;

  function tell(text, error = false) {
    feedback.textContent = text;
    feedback.classList.toggle("error", error);
    if (text) document.getElementById("page-status").textContent = text;
  }

  function focusHeading() {
    const heading = document.getElementById("journey-title");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    dialog.scrollTop = 0;
  }

  function openDialog() {
    if (!dialog.open) { opener = document.activeElement; dialog.showModal(); }
    tell("");
  }

  function current() { return demo.get(currentId); }
  function updateCount() { document.getElementById("plan-count").textContent = String(demo.plans.length); }
  function showPlan(plan, tab = "itinerary") {
    currentId = plan.id; selectedLeg = selectedLeg && plan.legs.some(leg => leg.id === selectedLeg) ? selectedLeg : plan.legs[0].id;
    activeTab = tab; openDialog(); renderPlan(); focusHeading();
  }

  function defaultLeg(label, pickup, destination, offset, time, guests = 4) {
    return { label, pickup, destination, date: localDate(offset), time, guests };
  }

  function defaults(service) {
    let legs;
    if (service === "villa") {
      legs = [
        defaultLeg("Arrival", "Cyril E. King Airport", "Sample villa, East End", 1, "15:30"),
        defaultLeg("Dinner", "Sample villa, East End", "Red Hook", 2, "18:30", 6),
        defaultLeg("Dinner return", "Red Hook", "Sample villa, East End", 2, "21:30", 6),
        defaultLeg("Departure", "Sample villa, East End", "Cyril E. King Airport", 5, "10:00")
      ];
    } else if (service === "wedding") {
      legs = [
        defaultLeg("Guest group A", "Sample hotel, Charlotte Amalie", "Example wedding venue, East End", 7, "14:00", 16),
        defaultLeg("Wedding party", "Sample villa, East End", "Example wedding venue, East End", 7, "14:30", 6),
        defaultLeg("Guest return", "Example wedding venue, East End", "Sample hotel, Charlotte Amalie", 7, "22:00", 16)
      ];
    } else if (service === "tour") {
      legs = [defaultLeg("Private island tour", "Sample villa, East End", "Mountain Top / Magens Bay / Red Hook", 1, "10:00", 6)];
    } else if (service === "transfer") {
      legs = [defaultLeg("Airport arrival", "Cyril E. King Airport", "Sample villa, East End", 1, "15:30")];
    } else {
      legs = [defaultLeg("Local ride", "Sample villa, East End", "Red Hook", 1, "18:30", 2)];
    }
    return { service, legs, preferred: "", luggage: service === "transfer" || service === "villa" ? 4 : 0, duration: 4, standby: 0, notes: "", flight: "", accessibility: false };
  }

  function options(values, selected) {
    return values.map(([value, label]) => `<option value="${escape(value)}"${String(value) === String(selected) ? " selected" : ""}>${escape(label)}</option>`).join("");
  }

  function legFields(leg, index, removable) {
    return `<fieldset data-leg-index="${index}">
      <legend>${builderService === "wedding" ? "Pickup group" : "Trip"} ${String(index + 1).padStart(2, "0")}</legend>
      <div class="leg-title"><span>${builderService === "wedding" ? "Separate groups can have their own vehicles and times." : "Keep the pickup and return as separate trips."}</span>${removable ? `<button type="button" class="remove-leg" data-action="remove-leg" data-index="${index}" aria-label="Remove trip ${index + 1}">Remove</button>` : ""}</div>
      <label>${builderService === "wedding" ? "Group name" : "Trip name"}<input name="label-${index}" value="${escape(leg.label)}" maxlength="80" required></label>
      <label>Pickup<input name="pickup-${index}" value="${escape(leg.pickup)}" list="island-places" maxlength="150" required autocomplete="off"></label>
      <label>${builderService === "tour" ? "Tour stops" : "Destination"}<input name="destination-${index}" value="${escape(leg.destination)}" list="island-places" maxlength="150" required autocomplete="off"></label>
      <div class="field-grid three"><label>Date<input name="date-${index}" type="date" min="${localDate()}" value="${escape(leg.date)}" required></label><label>Pickup time<input name="time-${index}" type="time" value="${escape(leg.time)}" required></label><label>Guests<input name="guests-${index}" type="number" min="1" max="200" value="${escape(leg.guests)}" required inputmode="numeric"></label></div>
    </fieldset>`;
  }

  function readBuilder() {
    const form = document.getElementById("journey-builder");
    const fields = new FormData(form);
    const legs = [...form.querySelectorAll("[data-leg-index]")].map((fieldset, index) => ({
      label: fields.get("label-" + index), pickup: fields.get("pickup-" + index),
      destination: fields.get("destination-" + index), date: fields.get("date-" + index),
      time: fields.get("time-" + index), guests: fields.get("guests-" + index)
    }));
    return {
      service: builderService, legs, preferred: fields.get("preferred"), duration: fields.get("duration") || 4, itinerary: fields.get("itinerary"),
      standby: fields.get("standby"), luggage: fields.get("luggage"),
      notes: fields.get("notes"), flight: fields.get("flight") || "", accessibility: fields.get("accessibility") === "on"
    };
  }

  function openBuilder(service, seed) {
    builderService = service;
    builderSeed = seed || defaults(service);
    openDialog();
    renderBuilder();
    focusHeading();
  }

  function renderBuilder() {
    const spec = SERVICES[builderService];
    const seed = builderSeed;
    const notes = {
      taxi: ["A clear pickup", "Add a return, note your luggage, and request a familiar driver. Availability still needs to be secured."],
      transfer: ["Arrive with a plan", "Add your flight or ferry details. An arrival delay should become a reviewed change, not a missed pickup."],
      tour: ["Room to explore", "These are example itineraries, not an operator's published tour. Changes to duration or stops need a fresh availability and price review."],
      villa: ["Rides during your stay", "Your group can plan separate arrivals and outings. A preferred driver is a request, not exclusive on-call availability."],
      wedding: ["Every group accounted for", "Each pickup wave needs accepted vehicle capacity. This preview will not call the whole event confirmed if one group is still unsecured."]
    }[builderService];
    content.innerHTML = `<div class="dialog-body">
      <div class="dialog-heading"><div><p class="eyebrow">01 / Arrange your transportation</p><h2 id="journey-title">${spec.name}</h2><p>${spec.description}</p></div></div>
      <div class="service-picker" aria-label="Choose a service">${Object.entries(SERVICES).map(([id, item]) => `<button type="button" data-open-service="${id}" aria-pressed="${builderService === id}">${item.short}</button>`).join("")}</div>
      <div class="builder-layout">
        <form id="journey-builder" class="journey-form">
          ${builderService === "tour" ? `<div class="field-grid"><label>Example itinerary<select name="itinerary" id="tour-itinerary">${options([["scenic", "Scenic island + beach"], ["east", "East End + beach stops"], ["custom", "Request your own route"]], seed.itinerary || "scenic")}</select></label><label>Reserved tour time<select name="duration">${options([[3, "3 hours"], [4, "4 hours"], [6, "6 hours"]], seed.duration)}</select></label></div>` : ""}
          <p class="help-text">All pickup dates and times are St. Thomas local time (AST).</p>
          <div id="builder-legs">${seed.legs.map((leg, index) => legFields(leg, index, seed.legs.length > 1)).join("")}</div>
          <div class="form-actions">${seed.legs.length < 20 ? button("add-leg", builderService === "wedding" ? "+ Add pickup group / return" : "+ Add a trip / return") : ""}</div>
          <h3 class="form-section-title">Make the arrangement fit your group.</h3>
          <div class="field-grid"><label>Preferred driver for first pickup<select name="preferred">${options([["", "No preference"], ["maya", "Maya R. (example driver)"], ["samir", "Samir A. (example driver)"]], seed.preferred)}</select><span class="help-text">Requested for later trips too, where available. Each assignment is shown before you confirm.</span></label><label>Most large bags on any trip<input name="luggage" type="number" min="0" max="200" value="${escape(seed.luggage)}" required inputmode="numeric"></label></div>
          ${builderService === "transfer" || builderService === "villa" ? `<label>Flight / ferry arrival reference (optional)<input name="flight" value="${escape(seed.flight)}" maxlength="80" placeholder="Use a sample reference"></label>` : ""}
          <label>Reserved driver time<select name="standby">${options([[0, "Booked trips only"], [2, "2-hour reserved window"], [4, "4-hour reserved window"], [8, "8-hour reserved window"]], seed.standby)}</select><span class="help-text">Reserved time is separate from requesting a preferred driver. It needs a specific vehicle, start time and agreed price.</span></label>
          <label class="check-label"><input name="accessibility" type="checkbox"${seed.accessibility ? " checked" : ""}> Accessible vehicle / boarding assistance needed</label>
          <label>Anything else to arrange? (optional)<textarea name="notes" maxlength="1000" placeholder="Use sample details for this preview.">${escape(seed.notes)}</textarea></label>
          ${builderService === "wedding" ? `<p class="help-text">Cakes, decor and vendor deliveries need a separate service and handling review. Passenger vehicles are not assumed suitable; deliveries cannot be booked in this preview.</p>` : ""}
          <div class="form-actions"><button type="submit" class="button button-dark">Review my plan <span aria-hidden="true">&#8599;</span></button><span class="help-text">This creates a sample request, not a booking.</span></div>
        </form>
        <aside class="builder-note"><p class="eyebrow">The important part</p><h3>${notes[0]}</h3><p>${notes[1]}</p><ul><li>Pickup and destination</li><li>Guests, luggage and vehicle fit</li><li>Availability before confirmation</li><li>A clear price before payment</li></ul><span class="aside-index">ETA<small> / YOUR PLANS, TOGETHER</small></span></aside>
      </div>
    </div>`;
  }

  function statusPill(status) {
    const kind = status === "cancelled" ? "cancelled" : ["requested", "held", "attention"].includes(status) ? "warning" : "";
    return `<span class="status-pill ${kind}"><span class="small-dot" aria-hidden="true"></span>${PHASE_LABELS[status] || escape(status)}</span>`;
  }

  function issuePanel(plan) {
    if (!plan.issue) return "";
    const issue = plan.issue;
    const replacement = issue.previousDriver === "maya" ? "samir" : "maya";
    const panels = {
      preferred: ["Your preferred driver is unavailable.", "Keep the request open, or choose another example driver. Your preference will not be silently replaced.", button("resolve", "Choose " + DRIVERS[plan.preferred === "maya" ? "samir" : "maya"].name, "button-dark", `data-choice="${plan.preferred === "maya" ? "samir" : "maya"}"`), button("support", "Keep request open / ask for help")],
      unavailable: ["No suitable vehicle is available.", "Nothing is confirmed. You can try another time or ask for help. The control below deliberately simulates capacity becoming available.", button("resolve", "Preview capacity becoming available"), button("rebook", "Choose another time")],
      capacity: ["The complete pickup plan is not secured.", "At least one group needs more eligible capacity. The whole event remains unconfirmed; accepted resources cannot be assumed or double-booked.", button("resolve", "Recheck the sample fleet"), button("support", "Ask about the missing capacity")],
      driver: ["Your driver can no longer make this trip.", "The affected assignment is no longer confirmed. Other trips stay in your itinerary. Review and accept a replacement before the pickup continues.", button("resolve", "Accept " + DRIVERS[replacement].name + " as replacement", "button-dark", `data-choice="${replacement}"`), button("support", "Ask for help")],
      stale: ["Location updates have stopped.", "The last sample location is more than 10 minutes old. There is no reliable arrival estimate until a fresh update or human confirmation is received.", button("resolve", "Preview a fresh update"), button("support", "Ask for a pickup update")]
    };
    const panel = panels[issue.type];
    return `<section class="info-panel warning" aria-label="Arrangement needs attention"><h3>${panel[0]}</h3><p>${panel[1]}</p><div class="action-row">${panel.slice(2).join("")}</div></section>`;
  }

  function changePanel(plan) {
    if (!plan.change) return "";
    const leg = demo.leg(plan, plan.change.legId);
    return `<section class="info-panel ${plan.change.conflict ? "warning" : ""}"><h3>${plan.change.conflict ? "The new pickup time conflicts with another booking." : "Your change is awaiting review."}</h3>
      <p>${escape(leg.label)}: ${dateLabel(leg.date)} at ${timeLabel(leg.time)} stays confirmed. Requested: ${dateLabel(plan.change.date)} at ${timeLabel(plan.change.time)}.</p>
      <p>${plan.change.conflict ? "Keep your current arrangement or discuss another time. No schedule has been overwritten." : "This example changes the time only. Vehicle capacity and the sample price are retained only after the simulated operator review below."}</p>
      <div class="action-row">${!plan.change.conflict ? button("approve-change", "Preview operator approval", "button-dark") : ""}${button("keep-original", "Keep the original pickup")}${button("support", "Discuss the change")}</div></section>`;
  }

  function trackingPanel(plan, leg) {
    if (!PHASES.includes(leg.phase) || leg.phase === "confirmed") return "";
    const age = leg.updatedAt === null ? null : Math.max(0, Math.floor((Date.now() - leg.updatedAt) / 60000));
    const stale = age !== null && age >= 10;
    const title = stale ? "Waiting for a fresh update" : {
      enroute: "Your example driver is on the way.",
      arrived: "Your example driver is at the pickup.",
      inprogress: "You're on your way.",
      completed: "This trip is complete."
    }[leg.phase];
    return `<section class="tracking-panel" aria-label="Sample trip progress"><p class="eyebrow">Simulated trip update / not GPS</p><h3 class="tracking-title">${title}</h3>
      <p>${stale ? "Arrival estimate unavailable. The displayed progress is not current." : leg.phase === "completed" ? "Trip completion is recorded in your sample itinerary." : "Your pickup instructions and messages stay with this trip. No real location is being tracked."}</p>
      <div class="tracking-line" aria-label="${escape(PHASE_LABELS[leg.phase])}">${PHASES.slice(1).map(phase => `<span class="${PHASES.indexOf(phase) <= PHASES.indexOf(leg.phase) ? "reached" : ""}"></span>`).join("")}</div>
      <div class="tracking-meta"><span>${escape(leg.pickup)}</span><span id="tracking-age">${stale ? age + " minutes since sample update" : "Sample update " + (age ? age + " min ago" : "just now")}</span></div>
      ${leg.phase !== "completed" && !plan.issue ? button("advance", "Advance sample trip", "button-light") : ""}</section>`;
  }

  function itineraryPanel(plan) {
    const selected = demo.leg(plan, selectedLeg);
    const driver = selected.driver ? DRIVERS[selected.driver] : null;
    const active = ["confirmed", "active"].includes(plan.status);
    return `${issuePanel(plan)}${changePanel(plan)}
      <div aria-label="Trips in this plan">${plan.legs.map((leg, index) => `<article class="itinerary-leg ${selectedLeg === leg.id ? "active" : ""}">
        <span class="leg-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <div class="leg-heading"><h3>${escape(leg.label)}</h3>${statusPill(leg.phase)}</div>
        <p class="leg-route">${escape(leg.pickup)} <span aria-hidden="true">&#8594;</span><span class="sr-only">to</span> ${escape(leg.destination)}</p>
        <p class="leg-meta">${dateLabel(leg.date)} &middot; ${timeLabel(leg.time)} &middot; ${leg.guests} guests &middot; ${leg.vehicles}/${leg.requiredVehicles} example vehicles secured</p>
        <button type="button" class="leg-detail" data-action="select-leg" data-leg="${leg.id}" aria-pressed="${selectedLeg === leg.id}">${selectedLeg === leg.id ? "Viewing this trip" : "View this trip"}</button>
      </article>`).join("")}</div>
      ${driver ? `<div class="driver-card"><span class="driver-avatar" aria-hidden="true">${driver.initials}</span><div><h3>${driver.name} <span class="help-text">(example lead driver)</span></h3><p>${selected.vehicleIds.map(id => escape(id)).join(", ")} &middot; ${SEATS} seats each. Fictional vehicle references, not an actual fleet.</p></div></div>` : ""}
      ${plan.status === "held" ? `<section class="info-panel"><h3>Review the sample assignment before confirming.</h3><p>All trips have illustrative operator acceptance. The hold lasts five minutes in this preview. Vehicle and luggage suitability must still be verified in an operating service.</p></section>` : ""}
      ${active && selected.phase === "confirmed" ? `<section class="tracking-panel"><p class="eyebrow">Your selected trip</p><h3 class="tracking-title">Your pickup details are together.</h3><p>${escape(selected.label)} &middot; ${dateLabel(selected.date)} at ${timeLabel(selected.time)}. Ask about the pickup point or request a change without losing the original arrangement.</p>${button("advance", "Preview driver on the way", "button-light")}</section>` : ""}
      ${trackingPanel(plan, selected)}
      ${plan.standby ? `<section class="info-panel"><h3>${plan.standby}-hour reserved-driver window requested</h3><p>This is a separate paid window, starting at the first pickup, for the number of example vehicles shown in the quote. It does not imply unlimited trips or availability outside that window.</p></section>` : ""}
      <div class="action-row">${active && selected.phase === "confirmed" && !plan.change && !plan.issue ? button("change-form", "Request a pickup change") : ""}${button("messages", "Trip messages")}${button("rebook", "Book another / reuse this plan")}${["requested", "held", "confirmed"].includes(plan.status) ? button("cancel-review", "Cancellation options") : ""}</div>
      <div id="inline-action"></div>`;
  }

  function messagesPanel(plan) {
    return `<p class="help-text">Messages stay with the plan. This demonstration does not send anything, record audio or translate your text.</p>
      <div class="messages-list">${plan.messages.map(item => `<article class="message ${item.system ? "" : "guest"}"><span class="message-author">${escape(item.author)}</span><p>${escape(item.text)}</p><small>${item.system ? "Illustrative message" : "Sample only / not delivered"}</small></article>`).join("")}</div>
      <form id="message-form" class="journey-form"><label>Message about your trip<textarea name="message" maxlength="600" placeholder="For example: Which entrance should we meet at?" required></textarea></label><div class="form-actions"><button type="submit" class="button button-dark">Add sample message</button>${button("sample-reply", "Preview an operator reply")}</div></form>
      <details class="demo-tools"><summary>Voice &amp; language support</summary><p>Voice messages and language assistance are possibilities to investigate, not confirmed features. Recording, translation and delivery require a connected implementation; they are not represented as working in this local preview.</p></details>`;
  }

  function paymentsPanel(plan) {
    const payment = plan.payment;
    const labels = { due: "Not paid", failed: "Payment failed", deposit_paid: "Sample deposit paid", paid: "Sample balance paid", refund_review: "Refund review needed", refund_pending: "Refund requested / not processed", refunded: "Sample refund completed" };
    const balance = plan.quote ? plan.quote.total - payment.paid : null;
    return `<p class="eyebrow">Payment preview / no funds move</p><h3 class="subheading">${labels[payment.status]}</h3>
      <p class="payment-amount">${plan.quote ? money(plan.quote.total) : "Quote first"}</p>
      <p class="payment-description">${plan.quote ? "Illustrative total for the whole plan, not a published fare, an operator quote or a recommended price." : "Capacity and an agreed quote come before payment. There is no amount to pay yet."}</p>
      <div class="summary-row"><span>Payer</span><span>Group organizer (example)</span></div>
      <div class="summary-row"><span>Sample payments recorded</span><span>${money(payment.paid)}</span></div>
      <div class="summary-row"><span>Outstanding sample balance</span><span>${balance === null ? "Not quoted" : money(balance)}</span></div>
      <div class="summary-row"><span>Sample refund processed</span><span>${money(payment.refunded)}</span></div>
      <p class="help-text">For illustration, a deposit is half the sample total and the remainder is due before pickup. Actual deposits, cancellation terms and refund eligibility require an operator agreement. No card details are collected.</p>
      <div class="action-row">${["confirmed", "active", "completed"].includes(plan.status) && balance > 0 ? `${payment.paid === 0 ? button("pay-deposit", "Preview deposit success", "button-dark") : ""}${button("pay", payment.paid > 0 ? "Preview balance payment" : "Preview full payment")}${button("payment-failed", "Try a failed payment")}` : ""}
      ${payment.status === "refund_review" ? button("request-refund", "Preview full refund request", "button-dark") : ""}
      ${payment.status === "refund_pending" ? button("complete-refund", "Preview refund being processed") : ""}</div>
      ${payment.status === "failed" ? `<section class="info-panel warning"><h3>The sample payment did not go through.</h3><p>No amount has been added to the paid balance. Review and retry using the controls above. A failed payment is never shown as paid.</p></section>` : ""}
      ${payment.status === "refund_pending" ? `<section class="info-panel warning"><h3>Requested is not refunded.</h3><p>This full-refund scenario is awaiting approval and processing. The original payment remains recorded until the sample refund is completed. This is not a promise of refund eligibility or timing.</p></section>` : ""}
      ${payment.status === "paid" || payment.status === "refunded" ? `<section class="info-panel"><h3>Sample ${payment.status === "paid" ? "receipt" : "refund record"}</h3><p>${escape(plan.id)} &middot; ${money(payment.status === "paid" ? payment.paid : payment.refunded)} &middot; no actual transaction.</p></section>` : ""}`;
  }

  function summaryPanel(plan) {
    const count = plan.legs.reduce((sum, leg) => sum + leg.requiredVehicles, 0);
    return `<aside class="trip-summary"><p class="eyebrow">Your arrangement</p><h3>${SERVICES[plan.service].short}</h3>
      <div class="summary-row"><span>Trips / pickup groups</span><span>${plan.legs.length}</span></div>
      <div class="summary-row"><span>Required vehicle assignments</span><span>${count}</span></div>
      <div class="summary-row"><span>Preferred driver</span><span>${plan.preferred ? DRIVERS[plan.preferred].name + " (request)" : "No preference"}</span></div>
      <div class="summary-row"><span>Luggage / boarding</span><span>${plan.luggage} large bags${plan.accessibility ? " / accessible vehicle review" : ""}</span></div>
      ${plan.flight ? `<div class="summary-row"><span>Arrival reference</span><span>${escape(plan.flight)}</span></div>` : ""}
      ${plan.notes ? `<div class="summary-row"><span>Notes</span><span>${escape(plan.notes)}</span></div>` : ""}
      ${plan.quote ? `<div class="summary-row"><span>Sample transportation</span><span>${money(plan.quote.transport)}</span></div>${plan.standby ? `<div class="summary-row"><span>Sample reserved time</span><span>${money(plan.quote.standby)}</span></div>` : ""}<div class="summary-row total"><span>Illustrative total</span><strong>${money(plan.quote.total)}</strong></div>` : `<div class="summary-row total"><span>Price</span><span>Awaiting an agreed quote</span></div>`}
      ${plan.status === "requested" && !plan.issue ? button("offer", "Preview availability & quote", "button-dark") : ""}
      ${plan.status === "held" ? button("confirm", "Confirm sample plan", "button-dark") : ""}
      <p class="quote-disclaimer">${plan.quote ? "All amounts are made-up demonstration values, not USVI fares, estimates or commercial terms. No platform fee has been agreed." : "No capacity has been promised. The next step deliberately simulates operator acceptance and an illustrative quote."}</p>
      ${plan.status === "held" ? `<p class="quote-disclaimer">Sample hold expires at ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/St_Thomas" }).format(new Date(plan.holdUntil))} AST. ${button("offer", "Recheck the sample hold")}</p>` : ""}
    </aside>`;
  }

  function scenarioTools(plan) {
    const scenarios = plan.status === "requested" || plan.status === "held"
      ? [["preferred", "Preferred driver unavailable"], ["unavailable", "No suitable vehicle"], ...(plan.service === "wedding" ? [["capacity", "Wedding capacity incomplete"]] : [])]
      : ["confirmed", "active"].includes(plan.status)
        ? [["driver", "Driver cancels"], ["stale", "Location stops updating"], ["arrival", "Arrival delayed"], ["conflict", "Change conflicts with another trip"]]
        : [];
    return `<details class="demo-tools"><summary>Explore what happens when plans change</summary><p>These controls introduce example situations, not actual events. The sample fleet has six 8-seat vans. Scheduling reserves 30 minutes before pickup and 90 minutes per ordinary trip, or the selected tour / reserved duration. These simplified windows are not route estimates or operating rules.</p>
      <div class="scenario-grid">${scenarios.map(([id, label]) => `<button type="button" data-action="scenario" data-scenario="${id}">${label}</button>`).join("")}${button("payments", "Payment & refund states")}${button("support", "Ask for help")}</div>
      <details><summary class="help-text">What has happened in this sample?</summary><ol class="help-text">${plan.history.map(event => `<li>${escape(event)}</li>`).join("")}</ol></details></details>`;
  }

  function renderPlan() {
    const plan = current();
    demo.refresh(plan.id);
    const panel = activeTab === "messages" ? messagesPanel(plan) : activeTab === "payments" ? paymentsPanel(plan) : itineraryPanel(plan);
    content.innerHTML = `<div class="dialog-body" data-plan-view><div class="trip-heading"><div><p class="eyebrow">${escape(plan.id)} / ${plan.status === "requested" ? "Request, not confirmed" : "Your sample plan"}</p><h2 id="journey-title">${SERVICES[plan.service].name}</h2><p>${plan.legs.length} ${plan.legs.length === 1 ? "trip" : "trips"} &middot; Starts ${dateLabel(plan.legs[0].date)} &middot; ${plan.legs.filter(leg => leg.phase === "completed").length} completed</p></div>${statusPill(plan.status)}</div>
      <nav class="trip-tabs" aria-label="Plan views">${[["itinerary", "Itinerary"], ["messages", "Messages"], ["payments", "Payments"]].map(([id, label]) => `<button type="button" data-action="tab" data-tab="${id}" ${activeTab === id ? 'aria-current="page"' : ""}>${label}${id === "messages" ? `<span class="message-count">${plan.messages.length}</span>` : ""}</button>`).join("")}</nav>
      <div class="trip-layout"><section aria-label="${activeTab === "itinerary" ? "Your trips" : activeTab}">${panel}${scenarioTools(plan)}</section>${summaryPanel(plan)}</div>
      <p class="step-label">All pickup times are St. Thomas local time (AST). Sample people, vehicles and prices. Nothing is sent or reserved. Reloading clears the sample.</p></div>`;
    updateCount();
  }

  function renderPlans() {
    openDialog();
    content.innerHTML = `<div class="dialog-body"><div class="dialog-heading"><div><p class="eyebrow">Together in one place</p><h2 id="journey-title">My plans</h2><p>Sample plans you create while this page is open. No account or real reservation is created.</p></div></div>
      ${demo.plans.length ? [...demo.plans].reverse().map(plan => `<article class="plan-list-item"><div><h3>${SERVICES[plan.service].name}</h3><p>${escape(plan.id)} &middot; ${dateLabel(plan.legs[0].date)} &middot; ${plan.legs.length} ${plan.legs.length === 1 ? "trip" : "trips"}</p>${statusPill(plan.status)}</div>${button("open-plan", "View plan", "button-outline", `data-id="${plan.id}"`)}</article>`).join("") : `<section class="empty-state"><h3>Your next ride starts here.</h3><p>Arrange a local ride or plan transportation for a guest stay. Your sample itinerary will appear here as you explore the preview.</p>${button("sample-ride", "Try a sample ride", "button-dark")}${button("sample-stay", "Plan rides during a stay")}</section>`}</div>`;
    focusHeading();
  }

  function changeForm() {
    const plan = current();
    const leg = demo.leg(plan, selectedLeg);
    const next = shifted(leg, 30);
    const target = document.getElementById("inline-action");
    target.innerHTML = `<section class="info-panel"><h3>Request a new pickup time</h3><p>The current pickup stays in place until the change is accepted. If cost or capacity changes, it would need separate agreement.</p><form id="change-form" class="journey-form"><div class="field-grid"><label>Date<input name="date" type="date" min="${localDate()}" value="${next.date}" required></label><label>Time<input name="time" type="time" value="${next.time}" required></label></div><button type="submit" class="button button-dark">Prepare sample change</button></form></section>`;
    target.querySelector("input").focus();
  }

  function support() {
    const plan = current();
    activeTab = "messages";
    demo.message(plan.id, "Example help request: please review the pickup and any open assignment or timing issue.", false);
    renderPlan();
    focusHeading();
    tell("Sample help request added to the conversation. No support team has been contacted; this prototype cannot provide emergency assistance.");
  }

  function handleAction(element) {
    const action = element.dataset.action;
    if (action === "close-dialog") { dialog.close(); return; }
    if (action === "my-plans") { renderPlans(); return; }
    if (action === "sample-ride") { openBuilder("taxi"); return; }
    if (action === "sample-stay") { openBuilder("villa"); return; }
    if (action === "about-preview") {
      openDialog();
      content.innerHTML = `<div class="dialog-body"><p class="eyebrow">About this experience</p><h2 id="journey-title">A service you can explore.</h2><p>ETA is a proposed booking and trip-coordination service. Guests request rides from participating St. Thomas operators; operators decide whether to accept and provide the ride. ETA would coordinate the confirmed driver, vehicle, pickup and updates on the operator's behalf.</p><ul class="feature-list"><li>This is an interactive concept, not an operating transport service.</li><li>All operators, capacity, quotes, messages and trip updates are examples.</li><li>No booking, payment, location tracking or message is sent.</li><li>Sample plans are kept only in memory and disappear when this page reloads.</li><li>Use sample details, not private travel information.</li></ul>${button("sample-ride", "Try a sample ride", "button-dark")}</div>`;
      focusHeading(); return;
    }
    if (action === "open-plan") { selectedLeg = null; showPlan(demo.get(element.dataset.id)); return; }
    if (action === "add-leg" || action === "remove-leg") {
      builderSeed = readBuilder();
      if (action === "remove-leg") {
        requireValue(builderSeed.legs.length > 1, "Keep at least one trip in the plan.");
        builderSeed.legs.splice(Number(element.dataset.index), 1);
      } else {
        requireValue(builderSeed.legs.length < 20, "This preview supports up to twenty trips.");
        const last = builderSeed.legs[builderSeed.legs.length - 1];
        const next = validDate(last.date) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(last.time) ? shifted(last, 120) : { date: localDate(1), time: "18:00" };
        builderSeed.legs.push({ label: builderService === "wedding" ? "Additional guest group" : "Return trip", pickup: last.destination, destination: last.pickup, guests: last.guests, ...next });
      }
      renderBuilder(); tell(""); return;
    }
    const plan = current();
    tell("");
    if (action === "tab") {
      requireValue(["itinerary", "messages", "payments"].includes(element.dataset.tab), "Choose a plan view.");
      activeTab = element.dataset.tab;
    } else if (action === "select-leg") {
      selectedLeg = demo.leg(plan, element.dataset.leg).id;
    } else if (action === "offer") {
      demo.offer(plan.id);
    } else if (action === "confirm") {
      demo.confirm(plan.id);
      tell("Sample plan confirmed after all assignments and the illustrative quote were accepted. No real booking was made.");
    } else if (action === "advance") {
      demo.advance(plan.id, selectedLeg);
    } else if (action === "scenario") {
      demo.scenario(plan.id, element.dataset.scenario, selectedLeg);
      activeTab = "itinerary";
    } else if (action === "resolve") {
      demo.resolve(plan.id, element.dataset.choice);
    } else if (action === "change-form") {
      changeForm(); return;
    } else if (action === "approve-change") {
      demo.approveChange(plan.id);
    } else if (action === "keep-original") {
      demo.keepOriginal(plan.id);
    } else if (action === "messages" || action === "payments") {
      activeTab = action;
    } else if (action === "support") {
      support(); return;
    } else if (action === "sample-reply") {
      demo.message(plan.id, "Example reply: we would confirm the exact meeting point and any revised arrangements here. This text is scripted, not a live operator response.", true);
    } else if (action === "pay" || action === "pay-deposit" || action === "payment-failed") {
      demo.pay(plan.id, action !== "payment-failed", action === "pay-deposit");
      activeTab = "payments";
    } else if (action === "request-refund" || action === "complete-refund") {
      demo.refund(plan.id, action === "complete-refund");
      activeTab = "payments";
    } else if (action === "rebook") {
      openBuilder(plan.service, demo.rebookInput(plan.id, localDate(2)));
      tell("Preferences copied into a new request. Dates, availability and pricing must be reviewed again; the existing plan is unchanged.");
      return;
    } else if (action === "cancel-review") {
      activeTab = "payments";
      renderPlan();
      const target = document.querySelector(".trip-layout > section");
      const section = document.createElement("section");
      section.className = "info-panel warning";
      section.innerHTML = `<h3>Cancel this sample plan?</h3><p>No real reservation exists. In this example, canceling releases the sample capacity. Any paid amount enters refund review, not an automatic refund. Actual cancellation terms have not been set.</p>${button("cancel-plan", "Cancel sample plan")}${button("itinerary", "Keep the plan")}`;
      target.prepend(section); section.scrollIntoView({ block: "nearest" }); return;
    } else if (action === "cancel-plan") {
      demo.cancel(plan.id); activeTab = "payments";
    } else if (action === "itinerary") {
      activeTab = "itinerary";
    } else {
      throw new DemoError("That preview action is not available.");
    }
    const scrollTop = dialog.scrollTop;
    renderPlan();
    const focusTarget = action === "tab"
      ? content.querySelector(`[data-tab="${activeTab}"]`)
      : action === "select-leg"
        ? content.querySelector(`[data-leg="${selectedLeg}"]`)
        : content.querySelector(`[data-action="${action}"]`);
    const heading = document.getElementById("journey-title");
    heading.tabIndex = -1;
    (focusTarget || heading).focus({ preventScroll: true });
    dialog.scrollTop = scrollTop;
  }

  document.addEventListener("click", event => {
    const element = event.target.closest("[data-action], [data-open-service]");
    if (!element) return;
    event.preventDefault();
    try {
      if (element.dataset.openService) {
        requireValue(Object.hasOwn(SERVICES, element.dataset.openService), "Choose a service.");
        openBuilder(element.dataset.openService);
      } else {
        handleAction(element);
      }
    } catch (error) {
      if (!(error instanceof DemoError)) {
        tell("The preview encountered an unexpected error. No booking or payment was sent. Reload to restart the sample.", true);
        console.error(error);
        return;
      }
      tell(error.message, true);
    }
  });

  document.getElementById("quick-booking").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const service = fields.get("service");
    const seed = defaults(service);
    const now = new Date();
    const next = new Date(now.getTime() + 30 * 60000);
    const parts = islandClock(next);
    seed.legs = [{
      label: service === "transfer" ? "Arrival transfer" : "Local ride",
      pickup: fields.get("pickup"), destination: fields.get("destination"), guests: fields.get("guests"),
      date: fields.get("when") === "soon" ? [parts.year, parts.month, parts.day].join("-") : localDate(1),
      time: fields.get("when") === "soon" ? [parts.hour, parts.minute].join(":") : "10:00"
    }];
    openBuilder(service, seed);
  });

  content.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    try {
      if (form.id === "journey-builder") {
        const plan = demo.create(readBuilder());
        selectedLeg = null;
        showPlan(plan);
      } else if (form.id === "message-form") {
        demo.message(currentId, new FormData(form).get("message"));
        renderPlan();
        tell("Sample message added. It has not been delivered to anyone.");
      } else if (form.id === "change-form") {
        const fields = new FormData(form);
        demo.requestChange(currentId, selectedLeg, { date: fields.get("date"), time: fields.get("time") });
        renderPlan();
        tell("Change prepared. Your original pickup stays in place until approval.");
      }
    } catch (error) {
      tell(error instanceof DemoError ? error.message : "The preview could not complete this action. Nothing was sent.", true);
      if (!(error instanceof DemoError)) console.error(error);
    }
  });

  content.addEventListener("change", event => {
    if (event.target.id !== "tour-itinerary") return;
    const form = document.getElementById("journey-builder");
    const routes = {
      scenic: "Mountain Top / Magens Bay / Red Hook",
      east: "Sapphire Beach / Smith Bay / Red Hook",
      custom: ""
    };
    form.elements.namedItem("destination-0").value = routes[event.target.value];
    if (event.target.value === "custom") {
      form.elements.namedItem("destination-0").focus();
      tell("Describe your requested stops. A custom route would need operator review, not instant confirmation.");
    }
  });

  setInterval(() => {
    if (!dialog.open || !currentId || activeTab !== "itinerary" || !content.querySelector("[data-plan-view]") || content.querySelector("#change-form")) return;
    const plan = current();
    if (demo.refresh(plan.id)) {
      const scrollTop = dialog.scrollTop;
      const focused = document.activeElement?.dataset;
      renderPlan();
      const target = focused?.action ? content.querySelector(`[data-action="${focused.action}"]`) : null;
      if (target) target.focus({ preventScroll: true });
      dialog.scrollTop = scrollTop;
      tell(plan.issue?.type === "stale" ? "The sample location is now stale. A fresh update or human confirmation is needed." : "The sample hold expired. Recheck availability before confirming.");
    } else {
      const leg = demo.leg(plan, selectedLeg);
      const label = document.getElementById("tracking-age");
      if (label && leg.updatedAt !== null) {
        const age = Math.max(0, Math.floor((Date.now() - leg.updatedAt) / 60000));
        label.textContent = age >= 10 ? age + " minutes since sample update" : "Sample update " + (age ? age + " min ago" : "just now");
      }
    }
  }, 30000);

  dialog.addEventListener("close", () => {
    tell("");
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  document.getElementById("quick-submit").disabled = false;
  document.getElementById("quick-booking").removeAttribute("inert");
})();
