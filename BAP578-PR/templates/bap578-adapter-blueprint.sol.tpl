// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface {{NFA_INTERFACE}} {
  function ownerOf(uint256 tokenId) external view returns (address);
}

interface IAgentVault {
  function creditNative(uint256 tokenId) external payable;
  function debitNative(uint256 tokenId, uint256 amount, address to) external;
}

contract {{CONTRACT_NAME}} {
  address public immutable nfa;
  IAgentVault public immutable vault;

  modifier onlyOperator(uint256 tokenId) {
    require({{NFA_INTERFACE}}(nfa).ownerOf(tokenId) == msg.sender, 'not operator');
    _;
  }

  constructor(address nfa_, address vault_) {
    require(nfa_ != address(0) && vault_ != address(0), 'zero address');
    nfa = nfa_;
    vault = IAgentVault(vault_);
  }
}
