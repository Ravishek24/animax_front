import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import VideoCard from './VideoCard';

interface CarouselItem {
	id: number;
	title?: string;
	youtubeUrl: string;
	youtubeId: string;
}

interface VideoCarouselProps {
	items: CarouselItem[];
}

const { width } = Dimensions.get('window');

const VideoCarousel: React.FC<VideoCarouselProps> = ({ items }) => {
	const scrollRef = React.useRef<ScrollView>(null);
	const [index, setIndex] = React.useState(0);
	const enableAuto = items.length > 1;

	React.useEffect(() => {
		if (!enableAuto) return;
		const interval = setInterval(() => {
			const next = (index + 1) % items.length;
			setIndex(next);
			if (scrollRef.current) {
				scrollRef.current.scrollTo({ x: next * (width - 32), animated: true });
			}
		}, 1500);
		return () => clearInterval(interval);
	}, [index, items.length, enableAuto]);

	if (!items || items.length === 0) return null;

	if (items.length === 1) {
		return (
			<View style={{ marginHorizontal: 16 }}>
				<VideoCard title={items[0].title} youtubeId={items[0].youtubeId} youtubeUrl={items[0].youtubeUrl} />
			</View>
		);
	}

	return (
		<View>
			<ScrollView
				ref={scrollRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={(e) => {
					const i = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
					setIndex(i);
				}}
				scrollEventThrottle={16}
				contentContainerStyle={{ paddingHorizontal: 16 }}
			>
				{items.map(item => (
					<View key={item.id} style={{ width: width - 32 }}>
						<VideoCard title={item.title} youtubeId={item.youtubeId} youtubeUrl={item.youtubeUrl} />
					</View>
				))}
			</ScrollView>
			<View style={styles.dots}>
				{items.map((_, i) => (
					<View key={i} style={[styles.dot, i === index && styles.dotActive]} />
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	dots: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 6,
		marginTop: 10
	},
	dot: {
		width: 8,
		height: 8,
		backgroundColor: '#ddd',
		borderRadius: 4
	},
	dotActive: {
		backgroundColor: '#990906',
		width: 20,
		borderRadius: 10
	}
});

export default VideoCarousel;


