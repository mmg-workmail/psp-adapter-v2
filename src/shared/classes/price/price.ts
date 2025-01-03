export class Price {
    static formatToTwoDecimalPlaces(value: string | number): string {
        const numberValue = parseFloat(value.toString()); // Convert to a number
        if (isNaN(numberValue)) {
            throw new Error('Invalid number format');
        }
        return numberValue.toFixed(2); // Format to two decimal places
    }
}
