import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { IntroScreen } from './IntroScreen';
import { useFavicon } from './useFavicon';
import irisIcon from '../../../assets/iris/iris-icon.png';

export function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  useFavicon(irisIcon);

  return (
    <div className="size-full">
      {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}
      {!showIntro && <ColorPicker />}
    </div>
  );
}
