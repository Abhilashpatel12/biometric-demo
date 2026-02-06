import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const BioWaveform = () => {
    // We will simulate a waveform using multiple vertical bars
    // This is performant and looks "digital/medical"
    const bars = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        height: useSharedValue(5),
    }));

    useEffect(() => {
        bars.forEach((bar, i) => {
            // Randomize heights in a loop to look like data
            const randomDuration = Math.random() * 500 + 200;
            bar.height.value = withRepeat(
                withTiming(Math.random() * 40 + 5, {
                    duration: randomDuration,
                    easing: Easing.linear
                }),
                -1,
                true // reverse
            );
        });
    }, []);

    return (
        <View style={styles.container}>
            {bars.map((bar) => {
                const style = useAnimatedStyle(() => ({
                    height: bar.height.value,
                }));
                return <Animated.View key={bar.id} style={[styles.bar, style]} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 50,
        gap: 2,
        marginBottom: 10,
    },
    bar: {
        width: 3,
        backgroundColor: COLORS.cyan,
        opacity: 0.8,
        borderRadius: 1,
    },
});

export default BioWaveform;
