import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: '#6F7CE8', // Purple-blue matching the gradient text
  isLogoTexture: false,
  isFullTexture: false,
  logoDecal: './threejs.png',
  fullDecal: './threejs.png',
  userChangedColor: false, // Track if user manually changed color
});

export default state;