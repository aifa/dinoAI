"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { NFTCard } from "~~/components/simpleNFT/NFTCard";
import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import Image from "next/image"; // Add this import

export interface Collectible extends Partial<NFTMetaData> {
  id: number;
  uri: string;
  owner: string;
  syspromt: string;
  name: string;
  description: string;
  model: string;
  temperature: string;
}

export const DinoList = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "DinoAI",
  });

  const { data: tokenCount } = useScaffoldContractRead({
    contractName: "DinoAI",
    functionName: "totalSupply",
    watch: true,
  });

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (tokenCount === undefined || yourCollectibleContract === undefined || connectedAddress === undefined) return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const totalBalance = parseInt(tokenCount.toString());
      console.log("totalBalance:", totalBalance);
      for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
        try {
          const tokenId = await yourCollectibleContract.read.tokenByIndex([BigInt(tokenIndex)]);

          const tokenURI = await yourCollectibleContract.read.tokenURI([tokenId]);
          const tokenConfig = await yourCollectibleContract.read.getTokenData([tokenId]);
          const name = tokenConfig.name;
          const description = tokenConfig.description;
          const sysprompt = tokenConfig.systemPrompt;
          const model = tokenConfig.model;
          const temperature = tokenConfig.temperature;
          const owner = await yourCollectibleContract.read.ownerOf([tokenId]);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          //const nftMetadata: NFTMetaData = await getMetadataFromIPFS(ipfsHash);

          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: ipfsHash,
            owner: owner,
            syspromt: sysprompt,
            model: model,
            temperature: temperature,
            name: name,
            description: description,
          });
        } catch (e) {
          notification.error("Error fetching all collectibles");
          setAllCollectiblesLoading(false);
          console.log(e);
        }
      }
      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenCount]);

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <figure className="relative">
            {/* eslint-disable-next-line  */}
          <img src={"/assets/extinction.webp"} alt="NFT Image" className="h-60 min-w-" />          
          <label className="text-1xl text-secondary-content text-center">Not another extinction event!<br />(Please reload)</label>
          </figure>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
          {myAllCollectibles.map(item => (
            <NFTCard nft={item} key={item.id} />
          ))}
        </div>
      )}
    </>
  );
};

export default DinoList;
