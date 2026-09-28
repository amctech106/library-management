// app.js
// تمام فنکشنز اور لاجک

let books = [];
let issuedBooks = [];
let currentCategory = 'All';

// Initialize App
function initApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load from LocalStorage or use default files
    const storedBooks = localStorage.getItem('library_books');
    if(storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        books = defaultBooks; // from books_data.js
        saveToLocalStorage();
    }

    const storedIssued = localStorage.getItem('library_issued');
    if(storedIssued) {
        issuedBooks = JSON.parse(storedIssued);
    } else {
        issuedBooks = defaultIssued; // from issued_data.js
        saveIssuedToLocalStorage();
    }

    renderBooks();
    renderIssuedBooks();
    updateStats();
}

// Navigation
function showPage(pageId) {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('booksPage').classList.add('hidden');
    document.getElementById('issuedPage').classList.add('hidden');
    
    // Slight fade effect
    const target = document.getElementById(pageId);
    target.classList.remove('hidden');
    target.style.opacity = 0;
    setTimeout(() => target.style.opacity = 1, 50);
}

// Date & Time Formatting matches screenshot roughly
function updateDateTime() {
    const now = new Date();
    const days = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
    const months = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'شام' : 'صبح';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    
    const timeString = `${ampm} ${hours}:${minutes}:${seconds}`;
    const dateString = `${dayName}, ${day} ${month} ${year}, ${timeString}`;
    
    document.getElementById('dateTimeDisplay').innerText = dateString;
}

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('library_books', JSON.stringify(books));
}
function saveIssuedToLocalStorage() {
    localStorage.setItem('library_issued', JSON.stringify(issuedBooks));
}

