import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import ZAI from 'z-ai-web-dev-sdk';

const STATION_IMAGES_TO_GENERATE = [
  // Music - add 8 more (17-24)
  { category: 'music', id: 17, prompt: "Professional radio station cover art, abstract neon music visualizer bars with colorful gradient from pink to purple, dark background, glowing sound waves radiating outward, no text no letters, modern digital art style, vibrant radio broadcasting aesthetic" },
  { category: 'music', id: 18, prompt: "Professional radio station cover art, golden microphone with colorful audio equalizer rings behind it, warm orange to red gradient background, music notes floating, dark professional aesthetic, no text no letters no words, premium radio station branding" },
  { category: 'music', id: 19, prompt: "Professional radio station cover art, abstract vinyl record spinning with rainbow sound frequency spectrum, dark navy background with neon blue accents, music waveform visualization, no text no letters no words, high quality digital illustration" },
  { category: 'music', id: 20, prompt: "Professional radio station cover art, elegant concert stage silhouette with colorful laser beams, deep purple to magenta gradient, musical instruments outline, dark atmospheric background, no text no letters no words, concert venue radio aesthetic" },
  { category: 'music', id: 21, prompt: "Professional radio station cover art, abstract DJ mixer console with colorful faders and knobs, electric blue to cyan gradient background, sound pulse waves, dark modern aesthetic, no text no letters no words, electronic music station" },
  { category: 'music', id: 22, prompt: "Professional radio station cover art, retro cassette tape with colorful music notes flowing out, warm sunset orange to pink gradient background, vintage radio feel with modern touch, no text no letters no words, nostalgic music station" },
  { category: 'music', id: 23, prompt: "Professional radio station cover art, abstract guitar silhouette with colorful sound distortion waves, fire red to golden gradient background, rock music energy, dark aggressive aesthetic, no text no letters no words, rock radio station" },
  { category: 'music', id: 24, prompt: "Professional radio station cover art, headphones with colorful bubble music notes around them, soft lavender to teal gradient background, calm relaxing music vibe, no text no letters no words, chill lounge radio station" },

  // News - add 4 more (7-10)
  { category: 'news', id: 7, prompt: "Professional news radio station cover art, abstract globe with colorful signal waves radiating, deep blue to teal gradient background, digital broadcast tower silhouette, no text no letters no words, breaking news radio aesthetic" },
  { category: 'news', id: 8, prompt: "Professional news radio station cover art, satellite dish pointing up with colorful data streams, dark navy background with emerald green accents, global broadcast visualization, no text no letters no words, world news station" },
  { category: 'news', id: 9, prompt: "Professional news radio station cover art, abstract microphone with colorful sound frequency bars, dark slate blue to cyan gradient background, live broadcast energy, no text no letters no words, 24/7 news station" },
  { category: 'news', id: 10, prompt: "Professional news radio station cover art, newspaper pages floating with colorful signal dots, dark charcoal to steel blue gradient, information flow visualization, no text no letters no words, press radio station" },

  // Sport - add 5 more (6-10)
  { category: 'sport', id: 6, prompt: "Professional sports radio station cover art, abstract soccer ball with colorful motion trails, dynamic green to yellow gradient background, stadium lights glow, no text no letters no words, live sports radio aesthetic" },
  { category: 'sport', id: 7, prompt: "Professional sports radio station cover art, running track with colorful speed lines, vibrant orange to red gradient background, athletic energy, dark dynamic background, no text no letters no words, sports radio" },
  { category: 'sport', id: 8, prompt: "Professional sports radio station cover art, abstract basketball hoop with colorful trajectory arcs, electric blue to purple gradient background, arena atmosphere, no text no letters no words, basketball radio station" },
  { category: 'sport', id: 9, prompt: "Professional sports radio station cover, tennis court with colorful ball trajectory lines, bright green to cyan gradient background, rally energy, dark athletic aesthetic, no text no letters no words, tennis radio" },
  { category: 'sport', id: 10, prompt: "Professional sports radio station cover art, stadium silhouette with colorful fireworks, dark navy to gold gradient background, championship celebration vibe, no text no letters no words, victory sports radio" },

  // Talk - add 4 more (7-10)
  { category: 'talk', id: 7, prompt: "Professional talk radio station cover art, abstract podcast microphone with colorful conversation bubbles, warm amber to coral gradient background, dialogue flow visualization, no text no letters no words, podcast talk radio" },
  { category: 'talk', id: 8, prompt: "Professional talk radio station cover art, abstract debate podium with colorful opinion waves, deep purple to rose gradient background, intellectual discussion vibe, no text no letters no words, debate talk radio" },
  { category: 'talk', id: 9, prompt: "Professional talk radio station cover art, open book with colorful knowledge sparks flying out, warm brown to gold gradient background, educational content flow, no text no letters no words, cultural talk radio" },
  { category: 'talk', id: 10, prompt: "Professional talk radio station cover art, abstract headphones with colorful interview waves, dark indigo to teal gradient background, studio conversation aesthetic, no text no letters no words, interview talk radio" },

  // Islamic - add 3 more (8-10)
  { category: 'islamic', id: 8, prompt: "Professional Islamic radio station cover art, abstract crescent moon with colorful stars and light rays, deep emerald green to gold gradient background, peaceful spiritual atmosphere, no text no letters no words, Islamic spiritual radio" },
  { category: 'islamic', id: 9, prompt: "Professional Islamic radio cover art, mosque dome silhouette with colorful light beams at sunset, warm gold to teal gradient background, serene spiritual vibes, no text no letters no words, mosque radio station" },
  { category: 'islamic', id: 10, prompt: "Professional Islamic radio cover art, abstract Islamic geometric pattern with colorful intricate designs, royal blue to silver gradient background, elegant heritage feel, no text no letters no words, Islamic art radio" },

  // Nasheed - add 3 more (8-10)
  { category: 'nasheed', id: 8, prompt: "Professional nasheed radio station cover art, abstract Islamic musical notes with colorful harmony waves, rich burgundy to gold gradient background, spiritual music celebration, no text no letters no words, Islamic music radio" },
  { category: 'nasheed', id: 9, prompt: "Professional nasheed radio cover art, hands raised in prayer with colorful musical notes rising, warm sunset orange to rose gradient background, spiritual singing atmosphere, no text no letters no words, nasheed radio" },
  { category: 'nasheed', id: 10, prompt: "Professional nasheed radio cover art, abstract daff drum with colorful rhythm patterns, deep purple to magenta gradient background, energetic Islamic music vibe, no text no letters no words, Islamic anasheed radio" },
];

