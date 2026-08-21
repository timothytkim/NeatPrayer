(function () {
  "use strict";

  var I18N = {
    ko: {
      tagline: "모든 기도제목을, 가장 단정하게.",
      subline: "이름을 적고, 기도제목을 적고, 복사하면 끝.",
      date: "날짜",
      no: "번호",
      name: "이름",
      request: "기도제목",
      add: "인원 추가",
      submit: "만들기",
      output: "결과",
      copy: "복사",
      pdf: "PDF로 저장",
      remove: "삭제",
      noteTitle: "안내 문구",
      note: "오늘 못 오신 분들도 기도제목 있으시면 여기에 남겨주세요!\nPlease leave your prayer request here if you weren\u2019t here today!\n(수정해야할 부분 있으면 알려주세요…)",
      pdfName: "기도제목",
      phName: "홍길동",
      phRequest: "기도제목을 입력하세요",
      copied: "복사했습니다",
      needBoth: "이름과 기도제목을 모두 입력해주세요",
      needOne: "최소 한 명을 입력해주세요",
      copyFail: "복사에 실패했어요. 직접 선택해서 복사해주세요"
    },
    en: {
      tagline: "Every prayer request. Beautifully in line.",
      subline: "Write a name. Write a prayer. Copy it. Done.",
      date: "Date",
      no: "No.",
      name: "Name",
      request: "Prayer Request",
      add: "Add Person",
      submit: "Submit",
      output: "Output",
      copy: "Copy",
      pdf: "Save as PDF",
      remove: "Remove",
      noteTitle: "Invitation Note",
      note: "Please leave your prayer request here if you weren\u2019t here today!\n(Let me know if anything needs to be fixed…)",
      pdfName: "Prayer Request",
      phName: "John Doe",
      phRequest: "Write the prayer request",
      copied: "Copied",
      needBoth: "Fill in both the name and the prayer request",
      needOne: "Add at least one person",
      copyFail: "Copy failed — select the text manually"
    }
  };

  var peopleEl = document.getElementById("people");
  var template = document.getElementById("personTemplate");
  var addBtn = document.getElementById("addBtn");
  var submitBtn = document.getElementById("submitBtn");
  var copyBtn = document.getElementById("copyBtn");
  var pdfBtn = document.getElementById("pdfBtn");
  var noteEl = document.getElementById("noteText");
  var noteCopyBtn = document.getElementById("noteCopyBtn");
  var outputCard = document.getElementById("outputCard");
  var outputEl = document.getElementById("output");
  var dateInput = document.getElementById("dateInput");
  var toastEl = document.getElementById("toast");
  var langBtns = document.querySelectorAll(".lang-btn");

  var lang = "en";
  function t(key) { return I18N[lang][key]; }

  /* ---------- language ---------- */

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-ph]").forEach(function (el) {
      el.placeholder = t(el.dataset.ph);
    });
    document.querySelectorAll("[data-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.dataset.aria));
    });
    document.querySelectorAll("[data-label-key]").forEach(function (el) {
      el.setAttribute("data-label", t(el.dataset.labelKey));
    });
    langBtns.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === next));
    });
    document.title = "Neat Prayer";
    noteEl.textContent = t("note");

    if (!outputCard.hidden) {
      var text = buildOutput(true);
      if (text !== null) outputEl.textContent = text;
    }
  }

  /* ---------- date ---------- */

  // en: "2026-08-16" -> "8/16/26"   ko: "2026-08-16" -> "2026-08-16"
  function formatDate(value) {
    var parts = value.split("-");
    if (lang === "ko") return parts[0] + "-" + parts[1] + "-" + parts[2];
    return Number(parts[1]) + "/" + Number(parts[2]) + "/" + parts[0].slice(2);
  }

  // en: <Prayer Request 8/16/26>   ko: <2026-08-16 기도제목>
  function buildHeader() {
    var date = formatDate(dateInput.value || todayValue());
    return lang === "ko"
      ? "<" + date + " 기도제목>"
      : "<Prayer Request " + date + ">";
  }

  function todayValue() {
    var now = new Date();
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + m + "-" + d;
  }

  /* ---------- rows ---------- */

  function renumber() {
    var rows = peopleEl.querySelectorAll(".person");
    rows.forEach(function (row, i) {
      row.querySelector(".person-index").textContent = String(i + 1);
      row.querySelector(".remove").disabled = rows.length === 1;
    });
  }

  function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function addPerson(focus) {
    var node = template.content.cloneNode(true);
    var row = node.querySelector(".person");

    row.querySelector(".remove").addEventListener("click", function () {
      row.remove();
      renumber();
    });

    row.querySelectorAll("input, textarea").forEach(function (field) {
      field.placeholder = t(field.dataset.ph);
      field.addEventListener("input", function () {
        field.closest("td").classList.remove("invalid-cell");
        if (field.tagName === "TEXTAREA") autoGrow(field);
      });
    });
    row.querySelector(".remove").setAttribute("aria-label", t("remove"));
    row.querySelectorAll("[data-label-key]").forEach(function (td) {
      td.setAttribute("data-label", t(td.dataset.labelKey));
    });

    peopleEl.appendChild(node);
    renumber();
    if (focus) peopleEl.lastElementChild.querySelector(".name").focus();
  }

  /* ---------- output ---------- */

  function buildOutput(silent) {
    var rows = Array.prototype.slice.call(peopleEl.querySelectorAll(".person"));
    var entries = [];
    var hasError = false;

    rows.forEach(function (row) {
      var nameField = row.querySelector(".name");
      var requestField = row.querySelector(".request");
      var name = nameField.value.trim().replace(/[:：]\s*$/, "");
      var request = requestField.value.trim().replace(/\s*\n\s*/g, " ");

      if (!name && !request) return; // skip blank rows

      if (!name) { nameField.closest("td").classList.add("invalid-cell"); hasError = true; }
      if (!request) { requestField.closest("td").classList.add("invalid-cell"); hasError = true; }
      if (name && request) entries.push("• " + name + ": " + request);
    });

    if (hasError) { if (!silent) showToast(t("needBoth")); return null; }
    if (!entries.length) { if (!silent) showToast(t("needOne")); return null; }

    return buildHeader() + "\n\n" + entries.join("\n\n");
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1900);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  /* ---------- events ---------- */

  langBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { applyLang(btn.dataset.lang); });
  });

  addBtn.addEventListener("click", function () { addPerson(true); });

  submitBtn.addEventListener("click", function () {
    var text = buildOutput();
    if (text === null) return;
    outputEl.textContent = text;
    outputCard.hidden = false;
    outputCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  copyBtn.addEventListener("click", function () {
    copyText(outputEl.textContent).then(
      function () { showToast(t("copied")); },
      function () { showToast(t("copyFail")); }
    );
  });

  noteCopyBtn.addEventListener("click", function () {
    copyText(noteEl.textContent).then(
      function () { showToast(t("copied")); },
      function () { showToast(t("copyFail")); }
    );
  });

  // The browser's print dialog handles "Save as PDF" — it already renders
  // Hangul correctly, and document.title becomes the default file name.
  pdfBtn.addEventListener("click", function () {
    var restore = document.title;
    document.title = t("pdfName") + " " + (dateInput.value || todayValue());
    window.print();
    setTimeout(function () { document.title = restore; }, 500);
  });

  /* ---------- init ---------- */

  applyLang("en");
  dateInput.value = todayValue();
  addPerson(false);
})();
