/**
 * OpenAI API Wrapper (Claude Sonnet 4.6 uyumlu)
 * Rate limiting, retry, Türkçe içerik üretimi için system prompt
 * 
 * Kullanım: OPENAI_API_KEY env variable gerekli (.env dosyasından okunur)
 */
import OpenAI from "openai";
import * as path from "path";
import * as fs from "fs";

let client: OpenAI | null = null;

function loadEnv(): void {
  const envPath = path.resolve(__dirname, "../../../fusionmarkt/.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function getClient(): OpenAI {
  if (!client) {
    loadEnv();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY bulunamadı. fusionmarkt/.env dosyasına ekleyin."
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `Sen FusionMarkt için SEO içerik uzmanısın. FusionMarkt, Türkiye merkezli bir e-ticaret sitesidir ve şu ürün kategorilerinde faaliyet gösterir:
- Taşınabilir Güç Kaynakları (LiFePO4 bataryalı portable power station)
- Katlanabilir Güneş Panelleri (solar panel)
- Endüstriyel İş Eldivenleri (Traffi)
- Teleskopik Merdivenler (Telesteps)

Kurallar:
1. Tüm içerikleri Türkçe yaz. Profesyonel, güvenilir ve bilgilendirici tonda ol.
2. SEO için doğal keyword yerleştirmesi yap, keyword stuffing yapma.
3. Kullanıcı niyetine odaklan: alıcı rehberi, karşılaştırma, problem çözüm.
4. Teknik bilgileri anlaşılır şekilde aktar, gerçek veri ve rakamlar kullan.
5. Her zaman FusionMarkt ürünlerini doğal şekilde öner, ama agresif satış yapma.
6. HTML formatında yaz (h2, h3, p, ul, li, strong, table, tr, th, td etiketleri kullan).
7. Türkçe karakterleri doğru kullan (ğ, ü, ş, ı, ö, ç, İ).`;

let lastCallTime = 0;
const MIN_DELAY_MS = 1000;

async function rateLimitedDelay(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_DELAY_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS - elapsed));
  }
  lastCallTime = Date.now();
}

export interface AIGenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export async function generateContent(options: AIGenerateOptions): Promise<string> {
  await rateLimitedDelay();

  const ai = getClient();
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: options.systemPrompt || SYSTEM_PROMPT },
          { role: "user", content: options.prompt },
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature ?? 0.7,
      });

      let text = response.choices[0]?.message?.content;
      if (!text) throw new Error("Boş yanıt alındı");

      text = text.trim();
      // ```html ... ``` wrapper'ini temizle
      text = text.replace(/^```html\s*\n?/, "").replace(/\n?```\s*$/, "").trim();

      return text;
    } catch (error) {
      lastError = error as Error;
      console.warn(`  ⚠ Deneme ${attempt + 1}/${maxRetries} başarısız: ${lastError.message}`);
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`AI çağrısı ${maxRetries} denemeden sonra başarısız: ${lastError?.message}`);
}

export async function generateJSON<T>(options: AIGenerateOptions): Promise<T> {
  const prompt = options.prompt + "\n\nYANITI SADECE GEÇERLİ JSON OLARAK VER. Markdown code block kullanma. Türkçe karakterlerde kaçış karakteri kullanma.";
  
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const raw = await generateContent({ ...options, prompt });

    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    let jsonStr = (jsonMatch[1] || raw).trim();
    // Trailing comma before ] or } temizle
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      try {
        const start = jsonStr.indexOf("{");
        const end = jsonStr.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
          return JSON.parse(jsonStr.slice(start, end + 1)) as T;
        }
        const arrStart = jsonStr.indexOf("[");
        const arrEnd = jsonStr.lastIndexOf("]");
        if (arrStart !== -1 && arrEnd !== -1) {
          return JSON.parse(jsonStr.slice(arrStart, arrEnd + 1)) as T;
        }
      } catch { /* retry */ }

      if (attempt < maxAttempts - 1) {
        console.warn(`  ⚠ JSON parse hatası, yeniden deneniyor (${attempt + 1}/${maxAttempts})...`);
      } else {
        throw new Error(`JSON parse hatası ${maxAttempts} denemede. Raw: ${jsonStr.slice(0, 200)}`);
      }
    }
  }
  throw new Error("JSON parse başarısız");
}

export { SYSTEM_PROMPT };
