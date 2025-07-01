import { useState } from 'react';
import SystemInfo from './components/SystemInfo';
import GraduateButton from './components/GraduateButton';
import './styles.css';

export default function App() {
  const [headline] = useState('Factory – Software at Light-Speed');
  return (
    <main className="container">
      {/* Use the high-resolution Factory logo */}
      <img src="/assets/128x128@2x.png" alt="Factory logo" width={128} />
      <h1>{headline}</h1>
      <SystemInfo />
      <GraduateButton />
    </main>
  );
}
