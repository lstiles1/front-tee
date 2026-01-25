import React, { useState, useEffect } from 'react'
import { SketchPicker } from 'react-color'
import { useSnapshot } from 'valtio'

import state from '../store';

const ColorPicker = () => {
  const snap = useSnapshot(state);
  const [hexInput, setHexInput] = useState(snap.color);
  const [isValid, setIsValid] = useState(true);

  // Update input when color changes from picker
  useEffect(() => {
    setHexInput(snap.color);
    setIsValid(true);
  }, [snap.color]);

  const handleHexChange = (e) => {
    const value = e.target.value;
    setHexInput(value);

    // Validate hex color format
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const isValidHex = hexRegex.test(value);

    setIsValid(isValidHex);

    if (isValidHex) {
      // Add # if missing
      const hexColor = value.startsWith('#') ? value : `#${value}`;
      state.color = hexColor;
      state.userChangedColor = true; // Mark that user manually changed color
    }
  };

  const handleHexBlur = () => {
    // If invalid, reset to current color
    if (!isValid) {
      setHexInput(snap.color);
      setIsValid(true);
    }
  };

  return (
    <div className="absolute left-full ml-3 flex flex-col">
      <div className="w-[200px] mb-2">
        <SketchPicker
          color={snap.color}
          disableAlpha
          presetColors={[
            "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#808080", "#8000ff", "#006400", "#964B00", "#a785d1"
          ]}
          onChange={(color) => {
            state.color = color.hex;
            state.userChangedColor = true; // Mark that user manually changed color
          }}
        />
      </div>
      <div className="glassmorphism p-3 rounded-md w-[200px] box-border">
        <label className="block text-xs font-semibold text-gray-800 mb-2">
          Enter Hex Code
        </label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: isValid ? snap.color : '#ff0000' }}
          />
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            placeholder="#000000"
            className={`flex-1 min-w-0 px-2 py-1.5 text-sm rounded border transition-all box-border ${isValid
              ? 'border-gray-300 bg-white/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              : 'border-red-400 bg-red-50/70 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              } outline-none`}
            maxLength={7}
          />
        </div>
        {!isValid && (
          <p className="text-xs text-red-500 mt-2">Invalid hex code</p>
        )}
      </div>
    </div>
  )
}

export default ColorPicker