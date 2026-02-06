import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS, EFFECTS } from '../constants/theme';

const ScanlineOverlay: React.FC = () => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-100, { duration: 0 }),
                withTiming(100, { duration: 3000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: `${translateY.value}%` }],
    }));

    return (
        <>
            {/* Scanline effect */}
            <View style={styles.scanlineContainer}>
                <Animated.View style={[styles.scanline, animatedStyle]} />
            </View>

            {/* Vignette effect */}
            <View style={styles.vignette} />
        </>
    );
};

const styles = StyleSheet.create({
    scanlineContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 5,
        pointerEvents: 'none',
    },
    scanline: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: COLORS.cyan,
        opacity: EFFECTS.scanlineOpacity,
        shadowColor: COLORS.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    vignette: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        borderWidth: 80,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 4,
        pointerEvents: 'none',
    },
});

export default ScanlineOverlay;
