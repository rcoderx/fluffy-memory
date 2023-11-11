document.addEventListener('DOMContentLoaded', function() {
    const answerForm = document.getElementById('answerForm');
    const shareButton = document.getElementById('shareButton');
    const twitterLinkInput = document.getElementById('twitterLink');
    let userAccount = null; // Variable to store the user's Ethereum account

    answerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const answer = document.getElementById('answer').value;
        const twitterLink = twitterLinkInput.value;
        const recaptchaResponse = grecaptcha.getResponse(); // Get reCAPTCHA response

        submitAnswer(answer, twitterLink, recaptchaResponse, userAccount);
    });


    shareButton.addEventListener('click', function() {
        const shareMessage = document.getElementById('shareMessage');
        shareMessage.style.display = 'block';
        shareMessage.select();
        document.execCommand('copy');
        shareMessage.style.display = 'none';
        alert('Message copied to clipboard!');

        shareButton.classList.add('disabled');
        shareButton.disabled = true;
    });
});

document.getElementById('connectWallet').addEventListener('click', function() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(function(accounts) {
            console.log('Connected account:', accounts[0]);
            userAccount = accounts[0]; // Store the connected account

            // Update UI to show the wallet is connected
            const connectWalletButton = document.getElementById('connectWallet');
            connectWalletButton.innerText = 'Wallet Connected';
            connectWalletButton.disabled = true;

            // Display the user's wallet address
            const walletDisplay = document.createElement('div');
            walletDisplay.textContent = `Connected Wallet: ${userAccount}`;
            document.body.appendChild(walletDisplay);

            // Optionally, update other parts of your UI here
        })
        .catch(function(error) {
            console.error('Error connecting to wallet:', error);
        });
    } else {
        alert('Ethereum wallet is not available. Please install MetaMask.');
    }
});

function submitAnswer(answer, twitterLink, recaptchaResponse, userAccount) {
    // Hash the answer using jsSHA
    const shaObj = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
    shaObj.update(answer);
    const answerHash = shaObj.getHash("HEX");

      // Send the answer hash, Twitter link, reCAPTCHA response, and user's Ethereum account to the server
      fetch('https://fuzzy-couscous-production.up.railway.app', {
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