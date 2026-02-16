import { useState, useMemo } from 'react';
import { calculateRecipe } from '../utils/calculator';

export function useRecipe() {
    const [coffeeGrams, setCoffeeGrams] = useState(20);
    const [waterAmount, setWaterAmount] = useState(300); // Default 1:15
    const [balance, setBalance] = useState('balanced'); // 'sweet', 'balanced', 'acidity'
    const [strengthPours, setStrengthPours] = useState(2); // Default 2 pours

    // Flag to prevent loop updates
    const [lastEdited, setLastEdited] = useState('coffee');

    const RATIO = 15;

    // Sync Water when Coffee changes
    const updateCoffee = (grams) => {
        setLastEdited('coffee');
        setCoffeeGrams(grams);
        setWaterAmount(Math.round(grams * RATIO));
    };

    // Sync Coffee when Water changes
    const updateWater = (ml) => {
        setLastEdited('water');
        setWaterAmount(ml);
        setCoffeeGrams(Math.round(ml / RATIO));
    };

    const recipe = useMemo(() => {
        return calculateRecipe(coffeeGrams, balance, strengthPours);
    }, [coffeeGrams, balance, strengthPours]);

    return {
        coffeeGrams,
        setCoffeeGrams: updateCoffee,
        waterAmount,
        setWaterAmount: updateWater,
        balance,
        setBalance,
        strengthPours,
        setStrengthPours,
        recipe
    };
}
