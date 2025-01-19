import { Card } from '@/components/ui/card'
import { Cloud, CloudRain, Sun } from 'lucide-react'

interface WeatherCardProps {
  temperature: number
  condition: string
  time: string
  isNow?: boolean
}

export function WeatherCard({ temperature, condition, time, isNow }: WeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
        return <CloudRain className="h-6 w-6" />
      case 'cloudy':
        return <Cloud className="h-6 w-6" />
      default:
        return <Sun className="h-6 w-6" />
    }
  }

  return (
    <Card className={`glass-card p-6 ${isNow ? 'bg-white/20' : 'bg-white/10'} backdrop-blur-xl border-white/20 rounded-xl`}>
      <div className="flex flex-col items-center gap-2 text-white">
        {getWeatherIcon(condition)}
        <div className="text-2xl font-bold">{temperature}°</div>
        <div className="text-sm text-white/70">{time}</div>
      </div>
    </Card>
  )
}

