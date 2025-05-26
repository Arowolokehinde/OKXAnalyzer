'use client';

import { useState, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';

const ClientBackgroundWrapper = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {isMounted && <AnimatedBackground variant="mixed" />}
      {children}
    </>
  );
};

export default ClientBackgroundWrapper;