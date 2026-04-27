import React, { useEffect, useState } from 'react';

const DatetimeSelector = ({ value, onChange, className = '' }) => {
    const [internalValue, setInternalValue] = useState(value);

    // Set internalValue when component mounts
    useEffect(() => {
        if (!value) { // Only set default if no value is provided
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const formattedMonth = month < 10 ? `0${month}` : `${month}`;
            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const defaultDateTime = `${year}-${formattedMonth}-${formattedDay}T23:59`;
            setInternalValue(defaultDateTime);
        }
    }, [value]);

    const handleChange = (event) => {
        setInternalValue(event.target.value);
        if (onChange) {
            onChange(event); // Propagate changes to parent
        }
    };

    return (
        <input
            id="datetime-selector"
            type="datetime-local"
            className={`w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-none text-sm focus:outline-none focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20 [color-scheme:dark] ${className}`}
            value={internalValue}
            onChange={handleChange}
        />
    );
};

export default DatetimeSelector;