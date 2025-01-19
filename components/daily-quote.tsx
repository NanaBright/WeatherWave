'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Quote } from 'lucide-react'

interface QuoteData {
  text: string
  author: string
}

export function DailyQuote() {
  const [quote, setQuote] = useState<QuoteData>({ text: '', author: '' })
  const [loading, setLoading] = useState(true)

  const fetchQuoteFromRapidAPI = async () => {
    const url = 'https://random-quote-generator2.p.rapidapi.com/randomQuote'
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'd53da96f6dmshd0e2d2972d46669p151095jsn4fd3cefd227d', // Your API key
        'x-rapidapi-host': 'random-quote-generator2.p.rapidapi.com'
      }
    }

    try {
      const response = await fetch(url, options)
      const result = await response.json()

      return { text: result.quote, author: result.author }
    } catch (error) {
      console.error('Error fetching from RapidAPI:', error)
      return null
    }
  }

  const fetchRandomQuote = async () => {
    setLoading(true)
    const quoteData = await fetchQuoteFromRapidAPI()

    if (quoteData) {
      setQuote(quoteData)
    } else {
      setQuote({
        text: 'Weather is a great metaphor for life - sometimes it\'s good, sometimes it\'s bad, and there\'s nothing much you can do about it but carry an umbrella.',
        author: 'Terri Guillemets',
      })
      console.error('Quote API failed!')
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRandomQuote()
  }, [])

  if (loading) {
    return (
      <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20 relative overflow-hidden">
        <p className="text-lg text-white/90 italic">Loading...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20 relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Quote className="h-6 w-6 text-white/20" />
      </div>
      <div className="space-y-2 max-w-2xl">
        <p className="text-lg text-white/90 italic">"{quote.text}"</p>
        <p className="text-sm text-white/60">— {quote.author}</p>
      </div>
    </Card>
  )
}
