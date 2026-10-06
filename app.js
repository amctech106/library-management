// app.js
// تمام فنکشنز اور لاجک

let books = [];
let issuedBooks = [];
let currentCategory = "All";

// Initialize App
function initApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load from LocalStorage or use default files

// Load books from books_data.js

// Load books from books_data.js
// Load books from books_data.js
if (typeof defaultBooks !== "undefined" && Array.isArray(defaultBooks)) {
    books = defaultBooks;
} else {
    console.error("defaultBooks نہیں ملا۔ books_data.js صحیح طرح load نہیں ہوئی۔");
    books = [];
}

// Load issued books from LocalStorage
const storedIssued = localStorage.getItem("library_issued");

if (storedIssued) {
    issuedBooks = JSON.parse(storedIssued);
} else {
    if (typeof defaultIssued !== 'undefined') {
        issuedBooks = defaultIssued;
    }

    saveIssuedToLocalStorage();
}

renderBooks();
renderIssuedBooks();
updateStats();

}


// Navigation
function showPage(pageId) {
    document.getElementById("mainPage").classList.add("hidden");
    document.getElementById("booksPage").classList.add("hidden");
    document.getElementById("issuedPage").classList.add("hidden");

    // Slight fade effect
    const target = document.getElementById(pageId);
    target.classList.remove("hidden");
    target.style.opacity = 0;
    setTimeout(() => (target.style.opacity = 1), 50);
}

// Date & Time Formatting matches screenshot roughly
function updateDateTime() {
    const now = new Date();
    const days = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];
    const months = [
        "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون", 
        "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر"
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? "شام" : "صبح";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    const timeString = `${ampm} ${hours}:${minutes}:${seconds}`;
    const dateString = `${dayName}, ${day} ${month} ${year}, ${timeString}`;

    document.getElementById("dateTimeDisplay").innerText = dateString;
}

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem("library_books", JSON.stringify(books));
}
function saveIssuedToLocalStorage() {
    localStorage.setItem("library_issued", JSON.stringify(issuedBooks));
}

// نیا فنکشن: سب کو ایک ساتھ سلیکٹ یا ڈی سلیکٹ کرنے کے لیے
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('input[name="bookSelect"]');
    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });
}

