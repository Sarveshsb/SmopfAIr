export type ValidationType = 'number' | 'date' | 'product_name' | 'quantity' | 'price' | 'category';

interface ValidationResult {
    isValid: boolean;
    message?: string;
    normalizedValue?: any;
}

export const validationEngine = {
    validate: (input: string, type: ValidationType, context?: any): ValidationResult => {
        switch (type) {
            case 'number':
            case 'quantity':
            case 'price':
                return validationEngine.validateNumeric(input, type);
            case 'date':
                return validationEngine.validateDate(input);
            case 'product_name':
                return validationEngine.validateProductName(input, context?.products);
            case 'category':
                return validationEngine.validateCategory(input);
            default:
                return { isValid: true, normalizedValue: input };
        }
    },

    validateNumeric: (input: string, type: string): ValidationResult => {
        const value = parseFloat(input.replace(/[^\d.-]/g, ''));
        if (isNaN(value)) {
            return { isValid: false, message: `Please provide a valid ${type}.` };
        }
        if (value < 0) {
            return { isValid: false, message: `${type} cannot be negative.` };
        }
        if (type === 'price' && value === 0) {
            return { isValid: false, message: 'Price cannot be zero.' };
        }
        if (value > 1000000) { // Limit for realistic values in small business
            return { isValid: false, message: 'This value seems unrealistically high.' };
        }
        return { isValid: true, normalizedValue: value };
    },

    validateDate: (input: string): ValidationResult => {
        const date = new Date(input);
        if (isNaN(date.getTime())) {
            return { isValid: false, message: 'Please provide a valid date.' };
        }
        const today = new Date();
        if (date > today) {
            return { isValid: false, message: 'Date cannot be in the future.' };
        }
        return { isValid: true, normalizedValue: date.toISOString().split('T')[0] };
    },

    validateProductName: (input: string, existingProducts: any[] = []): ValidationResult => {
        const normalized = input.trim();
        if (normalized.length < 2) {
            return { isValid: false, message: 'Product name is too short.' };
        }

        // Duplication check (optional warning or rejection)
        const exists = existingProducts.some(p => p.product_name.toLowerCase() === normalized.toLowerCase());
        if (exists) {
            return { isValid: true, normalizedValue: normalized, message: '(Note: This product already exists)' };
        }

        return { isValid: true, normalizedValue: normalized };
    },

    validateCategory: (input: string): ValidationResult => {
        const normalized = input.trim().charAt(0).toUpperCase() + input.trim().slice(1).toLowerCase();

        // Soft validation: just normalize
        return { isValid: true, normalizedValue: normalized };
    },

    normalizeUnits: (input: string): string => {
        const units: Record<string, string> = {
            'kg': 'kg',
            'kilogram': 'kg',
            'kilograms': 'kg',
            'gm': 'g',
            'gram': 'g',
            'grams': 'g',
            'pc': 'pcs',
            'piece': 'pcs',
            'pieces': 'pcs',
            'ltr': 'L',
            'liter': 'L',
            'liters': 'L',
            'litre': 'L',
            'litres': 'L',
        };

        const lower = input.toLowerCase().trim();
        return units[lower] || input;
    }
};
