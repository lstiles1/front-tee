import React from 'react'
import { useSnapshot } from 'valtio';

import state from '../store';
import { getContrastingColor } from '../config/helpers';

const CustomButton = ({ type, title, customStyles, handleClick, disabled }) => {
  const snap = useSnapshot(state);

  const generateStyle = (type) => {
    if(type === 'filled') {
      return {
        backgroundColor: snap.color,
        color: getContrastingColor(snap.color)
      }
    } else if(type === "outline") {
      return {
        borderWidth: '1px',
        borderColor: snap.color,
        color: snap.color
      }
    }
  }

  return (
    <button
      className={`px-2 py-1.5 flex-1 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${customStyles || ''}`}
      style={generateStyle(type)}
      onClick={handleClick}
      disabled={disabled}
      aria-label={title}
    >
      {title}
    </button>
  )
}

export default CustomButton