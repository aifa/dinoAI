import { useState } from "react";
import { Address, AddressInput } from "../scaffold-eth";
import { Collectible } from "./MyHoldings";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import Link from "next/link";

export const NFTCard = ({ nft }: { nft: Collectible }) => {
  const [transferToAddress, setTransferToAddress] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const { writeAsync: transferNFT } = useScaffoldContractWrite({
    contractName: "DinoAI",
    functionName: "transferFrom",
    args: [nft.owner, transferToAddress, BigInt(nft.id.toString())],
  });

  const { writeAsync: startChat } = useScaffoldContractWrite({
    contractName: "DinoAI",
    functionName: "startChat",
    args: [userMessage, BigInt(nft.id.toString())],
  });
  const { writeAsync: addMessage } = useScaffoldContractWrite({
    contractName: "DinoAI",
    functionName: "addMessage",
    args: [userMessage, BigInt(nft.id.toString())],
  });

  return (
    <div className="card card-compact bg-base-100 shadow-lg sm:min-w-[300px] shadow-secondary">
      <figure className="relative">
        {/* eslint-disable-next-line  */}
        <img src={nft.uri} alt="NFT Image" className="h-60 min-w-full" />
      </figure>
      <div className="card-body space-y-3">
        <div className="flex items-center justify-center">
          <p className="text-xl p-0 m-0 font-semibold">{nft.name}</p>
          <div className="flex flex-wrap space-x-2 mt-1">
            {nft.attributes?.map((attr, index) => (
              <div key={index} className="badge badge-primary py-3">
                {attr.value}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center mt-1 flex-wrap">
          <p className="my-0 text-sm">{nft.description}</p>
        </div>
        <div className="flex flex-col justify-center mt-1">
          <p className="my-0 text-lg">
            {nft.model}, temp:{nft.temperature}
          </p>
        </div>
        <div className="flex space-x-3 mt-1 items-center">
          <span className="text-lg font-semibold">Owner : </span>
          <Address address={nft.owner} />
        </div>
        <div className="card-actions justify-center">
          <Link href={`https://dinochat.vercel.app/chat/${nft.id}`} target="_blank">
            <button className="btn btn-secondary btn-md px-8 tracking-wide">Chat</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
