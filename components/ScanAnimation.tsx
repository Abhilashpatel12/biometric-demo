import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const ScanAnimation = () => {
    // Shared values for animations
    const gridOpacity = useSharedValue(0);
    const gridScale = useSharedValue(1.2);
    const scanLineY = useSharedValue(-height);
    const circleScale = useSharedValue(0.5);
    const circleOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        // 1. Grid Fade In & Scale In
        gridOpacity.value = withTiming(0.4, { duration: 500 });
        gridScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });

        // 2. Scanline Sweep (Repeats)
        scanLineY.value = withRepeat(
            withTiming(height, { duration: 1500, easing: Easing.linear }),
            -1,
            false
        );

        // 3. Central Circle Pulse
        circleOpacity.value = withTiming(0.8, { duration: 600 });
        circleScale.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.8, { duration: 1000 })
            ),
            -1,
            true
        );

        // 4. Text Fade In
        textOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

        return () => {
            // Cleanup if needed (reanimated handles most)
        };
    }, []);

    // Styles
    const gridStyle = useAnimatedStyle(() => ({
        opacity: gridOpacity.value,
        transform: [{ scale: gridScale.value }],
    }));

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <View style={styles.container}>
            {/* Background Grid - Cyberpunk style */}
            <Animated.View style={[styles.gridContainer, gridStyle]}>
                <View style={styles.gridVertical} />
                <View style={[styles.gridVertical, { left: '25%' }]} />
                <View style={[styles.gridVertical, { left: '50%' }]} />
                <View style={[styles.gridVertical, { left: '75%' }]} />
                <View style={styles.gridHorizontal} />
                <View style={[styles.gridHorizontal, { top: '25%' }]} />
                <View style={[styles.gridHorizontal, { top: '50%' }]} />
                <View style={[styles.gridHorizontal, { top: '75%' }]} />
            </Animated.View>

            {/* Moving Scanline (Refined: Thinner, glowing) */}
            <Animated.View style={[styles.scanLine, scanLineStyle]} />

            {/* Status Text Overlay */}
            <Animated.View style={[styles.statusContainer, textStyle]}>
                <Text style={styles.statusText}>生体スキャン中...</Text>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.detailText}>生体反射解析中</Text>
                <Text style={styles.detailText}>生体パターン照合中</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 50,
        backgroundColor: 'rgba(0, 20, 10, 0.3)', // Slight green tint
        overflow: 'hidden',
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    gridVertical: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: COLORS.cyan,
        opacity: 0.3,
    },
    gridHorizontal: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: COLORS.cyan,
        opacity: 0.3,
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3, // Thinner line (was 50)
        backgroundColor: COLORS.cyan, // Changed to Cyan for cleaner look
        opacity: 0.8,
        shadowColor: COLORS.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15, // Strong glow
        elevation: 10,
    },
    statusContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    statusText: {
        fontFamily: FONTS.monospace,
        fontSize: 30,
        color: COLORS.white,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 10,
        textShadowColor: COLORS.cyan,
        textShadowRadius: 10,
    },
    progressBarContainer: {
        width: '60%', // Slightly narrower
        height: 2, // Thinner progress bar
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressBar: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.green,
    },
    detailText: {
        fontFamily: FONTS.monospace,
        fontSize: 10,
        color: COLORS.cyan,
        letterSpacing: 1,
        marginTop: 4,
    },
});

export default ScanAnimation;
