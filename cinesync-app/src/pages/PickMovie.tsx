import React, { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { theme } from '../styles/theme';
import { useRoom } from '../context/RoomContext';
import UserProfile from '../components/UserProfile';
import { uploadVideo, getUserVideos, videoToMovie } from '../services/videoService';
import VideoLibrary from '../components/VideoLibrary';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  cursor: pointer;
  font-size: ${theme.typography.sizes.md};
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.text};
  }
  
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

const StyledUserProfile = styled(UserProfile)`
  margin-left: 16px;
`;

const PageTitle = styled.h1`
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.sizes['3xl']};
  color: ${theme.colors.text};
`;

const PageDescription = styled.p`
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing['2xl']};
  max-width: 600px;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.sizes.xl};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const MovieCard = styled.div<{ isSelected: boolean }>`
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  transition: transform ${theme.transitions.fast};
  cursor: pointer;
  position: relative;
  background-color: ${theme.colors.backgroundLight};
  
  ${props => props.isSelected && `
    box-shadow: 0 0 0 3px ${theme.colors.primary};
  `}
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const MovieThumbnail = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
`;

const MovieInfo = styled.div`
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.backgroundLight};
`;

const MovieTitle = styled.h3`
  font-size: ${theme.typography.sizes.md};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text};
`;

const MovieDuration = styled.span`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
`;

const UploadSection = styled.div`
  border: 2px dashed ${theme.colors.textSecondary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background-color: ${theme.colors.backgroundLight};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background-color: rgba(231, 76, 60, 0.05);
  }
`;

const UploadIcon = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 2rem;
  margin-bottom: ${theme.spacing.md};
`;

const UploadText = styled.p`
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
`;

const UploadSubtext = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadProgress = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${theme.colors.backgroundLight};
  border-radius: 2px;
  margin-top: ${theme.spacing.xs};
  overflow: hidden;
`;

const Progress = styled.div<{ width: string }>`
  height: 100%;
  background-color: ${theme.colors.primary};
  border-radius: 2px;
  width: ${props => props.width};
  transition: width 0.3s ease;
`;

const OptionsSection = styled.div`
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  max-width: 600px;
`;

const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const OptionLabel = styled.div`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const OptionDescription = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${theme.colors.primary};
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${theme.colors.backgroundLight};
  transition: ${theme.transitions.fast};
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: ${theme.transitions.fast};
    border-radius: 50%;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

// Sample movie data
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
  const [selectedMovie, setSelectedMovie] = useState<typeof sampleMovies[0] | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Load user videos without useEffect
  const loadUserVideos = () => {
    getUserVideos()
      .then(videos => {
        const formattedVideos = videos.map(videoToMovie);
        setUserVideos(formattedVideos);
      })
      .catch(error => {
        console.error('Failed to load videos:', error);
      });
  };
  
  // Call loadUserVideos immediately
  React.useLayoutEffect(() => {
    loadUserVideos();
  }, []);
  
  const handleMovieSelect = (movie: typeof sampleMovies[0]) => {
    setSelectedMovie(movie);
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log(`Starting upload for file: ${file.name} (${Math.round(file.size / 1024 / 1024 * 100) / 100} MB)`);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadedVideo = await uploadVideo(
        file,
        file.name.split('.')[0], // Use filename as title
        '', // No description for now
        (progress) => {
          setUploadProgress(progress);
          console.log(`Upload progress: ${progress}%`);
        }
      );
      
      console.log('Video uploaded successfully!', uploadedVideo);
      
      // Convert the uploaded video to movie format and add to userVideos
      const movieFromVideo = videoToMovie(uploadedVideo);
      setUserVideos(prev => [...prev, movieFromVideo]);
      
      // Auto-select the uploaded video
      setSelectedMovie(movieFromVideo as typeof sampleMovies[0]);
      
      // Reset upload state
      setIsUploading(false);
      setUploadProgress(0);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload video:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload video. Please try again.');
    }
  };
  
  const handleCreateRoom = async () => {
    if (!selectedMovie) return;
    
    try {
      const roomCode = await createRoom(
        selectedMovie,
        isPrivate,
        subtitlesEnabled
      );
      
      navigate(`/watch-room/${roomCode}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      // Would show an error message in a real app
    }
  };
  
  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/')}>
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
            onSelectVideo={(video) => {
              // Convert video to the format expected by handleMovieSelect if needed
              handleMovieSelect(video as typeof sampleMovies[0]);
            }} 
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
            onClick={() => navigate('/')}
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
