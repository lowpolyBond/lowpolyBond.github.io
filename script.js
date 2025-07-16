document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const tocContainer = document.getElementById('toc-container');
    const readerContainer = document.getElementById('reader-container');
    const chapterTitleElement = document.getElementById('chapter-title');
    const textElement = document.getElementById('text');
    const prevChapterBtn = document.getElementById('prev-chapter-btn');
    const nextChapterBtn = document.getElementById('next-chapter-btn');
    const homeBtn = document.getElementById('home-btn');
    const goToTopBtn = document.getElementById('go-to-top-btn');

    // --- Configuration ---
    const TEXT_FILE_PATH = 'text/';
    // This structure is crucial for generating the ToC and for navigation.
    // NOTE: You must know the number of chapters in each book.
    const MAHABHARATA_STRUCTURE = [
        { name: "Adi Parva", chapters: 236 },
        { name: "Sabha Parva", chapters: 81 },
        { name: "Vana Parva", chapters: 315 },
        { name: "Virata Parva", chapters: 72 },
        { name: "Udyoga Parva", chapters: 199 },
        { name: "Bhishma Parva", chapters: 124 },
        { name: "Drona Parva", chapters: 204 },
        { name: "Karna Parva", chapters: 96 },
        { name: "Shalya Parva", chapters: 65 },
        { name: "Sauptika Parva", chapters: 18 },
        { name: "Stri Parva", chapters: 27 },
        { name: "Shanti Parva", chapters: 365 },
        { name: "Anushasana Parva", chapters: 168 },
        { name: "Ashvamedhika Parva", chapters: 92 },
        { name: "Ashramavasika Parva", chapters: 39 },
        { name: "Mausala Parva", chapters: 9 },
        { name: "Mahaprasthanika Parva", chapters: 3 },
        { name: "Svargarohana Parva", chapters: 5 },
    ];

    // --- State ---
    let currentState = { book: 1, chapter: 1 };

    // --- Functions ---

    /**
     * Generates the Table of Contents on the main page.
     */
    function generateTableOfContents() {
        // Add a "Continue Reading" button if a position is saved
        const savedPosition = getSavedPosition();
        if (savedPosition) {
            const continueButton = document.createElement('button');
            continueButton.innerText = 'Continue Reading (Book ' + savedPosition.book + ', Chapter ' + savedPosition.chapter + ')';
            continueButton.id = 'continue-reading-btn';
            continueButton.className = 'btn';
            continueButton.addEventListener('click', () => {
                showSection(savedPosition.book, savedPosition.chapter);
            });
            tocContainer.appendChild(continueButton);
        }

        MAHABHARATA_STRUCTURE.forEach((book, bookIndex) => {
            const bookNumber = bookIndex + 1;
            const bookTitle = document.createElement('h2');
            bookTitle.innerText = `Book ${bookNumber}: ${book.name}`;
            tocContainer.appendChild(bookTitle);

            const chapterList = document.createElement('ul');
            chapterList.className = 'book-list';

            for (let chapterNumber = 1; chapterNumber <= book.chapters; chapterNumber++) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.innerText = `Chapter ${chapterNumber}`;
                link.className = 'chapter-link';
                link.href = `#book=${bookNumber}&chapter=${chapterNumber}`;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSection(bookNumber, chapterNumber);
                });
                listItem.appendChild(link);
                chapterList.appendChild(listItem);
            }
            tocContainer.appendChild(chapterList);
        });
    }

    /**
     * Shows the reader view and hides the table of contents.
     */
    function showReaderView() {
        readerContainer.classList.remove('hidden');
        tocContainer.classList.add('hidden');
        window.scrollTo(0, 0);
    }

    /**
     * Shows the table of contents and hides the reader.
     */
    function showTocView() {
        tocContainer.classList.remove('hidden');
        readerContainer.classList.add('hidden');
        history.pushState(null, '', window.location.pathname); // Clear URL hash
    }

    /**
     * Fetches and displays a specific section by book and chapter.
     * @param {number} book - The book number to load.
     * @param {number} chapter - The chapter number to load.
     */
    function showSection(book, chapter) {
        const filePath = `${TEXT_FILE_PATH}Book_${book}_Chapter_${chapter}.txt`;

        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error(`Could not find Book ${book}, Chapter ${chapter}.`);
                return response.text();
            })
            .then(text => {
                currentState = { book, chapter };
                showReaderView();

                // Update content and UI
                chapterTitleElement.innerText = `Book ${book}: ${MAHABHARATA_STRUCTURE[book - 1].name} - Chapter ${chapter}`;
                textElement.innerText = text;

                // Update URL and save state
                history.pushState(currentState, '', `#book=${book}&chapter=${chapter}`);
                savePosition(book, chapter);
                updateNavigationButtons();
            })
            .catch(error => {
                console.error('Error loading section:', error);
                alert("This chapter could not be loaded. You may have reached the end.");
                showTocView();
            });
    }

    /**
     * Updates the state of the Previous/Next navigation buttons.
     */
    function updateNavigationButtons() {
        const { book, chapter } = currentState;
        const totalChaptersInBook = MAHABHARATA_STRUCTURE[book - 1].chapters;

        // Previous button logic
        prevChapterBtn.disabled = (book === 1 && chapter === 1);

        // Next button logic
        const isLastBook = book === MAHABHARATA_STRUCTURE.length;
        const isLastChapter = chapter === totalChaptersInBook;
        nextChapterBtn.disabled = (isLastBook && isLastChapter);
    }

    /**
     * Handles clicks for the 'Previous' and 'Next' chapter buttons.
     * @param {'prev' | 'next'} direction - The direction to navigate.
     */
    function handleNavigation(direction) {
        let { book, chapter } = currentState;

        if (direction === 'next') {
            const totalChaptersInBook = MAHABHARATA_STRUCTURE[book - 1].chapters;
            if (chapter < totalChaptersInBook) {
                chapter++;
            } else if (book < MAHABHARATA_STRUCTURE.length) {
                book++;
                chapter = 1;
            }
        } else if (direction === 'prev') {
            if (chapter > 1) {
                chapter--;
            } else if (book > 1) {
                book--;
                chapter = MAHABHARATA_STRUCTURE[book - 1].chapters;
            }
        }
        showSection(book, chapter);
    }

    /**
     * Saves the current reading position to localStorage.
     */
    function savePosition(book, chapter) {
        localStorage.setItem('mahabharata_position', JSON.stringify({ book, chapter }));
    }

    /**
     * Retrieves the saved position from localStorage.
     * @returns {{book: number, chapter: number} | null}
     */
    function getSavedPosition() {
        const saved = localStorage.getItem('mahabharata_position');
        return saved ? JSON.parse(saved) : null;
    }

    /**
     * Checks the URL hash on page load to see if a specific chapter should be displayed.
     */
    function checkUrlForChapter() {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const book = parseInt(params.get('book'));
            const chapter = parseInt(params.get('chapter'));
            if (book && chapter) {
                showSection(book, chapter);
                return true;
            }
        }
        return false;
    }

    // --- Event Listeners & Initialization ---

    // Navigation buttons
    prevChapterBtn.addEventListener('click', () => handleNavigation('prev'));
    nextChapterBtn.addEventListener('click', () => handleNavigation('next'));
    homeBtn.addEventListener('click', showTocView);

    // Go to Top button
    window.addEventListener('scroll', () => {
        goToTopBtn.style.display = (window.scrollY > 300) ? 'block' : 'none';
    });
    goToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /**
     * Main initialization function.
     */
    function init() {
        generateTableOfContents();
        // If URL doesn't specify a chapter, show the table of contents.
        if (!checkUrlForChapter()) {
            showTocView();
        }
    }

    init();
});