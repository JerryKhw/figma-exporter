import React from "react";

export const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
        relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
        ${checked ? "bg-black" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
        >
            <span
                className={`
          inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-3.5" : "translate-x-0.5"}
        `}
            />
        </button>
    );
};
