import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { IntroScreen } from './IntroScreen';

export function HomePage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="size-full">
      {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}
      {!showIntro && <ColorPicker />}
    </div>
  );
}
