import React from 'react'

import CustomButton from './CustomButton';

const AIPicker = ({ prompt, setPrompt, generatingImg, handleSubmit }) => {
  return (
    <div className="aipicker-container">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">AI Design Generator</h3>
        <p className="text-xs text-gray-600">Describe your design idea</p>
      </div>
      <textarea 
        placeholder="e.g., 'A futuristic robot with neon lights' or 'Abstract geometric patterns in blue and purple'"
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="aipicker-textarea resize-none"
        disabled={generatingImg}
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {generatingImg ? (
          <div className="flex items-center gap-2 w-full">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
            <CustomButton 
              type="outline"
              title="Generating..."
              customStyles="text-xs flex-1"
              disabled={true}
            />
          </div>
        ) : (
          <>
            <CustomButton 
              type="filled"
              title="Apply as Logo"
              handleClick={() => handleSubmit('logo')}
              customStyles="text-xs flex-1"
              disabled={!prompt.trim()}
            />

            <CustomButton 
              type="filled"
              title="Apply as Full Design"
              handleClick={() => handleSubmit('full')}
              customStyles="text-xs flex-1"
              disabled={!prompt.trim()}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AIPicker