(function () {
  "use strict";

  var I18N = {
    ko: {
      tagline: "모든 기도제목을, 가장 단정하게.",
      subline: "이름을 적고, 기도제목을 적고, 복사하면 끝.",
      date: "날짜",
      title: "제목",
      no: "번호",
      name: "이름",
      request: "기도제목",
      add: "인원 추가",
      submit: "만들기",
      output: "결과",
      copy: "복사",
      pdf: "PDF로 저장",
      image: "이미지로 저장",
      remove: "삭제",
      noteTitle: "안내 문구",
      note: "오늘 못 오신 분들도 기도제목 있으시면 여기에 남겨주세요!\nPlease leave your prayer request here if you weren\u2019t here today!\n(수정해야할 부분 있으면 알려주세요…)",
      pdfName: "기도제목",
      dragHandle: "끌어서 순서 변경",
      phName: "홍길동",
      phRequest: "기도제목을 입력하세요",
      phTitle: "예: 청년부 (선택)",
      copied: "복사했습니다",
      needBoth: "이름과 기도제목을 모두 입력해주세요",
      needOne: "최소 한 명을 입력해주세요",
      copyFail: "복사에 실패했어요. 직접 선택해서 복사해주세요",
      imageFail: "이미지를 만들지 못했어요",
      imageCount: "기도제목이 길어서 이미지 {n}장으로 나눴어요"
    },
    en: {
      tagline: "Every prayer request. Beautifully in line.",
      subline: "Write a name. Write a prayer. Copy it. Done.",
      date: "Date",
      title: "Title",
      no: "No.",
      name: "Name",
      request: "Prayer Request",
      add: "Add Person",
      submit: "Submit",
      output: "Output",
      copy: "Copy",
      pdf: "Save as PDF",
      image: "Save as Image",
      remove: "Remove",
      noteTitle: "Invitation Note",
      note: "Please leave your prayer request here if you weren\u2019t here today!\n(Let me know if anything needs to be fixed…)",
      pdfName: "Prayer Request",
      dragHandle: "Drag to reorder",
      phName: "John Doe",
      phRequest: "Write the prayer request",
      phTitle: "e.g. Youth Group (optional)",
      copied: "Copied",
      needBoth: "Fill in both the name and the prayer request",
      needOne: "Add at least one person",
      copyFail: "Copy failed — select the text manually",
      imageFail: "Could not create the image",
      imageCount: "The list was long, so it was split into {n} images"
    }
  };

  var peopleEl = document.getElementById("people");
  var template = document.getElementById("personTemplate");
  var addBtn = document.getElementById("addBtn");
  var submitBtn = document.getElementById("submitBtn");
  var copyBtn = document.getElementById("copyBtn");
  var pdfBtn = document.getElementById("pdfBtn");
  var imgBtn = document.getElementById("imgBtn");
  var noteEl = document.getElementById("noteText");
  var noteCopyBtn = document.getElementById("noteCopyBtn");
  var outputCard = document.getElementById("outputCard");
  var outputEl = document.getElementById("output");
  var dateInput = document.getElementById("dateInput");
  var titleInput = document.getElementById("titleInput");
  var toastEl = document.getElementById("toast");
  var langBtns = document.querySelectorAll(".lang-btn");

  var lang = "ko";
  var lastEntries = [];
  var fontsReady = !(document.fonts && document.fonts.ready);
  if (!fontsReady) {
    document.fonts.ready.then(function () { fontsReady = true; });
  }
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

  // en: <Youth Group Prayer Request 8/16/26>   ko: <2026-08-16 청년부 기도제목>
  // the title is optional; without it the header keeps its original shape
  function buildHeader() {
    var date = formatDate(dateInput.value || todayValue());
    var title = titleInput.value.trim().replace(/\s+/g, " ");
    if (lang === "ko") {
      return "<" + date + (title ? " " + title : "") + " 기도제목>";
    }
    return "<" + (title ? title + " " : "") + "Prayer Request " + date + ">";
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

    var handle = row.querySelector(".drag-handle");
    handle.setAttribute("aria-label", t("dragHandle"));
    handle.addEventListener("pointerdown", startDrag);
    handle.addEventListener("keydown", handleKeys);
    row.querySelectorAll("[data-label-key]").forEach(function (td) {
      td.setAttribute("data-label", t(td.dataset.labelKey));
    });

    peopleEl.appendChild(node);
    renumber();
    if (focus) peopleEl.lastElementChild.querySelector(".name").focus();
  }

  /* ---------- reorder (drag + keyboard) ---------- */

  var drag = null;

  function rowAt(y) {
    var rows = peopleEl.querySelectorAll(".person");
    for (var i = 0; i < rows.length; i++) {
      var box = rows[i].getBoundingClientRect();
      if (y >= box.top && y <= box.bottom) return rows[i];
    }
    return null;
  }

  function startDrag(e) {
    if (e.button > 0) return;
    if (peopleEl.querySelectorAll(".person").length < 2) return;

    var handle = e.currentTarget;
    var row = handle.closest(".person");

    drag = { row: row, handle: handle, pointerId: e.pointerId };
    handle.setPointerCapture(e.pointerId);
    row.classList.add("dragging");
    document.body.classList.add("dragging-row");

    handle.addEventListener("pointermove", moveDrag);
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
    e.preventDefault();
  }

  function moveDrag(e) {
    if (!drag) return;
    var over = rowAt(e.clientY);
    if (!over || over === drag.row) return;

    var box = over.getBoundingClientRect();
    var before = e.clientY < box.top + box.height / 2;
    peopleEl.insertBefore(drag.row, before ? over : over.nextSibling);
    renumber();
  }

  function endDrag() {
    if (!drag) return;
    drag.handle.removeEventListener("pointermove", moveDrag);
    drag.handle.removeEventListener("pointerup", endDrag);
    drag.handle.removeEventListener("pointercancel", endDrag);
    drag.row.classList.remove("dragging");
    document.body.classList.remove("dragging-row");
    drag = null;
  }

  // the handle is focusable, so arrow keys move the row too
  function handleKeys(e) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    var handle = e.currentTarget;
    var row = handle.closest(".person");

    if (e.key === "ArrowUp" && row.previousElementSibling) {
      peopleEl.insertBefore(row, row.previousElementSibling);
    } else if (e.key === "ArrowDown" && row.nextElementSibling) {
      peopleEl.insertBefore(row.nextElementSibling, row);
    } else {
      return;
    }
    e.preventDefault();
    renumber();
    handle.focus();
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
      if (name && request) entries.push({ name: name, request: request });
    });

    if (hasError) { if (!silent) showToast(t("needBoth")); return null; }
    if (!entries.length) { if (!silent) showToast(t("needOne")); return null; }

    var bullets = entries.map(function (e) { return "• " + e.name + ": " + e.request; });
    lastEntries = entries;
    return buildHeader() + "\n\n" + bullets.join("\n\n");
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

  /* ---------- share image ---------- */

  // 1080x1920 is 9:16 — the ratio every phone screen and messenger/story
  // viewer handles without cropping. A list too long for one frame is split
  // into several 9:16 pages rather than one tall image that messengers would
  // shrink until it is unreadable.
  var IMG = {
    width: 1080,
    height: 1920,
    pad: 90,
    indent: 40,
    footer: 90,
    maxFont: 42,
    minFont: 34,   // floor while trying to keep everything on one page
    pageFont: 38,  // comfortable size once we accept multiple pages
    family: 'Inter, "Noto Sans KR", -apple-system, sans-serif'
  };

  // Split into wrap units: whole words for Latin, single characters for CJK,
  // which is how Korean has to break since it is written without spaces.
  function tokenize(text) {
    var tokens = [];
    var buf = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (/\s/.test(ch)) {
        if (buf) { tokens.push(buf); buf = ""; }
        tokens.push(" ");
      } else if (/[ᄀ-ᇿ぀-ヿ㄰-㆏㐀-䶿一-鿿가-힯]/.test(ch)) {
        if (buf) { tokens.push(buf); buf = ""; }
        tokens.push(ch);
      } else {
        buf += ch;
      }
    }
    if (buf) tokens.push(buf);
    return tokens;
  }

  function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var line = "";
    tokenize(text).forEach(function (token) {
      if (token === " " && line === "") return; // no leading space on a new line
      var next = line + token;
      if (line !== "" && ctx.measureText(next).width > maxWidth) {
        lines.push(line.replace(/\s+$/, ""));
        line = token === " " ? "" : token;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  // Measure the header and every entry once at a given body size.
  function measure(ctx, header, entries, size) {
    var textWidth = IMG.width - IMG.pad * 2;
    var headerSize = Math.round(size * 1.25);
    var lineHeight = Math.round(size * 1.55);
    var gap = Math.round(size * 0.95);

    ctx.font = "700 " + headerSize + "px " + IMG.family;
    var headerLines = wrapText(ctx, header, textWidth);
    var headerHeight = headerLines.length * Math.round(headerSize * 1.35) + Math.round(size * 1.9);

    ctx.font = "400 " + size + "px " + IMG.family;
    var blocks = entries.map(function (entry) {
      var lines = wrapText(ctx, entry.name + ": " + entry.request, textWidth - IMG.indent);
      return { lines: lines, height: lines.length * lineHeight };
    });

    return {
      size: size,
      headerSize: headerSize,
      headerLines: headerLines,
      headerHeight: headerHeight,
      lineHeight: lineHeight,
      gap: gap,
      blocks: blocks,
      total: headerHeight + blocks.reduce(function (sum, b, i) {
        return sum + b.height + (i < blocks.length - 1 ? gap : 0);
      }, 0)
    };
  }

  // Greedy fill: an entry never straddles a page break.
  function paginate(plan, bodyHeight) {
    var pages = [];
    var page = [];
    var used = plan.headerHeight;

    plan.blocks.forEach(function (block) {
      var needed = block.height + (page.length ? plan.gap : 0);
      if (page.length && used + needed > bodyHeight) {
        pages.push(page);
        page = [];
        used = plan.headerHeight;
        needed = block.height;
      }
      page.push(block);
      used += needed;
    });

    if (page.length) pages.push(page);
    return pages;
  }

  function drawPage(plan, blocks, pageNo, pageCount) {
    var canvas = document.createElement("canvas");
    var bodyHeight = plan.headerHeight + blocks.reduce(function (sum, b, i) {
      return sum + b.height + (i < blocks.length - 1 ? plan.gap : 0);
    }, 0);

    canvas.width = IMG.width;
    // Only a single entry taller than a whole frame can push a page past 9:16.
    canvas.height = Math.max(IMG.height, bodyHeight + IMG.pad * 2 + IMG.footer);

    var ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var y = IMG.pad;

    ctx.fillStyle = "#000000";
    ctx.font = "700 " + plan.headerSize + "px " + IMG.family;
    plan.headerLines.forEach(function (line) {
      ctx.fillText(line, IMG.pad, y);
      y += Math.round(plan.headerSize * 1.35);
    });

    ctx.fillStyle = "#e4002b";
    ctx.fillRect(IMG.pad, y + Math.round(plan.size * 0.5), 96, 6);
    y += Math.round(plan.size * 1.9);

    blocks.forEach(function (block, i) {
      ctx.fillStyle = "#e4002b";
      ctx.font = "400 " + plan.size + "px " + IMG.family;
      ctx.fillText("•", IMG.pad, y);

      ctx.fillStyle = "#000000";
      block.lines.forEach(function (line) {
        ctx.fillText(line, IMG.pad + IMG.indent, y);
        y += plan.lineHeight;
      });
      if (i < blocks.length - 1) y += plan.gap;
    });

    ctx.fillStyle = "#b5b7b4";
    ctx.font = "500 26px " + IMG.family;
    ctx.fillText("Neat Prayer", IMG.pad, canvas.height - IMG.pad - 26);

    if (pageCount > 1) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#575a5d";
      ctx.fillText(pageNo + " / " + pageCount, IMG.width - IMG.pad, canvas.height - IMG.pad - 26);
      ctx.textAlign = "left";
    }

    return canvas;
  }

  function renderPages(header, entries) {
    var ctx = document.createElement("canvas").getContext("2d");
    var bodyHeight = IMG.height - IMG.pad * 2 - IMG.footer;

    // Prefer one page: shrink the type toward minFont to make it fit.
    var plan = measure(ctx, header, entries, IMG.maxFont);
    for (var size = IMG.maxFont; plan.total > bodyHeight && size > IMG.minFont; size -= 2) {
      plan = measure(ctx, header, entries, size - 2);
    }
    // Still too long: stop shrinking, go back to a comfortable size, split.
    if (plan.total > bodyHeight) plan = measure(ctx, header, entries, IMG.pageFont);

    var pages = paginate(plan, bodyHeight);
    return pages.map(function (blocks, i) {
      return drawPage(plan, blocks, i + 1, pages.length);
    });
  }

  // toDataURL is synchronous, unlike toBlob. That matters: iOS Safari only
  // allows navigator.share() during a user gesture, and an awaited callback
  // no longer counts as one.
  function canvasToBlob(canvas) {
    var dataURL = canvas.toDataURL("image/png");
    var binary = atob(dataURL.split(",")[1]);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: "image/png" });
  }

  function pageName(baseName, i, count) {
    return count === 1 ? baseName + ".png" : baseName + " (" + (i + 1) + ").png";
  }

  // On a phone the share sheet is the only route into Photos or KakaoTalk;
  // a plain download drops the file into Files, where nobody looks for it.
  function shareOrSave(canvases, baseName) {
    var files;
    try {
      files = canvases.map(function (canvas, i) {
        return new File([canvasToBlob(canvas)], pageName(baseName, i, canvases.length), {
          type: "image/png"
        });
      });
    } catch (e) {
      saveCanvases(canvases, baseName);
      return;
    }

    if (navigator.canShare && navigator.canShare({ files: files })) {
      navigator.share({ files: files }).catch(function (err) {
        if (err && err.name === "AbortError") return; // the user closed the sheet
        saveCanvases(canvases, baseName);
      });
      return;
    }

    saveCanvases(canvases, baseName);
  }

  function saveCanvas(canvas, filename) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        if (!blob) { resolve(false); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        if ("download" in a) {
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(url, "_blank"); // iOS Safari: opens it to long-press save
        }
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve(true);
      }, "image/png");
    });
  }

  // Browsers rate-limit bursts of downloads, so space them out.
  function saveCanvases(canvases, baseName) {
    canvases.forEach(function (canvas, i) {
      var name = pageName(baseName, i, canvases.length);
      setTimeout(function () { saveCanvas(canvas, name); }, i * 600);
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

  imgBtn.addEventListener("click", function () {
    var text = buildOutput();
    if (text === null) return;
    outputEl.textContent = text;

    var name = t("pdfName") + " " + (dateInput.value || todayValue());

    function run() {
      try {
        var pages = renderPages(buildHeader(), lastEntries);
        if (pages.length > 1) showToast(t("imageCount").replace("{n}", pages.length));
        shareOrSave(pages, name);
      } catch (e) {
        showToast(t("imageFail"));
      }
    }

    // Fonts are normally in long before anyone submits, so this runs inline and
    // keeps the gesture alive for the share sheet. Only a very early tap waits,
    // and that path just downloads instead.
    if (fontsReady) run();
    else document.fonts.ready.then(run);
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

  applyLang("ko");
  dateInput.value = todayValue();
  addPerson(false);
})();
