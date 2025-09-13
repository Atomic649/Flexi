import React, { useRef } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

interface SafeSwipeableProps {
  children: React.ReactNode;
  renderRightActions?: () => React.ReactNode;
  renderLeftActions?: () => React.ReactNode;
  onSwipeableOpen?: (direction: 'left' | 'right') => void;
  onSwipeableClose?: () => void;
}

export const SafeSwipeable: React.FC<SafeSwipeableProps> = ({
  children,
  renderRightActions,
  renderLeftActions,
  onSwipeableOpen,
  onSwipeableClose,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const currentTranslateX = useRef(0); // Track current position
  const isSwipeOpen = useRef(false);
  const screenWidth = Dimensions.get('window').width;
  const swipeThreshold = 80; // Minimum distance to trigger swipe
  const actionWidth = 500; // Width of action buttons

  // Add listener to track the current value
  React.useEffect(() => {
    const listenerId = translateX.addListener(({ value }) => {
      currentTranslateX.current = value;
      console.log('SafeSwipeable: translateX value changed to:', value);
    });

    return () => {
      translateX.removeListener(listenerId);
    };
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        const shouldRespond = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 1;
        if (shouldRespond) {
          console.log('SafeSwipeable: Responding to gesture', gestureState.dx);
        }
        return shouldRespond;
      },
      onPanResponderGrant: () => {
        console.log('SafeSwipeable: Gesture granted');
        // Don't use offset - keep it simple
      },
      onPanResponderMove: (evt, gestureState) => {
        // Make the card follow your finger smoothly
        let newTranslateX = gestureState.dx;
        
        // For right actions (delete button), allow smooth left movement
        if (renderRightActions && newTranslateX <= 0) {
          // Swiping left - allow smooth movement up to actionWidth
          newTranslateX = Math.max(newTranslateX, -actionWidth);
          console.log('SafeSwipeable: Card following finger left, translateX:', newTranslateX);
          translateX.setValue(newTranslateX);
        } 
        // For left actions, allow smooth right movement  
        else if (renderLeftActions && newTranslateX >= 0) {
          // Swiping right - allow smooth movement up to actionWidth
          newTranslateX = Math.min(newTranslateX, actionWidth);
          console.log('SafeSwipeable: Card following finger right, translateX:', newTranslateX);
          translateX.setValue(newTranslateX);
        }
        // Don't restrict other movements - let the card follow naturally
        else if (renderRightActions && newTranslateX > 0) {
          // Allow slight right movement even when we have right actions
          newTranslateX = Math.min(newTranslateX, 20); // Small bounce back
          translateX.setValue(newTranslateX);
        }
        else if (renderLeftActions && newTranslateX < 0) {
          // Allow slight left movement even when we have left actions  
          newTranslateX = Math.max(newTranslateX, -20); // Small bounce back
          translateX.setValue(newTranslateX);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('SafeSwipeable: Finger released, final dx:', gestureState.dx);
        
        let targetTranslateX = 0;
        
        // Determine final position based on how far you swiped
        if (renderRightActions && gestureState.dx < -30) {
          // Swiped left enough - open to show delete button
          targetTranslateX = -actionWidth;
          console.log('SafeSwipeable: Opening delete button');
          if (!isSwipeOpen.current) {
            onSwipeableOpen?.('right');
            isSwipeOpen.current = true;
          }
        } else if (renderLeftActions && gestureState.dx > 30) {
          // Swiped right enough - open left actions
          targetTranslateX = actionWidth;
          console.log('SafeSwipeable: Opening left actions');
          if (!isSwipeOpen.current) {
            onSwipeableOpen?.('left');
            isSwipeOpen.current = true;
          }
        } else {
          // Didn't swipe far enough - snap back to center
          targetTranslateX = 0;
          console.log('SafeSwipeable: Snapping back to center');
          if (isSwipeOpen.current) {
            onSwipeableClose?.();
            isSwipeOpen.current = false;
          }
        }
        
        console.log('SafeSwipeable: Animating smoothly to:', targetTranslateX);
        // Smooth spring animation to final position
        Animated.spring(translateX, {
          toValue: targetTranslateX,
          useNativeDriver: false,
          tension: 120,
          friction: 12, // Smooth animation
        }).start((finished) => {
          console.log('SafeSwipeable: Animation completed:', finished);
        });
      },
    })
  ).current;

  return (
    <View style={{ 
      height: 'auto',
      overflow: 'hidden',
    }}>
      {/* Delete button background - always visible */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: actionWidth,
          backgroundColor: '#ff4444',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {renderRightActions && renderRightActions()}
      </View>
      
      {/* Main content that slides */}
      <Animated.View
        style={{
          backgroundColor: 'white',
          transform: [{ translateX }],
          zIndex: 2,
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};
