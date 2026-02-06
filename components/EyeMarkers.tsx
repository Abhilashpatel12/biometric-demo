import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { DemoState } from '../types/demo.types';

interface EyeMarkersProps {
    demoState: DemoState;
}

const { width, height } = Dimensions.get('window');
const BOX_WIDTH = width * 0.65;
const EYE_SIZE = 35;
const EYE_SPACING = BOX_WIDTH * 0.35;

const EyeMarkers: React.FC<EyeMarkersProps> = ({ demoState }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const crosshairOpacity = useSharedValue(0);

    useEffect(() => {
        if (demoState === 'idle') {
            opacity.value = withTiming(0.6, { duration: 500 });
            crosshairOpacity.value = withTiming(0.3, { duration: 500 });
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500 }),
                    withTiming(0.95, { duration: 1500 })
                ),
                -1,
                true
            );
        } else if (demoState === 'preparing') {
            scale.value = withSequence(
                withTiming(0.9, { duration: 150 }),
                withTiming(1, { duration: 150 })
            );
            opacity.value = withTiming(0.9, { duration: 200 });
            crosshairOpacity.value = withTiming(0.7, { duration: 200 });
        } else if (demoState === 'scanning') {
            scale.value = 1;
            opacity.value = withTiming(1, { duration: 100 });
            crosshairOpacity.value = withTiming(1, { duration: 100 });
        } else if (demoState === 'result') {
            opacity.value = withTiming(0.3, { duration: 500 });
            crosshairOpacity.value = withTiming(0.2, { duration: 500 });
        }
    }, [demoState]);

    const markerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const crosshairStyle = useAnimatedStyle(() => ({
        opacity: crosshairOpacity.value,
    }));

    const color = demoState === 'scanning' ? COLORS.cyan : COLORS.green;

    const renderEyeMarker = (isLeft: boolean) => (
        <Animated.View
            style={[
                styles.eyeMarker,
                markerStyle,
                { marginHorizontal: isLeft ? 0 : 0 }
            ]}
        >
            {/* Corner brackets */}
            <View style={[styles.cornerTL, { borderColor: color }]} />
            <View style={[styles.cornerTR, { borderColor: color }]} />
            <View style={[styles.cornerBL, { borderColor: color }]} />
            <View style={[styles.cornerBR, { borderColor: color }]} />

            {/* Crosshair */}
            <Animated.View style={[styles.crosshairContainer, crosshairStyle]}>
                <View style={[styles.crosshairH, { backgroundColor: color }]} />
                <View style={[styles.crosshairV, { backgroundColor: color }]} />
                <View style={[styles.centerDot, { backgroundColor: color }]} />
            </Animated.View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {renderEyeMarker(true)}
            {renderEyeMarker(false)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: height * 0.22,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: EYE_SPACING,
        zIndex: 14,
    },
    eyeMarker: {
        width: EYE_SIZE,
        height: EYE_SIZE,
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 10,
        height: 10,
        borderTopWidth: 2,
        borderLeftWidth: 2,
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderTopWidth: 2,
        borderRightWidth: 2,
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 10,
        height: 10,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderBottomWidth: 2,
        borderRightWidth: 2,
    },
    crosshairContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crosshairH: {
        position: 'absolute',
        width: 15,
        height: 1,
    },
    crosshairV: {
        position: 'absolute',
        width: 1,
        height: 15,
    },
    centerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});

export default EyeMarkers;
