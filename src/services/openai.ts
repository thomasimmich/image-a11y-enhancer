import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Nur für Entwicklungszwecke
});

async function extractPersonaInfo(svgUrl: string): Promise<string> {
  try {
    const response = await fetch(svgUrl);
    const text = await response.text();
    
    // Extrahiere den Text aus dem SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const textContent = doc.body.textContent || '';
    
    // Analysiere den Inhalt mit GPT, um strukturierte Informationen zu erhalten
    const response2 = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Extrahiere die wichtigsten Informationen über die Persona aus dem folgenden Text. Fokussiere dich auf Einschränkungen, Bedürfnisse und Frustrationspunkte. Formatiere die Antwort als klare Liste."
        },
        {
          role: "user",
          content: textContent
        }
      ]
    });

    return response2.choices[0]?.message?.content || 'Keine Persona-Informationen verfügbar';
  } catch (error) {
    console.error('Error extracting persona info:', error);
    throw new Error('Fehler beim Extrahieren der Persona-Informationen');
  }
}

export async function analyzeImage(imageUrl: string, personaUrl?: string): Promise<string> {
  try {
    let personaInfo = '';
    if (personaUrl) {
      personaInfo = await extractPersonaInfo(personaUrl);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Beschreibe dieses Hotelbild detailliert und barrierefrei. ${
                personaInfo ? 
                `Berücksichtige dabei besonders die folgenden Einschränkungen und Bedürfnisse der Persona: ${personaInfo}. 
                Hebe besonders die Aspekte hervor, die für diese Person relevant sind und erkläre, ob und wie gut das Hotel für diese Person geeignet ist.
                Berücksichtige dabei besonders: Zugänglichkeit, Orientierungshilfen, Verfügbarkeit von Assistenz, klare Ausschilderung, potenzielle Hindernisse oder Gefahrenstellen.` 
                : 'Fokussiere dich besonders auf Aspekte der Barrierefreiheit und Zugänglichkeit.'
              } Gib die Beschreibung auf Deutsch aus.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Keine Beschreibung verfügbar';
  } catch (error) {
    console.error('Error in image analysis:', error);
    throw new Error('Fehler bei der Bildanalyse');
  }
}

export async function generateSpeech(text: string): Promise<string> {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",  // Angenehmere Stimme für deutsche Texte
      input: text,
    });

    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error in speech generation:', error);
    throw new Error('Fehler bei der Sprachgenerierung');
  }
} 