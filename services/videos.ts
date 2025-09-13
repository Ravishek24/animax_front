import apiService from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export interface VideoItem {
	id: number;
	title?: string;
	youtubeUrl: string;
	youtubeId: string;
	isActive: boolean;
	order?: number | null;
}

export interface VideosResponse {
	success: boolean;
	data: VideoItem[];
}

export async function fetchActiveVideos(): Promise<VideoItem[]> {
	const res = await apiService.get<VideosResponse>(API_ENDPOINTS.VIDEOS.LIST, { active: true });
	const list = ((res as any)?.data || []) as VideoItem[];
	if (!Array.isArray(list) || list.length === 0) return [];

	// Fill missing titles using YouTube oEmbed
	const enriched = await Promise.all(
		list.map(async (item) => {
			if (item.title && item.title.trim().length > 0) return item;
			try {
				const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeId}`)}&format=json`;
				const resp = await fetch(oembedUrl);
				if (resp.ok) {
					const data = await resp.json();
					return { ...item, title: data?.title || item.title } as VideoItem;
				}
			} catch {}
			return item;
		})
	);

	return enriched;
}


