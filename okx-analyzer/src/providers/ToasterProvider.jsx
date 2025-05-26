// components/providers/ToasterProvider.jsx
'use client';

import { Toaster } from 'react-hot-toast';

export const ToasterProvider = () => {
  return <Toaster position="top-right" />;
};

export default ToasterProvider;