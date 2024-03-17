// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; //Do not change the solidity version as it negatively impacts submission grading

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


interface IOracle {
    function createFunctionCall(
        uint functionCallbackId,
        string memory functionType,
        string memory functionInput
    ) external returns (uint i);
}

contract DinoAI is
	ERC721,
	ERC721Enumerable,
	ERC721URIStorage,
	Ownable
{
	struct MintInput {
        address owner;
        string prompt;
        bool isMinted;	
    }

	using Counters for Counters.Counter;

	uint256 private _nextTokenId;
	Counters.Counter public tokenIdCounter;
    address public oracleAddress;

	event MintInputCreated(address indexed owner, uint indexed chatId);
	event OracleAddressUpdated(address indexed newOracleAddress);


	mapping(uint => MintInput) public mintInputs;
    uint private mintsCount;

	constructor(address initialOracleAddress) ERC721("DinoAI", "DINO") {
        oracleAddress = initialOracleAddress;
    }

	modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }


	function _baseURI() internal pure override returns (string memory) {
		return "https://ipfs.io/ipfs/";
	}

	function mintItem(address to, string memory prompt) public returns (uint256) {

		return initializeMint(to, prompt);
	}


    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function initializeMint(address to, string memory message) public returns (uint i) {
        MintInput storage mintInput = mintInputs[mintsCount];

        mintInput.owner = to;
        mintInput.prompt = message;
        mintInput.isMinted = false;

		tokenIdCounter.increment();
		uint256 tokenId = tokenIdCounter.current();

        string memory fullPrompt = mintInput.prompt;
        fullPrompt = string.concat(fullPrompt, message);
        fullPrompt = string.concat(fullPrompt, "\"");
        IOracle(oracleAddress).createFunctionCall(
            tokenId,
            "image_generation",
            fullPrompt
        );
        emit MintInputCreated(msg.sender, tokenId);

        return tokenId;
    }

    function onOracleFunctionResponse(
        uint runId,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
        MintInput storage mintInput = mintInputs[runId];
        require(!mintInput.isMinted, "NFT already minted");

        mintInput.isMinted = true;

        uint256 tokenId = _nextTokenId++;
        _safeMint(mintInput.owner, tokenId);
        _setTokenURI(tokenId, response);
    }

	// The following functions are overrides required by Solidity.

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 quantity
	) internal override(ERC721, ERC721Enumerable) {
		super._beforeTokenTransfer(from, to, tokenId, quantity);
	}

	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(ERC721, ERC721Enumerable, ERC721URIStorage)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}
