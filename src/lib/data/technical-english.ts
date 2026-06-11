export const TECH_ENGLISH_PHRASES = [
  {
    phase: "Clarificação de requisitos",
    phrases: [
      {
        pt: "Posso fazer algumas perguntas antes de começar?",
        en: "Can I ask a few clarifying questions before I start?",
      },
      { pt: "Qual é o tamanho esperado do input?", en: "What's the expected input size / scale?" },
      {
        pt: "Preciso me preocupar com valores nulos ou negativos?",
        en: "Do I need to handle null values or negative numbers?",
      },
      { pt: "Posso assumir que o array está ordenado?", en: "Can I assume the array is sorted?" },
      {
        pt: "O que deve retornar se não houver solução?",
        en: "What should we return if there's no valid answer?",
      },
      {
        pt: "Estamos otimizando para tempo ou espaço?",
        en: "Are we optimizing for time or space?",
      },
    ],
  },
  {
    phase: "Durante a solução",
    phrases: [
      { pt: "Deixa eu pensar em voz alta...", en: "Let me think through this out loud..." },
      {
        pt: "Minha primeira ideia é força bruta: O(n²). Depois posso otimizar.",
        en: "My initial approach is brute force: O(n²). I can optimize from there.",
      },
      {
        pt: "Estou usando um hashmap para conseguir lookup em O(1).",
        en: "I'm using a hashmap to get O(1) lookups.",
      },
      {
        pt: "Vou usar dois ponteiros para reduzir para O(n).",
        en: "I'll use two pointers to bring this down to O(n).",
      },
      { pt: "O invariante desta janela é...", en: "The invariant of this window is..." },
      { pt: "Preciso de uma condição de parada aqui.", en: "I need a base case here." },
      {
        pt: "Vou chamar essa função recursivamente com...",
        en: "I'll call this recursively with...",
      },
    ],
  },
  {
    phase: "Análise de complexidade",
    phrases: [
      {
        pt: "A complexidade de tempo é O(n log n) por causa do sort.",
        en: "The time complexity is O(n log n) due to the sort.",
      },
      {
        pt: "A complexidade de espaço é O(n) pelo hashmap.",
        en: "Space complexity is O(n) for the hashmap.",
      },
      {
        pt: "No pior caso, visitamos cada nó uma vez.",
        en: "In the worst case, we visit each node once.",
      },
      { pt: "Esse loop aninhado torna isso O(n²).", en: "This nested loop makes it O(n²)." },
      {
        pt: "Podemos reduzir para O(1) de espaço se...",
        en: "We can reduce to O(1) space if we...",
      },
    ],
  },
  {
    phase: "Testing e edge cases",
    phrases: [
      {
        pt: "Deixa eu testar com o exemplo básico primeiro.",
        en: "Let me trace through the basic example first.",
      },
      { pt: "O que acontece com um array vazio?", en: "What happens with an empty array?" },
      {
        pt: "Preciso verificar o caso de um único elemento.",
        en: "I need to check the single-element case.",
      },
      { pt: "E se todos os elementos forem iguais?", en: "What if all elements are the same?" },
      {
        pt: "Testando com o exemplo do enunciado: esperamos X, obtemos X.",
        en: "Testing with the given example: we expect X, and we get X.",
      },
    ],
  },
  {
    phase: "System Design",
    phrases: [
      {
        pt: "Vou começar pelos requisitos funcionais.",
        en: "Let me start with the functional requirements.",
      },
      {
        pt: "Para os requisitos não-funcionais, vou assumir alta disponibilidade.",
        en: "For non-functional requirements, I'll assume high availability.",
      },
      {
        pt: "A estimativa de escala é de 10M de usuários ativos.",
        en: "My scale estimate is 10M active users.",
      },
      {
        pt: "Vou usar uma fila de mensagens para desacoplar esses serviços.",
        en: "I'll use a message queue to decouple these services.",
      },
      {
        pt: "O tradeoff aqui é consistência vs disponibilidade.",
        en: "The tradeoff here is consistency vs availability.",
      },
      {
        pt: "Para leituras pesadas, vou adicionar um cache na frente.",
        en: "For read-heavy workloads, I'll add a caching layer in front.",
      },
      {
        pt: "Como vamos monitorar isso em produção?",
        en: "How would we monitor this in production?",
      },
    ],
  },
  {
    phase: "Behavioral (STAR)",
    phrases: [
      {
        pt: "Deixa eu dar um exemplo concreto disso.",
        en: "Let me give you a concrete example of that.",
      },
      { pt: "O contexto era...", en: "The context was..." },
      { pt: "Minha responsabilidade específica foi...", en: "My specific responsibility was..." },
      { pt: "A ação que tomei foi... porque...", en: "The action I took was... because..." },
      {
        pt: "O resultado foi um aumento de X% em...",
        en: "The result was an X% improvement in...",
      },
      { pt: "O que aprendi com isso foi...", en: "What I learned from that was..." },
      { pt: "Se fizesse de novo, eu...", en: "If I were to do it again, I would..." },
    ],
  },
  {
    phase: "Comunicação geral",
    phrases: [
      { pt: "Posso ter um momento para pensar?", en: "Can I take a moment to think?" },
      { pt: "Corrija-me se eu estiver errado.", en: "Please correct me if I'm wrong." },
      { pt: "Esse é um problema interessante.", en: "That's an interesting problem." },
      {
        pt: "Deixa eu reformular para ter certeza que entendi.",
        en: "Let me restate to make sure I understood correctly.",
      },
      {
        pt: "Tenho mais alguma pergunta sobre os requisitos?",
        en: "Do I have any more questions about the requirements?",
      },
      {
        pt: "Qual parte você gostaria que eu detalhasse mais?",
        en: "Which part would you like me to elaborate on?",
      },
      {
        pt: "Obrigado pelo feedback, vou levar isso em consideração.",
        en: "Thank you for the feedback, I'll keep that in mind.",
      },
    ],
  },
];
