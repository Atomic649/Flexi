import React, { useRef, useEffect } from "react";
import { ScrollView, View, Image, Dimensions, Platform, Text, StyleSheet, TouchableOpacity, Linking, useWindowDimensions } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import images from "@/constants/images";
import { CustomText } from "../CustomText";
import { API_URL } from "@/utils/config";

interface DashboardAdsProps {
  officeData?: any[];
}

const DashboardAds: React.FC<DashboardAdsProps> = ({ officeData = [] }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";
  
  // Responsive breakpoints
  const isSmallScreen = width < 640;
  const isMediumScreen = width >= 640 && width < 1024;
  const isLargeScreen = width >= 1024;

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
  }, []);

  // Format image URL properly
  const getImageSource = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return images.daikin;
    
    // Check if the image URL is already a complete URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return { uri: imageUrl };
    }
    
    // If it's a relative path, prepend the API URL
    return { uri: `${API_URL}/uploads/images/${imageUrl}` };
  };

  // Recalculate layout dimensions when screen size changes
  const getCardWidth = () => {
    if (isSmallScreen) return width * 0.92;
    if (isMediumScreen) return width * 0.75;
    return width * 0.6;
  };

  const getImageHeight = () => {
    if (isSmallScreen) return 180;
    if (isMediumScreen) return 220;
    return 250;
  };

  const handleCallToAction = (action: string) => {
    if (!action) return;
    
    if (action.startsWith('tel:')) {
      Linking.openURL(action);
    } else if (action.startsWith('email:')) {
      const email = action.replace('email:', '').trim();
      Linking.openURL(`mailto:${email}`);
    } else if (action.includes('LINE ID:')) {
      // Handle LINE ID action if possible
      alert(`Contact via ${action}`);
    } else {
      // Default action
      alert(action);
    }
  };

  // If no data is provided, return placeholder content
  if (!officeData || officeData.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { width: getCardWidth() }]}>
        <CustomText style={{ 
          color: theme === "dark" ? "#ffffff" : "#000000",
          fontSize: isSmallScreen ? 14 : 16 
        }}>
          {t("common.noDataAvailable")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: width }]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: isSmallScreen ? 10 : 20,
        }}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {officeData.map((item, index) => (
          <View
            key={index}
            style={[
              styles.cardContainer,
              {
                backgroundColor: theme === "dark" ? "#27272a" : "#ffffff",
                width: getCardWidth(),
                marginBottom: 20,
              },
            ]}
          >
            <View style={[styles.imageContainer, { height: getImageHeight() }]}>
              <Image
                source={getImageSource(item.image)}
                style={styles.image}
                defaultSource={images.daikin}
                // Adding specific props for iOS image loading
                resizeMethod={isIOS ? "resize" : "auto"}
              />
            </View>
            
            <View style={[
              styles.contentContainer, 
              { padding: isSmallScreen ? 12 : isLargeScreen ? 20 : 16 }
            ]}>
              <CustomText 
                style={[
                  styles.title, 
                  { 
                    color: theme === "dark" ? "#ffffff" : "#000000",
                    fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20
                  }
                ]}
              >
                {item.title}
              </CustomText>
              
              <CustomText 
                style={[
                  styles.description, 
                  { 
                    color: theme === "dark" ? "#cccccc" : "#555555",
                    fontSize: isSmallScreen ? 13 : 14,
                    lineHeight: isSmallScreen ? 18 : 20
                  }
                ]}
                numberOfLines={isSmallScreen ? 3 : 4}
              >
                {item.description}
              </CustomText>
              
              {item.callToAction && (
                <TouchableOpacity
                  style={[
                    styles.button, 
                    { 
                      backgroundColor: theme === "dark" ? "#4a5568" : "#e2e8f0",
                      padding: isSmallScreen ? 8 : 10,
                      marginTop: isSmallScreen ? 12 : 16
                    }
                  ]}
                  onPress={() => handleCallToAction(item.callToAction)}
                >
                  <CustomText 
                    style={[
                      styles.buttonText, 
                      { 
                        color: theme === "dark" ? "#ffffff" : "#000000",
                        fontSize: isSmallScreen ? 13 : 14
                      }
                    ]}
                  >
                    {item.callToAction}
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    padding: 0,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginVertical: 20,
  },
  cardContainer: {
    flexDirection: 'column',
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0', // Add a background color to show while image loads
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  button: {
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '500',
  },
});

export default DashboardAds;