const OpenAI = require('openai');
const aiRepository = require('../repositories/aiRepository');

/**
 * =====================================================================
 * AI SUPPORT SERVICE
 * =====================================================================
 * Ishlash tartibi:
 *   1. Agar OPENAI_API_KEY mavjud bo'lsa -> OpenAI'ga so'rov yuboriladi,
 *      bilim bazasi (ai_knowledge_base) system prompt sifatida qo'shiladi.
 *   2. Agar kalit bo'lmasa YOKI OpenAI xatolik qaytarsa (rate limit,
 *      network, invalid key va h.k.) -> avtomatik ravishda keyword-based
 *      fallback rejimiga o'tiladi. Bu holatda chat "o'lik" bo'lib qolmaydi.
 *   3. Ikkala holatda ham javob va foydalanuvchi savoli ai_chat_logs
 *      jadvaliga yoziladi (admin ko'rib, bilim bazasini yaxshilashi uchun).
 * =====================================================================
 */

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const FALLBACK_UNKNOWN_RESPONSE =
  "Kechirasiz, bu savolga aniq javob bera olmayapman. Iltimos, telefon raqamingizni qoldiring, administratorlarimiz sizga tez orada javob beradi. Yoki to'g'ridan-to'g'ri qo'ng'iroq qiling: +998883995414";

const SYSTEM_PROMPT_TEMPLATE = `Sen BMG School ingliz tili o'quv markazining virtual yordamchisisan.

QOIDALAR:
- FAQAT o'zbek tilida (lotin alifbosida) javob ber. Boshqa tilda savol berilsa ham, o'zbekcha javob ber.
- Faqat quyidagi mavzular bo'yicha javob ber: kurslar, CEFR darajalari, IELTS, narxlar, o'qituvchilar, manzil, ish vaqti va aloqa ma'lumotlari.
- Agar savol quyidagi bilim bazasida yo'q bo'lsa yoki mavzudan tashqari bo'lsa (masalan siyosat, boshqa mavzular), buni tan ol va foydalanuvchidan telefon raqamini so'ra, administratorlar bog'lanishini ayt.
- Javoblar qisqa va aniq bo'lsin (2-4 gap). Ortiqcha cho'zma.
- Do'stona va hurmatli ohangda yoz.

BILIM BAZASI:
{knowledge}

Yuqoridagi bilim bazasidan tashqariga chiqma. Aniq bilmagan narsa haqida taxmin qilib javob berma.`;

function buildSystemPrompt(knowledgeRows) {
  const knowledgeText = knowledgeRows
    .map((row) => `[${row.topic}]\n${row.content}`)
    .join('\n\n');
  return SYSTEM_PROMPT_TEMPLATE.replace('{knowledge}', knowledgeText);
}

/**
 * Kalit so'zlarga asoslangan oddiy javob beruvchi — OpenAI mavjud
 * bo'lmaganda yoki xatolik yuz berganda ishga tushadi.
 */
function keywordFallbackResponse(userMessage, knowledgeRows) {
  const normalizedMessage = userMessage.toLowerCase();

  let bestMatch = null;
  let bestMatchScore = 0;

  for (const row of knowledgeRows) {
    if (!row.keywords) continue;
    const keywords = row.keywords.split(',').map((k) => k.trim().toLowerCase());
    const matchCount = keywords.filter((kw) => kw && normalizedMessage.includes(kw)).length;

    if (matchCount > bestMatchScore) {
      bestMatchScore = matchCount;
      bestMatch = row;
    }
  }

  if (bestMatch) {
    return { response: bestMatch.content, requestedPhone: false };
  }

  return { response: FALLBACK_UNKNOWN_RESPONSE, requestedPhone: true };
}

/**
 * Asosiy funksiya — controller shu funksiyani chaqiradi.
 * @param {string} userMessage
 * @param {string} sessionId
 * @param {Array<{role: string, content: string}>} conversationHistory - oldingi xabarlar (ixtiyoriy, kontekst uchun)
 */
async function getChatResponse(userMessage, sessionId, conversationHistory = []) {
  const knowledgeRows = await aiRepository.findAllKnowledge();

  // ---------- OpenAI mavjud bo'lsa, avval shuni sinaymiz ----------
  if (openaiClient) {
    try {
      const systemPrompt = buildSystemPrompt(knowledgeRows);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6), // faqat oxirgi 6 xabar — token tejash
        { role: 'user', content: userMessage },
      ];

      const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.4,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error('OpenAI bo\'sh javob qaytardi.');
      }

      const requestedPhone = aiResponse.includes('telefon') && aiResponse.includes('raqam');

      await aiRepository.logChat({
        sessionId,
        userMessage,
        aiResponse,
        wasFallback: false,
        requestedPhone,
      });

      return { response: aiResponse, usedFallback: false };
    } catch (error) {
      console.error('⚠️  OpenAI xatoligi, keyword-fallback rejimiga o\'tildi:', error.message);
      // Pastga tushamiz — fallback ishlatiladi
    }
  }

  // ---------- FALLBACK: keyword-based javob ----------
  const { response, requestedPhone } = keywordFallbackResponse(userMessage, knowledgeRows);

  await aiRepository.logChat({
    sessionId,
    userMessage,
    aiResponse: response,
    wasFallback: true,
    requestedPhone,
  });

  return { response, usedFallback: true };
}

async function getKnowledgeBase(includeInactive = false) {
  return aiRepository.findAllKnowledge({ includeInactive });
}

async function createKnowledge(data) {
  return aiRepository.createKnowledge(data);
}

async function updateKnowledge(id, data) {
  return aiRepository.updateKnowledge(id, data);
}

async function removeKnowledge(id) {
  return aiRepository.removeKnowledge(id);
}

async function getChatLogs(pagination) {
  return aiRepository.findLogsPaginated(pagination);
}

function isOpenAiConfigured() {
  return openaiClient !== null;
}

module.exports = {
  getChatResponse,
  getKnowledgeBase,
  createKnowledge,
  updateKnowledge,
  removeKnowledge,
  getChatLogs,
  isOpenAiConfigured,
};
