'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';
// Using a placeholder image - replace with your actual image
const backgroundImage = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';

interface MovieBackgroundProps {
  children: ReactNode;
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

export default function MovieBackground({ children }: MovieBackgroundProps) {
  return (
    <BackgroundContainer>
      <BackgroundImage />
      <ContentWrapper>
        {children}
      </ContentWrapper>
    </BackgroundContainer>
  );
}
