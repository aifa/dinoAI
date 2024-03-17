
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
];

export type NFTMetaData = (typeof nftsMetadata)[number];

export default nftsMetadata;
