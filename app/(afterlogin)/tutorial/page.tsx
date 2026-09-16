import YoutubeCards, { type Video } from '@/components/YoutubeCards'
import React from 'react'
import { API_ROUTES } from '@/services/api-routes'
import { serverFetch } from '@/lib/server-fetcher'

const Page = async () => {
  let Videos: Video[] = [];
  
  try {
    const response = await serverFetch(API_ROUTES.support.fetchTutorialVideos);
    
    // The response is structured as { message: { status: "success", data: [...] } }
    if (response?.message?.status === 'success' && Array.isArray(response.message.data)) {
      Videos = response.message.data;
    } else {
      console.error("Failed to fetch tutorial videos:", response?.message?.message);
    }
  } catch (error) {
    console.error("Error fetching tutorial videos:", error);
  }

  return (
    <div>
      <YoutubeCards videos={Videos} />
    </div>
  )
}

export default Page
