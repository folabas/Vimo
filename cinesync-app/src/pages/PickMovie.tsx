import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { useRoom } from '../hooks/useRoom';
import { uploadVideo, getUserVideos, videoToMovie } from '../services/videoService';
import { usePickMovie } from '../hooks/usePickMovie';
import {
  PageContainer,
  Header,
  HeaderLeft,
  HeaderRight,
  BackButton,
  StyledUserProfile,
  PageTitle,
  PageDescription,
  OptionsContainer,
  SectionTitle,
  MovieGrid,
  MovieCard,
  MovieThumbnail,
  MovieInfo,
  MovieTitle,
  MovieDuration,
  UploadSection,
  UploadIcon,
  UploadText,
  UploadSubtext,
  HiddenInput,
  UploadProgress,
  Progress,
  OptionsSection,
  OptionRow,
  OptionLabel,
  OptionDescription,
  Toggle,
  ToggleInput,
  ToggleSlider,
  ActionButtons
} from '../styles/components/PickMovieStyles';
import VideoLibrary from '../components/VideoLibrary';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { Movie } from '../types/room';

const sampleMovies = [
  {
    id: 'movie1',
    title: 'Big Buck Bunny',
    source: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://sample-videos.com/img/Sample-png-image-500kb.png',
    duration: '9:56',
  },
  {
    id: 'movie2',
    title: 'Sintel',
    source: 'https://sample-videos.com/video123/mp4/720/sintel_trailer_720p.mp4',
    thumbnail: 'https://sample-videos.com/img/Sample-jpg-image-500kb.jpg',
    duration: '5:14',
  },
  {
    id: 'movie3',
    title: 'Tears of Steel',
    source: 'https://sample-videos.com/video123/mp4/720/tears_of_steel_720p_1mb.mp4',
    thumbnail: 'https://sample-videos.com/img/Sample-jpg-image-200kb.jpg',
    duration: '12:14',
  },
  {
    id: 'movie4',
    title: "Elephant's Dream",
    source: 'https://sample-videos.com/video123/mp4/720/elephants_dream_720p_1mb.mp4',
    thumbnail: 'https://sample-videos.com/img/Sample-jpg-image-100kb.jpg',
    duration: '10:53',
  },
];

const PickMovie: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useRoom();
  const {
    selectedMovie,
    setSelectedMovie,
    isPrivate,
    setIsPrivate,
    subtitlesEnabled,
    setSubtitlesEnabled,
    isUploading,
    uploadProgress,
    userVideos,
    setUserVideos,
    fileInputRef,
    loadUserVideos,
    handleFileChange,
    handleMovieSelect,
    handleCreateRoom,
  } = usePickMovie(sampleMovies);

  useEffect(() => {
    loadUserVideos();
  }, [loadUserVideos]);

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/dashboard')}>
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to home
          </BackButton>
        </HeaderLeft>
        <HeaderRight>
          <Logo />
          <StyledUserProfile />
        </HeaderRight>
      </Header>
      
      <PageTitle>Pick a Movie</PageTitle>
      <PageDescription>
        Select a movie to watch or upload your own video file. You'll be able to invite friends to watch with you after creating the room.
      </PageDescription>
      
      <OptionsContainer>
        <div>
          <SectionTitle>Your Videos</SectionTitle>
          <VideoLibrary 
            onSelectVideo={(video: Movie) => handleMovieSelect(video)} 
            selectedVideoId={selectedMovie?.id}
          />
        </div>
        
        <div>
          <SectionTitle>Sample Movies</SectionTitle>
          <MovieGrid>
            {sampleMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                isSelected={selectedMovie?.id === movie.id}
                onClick={() => handleMovieSelect(movie)}
              >
                <MovieThumbnail src={movie.thumbnail} alt={movie.title} />
                <MovieInfo>
                  <MovieTitle>{movie.title}</MovieTitle>
                  <MovieDuration>{movie.duration}</MovieDuration>
                </MovieInfo>
              </MovieCard>
            ))}
          </MovieGrid>
        </div>
        
        <div>
          <SectionTitle>Upload Your Own</SectionTitle>
          <UploadSection onClick={() => !isUploading && fileInputRef.current?.click()}>
            <UploadIcon>
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </UploadIcon>
            <UploadText>{isUploading ? 'Uploading...' : 'Click to upload a video file'}</UploadText>
            <UploadSubtext>Supports MP4, WebM, and OGG formats</UploadSubtext>
            {isUploading && (
              <UploadProgress>
                <Progress width={`${uploadProgress}%`} />
              </UploadProgress>
            )}
            <HiddenInput 
              type="file" 
              ref={fileInputRef}
              accept="video/mp4,video/webm,video/ogg" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </UploadSection>
        </div>
        
        <OptionsSection>
          <SectionTitle>Room Options</SectionTitle>
          
          <OptionRow>
            <div>
              <OptionLabel>Private Room</OptionLabel>
              <OptionDescription>Only people with the room code can join</OptionDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />
              <ToggleSlider />
            </Toggle>
          </OptionRow>
          
          <OptionRow>
            <div>
              <OptionLabel>Enable Subtitles</OptionLabel>
              <OptionDescription>Show subtitles if available</OptionDescription>
            </div>
            <Toggle>
              <ToggleInput 
                type="checkbox" 
                checked={subtitlesEnabled}
                onChange={() => setSubtitlesEnabled(!subtitlesEnabled)}
              />
              <ToggleSlider />
            </Toggle>
          </OptionRow>
        </OptionsSection>
        
        <ActionButtons>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button 
            disabled={!selectedMovie}
            onClick={handleCreateRoom}
          >
            Start Watch Room
          </Button>
        </ActionButtons>
      </OptionsContainer>
    </PageContainer>
  );
};

export default PickMovie;
