import axios from 'axios';

const PRICE_API_URL = "https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/prices"

// Token symbol mapping 
const TOKEN_SYMBOL_MAP: Record<string, string> = {
    'BTC': 'BTC',                   // Keep as is
    'ETH': 'ETH',                   // Keep as is
};

// Reverse mapping for API requests
const REVERSE_TOKEN_MAP: Record<string, string> = {};
Object.entries(TOKEN_SYMBOL_MAP).forEach(([apiSymbol, standardSymbol]) => {
    REVERSE_TOKEN_MAP[standardSymbol] = apiSymbol;
});

// Map API response to standard symbols
function mapApiResponse(prices: any[]): any[] {
    return prices.map(item => ({
        ...item,
        symbol: TOKEN_SYMBOL_MAP[item.symbol] || item.symbol
    }));
}

/**
 * Get all available prices from the KiloLend price API
 * @returns All price data with success status
 */
export const getAllPrices = async () => {
    try {
        const response = await axios.get(PRICE_API_URL);

        if (response.data.success) {
            // Map API symbols to standard symbols for better user experience
            const mappedPrices = mapApiResponse(response.data.data);
            return {
                success: true,
                prices: mappedPrices,
                count: response.data.count
            };
        } else {
            return {
                success: false,
                error: 'API returned unsuccessful response'
            };
        }
    } catch (error: any) {
        console.error('Error fetching all prices:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch prices from API'
        };
    }
};

/**
 * Get major cryptocurrency prices (BTC, ETH, etc.)
 * @returns Major crypto price data
 */
export const getTokenPrices = async () => {
    try {
        const allPricesResult = await getAllPrices();

        if (!allPricesResult.success) {
            return allPricesResult;
        }

        // Major cryptocurrencies
        const majorCryptoSymbols = ['BTC', 'ETH'];

        const cryptoPrices = (allPricesResult.prices || []).filter((price: any) =>
            majorCryptoSymbols.includes(price.symbol)
        );

        return {
            success: true,
            prices: cryptoPrices,
            count: cryptoPrices.length,
            category: 'major_crypto'
        };
    } catch (error: any) {
        console.error('Error fetching major crypto prices:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch major crypto prices'
        };
    }
};