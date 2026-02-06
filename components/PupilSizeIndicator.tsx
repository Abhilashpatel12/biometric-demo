import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import { DemoState, DemoType } from '../types/demo.types';

interface PupilSizeIndicatorProps {
    demoState: DemoState;
    demoType: DemoType;
}

const PupilSizeIndicator: React.FC<PupilSizeIndicatorProps> = ({ demoState, demoType }) => {
    // Shared values
    const pupilSize = useSharedValue(6.2);
    const circleScale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    // Internal display state
    const [displayValue, setDisplayValue] = useState('6.2');

    useEffect(() => {
        if (demoState === 'idle') {
            // Reset
            opacity.value = withTiming(0, { duration: 300 });
        } else if (demoState === 'preparing') {
            // Preparing
            opacity.value = withTiming(0, { duration: 300 });
        } else if (demoState === 'scanning') {
            // Visualize only during scanning
            opacity.value = withTiming(1, { duration: 200 });

            // Animate values
            if (demoType === 'success') {
                // Contract: 6.2 -> 4.1
                setTimeout(() => setDisplayValue('5.8'), 500);
                setTimeout(() => setDisplayValue('5.2'), 1000);
                setTimeout(() => setDisplayValue('4.6'), 1500);
                setTimeout(() => setDisplayValue('4.1'), 2000);

                circleScale.value = withSequence(
                    withTiming(1, { duration: 500 }),
                    withTiming(0.65, { duration: 1500 })
                );
            } else if (demoType === 'deepfake') {
                // Erratic
                const interval = setInterval(() => {
                    const rnd = (Math.random() * 3 + 3).toFixed(1);
                    setDisplayValue(rnd);
                }, 200);
                return () => clearInterval(interval);
            }
        }
    }, [demoState, demoType]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: circleScale.value }],
    }));

    // Only show for Live/Deepfake modes (Photo mode has no scan)
    if (demoType === 'photo') return null;

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.reticle}>
                {/* Outer cyan ring */}
                <View style={styles.outerRing} />
                <Animated.View style={[styles.pupilTarget, circleStyle]} />
            </View>

            {/* Data Box centered over reticle */}
            <View style={styles.dataBox}>
                <Text style={styles.label}>PUPIL DIAMETER</Text>
                <Text style={styles.value}>{displayValue} mm</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '30%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
    },
    reticle: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outerRing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: COLORS.cyan,
        opacity: 0.5,
    },
    pupilTarget: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 255, 0, 0.4)', // Filled green as in image
        borderWidth: 2,
        borderColor: COLORS.green,
    },
    dataBox: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,255,255,0.2)',
    },
    label: {
        color: COLORS.cyan,
        fontSize: 10,
        fontFamily: FONTS.monospace,
        letterSpacing: 1,
        marginBottom: 2,
    },
    value: {
        color: COLORS.white,
        fontSize: 24,
        fontFamily: FONTS.monospace,
        fontWeight: 'bold',
    },
});

export default PupilSizeIndicator;
