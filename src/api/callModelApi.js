
// callmodelapi.js
const MODEL_API_URL = "https://api-inference.huggingface.co/models/google/gemma-2b";

export const callModel = async (inputText) => {
  const data = {
    inputs: inputText,
  };

  try {
    const response = await fetch(MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Response not OK:', response.statusText);
      throw new Error(`Failed to fetch model prediction: ${response.statusText}`);
    }

    const result = await response.json();
    // Assuming the response structure is an array with objects that contain 'generated_text'
    if (Array.isArray(result) && result.length > 0 && result[0].hasOwnProperty('generated_text')) {
      return result[0]; // Return the first object in the array
    } else {
      throw new Error("Unexpected response structure from the API");
    }
  } catch (error) {
    console.error('Error in callModel:', error);
    throw error;
  }
};
