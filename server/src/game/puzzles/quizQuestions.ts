/**
 * 150 questions — thème : code (programmation, dev) et IA.
 * Réponses en minuscules pour la comparaison côté serveur.
 */

import { PREDEFINED_QUESTIONS } from "../predefinedQuestions";

const AI_QUESTIONS = [
  { text: "Quel acronyme désigne l'intelligence artificielle ?", answer: "ia" },
  { text: "Quel type de réseau de neurones est utilisé pour le traitement du langage ?", answer: "transformer" },
  { text: "Quelle entreprise a créé ChatGPT ?", answer: "openai" },
  { text: "Quel terme désigne l'apprentissage sur des données non étiquetées ?", answer: "non supervisé" },
  { text: "Quel framework Google est très utilisé pour le deep learning ?", answer: "tensorflow" },
  { text: "Quel type d'apprentissage utilise des récompenses ?", answer: "renforcement" },
  { text: "Quel modèle de langage open source est développé par Meta ?", answer: "llama" },
  { text: "Qu'est-ce qu'un LLM ?", answer: "large language model" },
  { text: "Quelle technique permet de réduire le nombre de paramètres d'un modèle ?", answer: "quantization" },
  { text: "Quel algorithme d'IA bat les humains au jeu de Go ?", answer: "alphago" },
  { text: "Quelle fonction d'activation est souvent utilisée en sortie pour une classification binaire ?", answer: "sigmoid" },
  { text: "Quel terme désigne l'ajustement d'un modèle pré-entraîné sur une tâche spécifique ?", answer: "fine-tuning" },
  { text: "Quelle librairie Python est la plus utilisée pour le machine learning ?", answer: "scikit-learn" },
  { text: "Quel type de couche permet de réduire la dimensionnalité en conservant l'information importante ?", answer: "attention" },
  { text: "Qu'est-ce que le prompt engineering ?", answer: "ingénierie des prompts" },
  { text: "Quel framework de deep learning utilise des graphes de calcul dynamiques ?", answer: "pytorch" },
  { text: "Quel terme désigne le biais introduit par les données d'entraînement ?", answer: "bias" },
  { text: "Quelle technique permet de générer du texte à partir d'un modèle de langage ?", answer: "génération" },
  { text: "Quel type de réseau est utilisé pour les images ?", answer: "convolutionnel" },
  { text: "Qu'est-ce qu'un embedding ?", answer: "vecteur" },
  { text: "Quelle métrique mesure la performance d'un modèle de classification ?", answer: "accuracy" },
  { text: "Quel terme désigne l'overfitting en français ?", answer: "surapprentissage" },
  { text: "Quelle technique divise les données en train et test ?", answer: "split" },
  { text: "Quel algorithme d'optimisation est très utilisé en deep learning ?", answer: "adam" },
  { text: "Qu'est-ce que le RAG (Retrieval-Augmented Generation) ?", answer: "génération augmentée" },
  { text: "Quel type de modèle génère du contenu (texte, image) ?", answer: "génératif" },
  { text: "Quelle technique permet de régulariser un réseau en désactivant des neurones ?", answer: "dropout" },
  { text: "Quel format représente les mots sous forme de vecteurs denses ?", answer: "word2vec" },
  { text: "Quelle architecture a révolutionné la traduction automatique ?", answer: "transformer" },
  { text: "Quel terme désigne l'explicabilité des décisions d'une IA ?", answer: "explicabilité" },
  { text: "Quelle librairie permet de faire du NLP avec des transformers ?", answer: "huggingface" },
  { text: "Quel type d'apprentissage utilise des paires entrée-sortie ?", answer: "supervisé" },
  { text: "Qu'est-ce qu'un token dans le contexte des LLM ?", answer: "unité" },
  { text: "Quelle technique permet d'utiliser un modèle trop grand pour la mémoire ?", answer: "quantization" },
  { text: "Quel type de couche permet de modéliser des séquences ?", answer: "lstm" },
  { text: "Quelle fonction d'activation évite le problème du gradient qui disparaît ?", answer: "relu" },
  { text: "Quel terme désigne l'entraînement d'un modèle à prédire le prochain token ?", answer: "next token" },
  { text: "Quelle technique améliore les performances en mélangeant les données ?", answer: "data augmentation" },
  { text: "Quel type de modèle peut générer des images à partir de texte ?", answer: "diffusion" },
  { text: "Qu'est-ce que l'alignement en IA ?", answer: "alignement" },
  { text: "Quelle métrique est utilisée pour évaluer la qualité de texte généré ?", answer: "bleu" },
  { text: "Quel terme désigne un modèle qui imite le raisonnement humain ?", answer: "chain of thought" },
  { text: "Quelle technique permet de réduire la taille d'un modèle ?", answer: "pruning" },
  { text: "Quel type de réseau a des connexions récurrentes ?", answer: "rnn" },
  { text: "Qu'est-ce que le few-shot learning ?", answer: "apprentissage peu shot" },
  { text: "Quelle API OpenAI permet de générer du texte ?", answer: "chatgpt" },
  { text: "Quel terme désigne la capacité d'un modèle à généraliser ?", answer: "généralisation" },
  { text: "Quelle structure de données est utilisée pour les arbres de décision ?", answer: "arbre" },
  { text: "Quel type de problème consiste à regrouper des données sans étiquette ?", answer: "clustering" },
  { text: "Qu'est-ce qu'un hallucination dans le contexte des LLM ?", answer: "hallucination" },
  { text: "Quelle technique permet d'entraîner un modèle sur plusieurs GPU ?", answer: "distributed" },
];

const CODE_QUESTIONS = PREDEFINED_QUESTIONS.slice(0, 100);

export const QUIZ_QUESTIONS: { text: string; answer: string }[] = [...CODE_QUESTIONS, ...AI_QUESTIONS];

export function getQuizQuestion(index: number): { text: string; answer: string } | null {
  if (index < 0 || index >= QUIZ_QUESTIONS.length) return null;
  return QUIZ_QUESTIONS[index] ?? null;
}

export function getQuizCount(): number {
  return QUIZ_QUESTIONS.length;
}
