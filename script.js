document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const mainSelectionContainer = document.getElementById('main-selection-container');
    const tocContainer = document.getElementById('toc-container');
    const readerContainer = document.getElementById('reader-container');
    const chapterTitleElement = document.getElementById('chapter-title');
    const textElement = document.getElementById('text');
    const prevChapterBtn = document.getElementById('prev-chapter-btn');
    const nextChapterBtn = document.getElementById('next-chapter-btn');
    const homeBtn = document.getElementById('home-btn');
    const goToTopBtn = document.getElementById('go-to-top-btn');

    // --- Configuration ---
    const EPIC_CONFIG = {
        mahabharata: {
            name: "The Mahabharata",
            folder: "text_1/",
            structure: [
                { name: "Adi Parva", chapters: 236 }, { name: "Sabha Parva", chapters: 80 },
                { name: "Vana Parva", chapters: 313 }, { name: "Virata Parva", chapters: 22 },
                { name: "Udyoga Parva", chapters: 199 }, { name: "Bhishma Parva", chapters: 124 },
                { name: "Drona Parva", chapters: 203 }, { name: "Karna Parva", chapters: 96 },
                { name: "Shalya Parva", chapters: 65 }, { name: "Sauptika Parva", chapters: 18 },
                { name: "Stri Parva", chapters: 27 }, { name: "Shanti Parva", chapters: 365 },
                { name: "Anushasana Parva", chapters: 162 }, { name: "Ashvamedhika Parva", chapters: 9 },
                { name: "Ashramavasika Parva", chapters: 39 }, { name: "Mausala Parva", chapters: 8 },
                { name: "Mahaprasthanika Parva", chapters: 3 }, { name: "Svargarohana Parva", chapters: 6 },
            ]
        },
        ramayana: {
            name: "The Ramayana",
            folder: "text_2/",
            structure: [
                { name: "Bala Kanda", chapters: 77 }, { name: "Ayodhya Kanda", chapters: 119 },
                { name: "Aranya Kanda", chapters: 75 }, { name: "Kishkindha Kanda", chapters: 67 },
                { name: "Sundara Kanda", chapters: 68 }, { name: "Yuddha Kanda", chapters: 131 },
                { name: "Uttara Kanda", chapters: 111 },
            ]
        }
    };

    // --- State ---
    let currentState = { epic: null, book: 1, chapter: 1 };

    // --- View Management ---
    function showView(view) {
        mainSelectionContainer.classList.add('hidden');
        tocContainer.classList.add('hidden');
        readerContainer.classList.add('hidden');
        document.getElementById(view).classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    // --- Functions ---

    /**
     * Creates the initial screen for users to select an epic.
     */
    function generateEpicSelection() {
        mainSelectionContainer.innerHTML = ''; // Clear previous content
        for (const epicKey in EPIC_CONFIG) {
            const config = EPIC_CONFIG[epicKey];
            const card = document.createElement('div');
            card.className = 'epic-card';
            card.innerHTML = `<h2>${config.name}</h2><p>Select to begin reading</p>`;
            card.addEventListener('click', () => showTocView(epicKey));
            mainSelectionContainer.appendChild(card);
        }
        showView('main-selection-container');
    }

    /**
     * Generates and displays the Table of Contents for a given epic.
     * @param {string} epicKey - The key for the epic (e.g., 'mahabharata').
     */
    function showTocView(epicKey) {
        const config = EPIC_CONFIG[epicKey];
        tocContainer.innerHTML = ''; // Clear previous content

        const header = document.createElement('div');
        header.className = 'toc-header';
        header.innerHTML = `<h2>${config.name}</h2>`;

        const backButton = document.createElement('button');
        backButton.innerText = '‹ Back to Epics';
        backButton.className = 'btn nav-btn';
        backButton.addEventListener('click', generateEpicSelection);
        header.appendChild(backButton);
        tocContainer.appendChild(header);

        const savedPosition = getSavedPosition(epicKey);
        if (savedPosition) {
            const continueButton = document.createElement('button');
            continueButton.innerText = `Continue Reading (Book ${savedPosition.book}, Chapter ${savedPosition.chapter})`;
            continueButton.className = 'btn continue-reading-btn';
            continueButton.addEventListener('click', () => showSection(epicKey, savedPosition.book, savedPosition.chapter));
            tocContainer.appendChild(continueButton);
        }

        config.structure.forEach((book, bookIndex) => {
            const bookNumber = bookIndex + 1;
            const bookTitle = document.createElement('h3');
            bookTitle.className = 'book-title';
            bookTitle.innerText = `Book ${bookNumber}: ${book.name}`;
            tocContainer.appendChild(bookTitle);

            const chapterList = document.createElement('ul');
            chapterList.className = 'book-list';
            for (let chapter = 1; chapter <= book.chapters; chapter++) {
                const link = document.createElement('a');
                link.innerText = `Chapter ${chapter}`;
                link.className = 'chapter-link';
                link.href = `#epic=${epicKey}&book=${bookNumber}&chapter=${chapter}`;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSection(epicKey, bookNumber, chapter);
                });
                const listItem = document.createElement('li');
                listItem.appendChild(link);
                chapterList.appendChild(listItem);
            }
            tocContainer.appendChild(chapterList);
        });

        history.pushState({ epic: epicKey }, '', `#epic=${epicKey}`);
        showView('toc-container');
    }

    /**
     * Fetches and displays a specific chapter of an epic.
     */
    function showSection(epicKey, book, chapter) {
        const config = EPIC_CONFIG[epicKey];
        if (!config) return generateEpicSelection();

        const filePath = `${config.folder}Book_${book}_Chapter_${chapter}.txt`;
        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`File not found: ${filePath}`);
                return response.text();
            })
            .then(text => {
                currentState = { epic: epicKey, book, chapter };
                showView('reader-container');

                chapterTitleElement.innerText = `${config.name} - Book ${book}: ${config.structure[book - 1].name} - Chapter ${chapter}`;
                textElement.innerText = text;

                history.pushState(currentState, '', `#epic=${epicKey}&book=${book}&chapter=${chapter}`);
                savePosition(epicKey, book, chapter);
                updateNavigationButtons();
            })
            .catch(error => {
                console.error('Error loading section:', error);
                alert("This chapter could not be loaded. You may have reached the end of this epic.");
                showTocView(epicKey);
            });
    }

    /**
     * Updates the state of the Previous/Next navigation buttons.
     */
    function updateNavigationButtons() {
        const { epic, book, chapter } = currentState;
        const config = EPIC_CONFIG[epic];
        const totalChaptersInBook = config.structure[book - 1].chapters;

        prevChapterBtn.disabled = (book === 1 && chapter === 1);
        const isLastBook = book === config.structure.length;
        const isLastChapter = chapter === totalChaptersInBook;
        nextChapterBtn.disabled = (isLastBook && isLastChapter);
    }

    /**
     * Handles clicks for 'Previous' and 'Next' chapter buttons.
     */
    function handleNavigation(direction) {
        let { epic, book, chapter } = currentState;
        const config = EPIC_CONFIG[epic];
        const structure = config.structure;

        if (direction === 'next') {
            if (chapter < structure[book - 1].chapters) chapter++;
            else if (book < structure.length) { book++; chapter = 1; }
        } else if (direction === 'prev') {
            if (chapter > 1) chapter--;
            else if (book > 1) { book--; chapter = structure[book - 1].chapters; }
        }
        showSection(epic, book, chapter);
    }

    // --- State & URL Management ---

    function savePosition(epicKey, book, chapter) {
        localStorage.setItem(`${epicKey}_position`, JSON.stringify({ book, chapter }));
    }

    function getSavedPosition(epicKey) {
        const saved = localStorage.getItem(`${epicKey}_position`);
        return saved ? JSON.parse(saved) : null;
    }

    function checkUrlForState() {
        const hash = window.location.hash;
        if (!hash) return false;

        const params = new URLSearchParams(hash.substring(1));
        const epic = params.get('epic');
        const book = parseInt(params.get('book'));
        const chapter = parseInt(params.get('chapter'));

        if (epic && EPIC_CONFIG[epic]) {
            if (book && chapter) {
                showSection(epic, book, chapter);
            } else {
                showTocView(epic);
            }
            return true;
        }
        return false;
    }

    // --- Event Listeners & Initialization ---
    prevChapterBtn.addEventListener('click', () => handleNavigation('prev'));
    nextChapterBtn.addEventListener('click', () => handleNavigation('next'));
    homeBtn.addEventListener('click', () => showTocView(currentState.epic));

    window.addEventListener('scroll', () => {
        goToTopBtn.style.display = (window.scrollY > 300) ? 'block' : 'none';
    });
    goToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /** Main initialization function. */
    function init() {
        if (!checkUrlForState()) {
            generateEpicSelection();
        }
    }

    init();
});