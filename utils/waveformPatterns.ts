import { WaveformPattern } from '../types/demo.types';

/**
 * Generate a data point for active/normal waveform pattern
 * Sine wave with varying amplitude
 */
export const generateActivePoint = (index: number): number => {
    const baseWave = Math.sin(index * 0.2) * 30;
    const variation = Math.sin(index * 0.05) * 10;
    return baseWave + variation + 50; // Offset to center in graph
};

/**
 * Generate a data point for flat waveform pattern (photo detection)
 * Returns constant value for horizontal line
 */
export const generateFlatPoint = (): number => {
    return 50; // Middle of the graph
};

/**
 * Generate a data point for erratic waveform pattern (deepfake detection)
 * Returns random spike values
 */
export const generateErraticPoint = (): number => {
    return Math.random() * 100;
};

/**
 * Get the appropriate generator function based on pattern type
 */
export const getPatternGenerator = (pattern: WaveformPattern, index: number): number => {
    switch (pattern) {
        case 'active':
            return generateActivePoint(index);
        case 'flat':
            return generateFlatPoint();
        case 'erratic':
            return generateErraticPoint();
        default:
            return 50;
    }
};