// Render Books Table
function renderBooks() {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';
    
    let filtered = books;
    if(currentCategory !== 'All') {
        filtered = books.filter(b => b.subject === currentCategory);
    }

    filtered.forEach((book, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="print:hidden text-center"><input type="radio" name="bookSelect" value="${book.id}" class="w-4 h-4 text-blue-600 cursor-pointer"></td>
            <td class="text-center font-sans">${index + 1}</td>
            <td class="font-bold text-[#1e40af]">${book.title}</td>
            <td>${book.author}</td>
            <td>${book.publisher || '-'}</td>
            <td class="text-center font-sans">${book.vols || 1}</td>
            <td class="text-center font-sans text-red-500">${book.missingVols || '-'}</td>
            <td class="text-center font-sans bg-gray-50">${book.shelfNo || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('footerTotalBooks').innerText = filtered.length;
    
    // Update category list dynamically
    updateCategorySidebar();
}

// Stats for Main Page
function updateStats() {
    document.getElementById('statTotalBooks').innerText = books.length;
    const authors = new Set(books.map(b => b.author));
    document.getElementById('statTotalAuthors').innerText = authors.size;
}

function updateCategorySidebar() {
    const list = document.getElementById('categoryList');
    const categories = ['All', ...new Set(books.map(b => b.subject))];
    
    list.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = `cursor-pointer p-2 rounded transition flex items-center gap-2 ${currentCategory === cat ? 'bg-blue-100 text-[#1e40af] font-bold' : 'hover:bg-gray-100 hover:text-blue-600'}`;
        li.onclick = () => filterByCategory(cat);
        let icon = '<i class="fas fa-folder text-yellow-500"></i>';
        li.innerHTML = `${icon} ${cat === 'All' ? 'تمام کتابیں' : cat}`;
        list.appendChild(li);
    });
}

function filterByCategory(cat) {
    currentCategory = cat;
    renderBooks();
}

// Modal Actions
function openBookModal(isEdit = false) {
    document.getElementById('bookModal').classList.remove('hidden');
    if(!isEdit) {
        document.getElementById('bookForm').reset();
        document.getElementById('bookId').value = '';
        document.getElementById('bookModalTitle').innerText = "نئی کتاب شامل کریں";
        checkCustomCategory();
    }
}
function closeBookModal() {
    document.getElementById('bookModal').classList.add('hidden');
}

function checkCustomCategory() {
    const select = document.getElementById('bCategorySelect');
    const input = document.getElementById('bCategoryInput');
    if(select.value === 'other') {
        input.classList.remove('hidden');
    } else {
        input.classList.add('hidden');
    }
}

function saveBookData() {
    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bTitle').value;
    const author = document.getElementById('bAuthor').value;
    const vols = document.getElementById('bVols').value;
    const missingVols = document.getElementById('bMissingVols').value;
    const publisher = document.getElementById('bPublisher').value;
    const shelfNo = document.getElementById('bShelf').value;
    
    let subject = document.getElementById('bCategorySelect').value;
    if(subject === 'other') {
        subject = document.getElementById('bCategoryInput').value;
    }

    if(!title || !author) {
        alert("کتاب کا نام اور مصنف کا نام لکھنا ضروری ہے۔");
        return;
    }

    const bookObj = {
        id: id ? parseInt(id) : Date.now(),
        title, author, vols, missingVols, publisher, shelfNo, subject
    };

    if(id) {
        const index = books.findIndex(b => b.id == id);
        if(index > -1) books[index] = bookObj;
    } else {
        books.push(bookObj);
    }

    saveToLocalStorage();
    renderBooks();
    updateStats();
    closeBookModal();
    alert("کتاب کامیابی سے محفوظ ہو گئی!");
}

function getSelectedBookId() {
    const selected = document.querySelector('input[name="bookSelect"]:checked');
    return selected ? parseInt(selected.value) : null;
}

function deleteSelectedBook() {
    const id = getSelectedBookId();
    if(!id) { alert("براہ کرم ڈیلیٹ کرنے کے لیے ایک کتاب منتخب کریں۔"); return; }
    if(confirm("کیا آپ واقعی اس کتاب کو ڈیلیٹ کرنا چاہتے ہیں؟")) {
        books = books.filter(b => b.id !== id);
        saveToLocalStorage();
        renderBooks();
        updateStats();
    }
}

function editSelectedBook() {
    const id = getSelectedBookId();
    if(!id) { alert("براہ کرم ایڈٹ کرنے کے لیے ایک کتاب منتخب کریں۔"); return; }
    
    const book = books.find(b => b.id === id);
    if(book) {
        document.getElementById('bookId').value = book.id;
        document.getElementById('bTitle').value = book.title;
        document.getElementById('bAuthor').value = book.author;
        document.getElementById('bVols').value = book.vols || '';
        document.getElementById('bMissingVols').value = book.missingVols || '';
        document.getElementById('bPublisher').value = book.publisher || '';
        document.getElementById('bShelf').value = book.shelfNo || '';
        
        const select = document.getElementById('bCategorySelect');
        let optionExists = Array.from(select.options).some(opt => opt.value === book.subject);
        if(optionExists) {
            select.value = book.subject;
            checkCustomCategory();
        } else {
            select.value = 'other';
            checkCustomCategory();
            document.getElementById('bCategoryInput').value = book.subject;
        }

        document.getElementById('bookModalTitle').innerText = "کتاب ایڈٹ کریں";
        openBookModal(true);
    }
}

// Issue Book
function renderIssuedBooks() {
    const tbody = document.getElementById('issuedTableBody');
    tbody.innerHTML = '';
    
    issuedBooks.forEach(issue => {
        const book = books.find(b => b.id == issue.bookId);
        const bookName = book ? book.title : 'نامعلوم کتاب';
        
        const tr = document.createElement('tr');
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

function openIssueModal() {
    const select = document.getElementById('iBookId');
    select.innerHTML = '';
    books.forEach(b => {
        select.innerHTML += `<option value="${b.id}">${b.title}</option>`;
    });
    
    document.getElementById('issueForm').reset();
    document.getElementById('issueModal').classList.remove('hidden');
}

function closeIssueModal() {
    document.getElementById('issueModal').classList.add('hidden');
}

function saveIssueData() {
    const name = document.getElementById('iName').value;
    const bookId = document.getElementById('iBookId').value;
    const issueDate = document.getElementById('iIssueDate').value;
    const returnDate = document.getElementById('iReturnDate').value;

    if(!name || !issueDate || !returnDate) {
        alert("تمام معلومات فراہم کرنا ضروری ہے۔");
        return;
    }

    issuedBooks.push({ id: Date.now(), name, bookId, issueDate, returnDate });

    saveIssuedToLocalStorage();
    renderIssuedBooks();
    closeIssueModal();
}

function returnBook(id) {
    if(confirm("کیا اس کتاب کی واپسی ہو چکی ہے؟")) {
        issuedBooks = issuedBooks.filter(i => i.id !== id);
        saveIssuedToLocalStorage();
        renderIssuedBooks();
    }
}

// Export Excel
function exportToExcel() {
    if(books.length === 0) { alert("ایکسپورٹ کرنے کے لیے کوئی ڈیٹا نہیں ہے۔"); return; }
    
    let csv = "\uFEFFسیریل نمبر,کتاب کا نام,مصنف,پبلشر,جلدیں,مسنگ جلدیں,الماری نمبر,کیٹیگری\n";
    books.forEach((b, i) => {
        csv += `${i+1},"${b.title}","${b.author}","${b.publisher || ''}","${b.vols || ''}","${b.missingVols || ''}","${b.shelfNo || ''}","${b.subject || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "library_books.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Search (Updated with no alerts)
function searchMain() {
    const type = document.getElementById('searchType').value;
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    if(!term) return;
    
    const matched = books.filter(b => {
        if(type === 'title') return b.title.toLowerCase().includes(term);
        if(type === 'author') return b.author.toLowerCase().includes(term);
        if(type === 'publisher') return (b.publisher || '').toLowerCase().includes(term);
        return false;
    });
    
    showPage('booksPage');
    
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';
    
    if(matched.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" class="text-center font-bold text-red-500 py-6 text-xl">کوئی کتاب نہیں ملی</td>`;
        tbody.appendChild(tr);
    } else {
        matched.forEach((book, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="print:hidden text-center"><input type="radio" name="bookSelect" value="${book.id}" class="w-4 h-4 text-blue-600"></td>
                <td class="text-center font-sans">${index + 1}</td>
                <td class="font-bold text-[#1e40af]">${book.title}</td>
                <td>${book.author}</td>
                <td>${book.publisher || '-'}</td>
                <td class="text-center font-sans">${book.vols || 1}</td>
                <td class="text-center font-sans text-red-500">${book.missingVols || '-'}</td>
                <td class="text-center font-sans bg-gray-50">${book.shelfNo || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    document.getElementById('footerTotalBooks').innerText = matched.length;
}

window.onload = initApp;
