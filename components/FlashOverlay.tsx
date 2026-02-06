import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface FlashOverlayProps {
    visible: boolean;
    onComplete?: () => void;
}

const FlashOverlay: React.FC<FlashOverlayProps> = ({ visible, onComplete }) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Flash sequence: fade in (100ms) → hold (200ms) → fade out (200ms)
            opacity.value = withSequence(
                withTiming(1, { duration: 100 }),
                withTiming(1, { duration: 200 }),
                withTiming(0, { duration: 200 }, (finished) => {
                    if (finished && onComplete) {
                        runOnJS(onComplete)();
                    }
                })
            );
        } else {
            opacity.value = 0;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!visible) return null;

    return <Animated.View style={[styles.overlay, animatedStyle]} />;
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.white,
        zIndex: 100,
    },
});

export default FlashOverlay;
