import { json } from '../_lib/http.mjs';
import { approvedRecent, publicStories } from '../_lib/store.mjs';

export async function GET() {
  try {
    const catalogue = new Map((await publicStories()).map(story => [story.slug, story]));
    const comments = (await approvedRecent()).flatMap(comment => {
      const story = catalogue.get(comment.slug);
      return story ? [{ ...comment, latitude: story.place.latitude, longitude: story.place.longitude, city: story.place.city, storyTitle: story.translations }] : [];
    });
    return json({ comments });
  } catch (error) {
    console.error(error);
    return json({ error: 'Comentários temporariamente indisponíveis' }, 503);
  }
}
