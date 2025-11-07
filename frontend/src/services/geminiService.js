// Client-side Gemini AI fallback for disease detection
import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export const analyzePlantDisease = async (imageFile) => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Remove data URL prefix
    const base64Data = base64Image.split(',')[1];
    
    const requestBody = {
      contents: [{
        parts: [
          {
            text: `You are an expert plant pathologist. Analyze this plant image and provide:
1. Disease name (if any)
2. Confidence level (0-100%)
3. Detailed description of the disease
4. Treatment recommendations
5. Prevention tips

If the plant is healthy, say "Healthy Plant" with 95% confidence.
Format your response as JSON with these exact fields: disease_name, confidence, description, treatment, prevention`
          },
          {
            inline_data: {
              mime_type: imageFile.type,
              data: base64Data
            }
          }
        ]
      }]
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse Gemini response
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response
    let result;
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse text manually
        result = parseTextResponse(text);
      }
    } catch (e) {
      result = parseTextResponse(text);
    }

    return {
      success: true,
      disease_name: result.disease_name || 'Unknown',
      confidence: result.confidence || 85,
      description: result.description || text,
      treatment: result.treatment || 'Consult with agricultural expert',
      prevention: result.prevention || 'Maintain good plant hygiene',
      source: 'Gemini AI'
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to parse text response if JSON parsing fails
const parseTextResponse = (text) => {
  const lines = text.split('\n');
  let disease_name = 'Unknown Disease';
  let confidence = 85;
  let description = '';
  let treatment = '';
  let prevention = '';

  lines.forEach(line => {
    if (line.toLowerCase().includes('disease') && line.includes(':')) {
      disease_name = line.split(':')[1].trim();
    } else if (line.toLowerCase().includes('confidence')) {
      const match = line.match(/(\d+)/);
      if (match) confidence = parseInt(match[1]);
    } else if (line.toLowerCase().includes('description')) {
      description = line.split(':')[1]?.trim() || '';
    } else if (line.toLowerCase().includes('treatment')) {
      treatment = line.split(':')[1]?.trim() || '';
    } else if (line.toLowerCase().includes('prevention')) {
      prevention = line.split(':')[1]?.trim() || '';
    }
  });

  return {
    disease_name,
    confidence,
    description: description || text,
    treatment: treatment || 'Consult with agricultural expert',
    prevention: prevention || 'Maintain good plant hygiene'
  };
};

export default { analyzePlantDisease };
