'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrackData {
    title: string;
    artist: string;
    audioUrl: string;
    source?: string;
    duration?: number;
    image?: string;
}

interface Playlist {
    name: string;
    tracks: TrackData[];
}

export function EnhancedMusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.5)
    const [tracks, setTracks] = useState<TrackData[]>([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<TrackData[]>([])
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [isShuffled, setIsShuffled] = useState(false)
    const [isRepeated, setIsRepeated] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Enhanced search with demo tracks
    const fetchTracks = async (query: string) => {
        setIsLoading(true);
        try {
            // Demo tracks with variety
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
                },
                {
                    title: 'Sunny Day Vibes',
                    artist: 'Upbeat Collection',
                    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                    source: 'Demo'
                },
                {
                    title: 'Cloudy Afternoon',
                    artist: 'Chill Collection',
                    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
                    source: 'Demo'
                }
            ];
            
            setSearchResults(demoTracks.filter(track => 
                track.title.toLowerCase().includes(query.toLowerCase()) ||
                track.artist.toLowerCase().includes(query.toLowerCase())
            ));
        } catch (error) {
            console.error('Error fetching tracks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced playback controls
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNextTrack = () => {
        if (tracks.length > 0) {
            const nextIndex = isShuffled 
                ? Math.floor(Math.random() * tracks.length)
                : (currentTrackIndex + 1) % tracks.length;
            setCurrentTrackIndex(nextIndex);
            setIsPlaying(false);
        }
    };

    const handlePrevTrack = () => {
        if (tracks.length > 0) {
            const prevIndex = isShuffled
                ? Math.floor(Math.random() * tracks.length)
                : currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
            setCurrentTrackIndex(prevIndex);
            setIsPlaying(false);
        }
    };

    const handleTrackEnd = () => {
        if (isRepeated) {
            audioRef.current?.play();
        } else {
            handleNextTrack();
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Playlist management
    const addToPlaylist = (track: TrackData) => {
        setTracks(prev => [...prev, track]);
        if (tracks.length === 0) {
            setCurrentTrackIndex(0);
        }
    };

    const createPlaylist = (name: string) => {
        const newPlaylist: Playlist = {
            name,
            tracks: [...tracks]
        };
        setPlaylists(prev => [...prev, newPlaylist]);
    };

    // Initialize with some default tracks
    useEffect(() => {
        const defaultTracks = [
            {
                title: 'Ambient Weather',
                artist: 'Nature Sounds',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                source: 'Default'
            },
            {
                title: 'Rain Meditation',
                artist: 'Peaceful Sounds',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                source: 'Default'
            }
        ];
        setTracks(defaultTracks);
    }, []);

    return (
        <Card className="glass-card p-3 sm:p-4 space-y-3 sm:space-y-4 w-full border-white/10 overflow-hidden music-player-container">
            <audio
                ref={audioRef}
                src={tracks[currentTrackIndex]?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={handleTrackEnd}
                onVolumeChange={() => setVolume(audioRef.current?.volume || 0.5)}
            />
            
            {/* Header */}
            <div className="text-center space-y-1">
                <h3 className="text-sm sm:text-base font-medium text-white/90">Weather Music</h3>
                <p className="text-xs text-white/60">Music for every mood</p>
            </div>

            {/* Search Section */}
            <div className="space-y-2">
                <div className="relative">
                    <Input
                        placeholder="Search for songs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchTracks(searchTerm)}
                        className="w-full bg-white/5 border-white/10 text-white placeholder-white/50 text-sm h-8 pr-8"
                    />
                    {isLoading && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <Button 
                    onClick={() => fetchTracks(searchTerm)} 
                    variant="ghost" 
                    className="text-white/80 hover:text-white w-full text-sm h-8 transition-colors btn-responsive"
                    disabled={isLoading}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 bg-black/20 rounded-lg p-2 border border-white/10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <p className="text-xs text-white/60 sticky top-0 bg-black/40 p-1 rounded">Results:</p>
                    {searchResults.map((track, index) => (
                        <div
                            key={`${track.title}-${index}`}
                            className="cursor-pointer text-white text-xs sm:text-sm hover:bg-white/5 p-2 rounded transition-colors group"
                            onClick={() => {
                                setTracks(searchResults);
                                setCurrentTrackIndex(index);
                                setIsPlaying(false);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2 card-responsive">
                                    <p className="truncate font-medium text-truncate-enhanced">{track.title}</p>
                                    <p className="text-white/60 text-xs truncate text-truncate-enhanced">{track.artist}</p>
                                    <p className="text-white/40 text-xs text-truncate-enhanced">{track.source}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-white/60 hover:text-white h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToPlaylist(track);
                                    }}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Current Track Display */}
            <div className="text-center space-y-2">
                <div className="space-y-1">
                    <h4 className="text-sm font-medium text-white/90 truncate px-2 text-truncate-enhanced">
                        {tracks[currentTrackIndex]?.title || 'No track selected'}
                    </h4>
                    <p className="text-xs text-white/60 truncate px-2 text-truncate-enhanced">
                        {tracks[currentTrackIndex]?.artist || 'Unknown artist'}
                    </p>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1 px-1">
                    <Slider
                        value={[currentTime]}
                        onValueChange={(value) => {
                            if (audioRef.current) {
                                audioRef.current.currentTime = value[0];
                                setCurrentTime(value[0]);
                            }
                        }}
                        max={duration}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-center items-center gap-1 sm:gap-2 px-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`text-white/80 hover:text-white h-7 w-7 sm:h-8 sm:w-8 ${isShuffled ? 'text-blue-400' : ''} transition-colors btn-responsive`}
                        onClick={() => setIsShuffled(!isShuffled)}
                    >
                        <Shuffle className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/80 hover:text-white h-7 w-7 sm:h-8 sm:w-8 transition-colors btn-responsive"
                        onClick={handlePrevTrack}
                    >
                        <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 sm:h-10 sm:w-10 text-white hover:bg-white/10 bg-white/5 transition-all hover:scale-105 btn-responsive"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                            <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                        )}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/80 hover:text-white h-7 w-7 sm:h-8 sm:w-8 transition-colors btn-responsive"
                        onClick={handleNextTrack}
                    >
                        <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={`text-white/80 hover:text-white h-7 w-7 sm:h-8 sm:w-8 ${isRepeated ? 'text-blue-400' : ''} transition-colors btn-responsive`}
                        onClick={() => setIsRepeated(!isRepeated)}
                    >
                        <Repeat className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                </div>

                {/* Like Button */}
                <div className="flex justify-center">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-white/80 hover:text-red-400 h-7 w-7 transition-colors btn-responsive"
                        onClick={() => setIsLiked(!isLiked)}
                    >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                    </Button>
                </div>

                {/* Volume Control */}
                <div className="space-y-1 px-1">
                    <div className="flex items-center gap-2">
                        <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                        <Slider
                            value={[volume * 100]}
                            onValueChange={(value) => {
                                const newVolume = value[0] / 100;
                                setVolume(newVolume);
                                if (audioRef.current) {
                                    audioRef.current.volume = newVolume;
                                }
                            }}
                            max={100}
                            step={1}
                            className="flex-1"
                        />
                        <span className="text-xs text-white/60 w-8 text-right">
                            {Math.round(volume * 100)}%
                        </span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 px-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/80 hover:text-white text-xs flex-1 h-7 transition-colors btn-responsive"
                        onClick={() => createPlaylist('My Playlist')}
                    >
                        Save Playlist
                    </Button>
                </div>
            </div>
        </Card>
    )
}
