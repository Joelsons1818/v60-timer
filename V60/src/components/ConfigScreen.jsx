import React from 'react';

export function ConfigScreen({
    coffeeGrams,
    setCoffeeGrams,
    waterAmount,
    setWaterAmount,
    balance,
    setBalance,
    strengthPours, // Now a number
    setStrengthPours,
    recipe,
    onStart
}) {
    return (
        <div className="card">
            <header className="header">
                <h1>4:6 Method</h1>
                <p className="subtitle">Tetsu Kasuya V60 Guide</p>
            </header>

            <div className="control-group-row">
                <div className="control-group half">
                    <label>Coffee (g)</label>
                    <div className="input-wrapper">
                        <input
                            type="number"
                            value={coffeeGrams}
                            onChange={(e) => setCoffeeGrams(Number(e.target.value))}
                            min="10"
                            max="100"
                        />
                    </div>
                </div>
                <div className="control-group half">
                    <label>Water (ml)</label>
                    <div className="input-wrapper">
                        <input
                            type="number"
                            value={waterAmount}
                            onChange={(e) => setWaterAmount(Number(e.target.value))}
                            min="150"
                            max="1500"
                        />
                    </div>
                </div>
            </div>

            <div className="control-group">
                <label>Balance (Flavor)</label>
                <div className="toggle-group">
                    {/* SWAPPED ORDER: Acidity first (Left), then Balanced, then Sweet (Right) */}
                    <button
                        className={balance === 'acidity' ? 'active' : ''}
                        onClick={() => setBalance('acidity')}
                    >
                        Acidity
                    </button>
                    <button
                        className={balance === 'balanced' ? 'active' : ''}
                        onClick={() => setBalance('balanced')}
                    >
                        Balanced
                    </button>
                    <button
                        className={balance === 'sweet' ? 'active' : ''}
                        onClick={() => setBalance('sweet')}
                    >
                        Sweet
                    </button>
                </div>
                <p className="helper-text">
                    {balance === 'acidity' && "More Acidity (Large 1st Pour)"}
                    {balance === 'balanced' && "Balanced Cup (Equal Pours)"}
                    {balance === 'sweet' && "More Sweetness (Small 1st Pour)"}
                </p>
            </div>

            <div className="control-group">
                <label>Strength (Number of Pours)</label>
                <div className="toggle-group">
                    {[2, 3, 4, 5].map(num => (
                        <button
                            key={num}
                            className={strengthPours === num ? 'active' : ''}
                            onClick={() => setStrengthPours(num)}
                        >
                            {num}
                        </button>
                    ))}
                </div>
                <p className="helper-text">
                    {strengthPours} pours for strength phase ({Math.round(120 / strengthPours)}s each).
                    {strengthPours >= 4 ? " Higher Extraction (Stronger)" : " Lower Extraction (Milder)"}
                </p>
            </div>

            <div className="recipe-summary">
                <div className="summary-item">
                    <span className="label">Total Water</span>
                    <span className="value">{recipe.totalWater}ml</span>
                </div>
                <div className="summary-item">
                    <span className="label">Ratio</span>
                    <span className="value">1:15</span>
                </div>
                <div className="summary-item">
                    <span className="label">Time</span>
                    <span className="value">~{Math.floor(recipe.totalTime / 60)}:{(recipe.totalTime % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>

            <button className="btn-primary" onClick={onStart}>
                Start Brewing
            </button>
            <div className="made-by-card">Made by Daniel Joelsons</div>
        </div>
    );
}
