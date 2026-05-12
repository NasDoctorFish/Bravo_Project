// controllers/StoryController.ts
import { supabase } from '../lib/supabaseClient';

// Fetch story and log VIEW event
export async function getStoryData(storyId: string, eventType: string = "VIEW") {
  // 1️⃣ Fetch story details
  const { data: story, error: storyError } = await supabase
    .from('Story')
    .select('*')
    .eq('id', storyId)
    .single();

  if (storyError) {
    console.error('Error fetching story:', storyError);
    return null;
  }

  // 2️⃣ Log VIEW event
  const { error: logError } = await supabase
    .from('ActivityViewLog')
    .insert([
      {
        story_id: storyId,
        event_type: eventType,
        created_at: new Date().toISOString()
      }
    ]);

  if (logError) {
    console.error('Error logging view event:', logError);
  }

  return story;
}

// Aggregate total views
export async function getTotalViews(storyId: string) {
  const { data, error } = await supabase
    .from('ActivityViewLog')
    .select('id', { count: 'exact' })
    .eq('story_id', storyId)
    .eq('event_type', 'VIEW');

  if (error) {
    console.error('Error fetching total views:', error);
    return 0;
  }

  return data?.length || 0;
}