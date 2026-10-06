// storage.js — ڈیٹا کو books_data.js اور issued_data.js فائلوں میں محفوظ کرنے کا نظام
// (Chrome / Edge میں فولڈر جوڑنے کے بعد ہر تبدیلی خودکار طور پر ان فائلوں میں لکھی جاتی ہے)

const DataStore = (() => {
    const DB_NAME = "library_fs";
    const STORE = "handles";
    const KEY = "dataDir";
    const supported = typeof window.showDirectoryPicker === "function";

    let dirHandle = null;   // وہ فولڈر جس میں فائلیں لکھی جائیں گی (جس میں index.html ہے)
    let stored = null;      // پچھلی بار کا محفوظ شدہ فولڈر
    let timer = null;
    let chain = Promise.resolve();

    // ---------- IndexedDB (فولڈر کا حوالہ یاد رکھنے کے لیے) ----------
    function openDb() {
        return new Promise((resolve, reject) => {
            const r = indexedDB.open(DB_NAME, 1);
            r.onupgradeneeded = () => r.result.createObjectStore(STORE);
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
        });
    }
    async function idbGet() {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const q = db.transaction(STORE).objectStore(STORE).get(KEY);
            q.onsuccess = () => resolve(q.result || null);
            q.onerror = () => reject(q.error);
        });
    }
    async function idbSet(value) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, "readwrite");
            tx.objectStore(STORE).put(value, KEY);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    // ---------- اسٹیٹس بٹن ----------
    function setStatus(state) {
        const dot = document.getElementById("syncDot");
        const txt = document.getElementById("syncText");
        const btn = document.getElementById("syncBtn");
        if (!dot || !txt) return;
        const map = {
            ok:          ["#4ade80", "فائلوں میں محفوظ"],
            warn:        ["#facc15", "فولڈر جوڑیں"],
            err:         ["#f87171", "فائل میں محفوظ نہ ہو سکا"],
            unsupported: ["#cbd5e1", "صرف براؤزر میں محفوظ"],
        };
        const [color, text] = map[state] || map.unsupported;
        dot.style.background = color;
        txt.innerText = text;
        if (btn) btn.title = state === "ok"
            ? "ڈیٹا books_data.js اور issued_data.js میں خودکار محفوظ ہو رہا ہے (فولڈر تبدیل کرنے کے لیے کلک کریں)"
            : "ایپ کا فولڈر جوڑیں تاکہ ڈیٹا فائلوں میں محفوظ ہو";
    }

    // ---------- فائلوں کا متن ----------
    function booksText() {
        const ts = parseInt(localStorage.getItem("library_books_ts")) || Date.now();
        return "// books_data.js\n// یہ فائل ایپ خود محفوظ کرتی ہے — اسے ہاتھ سے ایڈٹ نہ کریں\n" +
            "const defaultBooks = " + JSON.stringify(books, null, 4) + ";\n" +
            "const defaultBooksSavedAt = " + ts + ";\n";
    }
    function issuedText() {
        const ts = parseInt(localStorage.getItem("library_issued_ts")) || Date.now();
        return "// issued_data.js\n// یہ فائل ایپ خود محفوظ کرتی ہے — اسے ہاتھ سے ایڈٹ نہ کریں\n" +
            "const defaultIssued = " + JSON.stringify(issuedBooks, null, 4) + ";\n" +
            "const defaultIssuedSavedAt = " + ts + ";\n";
    }

    async function writeFile(name, text) {
        const fh = await dirHandle.getFileHandle(name, { create: true });
        const w = await fh.createWritable();
        await w.write(text);
        await w.close();
    }

    async function writeAll() {
        if (!dirHandle) return;
        try {
            await writeFile("books_data.js", booksText());
            await writeFile("issued_data.js", issuedText());
            setStatus("ok");
        } catch (e) {
            console.error("فائل لکھنے میں مسئلہ:", e);
            setStatus(e.name === "NotAllowedError" ? "warn" : "err");
        }
    }

    // ہر save کے بعد یہ فنکشن بلایا جاتا ہے
    function queueWrite() {
        if (!supported) return;
        clearTimeout(timer);
        timer = setTimeout(() => { chain = chain.then(writeAll); }, 300);
    }

    // ---------- شروع میں پچھلا فولڈر بحال کرنا ----------
    async function init() {
        if (!supported) { setStatus("unsupported"); return; }
        try { stored = await idbGet(); } catch (e) { stored = null; }
        if (!stored) { setStatus("warn"); return; }
        try {
            const perm = await stored.queryPermission({ mode: "readwrite" });
            if (perm === "granted") {
                dirHandle = stored;
                await writeAll();
            } else {
                setStatus("warn"); // براؤزر دوبارہ کھلنے پر ایک کلک سے اجازت دینی ہوگی
            }
        } catch (e) { setStatus("warn"); }
    }

    // ---------- فولڈر جوڑنے کا بٹن ----------
    async function pickFolder() {
        const h = await window.showDirectoryPicker({ mode: "readwrite", id: "library-data" });
        try {
            await h.getFileHandle("index.html");
        } catch (e) {
            if (!confirm("اس فولڈر میں index.html نہیں ملی۔\nکیا پھر بھی یہی فولڈر استعمال کرنا ہے؟")) return false;
        }
        dirHandle = h;
        stored = h;
        await idbSet(h);
        return true;
    }

    async function link() {
        if (!supported) {
            alert("اس براؤزر میں فولڈر میں براہ راست محفوظ کرنے کی سہولت نہیں ہے۔\nبراہ کرم Google Chrome یا Microsoft Edge استعمال کریں، یا 'ڈیٹا فائلیں ڈاؤنلوڈ کریں' کا بٹن دبائیں۔");
            return;
        }
        try {
            if (dirHandle) {
                // پہلے سے جڑا ہوا ہے — صرف فولڈر بدلنے کی پیشکش
                if (!confirm("ڈیٹا پہلے سے فائلوں میں محفوظ ہو رہا ہے۔\nکیا آپ دوسرا فولڈر منتخب کرنا چاہتے ہیں؟")) return;
                if (!(await pickFolder())) return;
            } else if (stored && (await stored.requestPermission({ mode: "readwrite" })) === "granted") {
                dirHandle = stored;
            } else {
                if (!(await pickFolder())) return;
            }
            await writeAll();
            if (dirHandle) alert("فولڈر جڑ گیا۔ اب ہر تبدیلی books_data.js اور issued_data.js میں خودکار محفوظ ہوگی۔");
        } catch (e) {
            if (e.name !== "AbortError") {
                console.error(e);
                alert("فولڈر جوڑنے میں مسئلہ آیا: " + e.message);
            }
        }
    }

    // ---------- دستی ڈاؤنلوڈ (ہر براؤزر میں کام کرتا ہے) ----------
    function download(name, text) {
        const blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    function downloadFiles() {
        download("books_data.js", booksText());
        setTimeout(() => download("issued_data.js", issuedText()), 400);
    }

    return { init, link, queueWrite, downloadFiles };
})();
