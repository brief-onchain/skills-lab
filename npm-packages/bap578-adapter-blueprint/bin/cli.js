#!/usr/bin/env node

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      out[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = 'true';
    }
  }
  return out;
}

const args = parseArgs(process.argv);
if (args.help === 'true' || args.h === 'true') {
  console.log('Usage: bap578-adapter-blueprint [--contractName MyBAP578Adapter] [--nfaInterface INFAOwner]');
  process.exit(0);
}

const contractName = args.contractName || 'MyBAP578Adapter';
const nfaInterface = args.nfaInterface || 'INFAOwner';

const solidityTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ${nfaInterface} {
  function ownerOf(uint256 tokenId) external view returns (address);
}

interface IAgentVault {
  function creditNative(uint256 tokenId) external payable;
  function debitNative(uint256 tokenId, uint256 amount, address to) external;
}

contract ${contractName} {
  address public immutable nfa;
  IAgentVault public immutable vault;

  modifier onlyOperator(uint256 tokenId) {
    require(${nfaInterface}(nfa).ownerOf(tokenId) == msg.sender, 'not operator');
    _;
  }

  constructor(address nfa_, address vault_) {
    require(nfa_ != address(0) && vault_ != address(0), 'zero address');
    nfa = nfa_;
    vault = IAgentVault(vault_);
  }

  function fund(uint256 tokenId) external payable {
    require(msg.value > 0, 'zero amount');
    vault.creditNative{ value: msg.value }(tokenId);
  }

  function withdraw(uint256 tokenId, uint256 amount, address to) external onlyOperator(tokenId) {
    vault.debitNative(tokenId, amount, to);
  }
}`;

const output = {
  summary: 'Generated from FlapBAP578Adapter pattern: token owner acts as operator and vault controller is isolated.',
  solidityTemplate,
  checklist: [
    'Keep ownerOf(tokenId) authorization in modifier.',
    'Separate vault balance bookkeeping from adapter business logic.',
    'Emit events for funding/withdraw/status updates.',
    'Add nonReentrant for payable and token transfer functions.'
  ]
};

console.log(JSON.stringify(output, null, 2));
