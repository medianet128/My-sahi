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

    // "Get Results" ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ
    getResultBtn.addEventListener('click', () => {
        landingPage.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        showWelcomeMessage();
    });

    // "Start" ബട്ടൺ ക്ലിക്ക് ചെയ്യുമ്പോൾ
    startBtn.addEventListener('click', () => {
        startBtn.classList.add('hidden');
        showCategoryMessage();
    });

    // സ്വാഗത സന്ദേശം കാണിക്കുക
    function showWelcomeMessage() {
        addBotMessage("Welcome to the Sahithyotsav Results Bot!", () => {
            startBtn.classList.remove('hidden');
        });
    }

    // കാറ്റഗറി തിരഞ്ഞെടുക്കാനുള്ള സന്ദേശം
    function showCategoryMessage() {
        addBotMessage("Please select a category to view results.", fetchCategories);
    }
    
    // കാറ്റഗറികൾ API-ൽ നിന്ന് എടുത്ത് ബട്ടനുകളായി കാണിക്കുക
    async function fetchCategories() {
        const response = await fetch(`${API_URL}?action=getCategories`);
        const categories = await response.json();
        actionArea.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = category;
            btn.onclick = () => {
                currentCategory = category;
                addUserMessage(category);
                showProgramMessage(category);
            };
            actionArea.appendChild(btn);
        });
    }

    // പ്രോഗ്രാം തിരഞ്ഞെടുക്കാനുള്ള സന്ദേശം
    function showProgramMessage(category) {
        addBotMessage(`Results for: ${category}`);
        addBotMessage("Please select a program:", () => fetchPrograms(category));
    }

    // പ്രോഗ്രാമുകൾ API-ൽ നിന്ന് എടുത്ത് ബട്ടനുകളായി കാണിക്കുക
    async function fetchPrograms(category) {
        const response = await fetch(`${API_URL}?action=getPrograms&category=${encodeURIComponent(category)}`);
        const programs = await response.json();
        actionArea.innerHTML = ''; // പഴയ ബട്ടണുകൾ നീക്കം ചെയ്യുന്നു
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
        actionArea.innerHTML = ''; // ബട്ടണുകൾ നീക്കം ചെയ്യുന്നു
        addBotMessage('Fetching results...', async () => {
            const response = await fetch(`${API_URL}?action=getResults&category=${encodeURIComponent(category)}&program=${encodeURIComponent(program)}`);
            const results = await response.json();
            displayResults(results);
        });
    }

    // റിസൾട്ടുകൾ ഇമേജ് ആയി കാണിക്കുക
    function displayResults(results) {
        if (results.length === 0) {
            addBotMessage("No results found for this selection.");
            return;
        }
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
        
        // തിരികെ പോകാനുള്ള ബട്ടൺ
        const backButton = document.createElement('button');
        backButton.className = 'action-btn';
        backButton.innerText = 'Back to Categories';
        backButton.onclick = () => {
            actionArea.innerHTML = '';
            chatBox.innerHTML = ''; // ചാറ്റ് ക്ലിയർ ചെയ്യാം (വേണമെങ്കിൽ)
            showCategoryMessage();
        };
        actionArea.appendChild(backButton);
    }

    // ചാറ്റ് ബോക്സിൽ ബോട്ട് സന്ദേശം ചേർക്കുക
    function addBotMessage(text, callback) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        msgDiv.innerText = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        if (callback) callback();
    }

    // ചാറ്റ് ബോക്സിൽ HTML ചേർക്കുക
    function addRawHtmlToBot(html) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.innerHTML = html;
        chatBox.appendChild(wrapperDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // യൂസർ സന്ദേശം ചേർക്കുക
    function addUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerText = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
