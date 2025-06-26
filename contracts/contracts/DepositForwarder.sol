// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract DepositForwarder {
    address public immutable recipient;
    address public immutable relayer;
    address[2] public tokens; // [sepoliaUSDC, zetaUSDC]

    constructor(address _recipient, address _relayer, address[2] memory _tokens) {
        require(_recipient != address(0), "Invalid recipient");
        require(_relayer != address(0), "Invalid relayer");
        recipient = _recipient;
        relayer = _relayer;
        tokens = _tokens;
    }

    receive() external payable {}

    function forwardFunds() external {
        require(msg.sender == relayer, "Only relayer");

        // ✅ Forward ETH safely
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            (bool success, ) = payable(recipient).call{value: ethBalance}("");
            if (!success) {
                // Log failure if needed, but don’t revert
                // e.g., emit FailedTransfer(recipient, ethBalance);
            }
        }

        // ✅ Forward all supported tokens
        for (uint i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            if (token != address(0)) {
                uint256 balance = IERC20(token).balanceOf(address(this));
                if (balance > 0) {
                    // If token transfer fails, we silently continue
                    IERC20(token).transfer(recipient, balance);
                }
            }
        }
    }
}
