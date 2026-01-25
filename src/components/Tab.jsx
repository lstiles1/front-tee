import React, { useState } from 'react'
import { useSnapshot } from 'valtio'

import state from '../store';

const Tab = ({ tab, isFilterTab, isActiveTab, handleClick }) => {
  const snap = useSnapshot(state);
  const [showTooltip, setShowTooltip] = useState(false);

  const activeStyles = isFilterTab && isActiveTab 
    ? { backgroundColor: snap.color, opacity: 0.5 }
    : { backgroundColor: "transparent", opacity: 1 }

  const tabNames = {
    colorpicker: "Color Picker",
    filepicker: "Upload Image",
    aipicker: "AI Generator",
    logoShirt: "Logo Shirt",
    stylishShirt: "Full Design"
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        key={tab.name}
        className={`tab-btn ${isFilterTab ? 'rounded-full glassmorphism' : 'rounded-4'} transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer`}
        onClick={handleClick}
        style={activeStyles}
        role="button"
        tabIndex={0}
        aria-label={tabNames[tab.name] || tab.name}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <img 
          src={tab.icon}
          alt={tab.name}
          className={`${isFilterTab ? 'w-2/3 h-2/3' : 'w-11/12 h-11/12 object-contain'} transition-transform duration-300`}
        />
      </div>
      {showTooltip && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none opacity-0 animate-fade-in">
          {tabNames[tab.name] || tab.name}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default Tab