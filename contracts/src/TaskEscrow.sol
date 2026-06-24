// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TaskEscrow
 * @dev Escrow contract for TaskVerdict platform.
 *      Holds funds for tasks and releases based on AI verdict scores.
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract TaskEscrow {
    IERC20 public token;
    address public verdictOracle;

    struct Escrow {
        address poster;
        uint256 amount;
        bool released;
    }

    mapping(string => Escrow) public escrows;

    event EscrowCreated(string taskKey, address indexed poster, uint256 amount);
    event EscrowReleased(string taskKey, address indexed winner, uint256 payout);
    event EscrowRefunded(string taskKey, address indexed poster, uint256 amount);

    constructor(address _token, address _verdictOracle) {
        token = IERC20(_token);
        verdictOracle = _verdictOracle;
    }

    function createEscrow(string calldata taskKey, uint256 amount) external {
        require(amount > 0, "amount must be > 0");
        require(escrows[taskKey].amount == 0, "escrow already exists");
        require(token.transferFrom(msg.sender, address(this), amount), "transfer failed");
        escrows[taskKey] = Escrow({
            poster: msg.sender,
            amount: amount,
            released: false
        });
        emit EscrowCreated(taskKey, msg.sender, amount);
    }

    function releaseEscrow(
        string calldata taskKey,
        address winner,
        uint256 score
    ) external {
        Escrow storage e = escrows[taskKey];
        require(!e.released, "already released");
        require(score <= 100, "invalid score");
        uint256 payout = (e.amount * score) / 100;
        require(token.transfer(winner, payout), "payout transfer failed");
        if (payout < e.amount) {
            require(token.transfer(e.poster, e.amount - payout), "refund transfer failed");
        }
        e.released = true;
        emit EscrowReleased(taskKey, winner, payout);
    }

    function refundEscrow(string calldata taskKey) external {
        Escrow storage e = escrows[taskKey];
        require(msg.sender == e.poster, "only poster can refund");
        require(!e.released, "already released");
        require(token.transfer(e.poster, e.amount), "refund transfer failed");
        e.released = true;
        emit EscrowRefunded(taskKey, e.poster, e.amount);
    }
}
