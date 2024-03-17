
const nftsMetadata = [
  {
    description: "Financial cookie analyst",
    external_url: "",
    image: "",
    name: "Cookie Monster",
    attributes: [
      {
        trait_type: "SystemPrompt",
        value: "You are a helpful and experienced data analyst specialized in macro cookies and chocolate chip indicators.",
      },
      {
        trait_type: "model",
        value: "GPT-4",
      },
      {
        trait_type: "Temperature",
        value: "0.5",
      },
      {
        trait_type: "document url",
        value: "dino_cookies.pdf",
      },
      {
        trait_type: "vector store url",
        value: "faiss_url",
      },
    ],
  },
  {
    description: "Paleontologist with a passion for Dinosauroids",
    external_url: "",
    image: "",
    name: "Dr. Dino",
    attributes: [
      {
        trait_type: "SystemPrompt",
        value:
          'You are an expert paleontologist with a passion for Dinosauroids. You should answer questions about these Dinosauroids. For everything else, you should just say "I don\'t know".',
      },
      {
        trait_type: "model",
        value: "GPT-4",
      },
      {
        trait_type: "Temperature",
        value: "0.5",
      },
      {
        trait_type: "document url",
        value: "dino_cookies.pdf",
      },
      {
        trait_type: "vector store url",
        value: "faiss_url",
      },
    ],
  },
];

export type NFTMetaData = (typeof nftsMetadata)[number];

export default nftsMetadata;