// نیا فنکشن: منتخب شدہ تمام کتابوں کی IDs حاصل کرنے کے لیے
function getSelectedBookIds() {
    const checkboxes = document.querySelectorAll('input[name="bookSelect"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// Render Books Table (Updated with Checkboxes)
function renderBooks() {
    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = "";

    let filtered = books;
    if (currentCategory !== "All") {
        filtered = books.filter((b) => b.subject === currentCategory);
    }

    filtered.forEach((book, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="print:hidden text-center"><input type="checkbox" name="bookSelect" value="${book.id}" class="w-4 h-4 text-blue-600 cursor-pointer"></td>
            <td class="text-center font-sans">${index + 1}</td>
            <td class="font-bold text-[#1e40af]">${book.title}</td>
            <td>${book.author}</td>
            <td>${book.publisher || "-"}</td>
            <td class="text-center font-sans">${book.vols || 1}</td>
            <td class="text-center font-sans text-red-500">${book.missingVols || "-"}</td>
            <td class="text-center font-sans bg-gray-50">${book.shelfNo || "-"}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("footerTotalBooks").innerText = filtered.length;

    // Update category list dynamically
    updateCategorySidebar();
}

// Stats for Main Page
function updateStats() {
    document.getElementById("statTotalBooks").innerText = books.length;
    const authors = new Set(books.map((b) => b.author));
    document.getElementById("statTotalAuthors").innerText = authors.size;
}

function updateCategorySidebar() {
    const list = document.getElementById("categoryList");
    const categories = ["All", ...new Set(books.map((b) => b.subject))];

    list.innerHTML = "";
    categories.forEach((cat) => {
        const li = document.createElement("li");
        li.className = `cursor-pointer p-2 rounded transition flex items-center gap-2 ${currentCategory === cat ? "bg-blue-100 text-[#1e40af] font-bold" : "hover:bg-gray-100 hover:text-blue-600"}`;
        li.onclick = () => filterByCategory(cat);
        let icon = '<i class="fas fa-folder text-yellow-500"></i>';
        li.innerHTML = `${icon} ${cat === "All" ? "تمام کتابیں" : cat}`;
        list.appendChild(li);
    });
}

function filterByCategory(cat) {
    currentCategory = cat;
    
    // جب کیٹیگری تبدیل ہو تو سلیکٹ آل والا چیک باکس خالی کر دیں
    const selectAll = document.getElementById('selectAllCheckbox');
    if(selectAll) selectAll.checked = false;
    
    renderBooks();
}

// موجودہ کیٹیگریز کو فارم کے ڈراپ ڈاؤن میں دکھانے کے لیے
function populateCategoryDropdown() {
    const select = document.getElementById("bCategorySelect");
    if(!select) return; 
    
    const categories = [...new Set(books.map((b) => b.subject))];
    select.innerHTML = '';
    
    categories.forEach(cat => {
        if (cat) { 
            const option = document.createElement("option");
            option.value = cat;
            option.innerText = cat;
            select.appendChild(option);
        }
    });
    
    const otherOption = document.createElement("option");
    otherOption.value = "other";
    otherOption.innerText = "نیا مضمون شامل کریں...";
    select.appendChild(otherOption);
}

// Modal Actions
function openBookModal(isEdit = false) {
    document.getElementById("bookModal").classList.remove("hidden");
    populateCategoryDropdown(); // Ensure dropdown is populated before opening
    if (!isEdit) {
        document.getElementById("bookForm").reset();
        document.getElementById("bookId").value = "";
        document.getElementById("bookModalTitle").innerText = "نئی کتاب شامل کریں";
        checkCustomCategory();
    }
}

function closeBookModal() {
    document.getElementById("bookModal").classList.add("hidden");
}

function checkCustomCategory() {
    const select = document.getElementById("bCategorySelect");
    const input = document.getElementById("bCategoryInput");
    if (select.value === "other") {
        input.classList.remove("hidden");
    } else {
        input.classList.add("hidden");
    }
}

function saveBookData() {
    const id = document.getElementById("bookId").value;
    const title = document.getElementById("bTitle").value;
    const author = document.getElementById("bAuthor").value;
    const vols = document.getElementById("bVols").value;
    const missingVols = document.getElementById("bMissingVols").value;
    const publisher = document.getElementById("bPublisher").value;
    const shelfNo = document.getElementById("bShelf").value;

    let subject = document.getElementById("bCategorySelect").value;
    if (subject === "other") {
        subject = document.getElementById("bCategoryInput").value;
    }

    if (!title || !author) {
        alert("کتاب کا نام اور مصنف کا نام لکھنا ضروری ہے۔");
        return;
    }

    const bookObj = {
        id: id ? parseInt(id) : Date.now(),
        title, author, vols, missingVols, publisher, shelfNo, subject,
    };

    if (id) {
        const index = books.findIndex((b) => b.id == id);
        if (index > -1) books[index] = bookObj;
    } else {
        books.push(bookObj);
    }

    saveToLocalStorage();
    renderBooks();
    updateStats();
    closeBookModal();
    alert("کتاب کامیابی سے محفوظ ہو گئی!");
}

// Multiple Delete / Single Edit Functions
function deleteSelectedBook() {
    const ids = getSelectedBookIds();
    if (ids.length === 0) {
        alert("براہ کرم ڈیلیٹ کرنے کے لیے کم از کم ایک کتاب منتخب کریں۔");
        return;
    }

    const msg = ids.length === 1 
        ? "کیا آپ واقعی اس کتاب کو ڈیلیٹ کرنا چاہتے ہیں؟" 
        : `کیا آپ واقعی ان ${ids.length} کتابوں کو ڈیلیٹ کرنا چاہتے ہیں؟`;

    if (confirm(msg)) {
        books = books.filter((b) => !ids.includes(b.id));
        saveToLocalStorage();
        
        const selectAll = document.getElementById('selectAllCheckbox');
        if(selectAll) selectAll.checked = false;
        
        renderBooks();
        updateStats();
    }
}

function editSelectedBook() {
    const ids = getSelectedBookIds();
    if (ids.length === 0) {
        alert("براہ کرم ایڈٹ کرنے کے لیے ایک کتاب منتخب کریں۔");
        return;
    }
    if (ids.length > 1) {
        alert("آپ ایک وقت میں صرف ایک ہی کتاب ایڈٹ کر سکتے ہیں۔ براہ کرم باقی کتابوں سے نشان ہٹا دیں۔");
        return;
    }

    const id = ids[0];
    const book = books.find((b) => b.id === id);
    if (book) {
        // سب سے پہلے موڈل کھولیں اور کیٹیگری کی لسٹ کو اپڈیٹ کریں
        openBookModal(true);

        document.getElementById("bookId").value = book.id;
        document.getElementById("bTitle").value = book.title;
        document.getElementById("bAuthor").value = book.author;
        document.getElementById("bVols").value = book.vols || "";
        document.getElementById("bMissingVols").value = book.missingVols || "";
        document.getElementById("bPublisher").value = book.publisher || "";
        document.getElementById("bShelf").value = book.shelfNo || "";

        const select = document.getElementById("bCategorySelect");
        let optionExists = Array.from(select.options).some(
            (opt) => opt.value === book.subject
        );
        if (optionExists) {
            select.value = book.subject;
            checkCustomCategory();
        } else {
            select.value = "other";
            checkCustomCategory();
            document.getElementById("bCategoryInput").value = book.subject;
        }

        document.getElementById("bookModalTitle").innerText = "کتاب ایڈٹ کریں";
    }
}

// Issue Book rendering
function renderIssuedBooks() {
    const tbody = document.getElementById("issuedTableBody");
    tbody.innerHTML = "";

    issuedBooks.forEach((issue) => {
        const book = books.find((b) => b.id == issue.bookId);
        const bookName = book ? book.title : "نامعلوم کتاب";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="font-bold text-gray-800">${issue.name}</td>
            <td class="text-[#1e40af]">${bookName}</td>
            <td class="text-center font-sans bg-gray-50">${issue.issueDate}</td>
            <td class="text-center font-sans bg-gray-50">${issue.returnDate}</td>
            <td class="text-center">
                <button class="text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200 font-bold transition" onclick="returnBook(${issue.id})">کتاب واپس لیں</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// موڈل اوپن کرنے کا فنکشن (Safe Version)
function openIssueModal() {
    const form = document.getElementById('issueForm');
    if(form) form.reset();
    
    const searchInput = document.getElementById('iBookSearch');
    if(searchInput) searchInput.value = '';
    
    const bookIdInput = document.getElementById('iBookId');
    if(bookIdInput) bookIdInput.value = '';
    
    const bookList = document.getElementById('iBookList');
    if(bookList) bookList.classList.add('hidden'); 
    
    const modal = document.getElementById('issueModal');
    if(modal) modal.classList.remove('hidden');
}


// نیا فنکشن: ایشو موڈل میں کتاب سرچ کرنے کے لیے 
function searchIssueBook() {
    const searchTerm = document.getElementById('iBookSearch').value.toLowerCase();
    const bookList = document.getElementById('iBookList');

    if (!searchTerm) {
        bookList.classList.add('hidden');
        bookList.innerHTML = '';
        return;
    }

    const matchedBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm));

    bookList.innerHTML = '';
    if (matchedBooks.length === 0) {
        bookList.innerHTML = '<div class="p-2 text-red-500 text-sm">کوئی کتاب نہیں ملی</div>';
    } else {
        matchedBooks.forEach(book => {
            const div = document.createElement('div');
            div.className = 'p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 text-sm';
            div.innerText = `${book.title} - (${book.author})`; 
            div.onclick = () => selectIssueBook(book.id, book.title);
            bookList.appendChild(div);
        });
    }
    bookList.classList.remove('hidden');
}

// کتاب پر کلک کر کے اسے سلیکٹ کرنے کے لیے
function selectIssueBook(id, title) {
    document.getElementById('iBookId').value = id; 
    document.getElementById('iBookSearch').value = title; 
    document.getElementById('iBookList').classList.add('hidden'); 
}

// کتاب جاری کرنے والا موڈل بند کرنے کا فنکشن
function closeIssueModal() {
    document.getElementById('issueModal').classList.add('hidden');
}

// کتاب جاری کرنے والا ڈیٹا محفوظ کرنے کا فنکشن
function saveIssueData() {
    const name = document.getElementById('iName').value;
    const bookId = document.getElementById('iBookId').value;
    const issueDate = document.getElementById('iIssueDate').value;
    const returnDate = document.getElementById('iReturnDate').value;

    if(!name || !bookId || !issueDate || !returnDate) {
        alert("براہ کرم تمام معلومات فراہم کریں اور لسٹ میں سے کتاب منتخب کریں۔");
        return;
    }

    issuedBooks.push({ id: Date.now(), name, bookId, issueDate, returnDate });

    saveIssuedToLocalStorage();
    renderIssuedBooks();
    
    closeIssueModal();
    alert("کتاب کامیابی سے جاری کر دی گئی!");
}

function returnBook(id) {
    if (confirm("کیا اس کتاب کی واپسی ہو چکی ہے؟")) {
        issuedBooks = issuedBooks.filter((i) => i.id !== id);
        saveIssuedToLocalStorage();
        renderIssuedBooks();
    }
}

// Export Excel (کتابوں کے لیے)
function exportToExcel() {
    if (books.length === 0) {
        alert("ایکسپورٹ کرنے کے لیے کوئی ڈیٹا نہیں ہے۔");
        return;
    }

    let html = '<html dir="rtl" lang="ur"><head><meta charset="utf-8"></head><body><table border="1">';
    html += "<tr><th>سیریل نمبر</th><th>کتاب کا نام</th><th>مصنف</th><th>پبلشر</th><th>جلدیں</th><th>مسنگ جلدیں</th><th>الماری نمبر</th><th>کیٹیگری</th></tr>";

    books.forEach((b, i) => {
        html += `<tr>
            <td>${i + 1}</td>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.publisher || ""}</td>
            <td>${b.vols || ""}</td>
            <td>${b.missingVols || ""}</td>
            <td>${b.shelfNo || ""}</td>
            <td>${b.subject || ""}</td>
        </tr>`;
    });
    html += "</table></body></html>";

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "library_books.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// نیا فنکشن: جاری کردہ کتابوں کو ایکسل میں ایکسپورٹ کرنے کے لیے
function exportIssuedToExcel() {
    if (issuedBooks.length === 0) {
        alert("ایکسپورٹ کرنے کے لیے کوئی ڈیٹا نہیں ہے۔");
        return;
    }

    let html = '<html dir="rtl" lang="ur"><head><meta charset="utf-8"></head><body><table border="1">';
    html += "<tr><th>سیریل نمبر</th><th>نام</th><th>کتاب کا نام</th><th>جاری کرنے کی تاریخ</th><th>واپسی کی تاریخ</th></tr>";

    issuedBooks.forEach((issue, i) => {
        const book = books.find((b) => b.id == issue.bookId);
        const bookName = book ? book.title : "نامعلوم کتاب";

        html += `<tr>
            <td>${i + 1}</td>
            <td>${issue.name}</td>
            <td>${bookName}</td>
            <td>${issue.issueDate}</td>
            <td>${issue.returnDate}</td>
        </tr>`;
    });
    html += "</table></body></html>";

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "issued_books.xls"); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ایکسل سے امپورٹ کریں (کتابوں کے لیے)
function importFromExcel(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let newBooks = [];
        
        if(text.includes('<table')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const rows = doc.querySelectorAll('tr');
            
            rows.forEach((row, i) => {
                if(i === 0) return; 
                const cols = row.querySelectorAll('td, th');
                if(cols.length >= 7) {
                    newBooks.push({
                        id: Date.now() + i,
                        title: cols[1] ? cols[1].innerText.trim() : '',
                        author: cols[2] ? cols[2].innerText.trim() : '',
                        publisher: cols[3] ? cols[3].innerText.trim() : '',
                        vols: cols[4] ? cols[4].innerText.trim() : '',
                        missingVols: cols[5] ? cols[5].innerText.trim() : '',
                        shelfNo: cols[6] ? cols[6].innerText.trim() : '',
                        subject: (cols[7] && cols[7].innerText.trim() !== '') ? cols[7].innerText.trim() : "متفرق"
                    });
                }
            });
        } 
        else {
            const rows = text.split('\n');
            if(rows.length < 2) {
                alert("فائل میں کوئی ڈیٹا نہیں ہے۔");
                return;
            }

            let colMap = { title: 1, author: 2, publisher: 3, vols: 4, missing: 5, shelf: 6, category: 7 };
            
            const headerRow = rows[0].split(',');
            for(let c = 0; c < headerRow.length; c++) {
                let h = headerRow[c].replace(/(^"|"$)/g, '').trim();
                if(h.includes('کتاب') || h.includes('کاب')) colMap.title = c;
                else if(h.includes('مصنف')) colMap.author = c;
                else if(h.includes('پبلشر')) colMap.publisher = c;
                else if(h.includes('مسنگ') || h.includes('مفقود')) colMap.missing = c;
                else if(h.includes('جلد')) colMap.vols = c;
                else if(h.includes('الماری')) colMap.shelf = c;
                else if(h.includes('کیٹیگری') || h.includes('موضوع') || h.includes('مضامین')) colMap.category = c;
            }

            for(let i = 1; i < rows.length; i++) {
                if(!rows[i].trim()) continue;
                const row = rows[i];
                let cols_arr = [];
                let inQuotes = false;
                let col = '';
                
                for(let j = 0; j < row.length; j++) {
                    if(row[j] === '"') inQuotes = !inQuotes;
                    else if(row[j] === ',' && !inQuotes) {
                        cols_arr.push(col);
                        col = '';
                    } else {
                        col += row[j];
                    }
                }
                cols_arr.push(col);

                let parsedSubject = cols_arr[colMap.category] ? cols_arr[colMap.category].replace(/(^"|"$)/g, '').trim() : '';
                
                newBooks.push({
                    id: Date.now() + i,
                    title: cols_arr[colMap.title] ? cols_arr[colMap.title].replace(/(^"|"$)/g, '').trim() : '',
                    author: cols_arr[colMap.author] ? cols_arr[colMap.author].replace(/(^"|"$)/g, '').trim() : '',
                    publisher: cols_arr[colMap.publisher] ? cols_arr[colMap.publisher].replace(/(^"|"$)/g, '').trim() : '',
                    vols: cols_arr[colMap.vols] ? cols_arr[colMap.vols].replace(/(^"|"$)/g, '').trim() : '',
                    missingVols: cols_arr[colMap.missing] ? cols_arr[colMap.missing].replace(/(^"|"$)/g, '').trim() : '',
                    shelfNo: cols_arr[colMap.shelf] ? cols_arr[colMap.shelf].replace(/(^"|"$)/g, '').trim() : '',
                    subject: parsedSubject !== '' ? parsedSubject : "متفرق"
                });
            }
        }
        
        if(newBooks.length > 0) {
            if(confirm(`فائل میں ${newBooks.length} کتابوں کا ریکارڈ ملا ہے۔\n\nکیا آپ موجودہ ریکارڈ کو مٹا کر صرف یہ نئی کتابیں امپورٹ کرنا چاہتے ہیں؟\n\n(OK = پرانا ڈیٹا ڈیلیٹ ہو جائے گا، Cancel = نیا ڈیٹا پرانے ریکارڈ میں جمع ہو جائے گا)`)) {
                books = newBooks;
            } else {
                books = [...books, ...newBooks];
            }
            saveToLocalStorage();
            renderBooks();
            updateStats();
            alert("ڈیٹا کامیابی سے امپورٹ ہو گیا!");
        } else {
            alert("فائل میں کوئی درست ڈیٹا نہیں ملا۔");
        }
        event.target.value = ''; 
    };
    reader.readAsText(file);
}

// نیا فنکشن: جاری شدہ کتابوں کو ایکسل سے امپورٹ کرنے کے لیے
function importIssuedFromExcel(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        let newIssued = [];
        
        // اگر فائل HTML Table فارمیٹ میں ہے (جیسا کہ ہم ایکسپورٹ کرتے ہیں)
        if(text.includes('<table')) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const rows = doc.querySelectorAll('tr');
            
            rows.forEach((row, i) => {
                if(i === 0) return; // پہلی لائن (ہیڈنگ) کو چھوڑ دیں
                const cols = row.querySelectorAll('td, th');
                if(cols.length >= 5) {
                    const personName = cols[1] ? cols[1].innerText.trim() : '';
                    const bookTitle = cols[2] ? cols[2].innerText.trim() : '';
                    const issueDate = cols[3] ? cols[3].innerText.trim() : '';
                    const returnDate = cols[4] ? cols[4].innerText.trim() : '';
                    
                    // کتاب کے نام سے اس کا ID تلاش کریں
                    const matchedBook = books.find(b => b.title === bookTitle);
                    const bookId = matchedBook ? matchedBook.id : Date.now() + i;

                    if (personName && bookTitle) {
                        newIssued.push({
                            id: Date.now() + i + 1000, 
                            name: personName,
                            bookId: bookId,
                            issueDate: issueDate,
                            returnDate: returnDate
                        });
                    }
                }
            });
        } 
        // اگر فائل CSV فارمیٹ میں ہے
        else {
            const rows = text.split('\n');
            if(rows.length < 2) {
                alert("فائل میں کوئی ڈیٹا نہیں ہے۔");
                return;
            }

            let colMap = { name: 1, bookTitle: 2, issueDate: 3, returnDate: 4 };
            const headerRow = rows[0].split(',');
            for(let c = 0; c < headerRow.length; c++) {
                let h = headerRow[c].replace(/(^"|"$)/g, '').trim();
                if(h.includes('نام') && !h.includes('کتاب')) colMap.name = c;
                else if(h.includes('کتاب')) colMap.bookTitle = c;
                else if(h.includes('جاری') || h.includes('اجراء')) colMap.issueDate = c;
                else if(h.includes('واپسی')) colMap.returnDate = c;
            }

            for(let i = 1; i < rows.length; i++) {
                if(!rows[i].trim()) continue;
                const row = rows[i];
                let cols_arr = [];
                let inQuotes = false;
                let col = '';
                
                for(let j = 0; j < row.length; j++) {
                    if(row[j] === '"') inQuotes = !inQuotes;
                    else if(row[j] === ',' && !inQuotes) {
                        cols_arr.push(col);
                        col = '';
                    } else {
                        col += row[j];
                    }
                }
                cols_arr.push(col);

                const personName = cols_arr[colMap.name] ? cols_arr[colMap.name].replace(/(^"|"$)/g, '').trim() : '';
                const bookTitle = cols_arr[colMap.bookTitle] ? cols_arr[colMap.bookTitle].replace(/(^"|"$)/g, '').trim() : '';
                const issueDate = cols_arr[colMap.issueDate] ? cols_arr[colMap.issueDate].replace(/(^"|"$)/g, '').trim() : '';
                const returnDate = cols_arr[colMap.returnDate] ? cols_arr[colMap.returnDate].replace(/(^"|"$)/g, '').trim() : '';

                const matchedBook = books.find(b => b.title === bookTitle);
                const bookId = matchedBook ? matchedBook.id : Date.now() + i;

                if (personName && bookTitle) {
                    newIssued.push({
                        id: Date.now() + i + 1000,
                        name: personName,
                        bookId: bookId,
                        issueDate: issueDate,
                        returnDate: returnDate
                    });
                }
            }
        }
        
        if(newIssued.length > 0) {
            if(confirm(`فائل میں ${newIssued.length} جاری شدہ کتابوں کا ریکارڈ ملا ہے۔\n\nکیا آپ موجودہ ریکارڈ کو مٹا کر صرف یہ نیا ڈیٹا امپورٹ کرنا چاہتے ہیں؟\n\n(OK = پرانا ڈیٹا ڈیلیٹ ہو جائے گا، Cancel = نیا ڈیٹا پرانے ریکارڈ میں جمع ہو جائے گا)`)) {
                issuedBooks = newIssued;
            } else {
                issuedBooks = [...issuedBooks, ...newIssued];
            }
            saveIssuedToLocalStorage();
            renderIssuedBooks();
            alert("ڈیٹا کامیابی سے امپورٹ ہو گیا!");
        } else {
            alert("فائل میں کوئی درست ڈیٹا نہیں ملا۔");
        }
        event.target.value = ''; // تاکہ دوبارہ وہی فائل سلیکٹ کی جا سکے
    };
    reader.readAsText(file);
}

// Search Main (For Books List)
function searchMain() {
    const type = document.getElementById("searchType").value;
    const term = document.getElementById("searchInput").value.toLowerCase();

    if (!term) return;

    const matched = books.filter((b) => {
        if (type === "title") return b.title.toLowerCase().includes(term);
        if (type === "author") return b.author.toLowerCase().includes(term);
        if (type === "publisher") return (b.publisher || "").toLowerCase().includes(term);
        return false;
    });

    showPage("booksPage");

    const tbody = document.getElementById("booksTableBody");
    tbody.innerHTML = "";

    if (matched.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="8" class="text-center font-bold text-red-500 py-6 text-xl">کوئی کتاب نہیں ملی</td>`;
        tbody.appendChild(tr);
    } else {
        matched.forEach((book, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="print:hidden text-center"><input type="checkbox" name="bookSelect" value="${book.id}" class="w-4 h-4 text-blue-600 cursor-pointer"></td>
                <td class="text-center font-sans">${index + 1}</td>
                <td class="font-bold text-[#1e40af]">${book.title}</td>
                <td>${book.author}</td>
                <td>${book.publisher || "-"}</td>
                <td class="text-center font-sans">${book.vols || 1}</td>
                <td class="text-center font-sans text-red-500">${book.missingVols || "-"}</td>
                <td class="text-center font-sans bg-gray-50">${book.shelfNo || "-"}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("footerTotalBooks").innerText = matched.length;
}

window.onload = initApp;