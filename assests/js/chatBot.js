import {GoogleGenerativeAI} from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyBuDsW04yXBn4aINO6ND87__R1bVeY2zjM";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize model
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});


// Handle sending messages
async function sendMessage() {
  const inputEl = document.querySelector(".chat-window input");
  const chatBox = document.querySelector(".chat-window .chat");
  const userMessage = inputEl.value.trim();

  if (!userMessage) return;

  // Add user message
  chatBox.insertAdjacentHTML(
    "beforeend",
    `<div class="user"><p>${userMessage}</p></div>`
  );

  inputEl.value = "";

  // Generate response
  try {
    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    // Add model response
    chatBox.insertAdjacentHTML(
      "beforeend",
      `<div class="bot"><p>${response}</p></div>`
    );
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error(err);
    chatBox.insertAdjacentHTML(
      "beforeend",
      `<div class="bot error"><p>Error: Unable to get response</p></div>`
    );
  }
}

// Add event listener for send button
document
  .querySelector(".chat-window .input-area button")
  .addEventListener("click", sendMessage);