// lib/solana.js
import { 
    Connection, 
    PublicKey, 
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    Transaction,
    SystemProgram
  } from '@solana/web3.js'
  
  // Create connection to Solana network
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
    'confirmed'
  )
  
  /**
   * Validates a Solana transaction to ensure it's legitimate
   * @param {string} signature - Transaction signature to validate
   * @param {string} expectedRecipient - Expected recipient wallet address
   * @param {number} expectedAmount - Expected amount in SOL
   * @returns {Promise<{valid: boolean, amount?: number, signature?: string, blockTime?: number, error?: string}>}
   */
  export const validateSolanaTransaction = async (signature, expectedRecipient, expectedAmount) => {
    try {
      console.log('Validating transaction:', { signature, expectedRecipient, expectedAmount })
  
      // Get transaction details from blockchain
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      })
  
      if (!tx) {
        throw new Error('Transaction not found on blockchain')
      }
  
      if (!tx.meta) {
        throw new Error('Transaction metadata not available')
      }
  
      // Check if transaction was successful
      if (tx.meta.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(tx.meta.err)}`)
      }
  
      // Get account keys and find recipient
      const accountKeys = tx.transaction.message.staticAccountKeys || []
      const recipientPubkey = new PublicKey(expectedRecipient)
      
      // Find recipient index in account keys
      const recipientIndex = accountKeys.findIndex(key => key.equals(recipientPubkey))
      
      if (recipientIndex === -1) {
        throw new Error('Recipient not found in transaction')
      }
  
      // Calculate actual amount transferred to recipient
      const recipientPreBalance = tx.meta.preBalances[recipientIndex] || 0
      const recipientPostBalance = tx.meta.postBalances[recipientIndex] || 0
      const actualAmountLamports = recipientPostBalance - recipientPreBalance
      const actualAmount = actualAmountLamports / LAMPORTS_PER_SOL
  
      console.log('Transaction validation details:', {
        recipientIndex,
        recipientAddress: expectedRecipient,
        recipientPreBalance,
        recipientPostBalance,
        actualAmountLamports,
        actualAmount,
        expectedAmount,
        allPreBalances: tx.meta.preBalances,
        allPostBalances: tx.meta.postBalances,
        allAccountKeys: accountKeys.map(key => key.toString())
      })
  
      // Ensure we got a positive amount (recipient received money)
      if (actualAmount <= 0) {
        throw new Error(`Invalid transfer: recipient balance decreased by ${Math.abs(actualAmount)} SOL`)
      }
  
      // Verify amount (allow small variance for fees)
      const tolerance = 0.001 // 0.001 SOL tolerance
      if (Math.abs(actualAmount - expectedAmount) > tolerance) {
        throw new Error(
          `Amount mismatch: expected ${expectedAmount} SOL, got ${actualAmount} SOL`
        )
      }
  
      return {
        valid: true,
        amount: actualAmount,
        signature,
        blockTime: tx.blockTime,
        slot: tx.slot
      }
  
    } catch (error) {
      console.error('Transaction validation error:', error)
      return { 
        valid: false, 
        error: error.message 
      }
    }
  }
  
  /**
   * Creates a simple SOL transfer transaction
   * @param {PublicKey} fromPubkey - Sender's public key
   * @param {PublicKey} toPubkey - Recipient's public key
   * @param {number} amountSOL - Amount in SOL to transfer
   * @returns {Transaction}
   */
  export const createTransferTransaction = (fromPubkey, toPubkey, amountSOL) => {
    const lamports = amountSOL * LAMPORTS_PER_SOL
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports
      })
    )
  
    return transaction
  }
  
  /**
   * Gets the SOL balance for a wallet address
   * @param {string} walletAddress - Wallet address to check
   * @returns {Promise<number>} Balance in SOL
   */
  export const getWalletBalance = async (walletAddress) => {
    try {
      const publicKey = new PublicKey(walletAddress)
      const balance = await connection.getBalance(publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error getting wallet balance:', error)
      return 0
    }
  }
  
  /**
   * Gets recent transactions for a wallet address
   * @param {string} walletAddress - Wallet address to check
   * @param {number} limit - Number of transactions to fetch (default: 10)
   * @returns {Promise<Array>} Array of transaction signatures
   */
  export const getRecentTransactions = async (walletAddress, limit = 10) => {
    try {
      const publicKey = new PublicKey(walletAddress)
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit })
      return signatures
    } catch (error) {
      console.error('Error getting recent transactions:', error)
      return []
    }
  }
  
  /**
   * Checks if a wallet address is valid
   * @param {string} address - Wallet address to validate
   * @returns {boolean} True if valid, false otherwise
   */
  export const isValidSolanaAddress = (address) => {
    try {
      new PublicKey(address)
      return true
    } catch (error) {
      return false
    }
  }
  
  /**
   * Converts lamports to SOL
   * @param {number} lamports - Amount in lamports
   * @returns {number} Amount in SOL
   */
  export const lamportsToSol = (lamports) => {
    return lamports / LAMPORTS_PER_SOL
  }
  
  /**
   * Converts SOL to lamports
   * @param {number} sol - Amount in SOL
   * @returns {number} Amount in lamports
   */
  export const solToLamports = (sol) => {
    return sol * LAMPORTS_PER_SOL
  }
  
  /**
   * Gets network info and cluster
   * @returns {Promise<Object>} Network information
   */
  export const getNetworkInfo = async () => {
    try {
      const version = await connection.getVersion()
      const epochInfo = await connection.getEpochInfo()
      const slot = await connection.getSlot()
      
      return {
        cluster: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
        rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet'),
        version,
        epochInfo,
        currentSlot: slot
      }
    } catch (error) {
      console.error('Error getting network info:', error)
      return null
    }
  }
  
  /**
   * Waits for transaction confirmation
   * @param {string} signature - Transaction signature to wait for
   * @param {string} commitment - Commitment level (default: 'confirmed')
   * @returns {Promise<boolean>} True if confirmed, false if timeout
   */
  export const waitForTransactionConfirmation = async (signature, commitment = 'confirmed') => {
    try {
      const confirmation = await connection.confirmTransaction(signature, commitment)
      return !confirmation.value.err
    } catch (error) {
      console.error('Error waiting for confirmation:', error)
      return false
    }
  }
  
  /**
   * Gets transaction details with better error handling
   * @param {string} signature - Transaction signature
   * @returns {Promise<Object|null>} Transaction details or null
   */
  export const getTransactionDetails = async (signature) => {
    try {
      const transaction = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      })
  
      if (!transaction) {
        return null
      }
  
      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee || 0,
        status: transaction.meta?.err ? 'failed' : 'success',
        accountKeys: transaction.transaction.message.staticAccountKeys,
        preBalances: transaction.meta?.preBalances || [],
        postBalances: transaction.meta?.postBalances || [],
        instructions: transaction.transaction.message.compiledInstructions
      }
    } catch (error) {
      console.error('Error getting transaction details:', error)
      return null
    }
  }
  
  /**
   * Helper function to format SOL amounts for display
   * @param {number} amount - Amount in SOL
   * @param {number} decimals - Number of decimal places (default: 3)
   * @returns {string} Formatted amount
   */
  export const formatSolAmount = (amount, decimals = 3) => {
    return parseFloat(amount).toFixed(decimals)
  }
  
  /**
   * Gets the current network status
   * @returns {Promise<Object>} Network status information
   */
  export const getNetworkStatus = async () => {
    try {
      const health = await connection.getHealth()
      const slot = await connection.getSlot()
      const blockTime = await connection.getBlockTime(slot)
      
      return {
        healthy: health === 'ok',
        currentSlot: slot,
        blockTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting network status:', error)
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
  
  // Export the connection for direct use if needed
  export { connection }
  
  // Export network constants
  export const NETWORKS = {
    MAINNET: 'mainnet-beta',
    TESTNET: 'testnet', 
    DEVNET: 'devnet'
  }
  
  export const RPC_ENDPOINTS = {
    MAINNET: 'https://api.mainnet-beta.solana.com',
    TESTNET: 'https://api.testnet.solana.com',
    DEVNET: 'https://api.devnet.solana.com'
  }
  
  // Default export with main functions
  export default {
    validateSolanaTransaction,
    createTransferTransaction,
    getWalletBalance,
    getRecentTransactions,
    isValidSolanaAddress,
    lamportsToSol,
    solToLamports,
    getNetworkInfo,
    waitForTransactionConfirmation,
    getTransactionDetails,
    formatSolAmount,
    getNetworkStatus,
    connection,
    NETWORKS,
    RPC_ENDPOINTS
  }