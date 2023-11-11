let userAccount = null; // Declare userAccount globally

document.addEventListener('DOMContentLoaded', function() {
    const answerForm = document.getElementById('answerForm');
    const shareButton = document.getElementById('shareButton');
    const twitterLinkInput = document.getElementById('twitterLink');
    const shareMessage = document.getElementById('shareMessage');

    shareButton.addEventListener('click', function() {
        shareMessage.style.display = 'block';
        shareMessage.select();
        document.execCommand('copy');
        shareMessage.style.display = 'none';
        alert('Message copied to clipboard!');
        shareButton.classList.add('disabled');
        shareButton.disabled = true;
    });

    answerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const answer = document.getElementById('answer').value;
        const twitterLink = twitterLinkInput.value;
        const recaptchaResponse = grecaptcha.getResponse();
        submitAnswer(answer, twitterLink, recaptchaResponse, userAccount);
    });
});

document.getElementById('connectWallet').addEventListener('click', function() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(function(accounts) {
            console.log('Connected account:', accounts[0]);
            userAccount = accounts[0];
            document.getElementById('submitAnswerButton').disabled = false;
            const connectWalletButton = document.getElementById('connectWallet');
            connectWalletButton.innerText = 'Wallet Connected';
            connectWalletButton.disabled = true;
            const walletDisplay = document.createElement('div');
            walletDisplay.textContent = `Connected Wallet: ${userAccount}`;
            document.body.appendChild(walletDisplay);
        })
        .catch(function(error) {
            console.error('Error connecting to wallet:', error);
        });
    } else {
        alert('Ethereum wallet is not available. Please install MetaMask.');
    }
});

async function submitAnswer(answer, twitterLink, recaptchaResponse, userAccount) {
    const encoder = new TextEncoder();
    const data = encoder.encode(answer);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const answerHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Submitting answer with userAccount:', userAccount);
    fetch('https://fuzzy-couscous-production.up.railway.app/submit-answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answerHash, twitterLink, recaptchaResponse, userAccount }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
