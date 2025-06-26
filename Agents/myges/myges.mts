import 'dotenv/config';

import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { loadAgentPrompt } from "./generate_prompt.mts";
import { prestations } from "./tools/prestations.mts";

const synaptixPrompt = loadAgentPrompt('myges');

const agentModel = new ChatOpenAI({ 
  temperature: 0.5,
  model: "deepseek/deepseek-r1-0528-qwen3-8b", // Modèle disponible dans LM Studio
  configuration: {
    baseURL: "http://10.213.20.215:1235/v1",
    apiKey: "not-needed", // LMStudio ne nécessite pas de clé API réelle
  }
});

//const agentModel = new ChatOpenAI({ temperature: 0.5, model: "gpt-4o-mini" });

const agentCheckpointer = new MemorySaver();
export const synaptixAgent = createReactAgent({
  prompt: synaptixPrompt,
  llm: agentModel,
  tools: [prestations],
  checkpointSaver: agentCheckpointer,
});
