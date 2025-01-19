import { Card } from '@/components/ui/card'
import { Wind, Droplets, Cloud } from 'lucide-react'

interface WeatherDetailsProps {
  humidity: number
  windSpeed: number
  cloudCover: number
}

export function WeatherDetails({ humidity, windSpeed, cloudCover }: WeatherDetailsProps) {
  return (
    <Card className="glass-card p-6 rounded-xl">
      <div className="grid grid-cols-3 gap-6 text-white">
        <div className="flex flex-col items-center gap-2">
          <Droplets className="h-6 w-6 text-blue-400" />
          <div className="text-sm text-white/70">Humidity</div>
          <div className="text-xl font-bold">{humidity}%</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Wind className="h-6 w-6 text-green-400" />
          <div className="text-sm text-white/70">Wind</div>
          <div className="text-xl font-bold">{windSpeed} km/h</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Cloud className="h-6 w-6 text-purple-400" />
          <div className="text-sm text-white/70">Cloud Cover</div>
          <div className="text-xl font-bold">{cloudCover}%</div>
        </div>
      </div>
    </Card>
  )
}

