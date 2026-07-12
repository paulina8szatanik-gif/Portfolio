/* AI assistant chat widget.
   Answers recruiter questions about Paulina using the proxy in
   ai-assistant/worker.js. Set WORKER_URL after deploying the worker. */

const WORKER_URL = ''; // e.g. 'https://portfolio-chat.yourname.workers.dev'

const SUGGESTIONS = [
  'What has she shipped at Testo?',
  'How does she use AI in her design work?',
  'Is she open to new roles?',
];

const root = document.createElement('div');
root.className = 'chat-root';
root.innerHTML = `
  <button class="chat-bubble" aria-expanded="false" aria-controls="chat-panel">
    Ask me about Paulina's work&nbsp;&nbsp;↑
  </button>
  <section class="chat-panel" id="chat-panel" hidden aria-label="Chat with Paulina's assistant">
    <header class="chat-head">
      <div>
        <p class="chat-title">Paulina's assistant</p>
        <p class="chat-note">AI — answers about Paulina's work &amp; experience</p>
      </div>
      <button class="chat-close" aria-label="Close chat">✕</button>
    </header>
    <div class="chat-messages" role="log" aria-live="polite">
      <div class="chat-msg from-ai">Hi! I'm Paulina's assistant. Ask me anything about her experience, case studies, or how she works.</div>
      <div class="chat-suggestions">
        ${SUGGESTIONS.map((s) => `<button class="chat-chip">${s}</button>`).join('')}
      </div>
    </div>
    <form class="chat-form">
      <input class="chat-input" type="text" placeholder="Ask a question..." maxlength="500" aria-label="Your question">
      <button class="chat-send button" type="submit">Send</button>
    </form>
  </section>
`;
document.body.appendChild(root);

const bubble = root.querySelector('.chat-bubble');
const panel = root.querySelector('.chat-panel');
const closeBtn = root.querySelector('.chat-close');
const messagesEl = root.querySelector('.chat-messages');
const form = root.querySelector('.chat-form');
const input = root.querySelector('.chat-input');

const history = []; // {role, content} pairs sent to the assistant
let busy = false;

function togglePanel(open) {
  panel.hidden = !open;
  bubble.setAttribute('aria-expanded', String(open));
  if (open) input.focus();
}
bubble.addEventListener('click', () => togglePanel(panel.hidden));
closeBtn.addEventListener('click', () => togglePanel(false));

root.querySelectorAll('.chat-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    input.value = chip.textContent;
    form.requestSubmit();
  });
});

function addMessage(cls, text) {
  const el = document.createElement('div');
  el.className = `chat-msg ${cls}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question || busy) return;

  if (!WORKER_URL) {
    addMessage('from-user', question);
    addMessage('from-ai', "The assistant isn't connected yet — please email paulina8szatanik@gmail.com instead.");
    input.value = '';
    return;
  }

  busy = true;
  input.value = '';
  root.querySelector('.chat-suggestions')?.remove();
  addMessage('from-user', question);
  history.push({ role: 'user', content: question });

  const aiEl = addMessage('from-ai is-thinking', '…');

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Send only the recent turns to keep requests small.
      body: JSON.stringify({ messages: history.slice(-12) }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Read the streaming response and render text as it arrives.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = '';
    let buffer = '';
    aiEl.classList.remove('is-thinking');
    aiEl.textContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep the last partial line for the next chunk
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            answer += event.delta.text;
            aiEl.textContent = answer;
            messagesEl.scrollTop = messagesEl.scrollHeight;
          }
        } catch {
          /* ignore non-JSON keepalive lines */
        }
      }
    }

    if (!answer) throw new Error('empty response');
    history.push({ role: 'assistant', content: answer });
  } catch (err) {
    aiEl.classList.remove('is-thinking');
    aiEl.textContent = "Sorry, something went wrong. Please try again, or email paulina8szatanik@gmail.com.";
    history.pop(); // drop the failed turn so it isn't resent
  } finally {
    busy = false;
    input.focus();
  }
});
