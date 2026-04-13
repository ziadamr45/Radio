// Stream Proxy Service with buffering to prevent audio glitches
// Buffers data before sending to prevent "tick tick" sounds

const PORT = 3031;
const BUFFER_SIZE = 64 * 1024; // 64KB buffer

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      });
    }
    
    const streamUrl = url.searchParams.get('url');
    if (!streamUrl) {
      return new Response('URL required', { status: 400 });
    }
    
    try {
      const decodedUrl = decodeURIComponent(streamUrl);
      console.log('[Proxy] Fetching:', decodedUrl);
      
      const response = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'VLC/3.0.0',
          'Accept': '*/*',
          'Icy-MetaData': '1',
        },
      });
      
      if (!response.ok) {
        console.log('[Proxy] Failed:', response.status);
        return new Response('Stream error', { status: response.status });
      }
      
      const contentType = response.headers.get('content-type') || 'audio/mpeg';
      const reader = response.body?.getReader();
      
      if (!reader) {
        return new Response('No body', { status: 500 });
      }
      
      // Create buffered stream using async generator
      const stream = new ReadableStream({
        async start(controller) {
          const buffer: Uint8Array[] = [];
          let bufferSize = 0;
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                // Flush remaining buffer
                if (buffer.length > 0) {
                  const combined = new Uint8Array(bufferSize);
                  let offset = 0;
                  for (const chunk of buffer) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                  }
                  controller.enqueue(combined);
                }
                controller.close();
                break;
              }
              
              buffer.push(value);
              bufferSize += value.length;
              
              // Send when buffer is full
              if (bufferSize >= BUFFER_SIZE) {
                const combined = new Uint8Array(bufferSize);
                let offset = 0;
                for (const chunk of buffer) {
                  combined.set(chunk, offset);
                  offset += chunk.length;
                }
                controller.enqueue(combined);
                buffer.length = 0;
                bufferSize = 0;
              }
            }
          } catch (e) {
            console.error('[Proxy] Read error:', e);
            controller.close();
          }
        },
        cancel() {
          reader.cancel();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (e) {
      console.error('[Proxy] Error:', e);
      return new Response('Proxy error', { status: 500 });
    }
  },
});

console.log(`[Stream Proxy] Port ${PORT} - Buffer: ${BUFFER_SIZE / 1024}KB`);
