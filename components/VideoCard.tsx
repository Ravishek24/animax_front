import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface VideoCardProps {
	title?: string;
	youtubeId: string;
	youtubeUrl: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, youtubeId, youtubeUrl }) => {
	const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

	const handlePress = async () => {
		try {
			const supported = await Linking.canOpenURL(youtubeUrl);
			if (supported) {
				await Linking.openURL(youtubeUrl);
			} else {
				await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
			}
		} catch {}
	};

	return (
		<TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
			<Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
			<View style={styles.meta}>
				<Text numberOfLines={2} style={styles.title}>{title || 'YouTube Video'}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: 'white',
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.08,
		shadowRadius: 5,
		elevation: 3,
		width: '100%'
	},
	thumbnail: {
		width: '100%',
		height: 190
	},
	meta: {
		padding: 12
	},
	title: {
		fontSize: 14,
		fontWeight: '600',
		color: '#222'
	}
});

export default VideoCard;


