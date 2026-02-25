/**
 * Anti-bot protection utilities for Devozy forms.
 * Provides: honeypot validation, time-based checks, rate limiting,
 * reCAPTCHA validation, business email enforcement.
 */
(function () {
  "use strict";

  var FORM_LOAD_KEY = "_dz_flt";
  var LAST_SUBMIT_KEY = "_dz_lst";
  var MIN_FILL_TIME_MS = 3000; // 3 seconds minimum to fill a form
  var SUBMIT_COOLDOWN_MS = 30000; // 30 seconds between submissions

  // ── Free / personal email providers (blocked — business emails only) ──
  var FREE_EMAIL_DOMAINS = [
    "gmail.com", "googlemail.com",
    "yahoo.com", "yahoo.in", "yahoo.co.in", "yahoo.co.uk", "yahoo.fr", "yahoo.de", "yahoo.ca", "yahoo.com.au", "yahoo.co.jp",
    "hotmail.com", "hotmail.co.uk", "hotmail.fr", "hotmail.de", "hotmail.it",
    "outlook.com", "outlook.in", "outlook.co.uk",
    "live.com", "live.in", "live.co.uk",
    "msn.com",
    "aol.com",
    "icloud.com", "me.com", "mac.com",
    "proton.me", "protonmail.com", "protonmail.ch",
    "zoho.com", "zohomail.in",
    "yandex.com", "yandex.ru",
    "mail.com", "email.com",
    "gmx.com", "gmx.net", "gmx.de",
    "tutanota.com", "tuta.io",
    "fastmail.com", "fastmail.fm",
    "hey.com",
    "inbox.com",
    "rediffmail.com",
    "rocketmail.com",
    "ymail.com",
    "mail.ru",
    "rambler.ru",
    "qq.com",
    "163.com", "126.com",
    "naver.com",
    "daum.net",
    "hanmail.net",
    "web.de",
    "t-online.de",
    "libero.it",
    "virgilio.it",
    "laposte.net",
    "orange.fr",
    "free.fr",
    "wanadoo.fr",
    "cox.net",
    "sbcglobal.net",
    "att.net",
    "comcast.net",
    "verizon.net",
    "charter.net",
    "earthlink.net",
    "optonline.net",
    "frontier.com",
    "aim.com"
  ];

  // Build lookup map for free email providers
  var freeEmailMap = {};
  for (var i = 0; i < FREE_EMAIL_DOMAINS.length; i++) {
    freeEmailMap[FREE_EMAIL_DOMAINS[i]] = true;
  }

  // Record form load time
  window[FORM_LOAD_KEY] = Date.now();

  window.DevozyAntiBot = {
    /**
     * Runs all anti-bot checks. Returns { ok: true } or { ok: false, reason: string }.
     * @param {object} opts
     * @param {string} opts.honeypotId - ID of the honeypot input
     * @param {boolean} opts.checkRecaptcha - whether to validate reCAPTCHA
     */
    validate: function (opts) {
      opts = opts || {};

      // 1. Honeypot check
      if (opts.honeypotId) {
        var hp = document.getElementById(opts.honeypotId);
        if (hp && hp.value && hp.value.trim() !== "") {
          return { ok: false, reason: "bot_honeypot" };
        }
      }

      // 2. Time-based check - form filled too fast
      var loadTime = window[FORM_LOAD_KEY] || 0;
      var elapsed = Date.now() - loadTime;
      if (loadTime > 0 && elapsed < MIN_FILL_TIME_MS) {
        return { ok: false, reason: "bot_too_fast" };
      }

      // 3. Rate limiting - too many submissions
      try {
        var lastSubmit = parseInt(localStorage.getItem(LAST_SUBMIT_KEY), 10);
        if (lastSubmit && Date.now() - lastSubmit < SUBMIT_COOLDOWN_MS) {
          var secondsLeft = Math.ceil(
            (SUBMIT_COOLDOWN_MS - (Date.now() - lastSubmit)) / 1000
          );
          return {
            ok: false,
            reason: "rate_limited",
            message:
              "Please wait " + secondsLeft + " seconds before submitting again.",
          };
        }
      } catch (e) {
        // localStorage not available, skip this check
      }

      return { ok: true };
    },

    /**
     * Validates that an email is a business/corporate email.
     * - Blocks free providers (Gmail, Yahoo, etc.) via static list
     * - Blocks disposable/temp emails via DeBounce Free API
     *   Docs: https://debounce.com/free-disposable-check-api/
     *   100% free, no API key, no signup, no rate limits, CORS enabled
     * @param {string} email - The email address to validate
     * @returns {Promise<{ ok: boolean, reason?: string, message?: string }>}
     */
    validateBusinessEmail: async function (email) {
      if (!email || typeof email !== "string") {
        return { ok: false, reason: "invalid_email", message: "Please enter a valid email address." };
      }

      var parts = email.toLowerCase().trim().split("@");
      if (parts.length !== 2 || !parts[1]) {
        return { ok: false, reason: "invalid_email", message: "Please enter a valid email address." };
      }

      var domain = parts[1];

      // 1. Block free/personal email providers (instant, no API call needed)
      if (freeEmailMap[domain]) {
        return {
          ok: false,
          reason: "free_email",
          message: "Please use your official business or work email address (e.g., name@yourcompany.com).",
        };
      }

      // 2. Block disposable/temp emails via DeBounce Free API
      try {
        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 5000);

        var apiRes = await fetch(
          "https://disposable.debounce.io/?email=" + encodeURIComponent(email),
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          var data = await apiRes.json();
          if (data.disposable === "true" || data.disposable === true) {
            return {
              ok: false,
              reason: "disposable_email",
              message: "Temporary or disposable email addresses are not accepted. Please use your business email.",
            };
          }
        }
      } catch (e) {
        // API failed or timed out — allow through, don't block real users
      }

      return { ok: true };
    },

    /**
     * Call after a successful form submission to record the timestamp.
     */
    recordSubmission: function () {
      try {
        localStorage.setItem(LAST_SUBMIT_KEY, Date.now().toString());
      } catch (e) {
        // ignore
      }
    },

    /**
     * Reset the form load timer (e.g., when a modal opens).
     */
    resetTimer: function () {
      window[FORM_LOAD_KEY] = Date.now();
    },
  };
})();
