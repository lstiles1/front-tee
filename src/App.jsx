import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import Canvas from './canvas';
import Customizer from './pages/Customizer';
import Home from './pages/Home';
import { Analytics } from '@vercel/analytics/react';
import state from './store';

// Color cycling function
const ColorCycler = () => {
  const snap = useSnapshot(state);

  useEffect(() => {
    // Only cycle colors on intro page and if user hasn't manually changed the color
    if (!snap.intro || snap.userChangedColor) return;

    const colors = [
      '#6F7CE8', // Purple-blue (gradient match)
      '#667eea', // Purple
      '#764ba2', // Purple-pink
      '#f093fb', // Pink
      '#4facfe', // Blue
      '#00f2fe', // Cyan
      '#43e97b', // Green
      '#fa709a', // Pink-red
      '#fee140', // Yellow
      '#30cfd0', // Teal
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      // Stop cycling if user left intro page or manually changed color
      if (!snap.intro || snap.userChangedColor) {
        clearInterval(interval);
        return;
      }
      currentIndex = (currentIndex + 1) % colors.length;
      state.color = colors[currentIndex];
    }, 1200); // Change color every 1.2 seconds

    return () => clearInterval(interval);
  }, [snap.userChangedColor, snap.intro]);

  return null;
};

function App() {
  return (
    <main className="app transition-all ease-in">
      <ColorCycler />
      <Home />
      <Canvas />
      <Customizer />
      <Analytics />
    </main>
  )
}

export default App
