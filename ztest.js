async function query(data) {
    const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2b", {
        headers: {
            Authorization: "Bearer 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",
            'Content-Type': 'application/json' // Explicitly set the content type to application/json
        },
        method: "POST",
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
}

query({"inputs": "Can you please let us know more details about your holiday and "}).then((response) => {
    console.log(JSON.stringify(response));
});
