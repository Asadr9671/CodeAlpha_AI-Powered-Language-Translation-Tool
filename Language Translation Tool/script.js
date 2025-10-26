// Language Translation Tool - JavaScript
const sourceText = document.getElementById('source-text');
const targetText = document.getElementById('target-text');
const sourceLang = document.getElementById('source-lang');
const targetLang = document.getElementById('target-lang');
const translateBtn = document.getElementById('translate-btn');
const swapBtn = document.getElementById('swap-btn');
const copyBtn = document.getElementById('copy-btn');
const speakBtn = document.getElementById('speak-btn');
const statusMessage = document.getElementById('status-message');
const charCount = document.querySelector('.char-count');

// Character counter
sourceText.addEventListener('input', function() {
    const length = this.value.length;
    charCount.textContent = `${length} / 5000 characters`;
    
    if (length > 5000) {
        this.value = this.value.substring(0, 5000);
        charCount.textContent = '5000 / 5000 characters';
        charCount.style.color = '#e74c3c';
    } else {
        charCount.style.color = '#999';
    }
    
    targetText.textContent = 'Translation will appear here...';
});

// Translate function using MyMemory Translation API
async function translateText() {
    const text = sourceText.value.trim();
    
    if (!text) {
        showStatus('Please enter text to translate', 'error');
        return;
    }
    
    translateBtn.classList.add('loading');
    translateBtn.disabled = true;
    targetText.textContent = 'Translating...';
    
    try {
        const sourceLangCode = sourceLang.value === 'auto' ? 'en' : sourceLang.value;
        const targetLangCode = targetLang.value;
        
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|${targetLangCode}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseStatus === 200 || data.responseData) {
            const translation = data.responseData.translatedText;
            
            targetText.textContent = '';
            let index = 0;
            
            const typingInterval = setInterval(() => {
                if (index < translation.length) {
                    targetText.textContent += translation.charAt(index);
                    index++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 20);
            
            showStatus('Translation completed successfully!', 'success');
        } else {
            throw new Error('Translation failed');
        }
    } catch (error) {
        console.error('Translation error:', error);
        targetText.textContent = 'Translation failed. Please try again.';
        showStatus('Translation failed. Please check your connection and try again.', 'error');
    } finally {
        translateBtn.classList.remove('loading');
        translateBtn.disabled = false;
    }
}

translateBtn.addEventListener('click', translateText);

sourceText.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateText();
    }
});

// Swap languages
swapBtn.addEventListener('click', function() {
    if (sourceLang.value === 'auto') {
        showStatus('Cannot swap with Auto Detect', 'error');
        return;
    }
    
    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;
    
    const tempText = sourceText.value;
    sourceText.value = targetText.textContent !== 'Translation will appear here...' 
        ? targetText.textContent 
        : '';
    
    if (tempText && targetText.textContent !== 'Translation will appear here...') {
        targetText.textContent = tempText;
    }
    
    this.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
        this.style.transform = '';
    }, 300);
});

// Copy to clipboard
copyBtn.addEventListener('click', async function() {
    const text = targetText.textContent;
    
    if (text === 'Translation will appear here...' || !text) {
        showStatus('No translation to copy', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showStatus('Translation copied to clipboard!', 'success');
        
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    } catch (error) {
        showStatus('Failed to copy text', 'error');
    }
});

// Text to speech
speakBtn.addEventListener('click', function() {
    const text = targetText.textContent;
    
    if (text === 'Translation will appear here...' || !text) {
        showStatus('No translation to speak', 'error');
        return;
    }
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang.value;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        this.style.color = '#e74c3c';
        
        utterance.onend = () => {
            this.style.color = '';
            showStatus('Speech completed', 'success');
        };
        
        utterance.onerror = () => {
            this.style.color = '';
            showStatus('Speech failed', 'error');
        };
        
        window.speechSynthesis.speak(utterance);
        showStatus('Speaking...', 'success');
    } else {
        showStatus('Text-to-speech not supported in your browser', 'error');
    }
});

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

window.addEventListener('load', () => {
    translateBtn.classList.add('pulse');
    setTimeout(() => {
        translateBtn.classList.remove('pulse');
    }, 3000);
});
