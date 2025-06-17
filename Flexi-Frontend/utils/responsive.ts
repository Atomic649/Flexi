import { Dimensions, Platform } from 'react-native';

export const isMobile =() => {
  const { width } = Dimensions.get('window');
  return width < 768; // Mobile devices typically have a width less than 768px
}

export const isMobileWeb = () => {
  const { width } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';
  return isWeb && width < 768; // Mobile web devices typically have a width less than 768px
}
export const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768 && width < 1024; // Tablets typically have a width between 768px and 1024px
}

export const isDesktop = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024; // Desktop devices typically have a width of 1024px or more
}


//------ Functions to determine the current orientation of the device--------
export const isLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height; // Landscape orientation has a greater width than height
}

export const isPortrait = () => {
  const { width, height } = Dimensions.get('window');
  return height > width; // Portrait orientation has a greater height than width
}


//--------Get Info about the current screen size and orientation--------

export const getScreenWidth = () => {
  const { width } = Dimensions.get('window');
  return width; // Returns the current screen width
}

export const getScreenHeight = () => {
  const { height } = Dimensions.get('window');
  return height; // Returns the current screen height
}


export const getScreenSize = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height }; // Returns an object with current screen width and height
}


export const getAspectRatio = () => {
  const { width, height } = Dimensions.get('window');
  return width / height; // Returns the aspect ratio of the screen
}

export const getOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return width > height ? 'landscape' : 'portrait'; // Returns 'landscape' or 'portrait'
}

export const getDeviceType = () => {
  const { width } = Dimensions.get('window');
  if (width < 768) return 'mobile'; // Mobile devices
  if (width >= 768 && width < 1024) return 'tablet'; // Tablets
  return 'desktop'; // Desktop devices
}
export const getDeviceInfo = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    isLandscape: isLandscape(),
    isPortrait: isPortrait(),
    aspectRatio: getAspectRatio(),
    orientation: getOrientation(),
    deviceType: getDeviceType()
  };
}

export const getResponsiveStyles = () => {
  const { width } = Dimensions.get('window');
  if (width < 640) {
    return { fontSize: 14, padding: 10 }; // Mobile styles
  } else if (width >= 640 && width < 1024) {
    return { fontSize: 16, padding: 15 }; // Tablet styles
  } else {
    return { fontSize: 18, padding: 20 }; // Desktop styles
  }
}

