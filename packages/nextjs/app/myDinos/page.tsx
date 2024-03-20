"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { MyHoldings } from "~~/components/simpleNFT";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";

const MyDinos: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  const { writeAsync: mintItem } = useScaffoldContractWrite({
    contractName: "DinoAI",
    functionName: "mintItem",
    args: [connectedAddress, "", "", "", "", ""],
  });

  const { data: tokenIdCounter } = useScaffoldContractRead({
    contractName: "DinoAI",
    functionName: "_nextTokenId",
    watch: true,
    cacheOnBlock: true,
  });

  const handleMintItem = async () => {
    // circle back to the zero item if we've reached the end of the array
    if (tokenIdCounter === undefined) return;

    const tokenIdCounterNumber = Number(tokenIdCounter);
    const currentTokenMetaData = nftsMetadata[tokenIdCounterNumber % nftsMetadata.length];
    try {
      await mintItem({
        args: [
          connectedAddress,
          currentTokenMetaData.attributes[0].value,
          currentTokenMetaData.attributes[1].value,
          currentTokenMetaData.attributes[2].value,
          currentTokenMetaData.name,
          currentTokenMetaData.description,
        ],
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">My Dino Assistans</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-center">
        {!isConnected || isConnecting ? (
          <RainbowKitCustomConnectButton />
        ) : (
          <button className="btn btn-secondary" onClick={handleMintItem}>
            Create new
          </button>
        )}
      </div>
      <MyHoldings />
    </>
  );
};

export default MyDinos;
