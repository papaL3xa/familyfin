import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAppScript(apiKey, spreadsheetUrl, description) {
  if (!apiKey) throw new Error("API Key is required");
  if (!spreadsheetUrl) throw new Error("Spreadsheet URL is required");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert Google Apps Script developer. The user wants to create a web application using Google Apps Script based on a spreadsheet.
Here is the Google Spreadsheet URL (assume it is public): ${spreadsheetUrl}
Here is the description of what the app should do:
${description}

Please generate the necessary code for:
1. code.gs (The Google Apps Script backend code)
2. index.html (The frontend HTML/JS/CSS code)

Make sure the code is production-ready, clean, and well-commented.
Return the output strictly in the following JSON format without any markdown blocks outside the JSON, just the JSON object:
{
  "gsCode": "code for code.gs here",
  "htmlCode": "code for index.html here"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response. 
    // Gemini might wrap it in ```json ... ``` so we clean it up first.
    let cleanText = text.trim();
    if (cleanText.startsWith('\`\`\`json')) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.startsWith('\`\`\`')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('\`\`\`')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }

    try {
      const data = JSON.parse(cleanText);
      return {
        gsCode: data.gsCode || "// Error: gsCode not generated properly\n" + text,
        htmlCode: data.htmlCode || "<!-- Error: htmlCode not generated properly -->\n" + text
      };
    } catch (e) {
      console.error("Failed to parse JSON from Gemini", text);
      throw new Error("Failed to parse the response from AI. Please try again.");
    }
    
  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}
