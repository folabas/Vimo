import React from 'react';
import styled from '@emotion/styled';
import backgroundImage from '../assets/movie-posters-background.jpg';

interface MovieBackgroundProps {
  children: React.ReactNode;
}

const BackgroundContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  padding: 20px;
`;

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  filter: brightness(0.3);
  z-index: -1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const MovieBackground: React.FC<MovieBackgroundProps> = ({ children }) => {
  return (
    <BackgroundContainer>
      <BackgroundImage />
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </BackgroundContainer>
  );
};

export default MovieBackground;
