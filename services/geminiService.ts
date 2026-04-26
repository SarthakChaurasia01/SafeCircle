export const askGemini = async (message: string) => {
  try {
    const API_KEY = "AIzaSyDw9z538DEcady7PteFvR_6xNqIIRb71Zg";

    // ✅ FIXED: Pointing to the active 2026 model 'gemini-2.5-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return `❌ ${data.error.message}`;
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI"
    );
  } catch (error) {
    console.log("Gemini error:", error);
    return "⚠️ Something went wrong";
  }
};