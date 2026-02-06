import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';

interface ScanningOverlayProps {
    visible: boolean;
}

const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ visible }) => {
    const pulseOpacity = useSharedValue(1);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            // Pulsing animation
            pulseOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.4, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                ),
                -1,
                false
            );

            // Scale animation
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                ),
                -1,
                false
            );
        } else {
            pulseOpacity.value = 1;
            scale.value = 1;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
        transform: [{ scale: scale.value }],
    }));

    if (!visible) return null;

    return (
        <Animated.Text style={[styles.text, animatedStyle]}>
            SCANNING...
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    text: {
        position: 'absolute',
        top: '35%',
        alignSelf: 'center',
        fontFamily: FONTS.monospace,
        fontSize: 32,
        color: COLORS.cyan,
        letterSpacing: 4,
        fontWeight: 'bold',
        zIndex: 50,
        textShadowColor: COLORS.cyan,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
});

export default ScanningOverlay;
