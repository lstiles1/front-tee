import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import config from '../config/config';
import state from '../store';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from '../components';

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');

  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: false,
    stylishShirt: false,
  });

  // show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />;
      case "filepicker":
        return (
          <FilePicker
            file={file}
            setFile={setFile}
            readFile={readFile}
          />
        );
      case "aipicker":
        return (
          <AIPicker
            prompt={prompt}
            setPrompt={setPrompt}
            generatingImg={generatingImg}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt.trim()) {
      alert("Please enter a prompt to generate your design");
      return;
    }

    try {
      setGeneratingImg(true);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const url = 'https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/fluximagegenerate/generateimage.php';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': 'b97671c5fcmsh841af94efe540cep12c36ajsn6daeb8f681b7',
          'x-rapidapi-host': 'ai-text-to-image-generator-flux-free-api.p.rapidapi.com',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          prompt: prompt,
          style_id: 4,
          size: '1-1'
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Failed to generate image. Please try again.';
        
        try {
          const errorText = await response.text();
          console.error('API Error Response:', response.status, errorText);
          
          if (response.status === 500) {
            errorMessage = 'The AI service is currently unavailable. This might be temporary - please try again in a moment.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. Please check your prompt and try again.';
          } else if (response.status === 503) {
            errorMessage = 'Service temporarily unavailable. The server may be starting up. Please wait a moment and try again.';
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      // The API returns binary image data directly (JPEG/PNG)
      // Check if response looks like binary image data
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);
      
      // Get the response as array buffer to check the first bytes
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check for image file signatures (JPEG starts with FF D8, PNG starts with 89 50 4E 47)
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
      const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
      
      if (isJPEG || isPNG || (contentType && contentType.startsWith('image/'))) {
        console.log('Response is binary image data, converting to data URL...');
        const blob = new Blob([arrayBuffer], { 
          type: isJPEG ? 'image/jpeg' : isPNG ? 'image/png' : contentType || 'image/jpeg' 
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('Image converted successfully');
          handleDecals(type, reader.result);
          setPrompt('');
        };
        reader.onerror = () => {
          console.error('FileReader error');
          throw new Error('Failed to read image data');
        };
        reader.readAsDataURL(blob);
        return; // Exit early since we're handling it asynchronously
      }
      
      // Otherwise, try to parse as text (for JSON responses)
      const decoder = new TextDecoder();
      const result = decoder.decode(arrayBuffer);
      console.log('API Response (text):', result.substring(0, 500));
      console.log('API Response length:', result.length);

      // The response might be a URL, base64 image, JSON, or HTML
      let imageUrl = null;
      let imageData = null;
      const trimmedResult = result.trim();

      // Try to parse as JSON first
      try {
        const data = JSON.parse(trimmedResult);
        console.log('Parsed as JSON:', data);
        imageUrl = data.url || data.image || data.photo || data.image_url || data.data || data.result || data.imageUrl || data.imageURL;
        imageData = data.base64 || data.image_base64 || data.base64Image || data.imageBase64;
        
        // Check nested objects
        if (!imageUrl && !imageData && data.data) {
          if (typeof data.data === 'string') {
            imageUrl = data.data;
          } else if (data.data.url) {
            imageUrl = data.data.url;
          }
        }
      } catch (e) {
        console.log('Not JSON, trying other formats...');
        
        // Check if it's already a data URL
        if (trimmedResult.startsWith('data:image')) {
          imageData = trimmedResult;
          console.log('Found data URL');
        }
        // Check if it's a plain URL (more flexible regex)
        else if (trimmedResult.match(/^https?:\/\/[^\s]+/)) {
          imageUrl = trimmedResult.match(/^https?:\/\/[^\s]+/)[0];
          console.log('Found URL:', imageUrl);
        }
        // Check if it contains HTML with an image tag
        else if (trimmedResult.includes('<img') || trimmedResult.includes('src=') || trimmedResult.includes('href=')) {
          const imgMatch = trimmedResult.match(/(?:src|href)=["']([^"']+)["']/);
          if (imgMatch && imgMatch[1].match(/https?:\/\//)) {
            imageUrl = imgMatch[1];
            console.log('Found URL in HTML:', imageUrl);
          }
        }
        // Check if it contains a URL anywhere in the text
        else {
          const urlMatches = trimmedResult.match(/https?:\/\/[^\s<>"']+[^\s<>"',.]/g);
          if (urlMatches && urlMatches.length > 0) {
            // Prefer image URLs
            const imageMatch = urlMatches.find(url => /\.(jpg|jpeg|png|gif|webp)/i.test(url));
            imageUrl = imageMatch || urlMatches[0];
            console.log('Found URL in text:', imageUrl);
          }
          // Check if it's base64 (longer strings of base64 characters)
          else if (trimmedResult.length > 100 && trimmedResult.match(/^[A-Za-z0-9+/=\s]+$/)) {
            // Remove whitespace and check if it looks like base64
            const cleanBase64 = trimmedResult.replace(/\s/g, '');
            if (cleanBase64.length > 50) {
              imageData = `data:image/png;base64,${cleanBase64}`;
              console.log('Found base64 string');
            }
          }
        }
      }

      // Handle the image data or URL
      if (imageData) {
        // We have direct image data
        console.log('Using image data directly');
        handleDecals(type, imageData);
        setPrompt('');
      } else if (imageUrl) {
        // We have a URL, fetch and convert to base64
        try {
          console.log('Fetching image from URL:', imageUrl);
          const imageResponse = await fetch(imageUrl, {
            mode: 'cors',
            headers: {
              'Accept': 'image/*'
            }
          });
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
          }
          const blob = await imageResponse.blob();
          console.log('Image blob type:', blob.type);
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log('Image loaded successfully');
            handleDecals(type, reader.result);
            setPrompt('');
          };
          reader.onerror = () => {
            console.error('FileReader error');
            throw new Error('Failed to read image data');
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error('Error fetching image:', e);
          throw new Error(`Failed to load generated image: ${e.message}. Please try again.`);
        }
      } else {
        // Couldn't parse the response - show full response in console
        console.error('=== Unable to parse API response ===');
        console.error('Full response:', result);
        console.error('Response length:', result.length);
        console.error('Response type:', typeof result);
        console.error('First 1000 chars:', result.substring(0, 1000));
        throw new Error('Unexpected response format from API. Check the browser console (F12) for details.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      
      let userMessage = error.message;
      if (error.name === 'AbortError') {
        userMessage = 'Request timed out. The AI service may be slow to respond. Please try again.';
      }
      
      alert(userMessage || 'An error occurred. Please try again.');
      setGeneratingImg(false);
    } finally {
      // Don't close the tab immediately - let the image load first
      setTimeout(() => {
        setGeneratingImg(false);
        setActiveEditorTab("");
      }, 1000);
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = false;
        state.isFullTexture = false;
        break;
    }

    // after setting the state, activeFilterTab is updated
    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab("");
    });
  };

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation('left')}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <CustomButton
              type="filled"
              title="← Back to Home"
              handleClick={() => (state.intro = true)}
              customStyles="w-fit px-5 py-2.5 font-bold text-sm shadow-lg"
            />
          </motion.div>

          <motion.div
            className="filtertabs-container"
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <div key={tab.name} className="flex items-center space-x-2">
                <Tab
                  tab={tab}
                  isFilterTab
                  isActiveTab={activeFilterTab[tab.name]}
                  handleClick={() => handleActiveFilterTab(tab.name)}
                />
                {tab.name === "stylishShirt" && (
                  <button 
                    className="download-btn group relative" 
                    onClick={downloadCanvasToImage}
                    aria-label="Download design"
                    title="Download your design"
                  >
                    <img
                      src={download}
                      alt="download_image"
                      className="w-3/5 h-3/5 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      Download
                    </span>
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;
