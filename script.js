
document.addEventListener('DOMContentLoaded', () => {
    const getResultBtn = document.getElementById('get-result-btn');
    const landingPage = document.getElementById('landing-page');
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const actionArea = document.getElementById('action-area');
    const startBtn = document.getElementById('start-btn');

    // നിങ്ങളുടെ Apps Script Web App URL ഇവിടെ ചേർക്കുക
    const API_URL = 'https://script.google.com/macros/s/AKfycbxYBKZ8v0ko0loJx2gVgECOGAEbz9YcQp_xURGpP85VgRtan5l_3lpW2TaaAnliWa3l/exec'; 

    let currentCategory = '';

    // "Get Results" ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ എന്തു സംഭവിക്കണം എന്ന് ഇവിടെ പറയുന്നു
    getResultBtn.addEventListener('click', () => {
        // 1. "Get Result" ഉള്ള ലാൻഡിംഗ് പേജ് ഹൈഡ് ചെയ്യുന്നു
        landingPage.classList.add('hidden');
        
        // 2. ചാറ്റ് ബോട്ട് ഉള്ള പേജ് കാണിക്കുന്നു
        chatContainer.classList.remove('hidden');
        
        // 3. സ്വാഗത സന്ദേശം കാണിക്കാൻ തുടങ്ങുന്നു
        showWelcomeMessage();
    });

    // "Start" ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ
    startBtn.addEventListener('click', () => {
        startBtn.classList.add('hidden');
        showCategoryMessage();
    });

    // സ്വാഗത സന്ദേശം കാണിക്കുക
    function showWelcomeMessage() {
        typeMessage("Welcome to the Sahithyotsav Results Bot!", () => {
            startBtn.classList.remove('hidden');
        });
    }

    // കാറ്റഗറി തിരഞ്ഞെടുക്കാനുള്ള സന്ദേശം
    function showCategoryMessage() {
        typeMessage("Please select a category to view results.", fetchCategories);
    }
    
    // കാറ്റഗറികൾ API-ൽ നിന്ന് എടുത്ത് ബട്ടനുകളായി കാണിക്കുക
    async function fetchCategories() {
        // കാറ്റഗറി ബട്ടണുകൾ കാണിക്കുന്നതിന് മുൻപ് പഴയവ നീക്കം ചെയ്യുന്നു
        const existingButtons = actionArea.querySelectorAll('.action-btn');
        existingButtons.forEach(btn => btn.style.display = 'none');

        const response = await fetch(`${API_URL}?action=getCategories`);
        const categories = await response.json();
        
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = category;
            btn.onclick = () => {
                currentCategory = category;
                addUserMessage(category);
                // കാറ്റഗറി ബട്ടണുകൾ ഹൈഡ് ചെയ്യാതെ പ്രോഗ്രാം കാണിക്കുന്നു
                showProgramMessage(category);
            };
            actionArea.appendChild(btn);
        });
    }

    // പ്രോഗ്രാം തിരഞ്ഞെടുക്കാനുള്ള സന്ദേശം
    function showProgramMessage(category) {
        typeMessage(`Results for: ${category}`);
        typeMessage("Please select a program:", () => fetchPrograms(category));
    }

    // പ്രോഗ്രാമുകൾ API-ൽ നിന്ന് എടുത്ത് ബട്ടനുകളായി കാണിക്കുക
    async function fetchPrograms(category) {
        // പഴയ ആക്ഷൻ ബട്ടണുകൾ നീക്കം ചെയ്യുന്നു
        actionArea.innerHTML = '';
        const response = await fetch(`${API_URL}?action=getPrograms&category=${encodeURIComponent(category)}`);
        const programs = await response.json();
        
        programs.forEach(program => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = program;
            btn.onclick = () => {
                addUserMessage(program);
                fetchResults(currentCategory, program);
            };
            actionArea.appendChild(btn);
        });
    }
    
    // റിസൾട്ടുകൾ API-ൽ നിന്ന് എടുക്കുക
    async function fetchResults(category, program) {
        actionArea.innerHTML = ''; 
        typeMessage('Fetching results...', async () => {
            const response = await fetch(`${API_URL}?action=getResults&category=${encodeURIComponent(category)}&program=${encodeURIComponent(program)}`);
            const results = await response.json();
            // പഴയ മെസ്സേജുകൾ നീക്കം ചെയ്യുന്നു
            const botMessages = chatBox.querySelectorAll('.bot-message, .user-message, .result-card');
            botMessages.forEach(msg => msg.remove());
            displayResults(results);
        });
    }

    // റിസൾട്ടുകൾ ഇമേജ് ആയി കാണിക്കുക
    function displayResults(results) {
        if (results.length === 0) {
            typeMessage("No results found for this selection.");
        } else {
            results.forEach(result => {
                const resultCard = `
                    <div class="result-card">
                        <img src="${result.ImageURL}" alt="${result.Name}">
                        <p>${result.Name} - <strong>${result.Position}</strong></p>
                        <a href="${result.ImageURL}" download="${result.Name}_${result.Program}.jpg" class="download-icon">📥</a>
                    </div>
                `;
                addRawHtmlToBot(resultCard);
            });
        }
        
        // തിരികെ പോകാനുള്ള ബട്ടൺ
        const backButton = document.createElement('button');
        backButton.className = 'action-btn';
        backButton.innerText = 'Back to Programs';
        backButton.onclick = () => {
            actionArea.innerHTML = '';
            const messages = chatBox.querySelectorAll('.result-card, .bot-message, .user-message');
            messages.forEach(msg => msg.remove());
            showProgramMessage(currentCategory);
        };

        const backToCatButton = document.createElement('button');
        backToCatButton.className = 'action-btn';
        backToCatButton.innerText = 'Back to Categories';
        backToCatButton.onclick = () => {
             actionArea.innerHTML = '';
             const messages = chatBox.querySelectorAll('.result-card, .bot-message, .user-message');
             messages.forEach(msg => msg.remove());
             showCategoryMessage();
        };

        actionArea.appendChild(backButton);
        actionArea.appendChild(backToCatButton);
    }
    
    // ടൈപ്പിംഗ് എഫക്റ്റോടു കൂടി സന്ദേശം ചേർക്കാൻ ഈ ഫംഗ്ഷൻ ഉപയോഗിക്കുന്നു
    function typeMessage(text, callback) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        chatBox.appendChild(msgDiv);
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                msgDiv.textContent += text.charAt(i);
                i++;
                chatBox.scrollTop = chatBox.scrollHeight;
            } else {
                clearInterval(interval);
                if (callback) {
                    callback();
                }
            }
        }, 50); // ടൈപ്പിംഗ് വേഗത (milliseconds)
    }

    function addRawHtmlToBot(html) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.innerHTML = html;
        chatBox.appendChild(wrapperDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerText = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
