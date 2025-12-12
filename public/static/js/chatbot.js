// Chatbot Widget pour Les Voyages de Jess
(function() {
  // Éléments DOM
  const widgetButton = document.getElementById('chat-widget-button');
  const widgetWindow = document.getElementById('chat-widget-window');
  const closeChat = document.getElementById('close-chat');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  
  // Historique de conversation
  let conversationHistory = [];

  // Ouvrir le widget
  widgetButton.addEventListener('click', function() {
    widgetWindow.classList.remove('chat-widget-hidden');
    userInput.focus();
  });

  // Fermer le widget
  closeChat.addEventListener('click', function() {
    widgetWindow.classList.add('chat-widget-hidden');
  });

  // Ajouter un message dans le chat
  function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser 
      ? 'chat-message chat-message-user' 
      : 'chat-message chat-message-bot';
    
    const p = document.createElement('p');
    p.textContent = text;
    p.style.whiteSpace = 'pre-wrap';
    
    messageDiv.appendChild(p);
    chatMessages.appendChild(messageDiv);
    
    // Scroll vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Envoyer un message
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Afficher le message de l'utilisateur
    addMessage(message, true);
    userInput.value = '';
    sendButton.disabled = true;
    sendButton.textContent = '⏳';

    // Ajouter à l'historique
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Détection de la devise et du pays
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let currency = 'EUR';
    let countryName = 'Europe';

    if (userTimezone.includes('America/Toronto') || userTimezone.includes('America/Montreal')) {
      currency = 'CAD';
      countryName = 'Canada';
    } else if (userTimezone.includes('America/')) {
      currency = 'USD';
      countryName = 'États-Unis';
    } else {
      currency = 'EUR';
      countryName = 'Europe';
    }

    try {
      // Appel API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Currency': currency,
          'X-User-Country': countryName
        },
        body: JSON.stringify({
          message,
          history: conversationHistory.slice(0, -1)
        })
      });

      const data = await response.json();
      
      if (data.error) {
        addMessage('❌ Erreur de connexion. Veuillez réessayer.', false);
        conversationHistory.pop(); // Retirer le message de l'historique
      } else {
        const reply = data.reply;
        addMessage(reply, false);
        
        // Ajouter la réponse à l'historique
        conversationHistory.push({
          role: 'assistant',
          content: reply
        });
        
        console.log('Tokens utilisés:', data.usage);
        console.log('Historique:', conversationHistory.length, 'messages');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      addMessage('❌ Erreur de connexion. Veuillez réessayer.', false);
      conversationHistory.pop();
    }

    // Réactiver le bouton
    sendButton.disabled = false;
    sendButton.textContent = '➤';
    userInput.focus();
  }

  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  
  // ============================================
  // GESTION DES CLICS SUR LES TAGS DE DESTINATIONS
  // ============================================
  
  // Fonction pour ouvrir le chatbot avec un message pré-rempli
  function openChatWithMessage(destination) {
    // Ouvrir le widget
    widgetWindow.classList.remove('chat-widget-hidden');
    
    // Pré-remplir le champ de saisie
    userInput.value = `Je souhaite partir en ${destination}`;
    
    // Focus sur le champ
    userInput.focus();
    
    // Optionnel : Envoyer automatiquement le message
    // sendMessage();
  }
  
  // Attacher les événements aux tags de destinations
  function attachDestinationTags() {
    const countryTags = document.querySelectorAll('.country-tag');
    
    countryTags.forEach(tag => {
      tag.style.cursor = 'pointer';
      
      tag.addEventListener('click', function() {
        const destination = this.textContent.trim();
        openChatWithMessage(destination);
      });
    });
  }
  
  // Attacher les événements quand le DOM est chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDestinationTags);
  } else {
    attachDestinationTags();
  }

  console.log('✅ Chatbot Les Voyages de Jess chargé');
})();

