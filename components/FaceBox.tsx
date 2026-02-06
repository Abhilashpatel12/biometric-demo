import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { DemoState } from '../types/demo.types';

interface FaceBoxProps {
    demoState: DemoState;
}

const { width, height } = Dimensions.get('window');
const BOX_WIDTH = width * 0.65;
const BOX_HEIGHT = BOX_WIDTH * 1.3;
const CORNER_SIZE = 25;
const CORNER_THICKNESS = 3;

const FaceBox: React.FC<FaceBoxProps> = ({ demoState }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const borderOpacity = useSharedValue(0.5);

    useEffect(() => {
        if (demoState === 'idle') {
            // Subtle drift animation - simulates tracking
            opacity.value = withTiming(0.8, { duration: 500 });
            translateX.value = withRepeat(
                withSequence(
                    withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-2, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-1, { duration: 1700, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            translateY.value = withRepeat(
                withSequence(
                    withTiming(2, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
                    withTiming(-3, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.01, { duration: 3000 }),
                    withTiming(0.99, { duration: 3000 })
                ),
                -1,
                true
            );
            borderOpacity.value = withTiming(0.5, { duration: 300 });
        } else if (demoState === 'preparing') {
            // Lock position - stop drift
            translateX.value = withTiming(0, { duration: 200 });
            translateY.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(1, { duration: 200 });
            borderOpacity.value = withTiming(0.8, { duration: 200 });
        } else if (demoState === 'scanning') {
            // Locked and bright
            translateX.value = 0;
            translateY.value = 0;
            scale.value = 1;
            borderOpacity.value = withTiming(1, { duration: 100 });
        } else if (demoState === 'result') {
            // Fade slightly
            borderOpacity.value = withTiming(0.4, { duration: 500 });
        }
    }, [demoState]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    const cornerStyle = useAnimatedStyle(() => ({
        opacity: borderOpacity.value,
    }));

    const color = demoState === 'scanning' ? COLORS.cyan : COLORS.green;

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            {/* Top-left corner */}
            <Animated.View style={[styles.corner, styles.topLeft, cornerStyle]}>
                <View style={[styles.cornerH, { backgroundColor: color }]} />
                <View style={[styles.cornerV, { backgroundColor: color }]} />
            </Animated.View>

            {/* Top-right corner */}
            <Animated.View style={[styles.corner, styles.topRight, cornerStyle]}>
                <View style={[styles.cornerH, { backgroundColor: color }]} />
                <View style={[styles.cornerVRight, { backgroundColor: color }]} />
            </Animated.View>

            {/* Bottom-left corner */}
            <Animated.View style={[styles.corner, styles.bottomLeft, cornerStyle]}>
                <View style={[styles.cornerHBottom, { backgroundColor: color }]} />
                <View style={[styles.cornerV, { backgroundColor: color }]} />
            </Animated.View>

            {/* Bottom-right corner */}
            <Animated.View style={[styles.corner, styles.bottomRight, cornerStyle]}>
                <View style={[styles.cornerHBottom, { backgroundColor: color }]} />
                <View style={[styles.cornerVRight, { backgroundColor: color }]} />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: height * 0.15,
        alignSelf: 'center',
        width: BOX_WIDTH,
        height: BOX_HEIGHT,
        zIndex: 12,
    },
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
    },
    topLeft: {
        top: 0,
        left: 0,
    },
    topRight: {
        top: 0,
        right: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
    },
    cornerH: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CORNER_SIZE,
        height: CORNER_THICKNESS,
    },
    cornerHBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: CORNER_SIZE,
        height: CORNER_THICKNESS,
    },
    cornerV: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CORNER_THICKNESS,
        height: CORNER_SIZE,
    },
    cornerVRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: CORNER_THICKNESS,
        height: CORNER_SIZE,
    },
});

export default FaceBox;
