document.addEventListener("DOMContentLoaded", function() {
    const quoteElement = document.getElementById("quote");
    const authorElement = document.getElementById("author");

    // Fetch and display the quote
    fetchQuote().then(([quote, author]) => {
        quoteElement.textContent = `"${quote}"`;
        authorElement.textContent = `~ ${author}`;
    });
    
    async function fetchQuote() {
        const response = await fetch("https://thequoteshub.com/api/");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
        return [data.text, data.author];
    }
});

