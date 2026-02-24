import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useRecipe } from './hooks/useRecipe';
import { ConfigScreen } from './components/ConfigScreen';
import { TimerScreen } from './components/TimerScreen';

function App() {
  const {
    coffeeGrams,
    setCoffeeGrams,
    waterAmount,
    setWaterAmount,
    balance,
    setBalance,
    strengthPours, // Changed from strength
    setStrengthPours, // Changed from setStrength
    recipe
  } = useRecipe();

  const [isBrewing, setIsBrewing] = useState(false);

  const handleStart = () => {
    setIsBrewing(true);
  };

  const handleReset = () => {
    setIsBrewing(false);
  };

  return (
    <div className="app-container">
      {!isBrewing ? (
        <ConfigScreen
          coffeeGrams={coffeeGrams}
          setCoffeeGrams={setCoffeeGrams}
          waterAmount={waterAmount}
          setWaterAmount={setWaterAmount}
          balance={balance}
          setBalance={setBalance}
          strengthPours={strengthPours}
          setStrengthPours={setStrengthPours}
          recipe={recipe}
          onStart={handleStart}
        />
      ) : (
        <TimerScreen
          recipe={recipe}
          onReset={handleReset}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
