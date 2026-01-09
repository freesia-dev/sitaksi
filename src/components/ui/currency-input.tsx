import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (value: string) => void;
  prefix?: string;
}

/**
 * Format number with thousand separators (Indonesian format)
 */
const formatNumber = (val: string | number): string => {
  if (val === '' || val === null || val === undefined) return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numStr));
};

/**
 * Parse formatted string back to raw number string
 */
const parseNumber = (val: string): string => {
  return val.replace(/\D/g, '');
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, prefix = 'Rp', ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => formatNumber(value));

    // Sync display value when external value changes
    React.useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = parseNumber(e.target.value);
      setDisplayValue(formatNumber(rawValue));
      onChange(rawValue);
    };

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          className={cn(prefix && 'pl-10', className)}
          value={displayValue}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput, formatNumber, parseNumber };
