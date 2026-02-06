import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
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

interface ScanLineProps {
    demoState: DemoState;
}

const { width, height } = Dimensions.get('window');
const BOX_WIDTH = width * 0.65;
const BOX_HEIGHT = BOX_WIDTH * 1.3;
const SCAN_TOP = height * 0.15;

const ScanLine: React.FC<ScanLineProps> = ({ demoState }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (demoState === 'scanning') {
            // Vertical sweep animation
            opacity.value = withTiming(1, { duration: 100 });
            translateY.value = withRepeat(
                withSequence(
                    withTiming(0, { duration: 0 }),
                    withTiming(BOX_HEIGHT, {
                        duration: 1200,
                        easing: Easing.linear
                    })
                ),
                -1,
                false
            );
        } else {
            opacity.value = withTiming(0, { duration: 300 });
            translateY.value = 0;
        }
    }, [demoState]);

    const lineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (demoState !== 'scanning') return null;

    return (
        <Animated.View style={[styles.scanLine, lineStyle]}>
            <Animated.View style={styles.lineGlow} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    scanLine: {
        position: 'absolute',
        top: SCAN_TOP,
        left: (width - BOX_WIDTH) / 2,
        width: BOX_WIDTH,
        height: 3,
        zIndex: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    lineGlow: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.cyan,
        shadowColor: COLORS.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
});

export default ScanLine;
