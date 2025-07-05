'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrackData {
    title: string;
    artist: string;
    audioUrl: string;
}

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.5)
    const [tracks, setTracks] = useState<TrackData[]>([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<TrackData[]>([])
    const [uploadedSong, setUploadedSong] = useState<File | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Enhanced music search with multiple sources and local files
    const fetchTracks = async (query: string) => {
        try {
            // First try to search for free music on Archive.org
            const archiveResponse = await fetch(
                `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(query)})%20AND%20mediatype:audio&fl=identifier,title,creator&rows=10&page=1&output=json`
            );
            
            if (archiveResponse.ok) {
                const archiveData = await archiveResponse.json();
                const archiveTracks = archiveData.response.docs.map((item: any) => ({
                    title: item.title || 'Unknown Title',
                    artist: item.creator || 'Unknown Artist',
                    audioUrl: `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`,
                    source: 'Archive.org'
                }));
                
                if (archiveTracks.length > 0) {
                    setSearchResults(archiveTracks);
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching from Archive.org:', error);
        }

        // Fallback to demo tracks
        const demoTracks = [
            {
                title: `Demo Song - ${query}`,
                artist: 'WeatherWave Demo',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                source: 'Demo'
            },
            {
                title: 'Relaxing Rain Sounds',
                artist: 'Nature Collection',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                source: 'Demo'
            },
            {
                title: 'Thunder Ambience',
                artist: 'Weather Sounds',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                source: 'Demo'
            }
        ];
        
        setSearchResults(demoTracks);
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleSliderChange = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = (value[0] / 100) * duration
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0] / 100)
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }

    const handleNextTrack = () => {
        setCurrentTrackIndex((prevIndex) =>
            prevIndex < tracks.length - 1 ? prevIndex + 1 : 0
        );
    }

    const handlePrevTrack = () => {
        setCurrentTrackIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : tracks.length - 1
        );
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTracks(searchTerm);
    }

    const handleSelectTrack = (index: number) => {
        setTracks(searchResults);
        setCurrentTrackIndex(index);
        setIsPlaying(false);
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedSong(file);
            const fileURL = URL.createObjectURL(file);
            if (audioRef.current) {
                audioRef.current.src = fileURL;
                audioRef.current.load();
            }
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    return (
        <Card className="glass-card p-4 fixed right-4 top-16 bottom-4 max-w-xs w-full mx-auto rounded-xl border-white/20">
            <audio
                ref={audioRef}
                src={tracks[currentTrackIndex]?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleNextTrack}
            />
            <div className="space-y-4">
                <form onSubmit={handleSearch} className="mb-4">
                    <Input
                        placeholder="Search for songs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" variant="ghost" className="text-white mt-2">
                        Search
                    </Button>
                </form>

                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        {searchResults.map((track, index) => (
                            <div
                                key={index}
                                className="cursor-pointer text-white text-sm hover:bg-white/10 p-2 rounded"
                                onClick={() => handleSelectTrack(index)}
                            >
                                <p>{track.title}</p>
                                <p className="text-white/60 text-xs">{track.artist}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-white">
                    <h3 className="font-medium">{tracks[currentTrackIndex]?.title || uploadedSong?.name || 'Rainy Day'}</h3>
                    <p className="text-sm text-white/60">{tracks[currentTrackIndex]?.artist || 'Nature Sounds'}</p>
                </div>

                <div className="space-y-2">
                    <Slider
                        value={[currentTime / duration * 100]}
                        onValueChange={handleSliderChange}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Slider
                        value={[volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                    <div className="text-xs text-white/60">Volume: {Math.round(volume * 100)}%</div>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <label htmlFor="file-upload" className="text-white/60 mb-2">
                        Upload your music:
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                </div>

                <div className="flex justify-center items-center gap-4">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10"
                        onClick={handlePrevTrack}
                    >
                        <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 text-white hover:bg-white/10"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5" />
                        ) : (
                            <Play className="h-5 w-5" />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10"
                        onClick={handleNextTrack}
                    >
                        <SkipForward className="h-4 w-4" />
                    </Button>
                </div>

                {uploadedSong && (
                    <div className="mt-4 text-white/60 text-sm">
                        <strong>Uploaded Song:</strong> {uploadedSong.name}
                    </div>
                )}
            </div>
        </Card>
    )
}
