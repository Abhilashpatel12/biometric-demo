import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { WaveformPattern } from '../types/demo.types';
import { getPatternGenerator } from '../utils/waveformPatterns';

interface WaveformGraphProps {
    pattern: WaveformPattern;
}

const GRAPH_WIDTH = Dimensions.get('window').width;
const GRAPH_HEIGHT = 120;
const DATA_POINTS = 100;

const WaveformGraph: React.FC<WaveformGraphProps> = ({ pattern }) => {
    const dataRef = useRef<number[]>(Array(DATA_POINTS).fill(50));
    const indexRef = useRef<number>(0);
    const animationFrameRef = useRef<number | undefined>();

    const getColor = () => {
        switch (pattern) {
            case 'active':
                return COLORS.green;
            case 'flat':
                return COLORS.dimGreen;
            case 'erratic':
                return COLORS.red;
            default:
                return COLORS.green;
        }
    };

    const generatePath = (data: number[]): string => {
        if (data.length === 0) return '';

        const scaleX = GRAPH_WIDTH / DATA_POINTS;
        const scaleY = GRAPH_HEIGHT / 100;

        let path = `M 0,${GRAPH_HEIGHT - data[0] * scaleY}`;

        for (let i = 1; i < data.length; i++) {
            const x = i * scaleX;
            const y = GRAPH_HEIGHT - data[i] * scaleY;
            path += ` L ${x},${y}`;
        }

        return path;
    };

    useEffect(() => {
        let lastTime = Date.now();
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        const animate = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= frameInterval) {
                // Shift data left (scrolling effect)
                dataRef.current.shift();

                // Add new data point on the right
                const newPoint = getPatternGenerator(pattern, indexRef.current);
                dataRef.current.push(newPoint);

                indexRef.current += 1;
                lastTime = currentTime;

                // Force re-render by updating state
                // This is a workaround - we'll use a key or forceUpdate mechanism
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [pattern]);

    // We need to force updates, so let's use a state-based approach
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate();
        }, 1000 / 30); // 30 FPS

        return () => clearInterval(interval);
    }, []);

    const pathData = generatePath(dataRef.current);

    return (
        <View style={styles.container}>
            <View style={styles.graphContainer}>
                <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                    {/* Grid lines */}
                    <Line
                        x1="0"
                        y1={GRAPH_HEIGHT / 2}
                        x2={GRAPH_WIDTH}
                        y2={GRAPH_HEIGHT / 2}
                        stroke={COLORS.dimGreen}
                        strokeWidth="0.5"
                        opacity="0.3"
                    />
                    <Line
                        x1="0"
                        y1={GRAPH_HEIGHT / 4}
                        x2={GRAPH_WIDTH}
                        y2={GRAPH_HEIGHT / 4}
                        stroke={COLORS.dimGreen}
                        strokeWidth="0.5"
                        opacity="0.2"
                    />
                    <Line
                        x1="0"
                        y1={(GRAPH_HEIGHT * 3) / 4}
                        x2={GRAPH_WIDTH}
                        y2={(GRAPH_HEIGHT * 3) / 4}
                        stroke={COLORS.dimGreen}
                        strokeWidth="0.5"
                        opacity="0.2"
                    />

                    {/* Waveform path */}
                    <Path
                        d={pathData}
                        stroke={getColor()}
                        strokeWidth="3"
                        fill="none"
                    />
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    graphContainer: {
        backgroundColor: COLORS.background,
        borderTopColor: COLORS.cyan,
        borderBottomColor: COLORS.cyan,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        paddingVertical: 15,
        shadowColor: COLORS.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 12,
        elevation: 12,
    },
});

export default WaveformGraph;