async function generateAndSave(prompt: string, filepath: string): Promise<boolean> {
  try {
    const zai = await ZAI.create();
    const result = await zai.images.generations.create({
      prompt,
      size: '1024x1024',
    });

    const base64 = result.data?.[0]?.base64;
    if (!base64) {
      console.error(`No base64 data for ${filepath}`);
      return false;
    }

    const buffer = Buffer.from(base64, 'base64');

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filepath, buffer);
    console.log(`✅ Generated: ${path.basename(filepath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed ${path.basename(filepath)}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let images = STATION_IMAGES_TO_GENERATE;
    if (category) {
      images = images.filter(img => img.category === category);
    }

    const limit = parseInt(searchParams.get('limit') || '3');

    // Limit to avoid timeout
    const toGenerate = images.slice(0, Math.min(limit, images.length));

    const results: { file: string; success: boolean; error?: string }[] = [];

    for (const img of toGenerate) {
      const filepath = path.join(process.cwd(), 'public', 'images', 'stations', img.category, `${img.category}-${img.id}.png`);
      console.log(`Generating ${img.category}-${img.id}...`);
      const success = await generateAndSave(img.prompt, filepath);
      results.push({
        file: `stations/${img.category}/${img.category}-${img.id}.png`,
        success,
        error: success ? undefined : 'Failed to generate',
      });
    }

    return NextResponse.json({
      success: true,
      generated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    console.error('Generate images error:', error);
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 });
  }
}
