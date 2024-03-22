"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

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

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "DinoAI",
  });

  const { data: myTotalBalance } = useScaffoldContractRead({
    contractName: "DinoAI",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined)
        return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const totalBalance = parseInt(myTotalBalance.toString());
      for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
        try {
          const tokenId = await yourCollectibleContract.read.tokenOfOwnerByIndex([
            connectedAddress,
            BigInt(tokenIndex),
          ]);

          const tokenURI = await yourCollectibleContract.read.tokenURI([tokenId]);
          const tokenConfig = await yourCollectibleContract.read.tokenDataMap([tokenId]);
          const name = tokenConfig[3];
          const description = tokenConfig[4];
          const sysprompt = tokenConfig[5];
          const model = tokenConfig[6];
          const temperature = tokenConfig[7];

          console.log("tokenURI:", tokenURI);
          console.log("model:", model);
          console.log("temperature:", temperature);
          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash:", ipfsHash);
          //const nftMetadata: NFTMetaData = await getMetadataFromIPFS(ipfsHash);

          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: ipfsHash,
            owner: connectedAddress,
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
  }, [connectedAddress, myTotalBalance]);

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
          <div className="text-2xl text-primary-content">
            Your list is empty. Create one or browse through what is available.
          </div>
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
