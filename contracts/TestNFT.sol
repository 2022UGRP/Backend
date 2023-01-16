pragma solidity 0.8.16;

import "../node_modules/@klaytn/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@klaytn/contracts/utils/Counters.sol";
import "../node_modules/@klaytn/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@klaytn/contracts/access/Ownable.sol";

contract TestNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Token name("TestNFT"), Token symbol("TNFT") 각자 자유롭게 설정
    constructor() public ERC721("TestNFT", "NFT-I") {}

    // function 명칭(mintNFT)은 각자 자유롭게 설정
    function mintNFT(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId); // IKIP17.sol 의 event Transfer() 사용
        _setTokenURI(newItemId, tokenURI); // IKIP17Metadata.sol 의 function tokenURI() 사용

        return newItemId;
    }

    function mintToken(
        string memory uri
    ) public payable virtual {
        require(msg.value >= 10, "Not enough ETH sent; check price!");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, uri);
    }
}
