export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return handleHealth(env);
    }

    if (url.pathname === '/api/firebase-config' && request.method === 'GET') {
      return handleFirebaseConfig(env);
    }

    if (url.pathname === '/api/generate-image' && request.method === 'POST') {
      return handleGenerateImage(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

function handleHealth(env) {
  const status = {
    worker: 'running',
    openai: !!env.OPENAI_API_KEY,
    openaiProject: !!env.OPENAI_PROJECT_ID,
    openaiGateway: !!env.OPENAI_GATEWAY,
    firebase: !!(env.FIREBASE_API_KEY && env.FIREBASE_AUTH_DOMAIN && env.FIREBASE_PROJECT_ID && env.FIREBASE_APP_ID),
  };
  return json(status, 200);
}

function handleFirebaseConfig(env) {
  const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
  };

  const hasConfig = config.apiKey && config.authDomain && config.projectId && config.appId;

  if (!hasConfig) {
    return json({ error: 'Firebase 설정이 등록되지 않았습니다.' }, 503);
  }

  return json(config, 200);
}

async function handleGenerateImage(request, env) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: '서버 설정 오류: API 키가 등록되지 않았습니다.' }, 500);
  }

  const gateway = env.OPENAI_GATEWAY;
  const apiBase = gateway
    ? `https://gateway.ai.cloudflare.com/v1/${gateway}/openai`
    : 'https://api.openai.com/v1';

  try {
    const body = await request.json();
    const { prompt, size, quality } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return json({ error: '프롬프트는 필수입니다.' }, 400);
    }

    const VALID_SIZES = ['1024x1024', '1024x1536', '1536x1024', 'auto'];
    const VALID_QUALITIES = ['low', 'medium', 'high', 'auto'];

    const imageSize = VALID_SIZES.includes(size) ? size : '1024x1024';
    const imageQuality = VALID_QUALITIES.includes(quality) ? quality : 'auto';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    if (env.OPENAI_PROJECT_ID) {
      headers['OpenAI-Project'] = env.OPENAI_PROJECT_ID;
    }

    const openaiRes = await fetch(`${apiBase}/images/generations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt: prompt.trim(),
        n: 1,
        size: imageSize,
        quality: imageQuality,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error('OpenAI API 오류:', openaiRes.status, errBody);
      let errMsg = `이미지 생성에 실패했어요. (${openaiRes.status})`;
      try {
        const errJson = JSON.parse(errBody);
        if (errJson.error?.message) errMsg = errJson.error.message;
      } catch (_) { /* raw text */ }
      return json({ error: errMsg }, 502);
    }

    const data = await openaiRes.json();
    const base64 = data.data?.[0]?.b64_json;

    if (!base64) {
      return json({ error: '이미지 데이터를 받지 못했어요.' }, 502);
    }

    return json({ base64, revised_prompt: data.data?.[0]?.revised_prompt || null }, 200);
  } catch (err) {
    console.error('Worker 오류:', err.message);
    return json({ error: '서버 내부 오류가 발생했어요.' }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
