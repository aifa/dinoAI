// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; //Do not change the solidity version as it negatively impacts submission grading

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./chatlib.sol";
import "./IOracle.sol";

/** It is a beast of an NFT
 * @title DinoAI */

contract DinoAI is
	ERC721,
	ERC721Enumerable,
	ERC721URIStorage,
	Ownable
{
    using ChatLib for ChatLib.ChatRun;
    using ChatLib for ChatLib.Message;
    using ChatLib for ChatLib.MintInput;

    string private constant BASE_CHAR = "You are a Dino cartoon with superior intelligence that can talk like a human but needs to roar from time to time. Your role is the following:";
    /** Mapping of user to chats */
    mapping(uint => ChatLib.ChatRun) public chatRuns;
    uint private chatRunsCount;

  	mapping(uint => ChatLib.MintInput) public mintInputs;
	uint256 public _nextTokenId;

    address public oracleAddress;

	event MintInputCreated(address indexed owner, uint indexed chatId);
	event OracleAddressUpdated(address indexed newOracleAddress);
    event ChatCreated(address indexed owner, uint indexed chatId);

	constructor(address initialOracleAddress) ERC721("DinoAI", "DINO") {
        oracleAddress = initialOracleAddress;
        chatRunsCount = 0;
        _nextTokenId = 0;
    }

	modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

	function mintItem(address to, string memory prompt, string memory model, string memory temperature, 
							string memory name, string memory description) public returns (uint256) {

		return initializeMint(to, prompt, model, temperature, name, description);
	}

    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function initializeMint(address to, string memory prompt, string memory model, string memory temperature, string memory name, string memory description) private returns (uint i) {
       
        uint currentId =  _nextTokenId++;

        ChatLib.MintInput storage mintInput = mintInputs[currentId];
        mintInput.owner = to;
        mintInput.tokenId = currentId;
        mintInput.systemPrompt = string.concat(BASE_CHAR, prompt);
		mintInput.model = model;
		mintInput.temperature = temperature;
        mintInput.isMinted = false;
		mintInput.name = name;
		mintInput.description = description;

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
		ChatLib.MintInput storage mintInput = mintInputs[runId];
        require(!mintInput.isMinted, "NFT already minted");

        mintInput.isMinted = true;

        uint256 tokenId = mintInput.tokenId;
        _safeMint(mintInput.owner, tokenId);
        _setTokenURI(tokenId, response);
    }

    function startChat(string memory message, uint tokenId) public returns (uint i) {

        ChatLib.ChatRun storage run = chatRuns[chatRunsCount];
        ChatLib.MintInput storage mintInput = mintInputs[tokenId];

        run.owner = msg.sender;
        run.messagesCount=0;
        
        ChatLib.Message memory sysMessage;
        sysMessage.content = mintInput.systemPrompt;
        sysMessage.role = "system";
        run.messages.push(sysMessage);
        run.messagesCount += 1;

        ChatLib.Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount += 1;

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
        ChatLib.ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to respond to..."
        );

        ChatLib.Message memory newMessage;
        newMessage.content = response;
        newMessage.role = "assistant";
        run.messages.push(newMessage);
        run.messagesCount++;
    }

    function addMessage(string memory message, uint runId) public {
        ChatLib.ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(
            run.owner == msg.sender, "Only chat owner can add messages"
        );

        ChatLib.Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount += 1;
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

    uint256 private nonce = 0; // Helps to ensure a different value each time

    function generateRandomNumber() internal returns (uint) {
        uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce)));
        nonce++;
        return random;
    }
}
