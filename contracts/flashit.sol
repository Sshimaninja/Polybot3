//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.9;

interface IUniswapV2Factory {
        function getPair(address tokenA, address tokenB) external view returns (address pair);
}
interface IUniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function token0() external view returns (address);
    function token1() external view returns (address);
}
interface IUniswapV2Library {
    function getReserves(address factory, address tokenA, address tokenB) external view returns (uint112 reserveA, uint112 reserveB, uint32 blockTimestampLast);
}
interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}
library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, 'ds-math-sub-underflow');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }
}

import "hardhat/console.sol";

interface IUniswapV2Callee {
    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}
contract flashit is IUniswapV2Callee{
    address owner;
    IUniswapV2Pair pair;
    using SafeMath for uint256;

    event log(string message);
    event logValue(string message, uint256 val);
    event logAddress(string message, address val);
    constructor(
    address _owner) public {owner = _owner;}

    function checkOwner() public view returns (address) {
        
        return owner;
    }   
    
    function flashSwap(
        address loanFactory, 
        address recipientRouter, 
        address token0ID, 
        address token1ID, 
        uint256 amount0In,
        uint256 amount1Out,
        uint256 amountToRepay
        ) external {
        emit log("Contract Entered");
        require(msg.sender == address(owner), "Error: Only owner can call this function");
        pair = IUniswapV2Pair(IUniswapV2Factory(loanFactory).getPair(token0ID, token1ID));
        emit logValue("amount0In requested: ", amount0In);
        emit logValue("amount1Out expected: ", amount1Out);
        emit logValue("Contract Balance Before Swap: ", IERC20(token0ID).balanceOf(address(this)));
        emit logAddress("Pair address: ", address(pair));
        require(address(pair) != address(0), "Error: Pair does not exist");
        bytes memory data = abi.encode(loanFactory, recipientRouter, amount1Out, amountToRepay);
        emit log("Data encoded");
        IERC20(token0ID).approve(address(pair), amount0In);
        pair.swap( 
            amount0In,
            0, 
            address(this), 
            data
            );
        emit logValue("New Contract Balance (Token0):", IERC20(token0ID).balanceOf(address(this)));
        emit logValue("New Contract Balance (Token1):", IERC20(token1ID).balanceOf(address(this)));
        emit logValue("New Owner Balance (Token0):", IERC20(token0ID).balanceOf(owner));
        emit logValue("New Owner Balance (Token1):", IERC20(token1ID).balanceOf(owner));
    }

    function uniswapV2Call(
    address _sender,
    uint256 _amount0,
    uint256 _amount1,
    bytes calldata _data
    ) external override {
        emit log("uniswapV2Call Entered");
        address[] memory path = new address[](2);
        emit log("Decoding Loan Data");
        (address loanFactory, address recipientRouter, uint256 amount1Out,  uint256 amount1Repay) = abi.decode(_data, (address, address, uint256, uint256));
        emit log("Loan Data Decoded");
        path[0] = IUniswapV2Pair(msg.sender).token0();
        path[1] = IUniswapV2Pair(msg.sender).token1();
        pair = IUniswapV2Pair(IUniswapV2Factory(loanFactory).getPair(path[0], path[1]));
        emit logAddress("Pair address: ", address(pair));
        emit logAddress("msg.sender address: ", msg.sender);        
        require(msg.sender == address(pair), "Error: Unauthorized");
        require(_sender == address(this), "Error: Not sender");
        require(_amount0 == 0 || _amount1 == 0, "Error: Invalid amounts");
        IERC20 token0 = IERC20(path[0]);
        IERC20 token1 = IERC20(path[1]);
        uint256 deadline = block.timestamp + 5 minutes;
        emit logValue("Amount0 requested: ", _amount0);
        emit logAddress("Token0 address: ", path[0]);
        emit logValue("Amount1 expected: ", _amount1);
        emit logAddress("Token1 address: ", path[1]);
        emit logValue("New token0 balance (loaned):::::::::::::::::: ", token0.balanceOf(address(this)));
        emit log("Approving recipientRouter to trade token0");
        token0.approve(address(recipientRouter), _amount0);
        uint256[] memory amounts = IUniswapV2Router02(address(recipientRouter))
            .swapExactTokensForTokens(
                _amount0,
                amount1Out,
                path,
                address(this),
                deadline
            );
        emit log("Swap executed");
        emit logValue("AmountsOut expected::::: ", amount1Out);
        emit logValue("AmountsOut calculated:::: ", amounts[1]);
        emit log("Contract Balances: ");
        emit logValue("Token0: ", token0.balanceOf(address(this)));
        emit logValue("Token1: ", token1.balanceOf(address(this)));        
        emit logValue("Amount repay expected::::: ", amount1Repay);
        require(amounts[1] > amount1Repay, "Error: Insufficient output amount");
        token1.approve(address(address(this)), amounts[1]);
        emit logValue("AmountsOut approved::::: ", amounts[1]);
        emit log("Repaying Loan");
        token1.transfer(msg.sender, amount1Repay); 
        token1.transfer(owner, amounts[1] - amount1Repay);
        emit log("Loan Repaid");
    }
}
