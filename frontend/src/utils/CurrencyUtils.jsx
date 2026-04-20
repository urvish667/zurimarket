/**
 * Custom Coin Icon component using branded image
 */
export const CoinIcon = ({ className = "", size = "text-base" }) => {
    // Map legacy text-size classes to width/height
    const sizeMap = {
        'text-xs': 'w-3 h-3',
        'text-sm': 'w-4 h-4',
        'text-base': 'w-5 h-5',
        'text-lg': 'w-6 h-6',
        'text-xl': 'w-7 h-7',
        'text-2xl': 'w-8 h-8',
        'text-3xl': 'w-10 h-10',
        'text-4xl': 'w-12 h-12',
        'text-[10px]': 'w-[14px] h-[14px]',
        'text-[12px]': 'w-[12px] h-[12px]',
        'text-[8px]': 'w-[10px] h-[10px]',
    };

    const mappedSize = sizeMap[size] || size;

    return (
        <img 
            src="/coin.png" 
            alt="Coin" 
            className={`${mappedSize} ${className} inline-block align-middle mr-1.5 object-contain`}
        />
    );
};

/**
 * Formats a raw balance (in cents) to a human-readable coin string
 * @param {number} value - The raw balance from the backend (e.g., 25000)
 * @returns {string} - Formatted string (e.g., "250.00")
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0';
    // Convert cents to coins (divide by 100)
    const coins = value / 100;
    return coins.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};
