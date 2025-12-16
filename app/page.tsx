'use client';

import { useState } from 'react';
import Desktop from '@/components/Desktop';
import Bootup from '@/components/Bootup';

export default function Home() {
  const [bootComplete, setBootComplete] = useState(false);

  if (!bootComplete) {
    return <Bootup onComplete={() => setBootComplete(true)} />;
  }

  return <Desktop />;
}
