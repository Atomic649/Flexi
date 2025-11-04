import React, { useCallback } from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../CustomText";

export interface SwipeAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  text?: string;
  backgroundColor: string;
  textColor?: string;
  onPress: () => void;
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  disabled?: boolean;
  actionWidth?: number;
  actionHeight?: number | `${number}%`;
  actionBorderRadius?: number;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  disabled = false,
  actionWidth = 80,
  actionHeight = "80%",
  actionBorderRadius = 0,
}) => {
  const translateX = useSharedValue(0);

  // Calculate total widths
  const leftActionsWidth = leftActions.length * actionWidth;
  const rightActionsWidth = rightActions.length * actionWidth;

  // Pan gesture for swipe functionality
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      const maxLeft = leftActionsWidth;
      const maxRight = -rightActionsWidth;

      // Constrain translation within bounds
      const newTranslateX = Math.min(
        maxLeft,
        Math.max(maxRight, event.translationX)
      );
      translateX.value = newTranslateX;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Determine direction and whether to reveal actions
      if (translation > 0 && leftActions.length > 0) {
        // Right swipe (revealing left actions)
        const shouldReveal =
          Math.abs(translation) > threshold || velocity > 500;
        translateX.value = withSpring(shouldReveal ? leftActionsWidth : 0);
      } else if (translation < 0 && rightActions.length > 0) {
        // Left swipe (revealing right actions)
        const shouldReveal =
          Math.abs(translation) > threshold || velocity < -500;
        translateX.value = withSpring(shouldReveal ? -rightActionsWidth : 0);
      } else {
        // Return to center
        translateX.value = withSpring(0);
      }
    });

  // Animated style for the main content
  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Function to close actions
  const closeActions = useCallback(() => {
    translateX.value = withSpring(0);
  }, [translateX]);

  // Handle content press
  const handleContentPress = useCallback(() => {
    // If actions are revealed, close them
    if (Math.abs(translateX.value) > threshold / 2) {
      closeActions();
    }
  }, [closeActions, threshold, translateX]);

  // Render action buttons
  const renderActions = (actions: SwipeAction[], side: "left" | "right") => {
    if (actions.length === 0) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [side]: 0,
          width: actions.length * actionWidth,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 0,
        }}
      >
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => {
              closeActions();
              action.onPress();
            }}
            style={{
              width: actionWidth,
              height: actionHeight,
              backgroundColor: action.backgroundColor,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 8,
              borderRadius: actionBorderRadius,
            }}
          >
            <Ionicons
              name={action.icon}
              size={20}
              color={action.textColor || "#FFFFFF"}
            />
            {action.text && (
              <CustomText
                style={{
                  color: action.textColor || "#FFFFFF",
                  fontSize: 10,
                  fontWeight: "600",
                  textAlign: "center",
                  marginTop: 2,
                }}
                numberOfLines={2}
              >
                {action.text}
              </CustomText>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View
      style={{
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Left Actions */}
      {renderActions(leftActions, "left")}

      {/* Right Actions */}
      {renderActions(rightActions, "right")}

      {/* Main Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ zIndex: 1 }, animatedContentStyle]}>
          <TouchableOpacity activeOpacity={1} onPress={handleContentPress}>
            {children}
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default SwipeableRow;
