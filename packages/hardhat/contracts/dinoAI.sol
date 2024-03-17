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

	function createLlmCall(
        uint promptId
    ) external returns (uint);
}

/** It is a beast of an NFT
 * @title DinoAI */

contract DinoAI is
	ERC721,
	ERC721Enumerable,
	ERC721URIStorage,
	Ownable
{
	
    struct Message {
        string role;
        string content;
    }

    struct ChatRun {
        address owner;
        Message[] messages;
        uint messagesCount;
    }

    mapping(uint => ChatRun) public chatRuns;
    uint private chatRunsCount;

    event ChatCreated(address indexed owner, uint indexed chatId);


	struct MintInput {
        address owner;
        bool isMinted;
		string name;
		string description;
		string systemPrompt;
		string model;
		string temperature;
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
		chatRunsCount = 0;
		mintsCount = 0;
    }

	modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }


	function _baseURI() internal pure override returns (string memory) {
		return "https://ipfs.io/ipfs/";
	}

	function mintItem(address to, string memory prompt, string memory model, string memory temperature, 
							string memory name, string memory description) public returns (uint256) {

		return initializeMint(to, prompt, model, temperature, name, description);
	}


    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function initializeMint(address to, string memory prompt, string memory model, string memory temperature, string memory name, string memory description) public returns (uint i) {
        MintInput storage mintInput = mintInputs[mintsCount];

        mintInput.owner = to;
        mintInput.systemPrompt = prompt;
		mintInput.model = model;
		mintInput.temperature = temperature;
        mintInput.isMinted = false;
		mintInput.name = name;
		mintInput.description = description;


      	uint currentId = mintsCount;
        mintsCount = currentId + 1;

        string memory fullPrompt = mintInput.systemPrompt;
        fullPrompt = string.concat(fullPrompt, "\"");
        IOracle(oracleAddress).createFunctionCall(
            currentId,
            "image_generation",
            fullPrompt
        );
        emit MintInputCreated(to, currentId);

        return currentId;
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
        _mint(mintInput.owner, tokenId);
        _setTokenURI(tokenId, response);
    }

    function startChat(string memory message, uint mintId) public returns (uint i) {
        ChatRun storage run = chatRuns[chatRunsCount];

        run.owner = msg.sender;
		
		//in the first run, add the system prompt
		if (chatRunsCount == 0) {
			Message memory sysMessage;
			sysMessage.content = mintInputs[mintId].systemPrompt;
			sysMessage.role = "system";
			run.messages.push(sysMessage);
		}

        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = chatRunsCount;
        chatRunsCount = chatRunsCount + 1;

        IOracle(oracleAddress).createLlmCall(currentId);
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    function onOracleLlmResponse(
        uint runId,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to respond to"
        );

        Message memory newMessage;
        newMessage.content = response;
        newMessage.role = "assistant";
        run.messages.push(newMessage);
        run.messagesCount++;
    }

    function addMessage(string memory message, uint runId) public {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(
            run.owner == msg.sender, "Only chat owner can add messages"
        );

        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount++;
        IOracle(oracleAddress).createLlmCall(runId);
    }

    function getMessageHistoryContents(uint chatId) public view returns (string[] memory) {
        string[] memory messages = new string[](chatRuns[chatId].messages.length);
        for (uint i = 0; i < chatRuns[chatId].messages.length; i++) {
            messages[i] = chatRuns[chatId].messages[i].content;
        }
        return messages;
    }

    function getMessageHistoryRoles(uint chatId) public view returns (string[] memory) {
        string[] memory roles = new string[](chatRuns[chatId].messages.length);
        for (uint i = 0; i < chatRuns[chatId].messages.length; i++) {
            roles[i] = chatRuns[chatId].messages[i].role;
        }
        return roles;
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
