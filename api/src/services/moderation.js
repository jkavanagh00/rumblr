import OpenAI from "openai";

const MODERATION_MODEL = "omni-moderation-latest";

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

function isEnabled() {
  return process.env.MODERATION_ENABLED === "true";
}

/**
 * Check text content against the OpenAI Moderation API.
 * @param {string|string[]} inputs - Text (or list of texts) to check.
 * @returns {Promise<{ flagged: boolean, results: object[] }>}
 */

export async function moderateContent(inputs) {
  const texts = (Array.isArray(inputs) ? inputs : [inputs]).filter(
    (text) => typeof text === "string" && text.trim().length > 0,
  );

  if (!isEnabled() || texts.length === 0) {
    return { flagged: false, results: [] };
  }

  const response = await getClient().moderations.create({
    model: MODERATION_MODEL,
    input: texts,
  });

  const results = response?.results ?? [];
  const flagged = results.some((r) => r.flagged);

  return { flagged, results };
}
