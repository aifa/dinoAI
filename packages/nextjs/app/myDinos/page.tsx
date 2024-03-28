"use client";

// eslint-disable-next-line prettier/prettier
import { NextPage } from "next";
// eslint-disable-next-line prettier/prettier
import Link from "next/link";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { MyHoldings } from "~~/components/simpleNFT";

const MyDinos: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">My Dinos</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-center">
        {!isConnected || isConnecting ? (
          <RainbowKitCustomConnectButton />
        ) : (
          <Link href="/myDinos/create">
            <button className="btn btn-secondary">Create new</button>
          </Link>
        )}
      </div>
      <MyHoldings />
    </>
  );
};
export default MyDinos;
