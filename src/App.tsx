import { useState, useRef } from 'react'
import './App.css'
import { analyzeImage, generateSpeech } from './services/openai'

function App() {
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [personaUrl, setPersonaUrl] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleAnalyzeImage = async () => {
    if (!imageUrl) return
    
    setIsLoading(true)
    try {
      const description = await analyzeImage(imageUrl, personaUrl)
      setDescription(description)
      // Generate speech right after getting the description
      const speechUrl = await generateSpeech(description)
      setAudioUrl(speechUrl)
    } catch (error) {
      console.error('Error:', error)
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpeak = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
    }
  }

  const handleDownloadAudio = async () => {
    if (!description) return;
    
    setIsDownloading(true)
    try {
      const speechUrl = await generateSpeech(description)
      // Erstelle einen temporären Link zum Herunterladen
      const link = document.createElement('a')
      link.href = speechUrl
      link.download = 'alt-text-audio.mp3'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Generieren der Audiodatei')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="container">
      <h1>Hotel Image Analyzer</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Geben Sie die Hotel-Bild URL ein"
          className="url-input"
        />
        <button 
          onClick={handleAnalyzeImage}
          disabled={!imageUrl || isLoading}
          className="analyze-button"
        >
          {isLoading ? 'Analysiere...' : 'Bild analysieren'}
        </button>
      </div>

      {imageUrl && (
        <div className="image-preview">
          <img src={imageUrl} alt="Hotel Vorschau" />
        </div>
      )}

      <div className="persona-section">
        <h2>Persona Poster</h2>
        <p>Fügen Sie optional eine URL zu einem Persona-Poster ein, um die Bildanalyse auf spezifische Bedürfnisse anzupassen.</p>
        <div className="input-section">
          <input
            type="text"
            value={personaUrl}
            onChange={(e) => setPersonaUrl(e.target.value)}
            placeholder="Geben Sie die Persona-Poster URL ein"
            className="url-input"
          />
        </div>
        {personaUrl && (
          <div className="persona-preview">
            <h3>Geladenes Persona-Poster:</h3>
            <img src={personaUrl} alt="Persona Poster" className="persona-poster" />
          </div>
        )}
      </div>

      {description && (
        <div className="results-section">
          <h2>Bildbeschreibung</h2>
          <p>{description}</p>
          <div className="button-group">
            <button 
              className="speak-button"
              onClick={handleSpeak}
              disabled={!audioUrl}
            >
              Beschreibung vorlesen
            </button>
            <button 
              className="download-button"
              onClick={handleDownloadAudio}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="spinner"></span>
                  MP3 wird erstellt...
                </>
              ) : (
                'MP3 herunterladen'
              )}
            </button>
          </div>
          <audio ref={audioRef} src={audioUrl || ''} />
          <div className="alt-text">
            <h3>Generierter Alt-Text:</h3>
            <code>{description}</code>
          </div>
        </div>
      )}
    </div>
  )
}

export default App; 