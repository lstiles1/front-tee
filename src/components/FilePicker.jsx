import React from 'react'

import CustomButton from './CustomButton'

const FilePicker = ({ file, setFile, readFile }) => {
  return (
    <div className="filepicker-container">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Upload Your Design</h3>
        <p className="text-xs text-gray-600">Choose an image file</p>
      </div>
      <div className="flex-1 flex flex-col">
        <input 
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label 
          htmlFor="file-upload" 
          className="filepicker-label transition-all duration-300 hover:bg-gray-50 hover:shadow-md cursor-pointer" 
          style={{ backgroundColor: "#ffffff" }}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </span>
        </label>

        <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-gray-600 text-xs font-medium mb-1">Selected:</p>
          <p className="text-gray-700 text-xs truncate">
            {file === '' ? (
              <span className="text-gray-400 italic">No file selected</span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {file.name}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CustomButton 
          type="filled"
          title="Apply as Logo"
          handleClick={() => readFile('logo')}
          customStyles="text-xs flex-1"
          disabled={file === ''}
        />
        <CustomButton 
          type="filled"
          title="Apply as Full Design"
          handleClick={() => readFile('full')}
          customStyles="text-xs flex-1"
          disabled={file === ''}
        />
      </div>
    </div>
  )
}

export default FilePicker