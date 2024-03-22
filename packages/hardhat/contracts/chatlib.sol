// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.2;

library ChatLib{

    struct Message {
        string role;
        string content;
    }

    struct ChatRun {
        address owner;
        Message[] messages;
        uint messagesCount;
    }

    struct TokenData {
        uint tokenId;
        address owner;
        bool isMinted;
		string name;
		string description;
		string systemPrompt;
		string model;
		string temperature;
    }
}