const axios = require('axios');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.0';

// This service calls the Gemini API. If API key not present, it returns a simple heuristic fallback.
exports.predict = async ({ glucose, haemoglobin, cholesterol }) => {
  // Build prompt
  const prompt = `Given glucose=${glucose}, haemoglobin=${haemoglobin}, cholesterol=${cholesterol}, provide: Possible Condition, Reason, Recommendation in JSON.`;

  if (!GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set, using fallback heuristic');
    // Simple heuristic
    let possibleCondition = 'Normal';
    let reason = 'All values within typical ranges.';
    let recommendation = 'Maintain healthy lifestyle.';

    if (glucose > 125) {
      possibleCondition = 'High Risk of Diabetes';
      reason = 'Glucose level is above normal.';
      recommendation = 'Consult a doctor and maintain a healthy diet.';
    } else if (cholesterol > 240) {
      possibleCondition = 'High Cholesterol';
      reason = 'Cholesterol level is high.';
      recommendation = 'Consider lipid-lowering diet and consult physician.';
    } else if (haemoglobin < 12) {
      possibleCondition = 'Low Haemoglobin / Anemia risk';
      reason = 'Haemoglobin is below normal.';
      recommendation = 'Get iron-rich foods and consult a physician.';
    }

    return { possibleCondition, reason, recommendation };
  }

  try {
    const res = await axios.post('https://api.gemini.example/v1/generate', {
      model: GEMINI_MODEL,
      prompt,
      max_tokens: 300
    }, {
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Parse response depending on Gemini shape. Expecting text with JSON.
    const text = res.data?.output || res.data?.choices?.[0]?.text || JSON.stringify(res.data);
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseErr) {
      // Fallback: attempt to extract the JSON substring
      const m = text.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
      return { possibleCondition: text, reason: '', recommendation: '' };
    }
  } catch (err) {
    logger.error('Gemini API error', err.message || err);
    throw new Error('Prediction service unavailable');
  }
};
